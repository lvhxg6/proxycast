//! AI Agent 集成模块
//!
//! 使用策略模式支持多种 API 协议（OpenAI、Anthropic、Kiro、Gemini）
//! 包含工具系统、流式处理和工具调用循环
//!
//! ## 架构设计
//! - protocols/ - 协议策略实现（策略模式）
//! - parsers/ - SSE 流解析器
//! - native_agent - 核心 Agent 逻辑
//! - tool_loop - 工具调用循环
//! - tools/ - 工具实现
//! - aster_state - Aster Agent 状态管理（新）
//! - aster_agent - Aster Agent 包装器（新）
//! - event_converter - Aster 事件转换器（新）

pub mod aster_agent;
pub mod aster_state;
pub mod event_converter;
pub mod native_agent;
pub mod parsers;
pub mod protocols;
pub mod tool_loop;
pub mod tools;
pub mod types;

pub use aster_agent::{AsterAgentWrapper, SessionDetail, SessionInfo};
pub use aster_state::AsterAgentState;
pub use event_converter::{convert_agent_event, TauriAgentEvent};
pub use native_agent::{NativeAgent, NativeAgentState};
pub use parsers::{AnthropicSSEParser, OpenAISSEParser};
pub use protocols::{create_protocol, AnthropicProtocol, OpenAIProtocol, Protocol};
pub use tool_loop::{ToolCallResult, ToolLoopConfig, ToolLoopEngine, ToolLoopError, ToolLoopState};
pub use types::*;
