/**
 * @file 押韵检测 Hook
 * @description 提供押韵分析和建议功能
 * @module components/content-creator/canvas/music/hooks/useRhyme
 */

import { useMemo, useCallback } from "react";
import type { MusicSection } from "../types";
import {
  analyzeRhyme,
  getRhymeSuggestions,
  type RhymeAnalysis,
  type RhymeScheme,
} from "../utils/rhymeDetector";

export interface SectionRhymeAnalysis {
  /** 段落 ID */
  sectionId: string;
  /** 段落名称 */
  sectionName: string;
  /** 押韵分析结果 */
  analysis: RhymeAnalysis;
}

export interface UseRhymeReturn {
  /** 所有段落的押韵分析 */
  sectionAnalyses: SectionRhymeAnalysis[];
  /** 整体押韵质量 (0-100) */
  overallQuality: number;
  /** 主要押韵模式 */
  dominantScheme: RhymeScheme;
  /** 分析指定段落 */
  analyzeSection: (section: MusicSection) => RhymeAnalysis;
  /** 获取押韵词建议 */
  getSuggestions: (rhymeGroup: string) => string[];
  /** 获取段落的押韵建议 */
  getSectionSuggestions: (sectionId: string) => string[];
}

/**
 * 押韵检测 Hook
 * @param sections 段落列表
 */
export function useRhyme(sections: MusicSection[]): UseRhymeReturn {
  // 分析所有段落
  const sectionAnalyses = useMemo<SectionRhymeAnalysis[]>(() => {
    return sections.map((section) => ({
      sectionId: section.id,
      sectionName: section.name,
      analysis: analyzeRhyme(section.lyricsLines),
    }));
  }, [sections]);

  // 计算整体押韵质量
  const overallQuality = useMemo(() => {
    if (sectionAnalyses.length === 0) return 0;

    const totalQuality = sectionAnalyses.reduce(
      (sum, sa) => sum + sa.analysis.quality,
      0,
    );
    return Math.round(totalQuality / sectionAnalyses.length);
  }, [sectionAnalyses]);

  // 确定主要押韵模式
  const dominantScheme = useMemo<RhymeScheme>(() => {
    if (sectionAnalyses.length === 0) return "FREE";

    const schemeCounts: Record<RhymeScheme, number> = {
      AABB: 0,
      ABAB: 0,
      ABCB: 0,
      AAAA: 0,
      FREE: 0,
    };

    sectionAnalyses.forEach((sa) => {
      schemeCounts[sa.analysis.scheme]++;
    });

    let maxScheme: RhymeScheme = "FREE";
    let maxCount = 0;

    for (const [scheme, count] of Object.entries(schemeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxScheme = scheme as RhymeScheme;
      }
    }

    return maxScheme;
  }, [sectionAnalyses]);

  // 分析指定段落
  const analyzeSection = useCallback((section: MusicSection): RhymeAnalysis => {
    return analyzeRhyme(section.lyricsLines);
  }, []);

  // 获取押韵词建议
  const getSuggestions = useCallback((rhymeGroup: string): string[] => {
    return getRhymeSuggestions(rhymeGroup);
  }, []);

  // 获取段落的押韵建议
  const getSectionSuggestions = useCallback(
    (sectionId: string): string[] => {
      const sectionAnalysis = sectionAnalyses.find(
        (sa) => sa.sectionId === sectionId,
      );
      return sectionAnalysis?.analysis.suggestions || [];
    },
    [sectionAnalyses],
  );

  return {
    sectionAnalyses,
    overallQuality,
    dominantScheme,
    analyzeSection,
    getSuggestions,
    getSectionSuggestions,
  };
}
