//! Browser 工具模块
//!
//! 提供浏览器自动化功能，基于 Playwright
//! 专为 AI Agent 设计，提供结构化的页面快照

#![allow(dead_code)]

use super::registry::Tool;
use super::types::{JsonSchema, PropertySchema, ToolDefinition, ToolError, ToolResult};
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::process::Stdio;
use std::time::Duration;
use tokio::process::Command;
use tokio::time::timeout;
use tracing::info;

/// 默认超时时间（秒）
const DEFAULT_TIMEOUT_SECS: u64 = 30;

/// Playwright 脚本目录
const PLAYWRIGHT_SCRIPTS_DIR: &str = "scripts/playwright";

/// 浏览器操作类型
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BrowserAction {
    /// 打开页面
    Open { url: String },
    /// 获取页面快照（AI 友好的可访问性树）
    Snapshot {
        #[serde(default)]
        interactive_only: bool,
    },
    /// 点击元素
    Click { selector: String },
    /// 填充表单
    Fill { selector: String, value: String },
    /// 输入文本（逐字符）
    Type { selector: String, text: String },
    /// 按键
    Press { key: String },
    /// 滚动页面
    Scroll {
        direction: ScrollDirection,
        #[serde(default = "default_scroll_amount")]
        amount: i32,
    },
    /// 等待元素
    WaitFor {
        selector: String,
        #[serde(default = "default_wait_timeout")]
        timeout_ms: u64,
    },
    /// 截图
    Screenshot {
        #[serde(default)]
        full_page: bool,
        path: Option<String>,
    },
    /// 获取页面文本内容
    GetText { selector: Option<String> },
    /// 执行 JavaScript
    Evaluate { script: String },
    /// 关闭浏览器
    Close,
}

fn default_scroll_amount() -> i32 {
    500
}

fn default_wait_timeout() -> u64 {
    5000
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ScrollDirection {
    Up,
    Down,
    Left,
    Right,
}

/// 浏览器操作结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrowserResult {
    /// 是否成功
    pub success: bool,
    /// 输出内容
    pub output: String,
    /// 页面 URL
    pub url: Option<String>,
    /// 页面标题
    pub title: Option<String>,
    /// 截图 base64（如果有）
    pub screenshot: Option<String>,
    /// 错误信息
    pub error: Option<String>,
}

/// Browser 工具
///
/// 提供浏览器自动化功能，专为 AI Agent 设计
pub struct BrowserTool {
    /// Playwright 脚本路径
    script_path: PathBuf,
    /// 超时时间（秒）
    timeout_secs: u64,
    /// 是否使用 headless 模式
    headless: bool,
}

impl BrowserTool {
    /// 创建新的 Browser 工具
    pub fn new() -> Self {
        // 获取脚本路径（相对于项目根目录）
        let script_path = std::env::current_dir()
            .unwrap_or_default()
            .join(PLAYWRIGHT_SCRIPTS_DIR)
            .join("browser-tool.mjs");

        Self {
            script_path,
            timeout_secs: DEFAULT_TIMEOUT_SECS,
            headless: true,
        }
    }

    /// 设置脚本路径
    pub fn with_script_path(mut self, path: PathBuf) -> Self {
        self.script_path = path;
        self
    }

    /// 设置超时时间
    pub fn with_timeout(mut self, timeout_secs: u64) -> Self {
        self.timeout_secs = timeout_secs;
        self
    }

    /// 设置是否 headless
    pub fn with_headless(mut self, headless: bool) -> Self {
        self.headless = headless;
        self
    }

    /// 执行浏览器操作
    async fn execute_action(&self, action: &BrowserAction) -> Result<BrowserResult, ToolError> {
        let action_json = serde_json::to_string(action)
            .map_err(|e| ToolError::ExecutionFailed(format!("序列化操作失败: {}", e)))?;

        info!("[BrowserTool] 执行操作: {:?}", action);

        // 构建命令
        let mut cmd = Command::new("node");
        cmd.arg(&self.script_path);
        cmd.arg("--action");
        cmd.arg(&action_json);

        if self.headless {
            cmd.arg("--headless");
        }

        cmd.stdin(Stdio::null());
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());

        // 执行命令
        let timeout_duration = Duration::from_secs(self.timeout_secs);
        let result = timeout(timeout_duration, cmd.output()).await;

        match result {
            Ok(Ok(output)) => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let stderr = String::from_utf8_lossy(&output.stderr);

                if output.status.success() {
                    // 解析 JSON 输出
                    serde_json::from_str(&stdout).map_err(|e| {
                        ToolError::ExecutionFailed(format!(
                            "解析输出失败: {}\nstdout: {}\nstderr: {}",
                            e, stdout, stderr
                        ))
                    })
                } else {
                    Err(ToolError::ExecutionFailed(format!(
                        "浏览器操作失败: {}",
                        stderr
                    )))
                }
            }
            Ok(Err(e)) => Err(ToolError::ExecutionFailed(format!("执行命令失败: {}", e))),
            Err(_) => Err(ToolError::Timeout),
        }
    }
}

impl Default for BrowserTool {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Tool for BrowserTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition::new(
            "browser",
            "Control a web browser for automation tasks. Use this to navigate websites, \
             interact with elements, fill forms, and extract information. The 'snapshot' \
             action returns an accessibility tree with element references (like @e1, @e2) \
             that can be used in subsequent actions.",
        )
        .with_parameters(
            JsonSchema::new()
                .add_property(
                    "action",
                    PropertySchema::string(
                        "The browser action to perform. One of: open, snapshot, click, fill, \
                         type, press, scroll, wait_for, screenshot, get_text, evaluate, close",
                    ),
                    true,
                )
                .add_property(
                    "url",
                    PropertySchema::string("URL to open (for 'open' action)"),
                    false,
                )
                .add_property(
                    "selector",
                    PropertySchema::string(
                        "Element selector. Can be CSS selector, XPath, or element reference \
                         like @e1 from snapshot output",
                    ),
                    false,
                )
                .add_property(
                    "value",
                    PropertySchema::string("Value to fill (for 'fill' action)"),
                    false,
                )
                .add_property(
                    "text",
                    PropertySchema::string("Text to type (for 'type' action)"),
                    false,
                )
                .add_property(
                    "key",
                    PropertySchema::string(
                        "Key to press (for 'press' action), e.g., 'Enter', 'Tab', 'Escape'",
                    ),
                    false,
                )
                .add_property(
                    "direction",
                    PropertySchema::string("Scroll direction: up, down, left, right"),
                    false,
                )
                .add_property(
                    "script",
                    PropertySchema::string("JavaScript code to evaluate (for 'evaluate' action)"),
                    false,
                )
                .add_property(
                    "interactive_only",
                    PropertySchema::boolean(
                        "Only include interactive elements in snapshot (default: false)",
                    ),
                    false,
                )
                .add_property(
                    "full_page",
                    PropertySchema::boolean("Capture full page screenshot (default: false)"),
                    false,
                ),
        )
    }

    async fn execute(&self, args: serde_json::Value) -> Result<ToolResult, ToolError> {
        let action_str = args
            .get("action")
            .and_then(|v| v.as_str())
            .ok_or_else(|| ToolError::InvalidArguments("缺少 action 参数".to_string()))?;

        // 解析操作
        let action = match action_str {
            "open" => {
                let url = args.get("url").and_then(|v| v.as_str()).ok_or_else(|| {
                    ToolError::InvalidArguments("open 操作需要 url 参数".to_string())
                })?;
                BrowserAction::Open {
                    url: url.to_string(),
                }
            }
            "snapshot" => {
                let interactive_only = args
                    .get("interactive_only")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);
                BrowserAction::Snapshot { interactive_only }
            }
            "click" => {
                let selector = args
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        ToolError::InvalidArguments("click 操作需要 selector 参数".to_string())
                    })?;
                BrowserAction::Click {
                    selector: selector.to_string(),
                }
            }
            "fill" => {
                let selector = args
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        ToolError::InvalidArguments("fill 操作需要 selector 参数".to_string())
                    })?;
                let value = args.get("value").and_then(|v| v.as_str()).ok_or_else(|| {
                    ToolError::InvalidArguments("fill 操作需要 value 参数".to_string())
                })?;
                BrowserAction::Fill {
                    selector: selector.to_string(),
                    value: value.to_string(),
                }
            }
            "type" => {
                let selector = args
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        ToolError::InvalidArguments("type 操作需要 selector 参数".to_string())
                    })?;
                let text = args.get("text").and_then(|v| v.as_str()).ok_or_else(|| {
                    ToolError::InvalidArguments("type 操作需要 text 参数".to_string())
                })?;
                BrowserAction::Type {
                    selector: selector.to_string(),
                    text: text.to_string(),
                }
            }
            "press" => {
                let key = args.get("key").and_then(|v| v.as_str()).ok_or_else(|| {
                    ToolError::InvalidArguments("press 操作需要 key 参数".to_string())
                })?;
                BrowserAction::Press {
                    key: key.to_string(),
                }
            }
            "scroll" => {
                let direction = args
                    .get("direction")
                    .and_then(|v| v.as_str())
                    .unwrap_or("down");
                let direction = match direction {
                    "up" => ScrollDirection::Up,
                    "down" => ScrollDirection::Down,
                    "left" => ScrollDirection::Left,
                    "right" => ScrollDirection::Right,
                    _ => ScrollDirection::Down,
                };
                let amount = args
                    .get("amount")
                    .and_then(|v| v.as_i64())
                    .map(|v| v as i32)
                    .unwrap_or(500);
                BrowserAction::Scroll { direction, amount }
            }
            "wait_for" => {
                let selector = args
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| {
                        ToolError::InvalidArguments("wait_for 操作需要 selector 参数".to_string())
                    })?;
                let timeout_ms = args
                    .get("timeout_ms")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(5000);
                BrowserAction::WaitFor {
                    selector: selector.to_string(),
                    timeout_ms,
                }
            }
            "screenshot" => {
                let full_page = args
                    .get("full_page")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);
                let path = args.get("path").and_then(|v| v.as_str()).map(String::from);
                BrowserAction::Screenshot { full_page, path }
            }
            "get_text" => {
                let selector = args
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .map(String::from);
                BrowserAction::GetText { selector }
            }
            "evaluate" => {
                let script = args.get("script").and_then(|v| v.as_str()).ok_or_else(|| {
                    ToolError::InvalidArguments("evaluate 操作需要 script 参数".to_string())
                })?;
                BrowserAction::Evaluate {
                    script: script.to_string(),
                }
            }
            "close" => BrowserAction::Close,
            _ => {
                return Err(ToolError::InvalidArguments(format!(
                    "未知的操作: {}",
                    action_str
                )));
            }
        };

        // 执行操作
        let result = self.execute_action(&action).await?;

        // 构建输出
        let mut output = result.output;

        if let Some(url) = &result.url {
            output = format!("URL: {}\n{}", url, output);
        }
        if let Some(title) = &result.title {
            output = format!("Title: {}\n{}", title, output);
        }

        if result.success {
            Ok(ToolResult::success(output))
        } else {
            Ok(ToolResult::failure_with_output(
                output,
                result.error.unwrap_or_else(|| "未知错误".to_string()),
            ))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tool_definition() {
        let tool = BrowserTool::new();
        let def = tool.definition();

        assert_eq!(def.name, "browser");
        assert!(!def.description.is_empty());
        assert!(def.parameters.required.contains(&"action".to_string()));
    }

    #[test]
    fn test_action_serialization() {
        let action = BrowserAction::Open {
            url: "https://example.com".to_string(),
        };
        let json = serde_json::to_string(&action).unwrap();
        assert!(json.contains("open"));
        assert!(json.contains("https://example.com"));
    }
}
