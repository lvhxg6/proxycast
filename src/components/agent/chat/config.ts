/**
 * Agent 后端配置
 *
 * 用于切换 Native 和 Aster 后端
 */

export type AgentBackend = "native" | "aster";

// 默认使用 Native 后端，可以通过 localStorage 切换
const STORAGE_KEY = "proxycast_agent_backend";

/**
 * 获取当前 Agent 后端
 */
export function getAgentBackend(): AgentBackend {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "aster" || stored === "native") {
    return stored;
  }
  return "native"; // 默认
}

/**
 * 设置 Agent 后端
 */
export function setAgentBackend(backend: AgentBackend): void {
  localStorage.setItem(STORAGE_KEY, backend);
}

/**
 * 是否使用 Aster 后端
 */
export function useAsterBackend(): boolean {
  return getAgentBackend() === "aster";
}
