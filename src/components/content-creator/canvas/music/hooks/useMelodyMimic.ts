/**
 * @file 旋律学习 Hook
 * @description 基于参考歌曲的旋律风格学习
 * @module components/content-creator/canvas/music/hooks/useMelodyMimic
 */

import { useState, useCallback } from "react";
import {
  analyzeMidi,
  convertMp3ToMidi,
  checkPythonEnv,
  type PythonEnvInfo,
} from "../api/tauri";

/**
 * 旋律学习状态
 */
export type MimicState =
  | "idle"
  | "uploading"
  | "converting"
  | "analyzing"
  | "completed"
  | "error";

/**
 * 借鉴程度
 */
export type MimicLevel = "light" | "medium" | "heavy";

/**
 * 旋律分析报告
 */
export interface MelodyAnalysisReport {
  /** 调式信息 */
  mode: string;
  /** BPM */
  bpm: number;
  /** 拍号 */
  timeSignature: string;
  /** 音域范围 */
  range: number;
  /** 平均音高 */
  avgPitch: number;
  /** 音程跳跃频率 */
  intervalJumps: number;
  /** 节奏复杂度 */
  rhythmComplexity: number;
  /** 选中的音轨 */
  selectedTrack: number;
  /** 音轨列表 */
  tracks: Array<{
    index: number;
    name: string;
    instrument: string;
    noteCount: number;
    isVocal: boolean;
  }>;
}

/**
 * 歌词分析报告
 */
export interface LyricsAnalysisReport {
  /** 段落结构 */
  structure: string[];
  /** 平均每句字数 */
  avgCharsPerLine: number;
  /** 押韵模式 */
  rhymeScheme: string;
  /** 主题词 */
  keywords: string[];
}

/**
 * 一致性评分
 */
export interface ConsistencyScore {
  /** 调式一致性 (0-100) */
  modeConsistency: number;
  /** 节奏一致性 (0-100) */
  rhythmConsistency: number;
  /** 结构一致性 (0-100) */
  structureConsistency: number;
  /** 整体评分 (0-100) */
  overall: number;
}

export interface UseMelodyMimicOptions {
  /** 借鉴程度 */
  mimicLevel?: MimicLevel;
  /** 分析完成回调 */
  onAnalysisComplete?: (report: MelodyAnalysisReport) => void;
  /** 错误回调 */
  onError?: (error: string) => void;
}

export interface UseMelodyMimicReturn {
  /** 当前状态 */
  state: MimicState;
  /** 借鉴程度 */
  mimicLevel: MimicLevel;
  /** Python 环境信息 */
  pythonEnv: PythonEnvInfo | null;
  /** 旋律分析报告 */
  melodyReport: MelodyAnalysisReport | null;
  /** 歌词分析报告 */
  lyricsReport: LyricsAnalysisReport | null;
  /** 一致性评分 */
  consistencyScore: ConsistencyScore | null;
  /** 错误信息 */
  error: string | null;
  /** 上传文件 */
  uploadFile: (file: File) => Promise<void>;
  /** 选择音轨 */
  selectTrack: (trackIndex: number) => void;
  /** 设置借鉴程度 */
  setMimicLevel: (level: MimicLevel) => void;
  /** 生成歌词分析 */
  generateLyricsAnalysis: (lyrics: string) => void;
  /** 计算一致性评分 */
  calculateConsistency: (userLyrics: string) => ConsistencyScore;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 旋律学习 Hook
 */
export function useMelodyMimic(
  options: UseMelodyMimicOptions = {},
): UseMelodyMimicReturn {
  const {
    mimicLevel: initialMimicLevel = "medium",
    onAnalysisComplete,
    onError,
  } = options;

  const [state, setState] = useState<MimicState>("idle");
  const [mimicLevel, setMimicLevel] = useState<MimicLevel>(initialMimicLevel);
  const [pythonEnv, setPythonEnv] = useState<PythonEnvInfo | null>(null);
  const [melodyReport, setMelodyReport] = useState<MelodyAnalysisReport | null>(
    null,
  );
  const [lyricsReport, setLyricsReport] = useState<LyricsAnalysisReport | null>(
    null,
  );
  const [consistencyScore, setConsistencyScore] =
    useState<ConsistencyScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [_midiPath, setMidiPath] = useState<string | null>(null);

  // 检查 Python 环境
  const checkEnvironment = useCallback(async () => {
    try {
      const env = await checkPythonEnv();
      setPythonEnv(env);
      return env;
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to check Python environment";
      setError(errorMsg);
      onError?.(errorMsg);
      return null;
    }
  }, [onError]);

  // 上传文件
  const uploadFile = useCallback(
    async (file: File) => {
      try {
        setState("uploading");
        setError(null);

        // 检查 Python 环境
        const env = await checkEnvironment();
        if (!env?.python_installed) {
          throw new Error(
            "Python is not installed. Please install Python 3.x first.",
          );
        }
        if (env.missing_packages.length > 0) {
          throw new Error(
            `Missing Python packages: ${env.missing_packages.join(", ")}. Please install them first.`,
          );
        }

        // 保存文件到临时目录
        const tempPath = `/tmp/${file.name}`;
        await file.arrayBuffer();
        // TODO: 使用 Tauri 的文件系统 API 保存文件

        let finalMidiPath = tempPath;

        // 如果是 MP3 文件,需要转换为 MIDI
        if (file.name.toLowerCase().endsWith(".mp3")) {
          setState("converting");
          const outputPath = tempPath.replace(/\.mp3$/i, ".mid");
          finalMidiPath = await convertMp3ToMidi(tempPath, outputPath);
        }

        // 分析 MIDI 文件
        setState("analyzing");
        const result = await analyzeMidi(finalMidiPath);

        // 转换为前端格式
        const report: MelodyAnalysisReport = {
          mode: result.mode,
          bpm: result.bpm,
          timeSignature: result.time_signature,
          range: result.melody_features.range,
          avgPitch: result.melody_features.avg_pitch,
          intervalJumps: result.melody_features.interval_jumps,
          rhythmComplexity: result.melody_features.rhythm_complexity,
          selectedTrack: 0,
          tracks: result.tracks.map((track) => ({
            index: track.index,
            name: track.name,
            instrument: track.instrument,
            noteCount: track.note_count,
            isVocal: track.is_vocal,
          })),
        };

        setMelodyReport(report);
        setMidiPath(finalMidiPath);
        setState("completed");
        onAnalysisComplete?.(report);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to analyze file";
        setError(errorMsg);
        setState("error");
        onError?.(errorMsg);
      }
    },
    [checkEnvironment, onAnalysisComplete, onError],
  );

  // 选择音轨
  const selectTrack = useCallback(
    (trackIndex: number) => {
      if (!melodyReport) return;

      setMelodyReport({
        ...melodyReport,
        selectedTrack: trackIndex,
      });
    },
    [melodyReport],
  );

  // 生成歌词分析
  const generateLyricsAnalysis = useCallback((lyrics: string) => {
    // 解析歌词结构
    const lines = lyrics.split("\n").filter((line) => line.trim());
    const structure: string[] = [];
    let currentSection = "";

    lines.forEach((line) => {
      const sectionMatch = line.match(/^\[(.*?)\]/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        structure.push(currentSection);
      }
    });

    // 计算平均字数
    const contentLines = lines.filter((line) => !line.startsWith("["));
    const totalChars = contentLines.reduce(
      (sum, line) => sum + line.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "").length,
      0,
    );
    const avgCharsPerLine =
      contentLines.length > 0 ? totalChars / contentLines.length : 0;

    // 简单的押韵模式检测
    const rhymeScheme = "AABB"; // 简化版,实际应该使用押韵检测算法

    // 提取关键词 (简化版)
    const keywords: string[] = [];

    const report: LyricsAnalysisReport = {
      structure,
      avgCharsPerLine: Math.round(avgCharsPerLine),
      rhymeScheme,
      keywords,
    };

    setLyricsReport(report);
  }, []);

  // 计算一致性评分
  const calculateConsistency = useCallback(
    (_userLyrics: string): ConsistencyScore => {
      if (!melodyReport || !lyricsReport) {
        return {
          modeConsistency: 0,
          rhythmConsistency: 0,
          structureConsistency: 0,
          overall: 0,
        };
      }

      // 调式一致性 (简化版)
      const modeConsistency = 80;

      // 节奏一致性 (简化版)
      const rhythmConsistency = 75;

      // 结构一致性 (简化版)
      const structureConsistency = 85;

      // 整体评分
      const overall = Math.round(
        (modeConsistency + rhythmConsistency + structureConsistency) / 3,
      );

      const score: ConsistencyScore = {
        modeConsistency,
        rhythmConsistency,
        structureConsistency,
        overall,
      };

      setConsistencyScore(score);
      return score;
    },
    [melodyReport, lyricsReport],
  );

  // 重置状态
  const reset = useCallback(() => {
    setState("idle");
    setMelodyReport(null);
    setLyricsReport(null);
    setConsistencyScore(null);
    setError(null);
    setMidiPath(null);
  }, []);

  return {
    state,
    mimicLevel,
    pythonEnv,
    melodyReport,
    lyricsReport,
    consistencyScore,
    error,
    uploadFile,
    selectTrack,
    setMimicLevel,
    generateLyricsAnalysis,
    calculateConsistency,
    reset,
  };
}
