<div align="center">

# ProxyCast 🚀

**AI Agent 创作工具平台**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)

</div>

---

## ✨ 核心特性

- **多 Provider 统一管理** - 支持 Kiro、Gemini、通义千问、Antigravity、Vertex AI 等多种 AI 服务
- **智能凭证管理** - 自动检测凭证变化、Token 自动刷新、配额超限自动切换
- **完整 API 兼容** - 支持 OpenAI Chat API 和 Anthropic Messages API
- **友好图形界面** - Dashboard 监控、Provider 管理、日志查看

---

## 🚀 快速开始

### 安装

#### macOS (Homebrew)

```bash
brew tap aiclientproxy/tap
brew install --cask proxycast
```

#### 手动下载

从 [Releases](https://github.com/aiclientproxy/proxycast/releases) 下载对应平台安装包。

### 使用

1. 启动 ProxyCast
2. 加载凭证 - Provider 管理页面点击"一键读取凭证"
3. 启动服务 - Dashboard 点击"启动服务器"
4. 配置客户端：
   ```
   API Base URL: http://localhost:8999/v1
   API Key: 启动时自动生成（设置页查看）
   ```

---

## 🛠️ 开发构建

```bash
# 安装依赖
npm install

# 开发模式
npm run tauri dev

# 构建发布
npm run tauri build
```

---

## 📄 开源协议

[GNU General Public License v3 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0)

## ⚠️ 免责声明

本项目仅供学习研究使用，用户需自行承担使用风险。本项目不提供 AI 模型服务，所有服务由第三方提供商提供。
