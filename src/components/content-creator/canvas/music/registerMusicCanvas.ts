/**
 * @file 音乐画布注册
 * @description 将音乐画布注册到全局画布注册中心
 * @module components/content-creator/canvas/music/registerMusicCanvas
 */

import type { ComponentType } from "react";
import { canvasRegistry } from "../../core/CanvasContainer";
import { MusicCanvas } from "./MusicCanvas";
import type { CanvasPlugin, CanvasProps } from "../../types";

/**
 * 音乐画布插件配置
 */
export const musicCanvasPlugin: CanvasPlugin = {
  type: "music",
  name: "音乐画布",
  icon: "🎵",
  supportedThemes: ["music"],
  supportedFileTypes: ["lyrics", "jianpu", "midi", "mid"],
  // MusicCanvas 接受 MusicCanvasProps，与 CanvasProps 兼容
  component: MusicCanvas as unknown as ComponentType<CanvasProps>,
};

/**
 * 注册音乐画布到全局注册中心
 */
export function registerMusicCanvas(): void {
  canvasRegistry.register(musicCanvasPlugin);
}

/**
 * 注销音乐画布
 */
export function unregisterMusicCanvas(): void {
  canvasRegistry.unregister("music");
}
