/**
 * @file 画布工具函数
 * @description 画布相关的工具函数和类型定义
 * @module components/content-creator/canvas/canvasUtils
 */

import type { ThemeType } from "../types";
import { createInitialDocumentState } from "./document";
import type { DocumentCanvasState } from "./document/types";
import { createInitialPosterState } from "./poster";
import type { PosterCanvasState } from "./poster/types";
import { createInitialMusicState } from "./music";
import type { MusicCanvasState } from "./music/types";

/**
 * 画布状态联合类型
 */
export type CanvasStateUnion =
  | DocumentCanvasState
  | PosterCanvasState
  | MusicCanvasState;

/**
 * 画布类型
 */
export type CanvasType = "document" | "poster" | "music";

/**
 * 主题到画布类型的映射
 */
const THEME_TO_CANVAS_TYPE: Record<ThemeType, CanvasType | null> = {
  general: null,
  knowledge: null,
  planning: null,
  "social-media": "document",
  poster: "poster",
  document: "document",
  paper: "document",
  novel: "document",
  script: "document",
  music: "music",
  video: null,
};

/**
 * 获取主题对应的画布类型
 */
export function getCanvasTypeForTheme(theme: ThemeType): CanvasType | null {
  return THEME_TO_CANVAS_TYPE[theme];
}

/**
 * 判断主题是否支持画布
 */
export function isCanvasSupported(theme: ThemeType): boolean {
  return THEME_TO_CANVAS_TYPE[theme] !== null;
}

/**
 * 根据主题创建初始画布状态
 */
export function createInitialCanvasState(
  theme: ThemeType,
  content?: string,
): CanvasStateUnion | null {
  const canvasType = THEME_TO_CANVAS_TYPE[theme];

  switch (canvasType) {
    case "document":
      return createInitialDocumentState(content || "");
    case "poster":
      return createInitialPosterState();
    case "music":
      return createInitialMusicState();
    default:
      return null;
  }
}
