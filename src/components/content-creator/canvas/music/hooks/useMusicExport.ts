/**
 * @file 音乐导出 Hook
 * @description 处理音乐作品的导出功能
 * @module components/content-creator/canvas/music/hooks/useMusicExport
 */

import { useState, useCallback } from "react";
import type { MusicSection, SongSpec } from "../types";
import {
  exportToSuno,
  exportToText,
  exportToMarkdown,
  exportToJSON,
  type SunoExport,
} from "../utils/exportFormatters";

/**
 * 导出格式
 */
export type ExportFormat = "suno" | "text" | "markdown" | "json";

/**
 * 导出状态
 */
export type ExportState = "idle" | "exporting" | "completed" | "error";

export interface UseMusicExportOptions {
  /** 导出完成回调 */
  onExportComplete?: (format: ExportFormat, content: string) => void;
  /** 错误回调 */
  onError?: (error: string) => void;
}

export interface UseMusicExportReturn {
  /** 当前状态 */
  state: ExportState;
  /** 错误信息 */
  error: string | null;
  /** 导出为 Suno 格式 */
  exportSuno: (sections: MusicSection[], spec: SongSpec) => SunoExport;
  /** 导出为纯文本 */
  exportText: (sections: MusicSection[], spec: SongSpec) => string;
  /** 导出为 Markdown */
  exportMarkdown: (sections: MusicSection[], spec: SongSpec) => string;
  /** 导出为 JSON */
  exportJSON: (sections: MusicSection[], spec: SongSpec) => string;
  /** 下载文件 */
  downloadFile: (content: string, filename: string, mimeType: string) => void;
  /** 复制到剪贴板 */
  copyToClipboard: (content: string) => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 音乐导出 Hook
 */
export function useMusicExport(
  options: UseMusicExportOptions = {},
): UseMusicExportReturn {
  const { onExportComplete, onError } = options;

  const [state, setState] = useState<ExportState>("idle");
  const [error, setError] = useState<string | null>(null);

  // 导出为 Suno 格式
  const exportSuno = useCallback(
    (sections: MusicSection[], spec: SongSpec): SunoExport => {
      try {
        setState("exporting");
        const result = exportToSuno(sections, spec);
        setState("completed");
        onExportComplete?.("suno", JSON.stringify(result, null, 2));
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to export to Suno format";
        setError(errorMsg);
        setState("error");
        onError?.(errorMsg);
        throw err;
      }
    },
    [onExportComplete, onError],
  );

  // 导出为纯文本
  const exportText = useCallback(
    (sections: MusicSection[], spec: SongSpec): string => {
      try {
        setState("exporting");
        const result = exportToText(sections, spec);
        setState("completed");
        onExportComplete?.("text", result);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to export to text format";
        setError(errorMsg);
        setState("error");
        onError?.(errorMsg);
        throw err;
      }
    },
    [onExportComplete, onError],
  );

  // 导出为 Markdown
  const exportMarkdown = useCallback(
    (sections: MusicSection[], spec: SongSpec): string => {
      try {
        setState("exporting");
        const result = exportToMarkdown(sections, spec);
        setState("completed");
        onExportComplete?.("markdown", result);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to export to Markdown format";
        setError(errorMsg);
        setState("error");
        onError?.(errorMsg);
        throw err;
      }
    },
    [onExportComplete, onError],
  );

  // 导出为 JSON
  const exportJSON = useCallback(
    (sections: MusicSection[], spec: SongSpec): string => {
      try {
        setState("exporting");
        const result = exportToJSON(sections, spec);
        setState("completed");
        onExportComplete?.("json", result);
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Failed to export to JSON format";
        setError(errorMsg);
        setState("error");
        onError?.(errorMsg);
        throw err;
      }
    },
    [onExportComplete, onError],
  );

  // 下载文件
  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string) => {
      try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to download file";
        setError(errorMsg);
        onError?.(errorMsg);
      }
    },
    [onError],
  );

  // 复制到剪贴板
  const copyToClipboard = useCallback(
    async (content: string) => {
      try {
        await navigator.clipboard.writeText(content);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to copy to clipboard";
        setError(errorMsg);
        onError?.(errorMsg);
        throw err;
      }
    },
    [onError],
  );

  // 重置状态
  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  return {
    state,
    error,
    exportSuno,
    exportText,
    exportMarkdown,
    exportJSON,
    downloadFile,
    copyToClipboard,
    reset,
  };
}
