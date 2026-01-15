//! Aster Agent 包装器
//!
//! 提供简化的接口来使用 Aster Agent
//! 处理消息发送、事件流转换和会话管理

use crate::agent::aster_state::{AsterAgentState, SessionConfigBuilder};
use crate::agent::event_converter::TauriAgentEvent;
use aster::agents::SessionConfig;
use aster::conversation::message::Message;
use aster::session::SessionManager;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tokio_util::sync::CancellationToken;

/// Aster Agent 包装器
///
/// 提供与 Tauri 集成的简化接口
pub struct AsterAgentWrapper;

impl AsterAgentWrapper {
    /// 发送消息并获取流式响应
    ///
    /// # Arguments
    /// * `state` - Aster Agent 状态
    /// * `app` - Tauri AppHandle，用于发送事件
    /// * `message` - 用户消息文本
    /// * `session_id` - 会话 ID
    /// * `event_name` - 前端监听的事件名称
    ///
    /// # Returns
    /// 成功时返回 Ok(())，失败时返回错误信息
    pub async fn send_message(
        state: &AsterAgentState,
        app: &AppHandle,
        message: String,
        session_id: String,
        event_name: String,
    ) -> Result<(), String> {
        // 确保 Agent 已初始化
        if !state.is_initialized().await {
            state.init_agent().await?;
        }

        // 创建取消令牌
        let cancel_token = state.create_cancel_token(&session_id).await;

        // 创建用户消息
        let user_message = Message::user().with_text(&message);

        // 创建会话配置
        let session_config = SessionConfigBuilder::new(&session_id).build();

        // 使用 with_agent 方法获取 Agent 并处理
        let app_clone = app.clone();
        let event_name_clone = event_name.clone();
        let cancel_token_clone = cancel_token.clone();

        let result = state
            .with_agent(|agent| {
                // 注意：这里我们需要异步处理，但 with_agent 是同步的
                // 我们需要重新设计这个接口
            })
            .await;

        // 由于 with_agent 的限制，我们需要使用不同的方法
        // 直接在这里处理流
        Self::process_reply_internal(
            state,
            &app_clone,
            user_message,
            session_config,
            cancel_token_clone,
            event_name_clone,
        )
        .await?;

        // 清理取消令牌
        state.remove_cancel_token(&session_id).await;

        Ok(())
    }

    /// 内部处理回复的方法
    async fn process_reply_internal(
        state: &AsterAgentState,
        app: &AppHandle,
        user_message: Message,
        session_config: SessionConfig,
        cancel_token: CancellationToken,
        event_name: String,
    ) -> Result<(), String> {
        // 这里我们需要一个更好的方式来访问 Agent
        // 暂时使用一个简化的实现

        // 发送开始事件
        let start_event = TauriAgentEvent::TextDelta {
            text: String::new(),
        };
        let _ = app.emit(&event_name, &start_event);

        // TODO: 实现完整的 Agent 调用
        // 由于 Agent.reply() 需要 &self，而我们的 with_agent 方法不支持异步
        // 我们需要重新设计 AsterAgentState 的接口

        // 发送完成事件
        let done_event = TauriAgentEvent::FinalDone { usage: None };
        if let Err(e) = app.emit(&event_name, &done_event) {
            tracing::error!("Failed to emit final done event: {}", e);
        }

        Ok(())
    }

    /// 停止当前会话
    pub async fn stop_session(state: &AsterAgentState, session_id: &str) -> bool {
        state.cancel_session(session_id).await
    }

    /// 创建新会话
    pub async fn create_session(
        working_dir: Option<PathBuf>,
        name: Option<String>,
    ) -> Result<String, String> {
        let dir = working_dir
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));
        let session_name = name.unwrap_or_else(|| "New Session".to_string());

        let session =
            SessionManager::create_session(dir, session_name, aster::session::SessionType::User)
                .await
                .map_err(|e| format!("Failed to create session: {}", e))?;

        Ok(session.id)
    }

    /// 列出所有会话
    pub async fn list_sessions() -> Result<Vec<SessionInfo>, String> {
        let sessions = SessionManager::list_sessions()
            .await
            .map_err(|e| format!("Failed to list sessions: {}", e))?;

        Ok(sessions
            .into_iter()
            .map(|s| SessionInfo {
                id: s.id,
                name: s.name,
                created_at: s.created_at.timestamp(),
                updated_at: s.updated_at.timestamp(),
            })
            .collect())
    }

    /// 获取会话详情
    pub async fn get_session(session_id: &str) -> Result<SessionDetail, String> {
        let session = SessionManager::get_session(session_id, true)
            .await
            .map_err(|e| format!("Failed to get session: {}", e))?;

        Ok(SessionDetail {
            id: session.id,
            name: session.name,
            created_at: session.created_at.timestamp(),
            updated_at: session.updated_at.timestamp(),
            messages: session
                .conversation
                .map(|c| {
                    c.messages()
                        .iter()
                        .map(|m| crate::agent::event_converter::convert_to_tauri_message(m))
                        .collect()
                })
                .unwrap_or_default(),
        })
    }
}

/// 会话信息（简化版）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SessionInfo {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
}

/// 会话详情（包含消息）
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SessionDetail {
    pub id: String,
    pub name: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub messages: Vec<crate::agent::event_converter::TauriMessage>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_session_config_builder() {
        let config = SessionConfigBuilder::new("test-session").build();
        assert_eq!(config.id, "test-session");
    }
}
