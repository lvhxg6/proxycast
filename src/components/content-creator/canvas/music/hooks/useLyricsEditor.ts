/**
 * @file 歌词编辑器 Hook
 * @description 管理歌词编辑状态和操作
 * @module components/content-creator/canvas/music/hooks/useLyricsEditor
 */

import { useState, useCallback, useMemo } from "react";
import type { MusicSection, SectionType } from "../types";
import { createSection } from "../types";
import {
  parseLyrics,
  sectionsToLyrics,
  getLyricsStats,
  type LyricsStats,
} from "../utils/lyricsParser";

export interface UseLyricsEditorOptions {
  initialSections?: MusicSection[];
  onChange?: (sections: MusicSection[]) => void;
}

export interface UseLyricsEditorReturn {
  /** 段落列表 */
  sections: MusicSection[];
  /** 当前选中的段落 ID */
  currentSectionId: string | null;
  /** 当前选中的段落 */
  currentSection: MusicSection | null;
  /** 歌词统计信息 */
  stats: LyricsStats;
  /** 是否处于编辑模式 */
  isEditing: boolean;
  /** 编辑中的文本 */
  editingText: string;

  // 操作方法
  /** 选择段落 */
  selectSection: (sectionId: string | null) => void;
  /** 添加段落 */
  addSection: (type: SectionType, afterId?: string) => void;
  /** 删除段落 */
  deleteSection: (sectionId: string) => void;
  /** 更新段落歌词 */
  updateSectionLyrics: (sectionId: string, lyrics: string[]) => void;
  /** 更新段落名称 */
  updateSectionName: (sectionId: string, name: string) => void;
  /** 移动段落 */
  moveSection: (sectionId: string, direction: "up" | "down") => void;
  /** 从文本导入歌词 */
  importFromText: (text: string) => void;
  /** 导出为文本 */
  exportToText: () => string;
  /** 进入编辑模式 */
  startEditing: () => void;
  /** 保存编辑 */
  saveEditing: () => void;
  /** 取消编辑 */
  cancelEditing: () => void;
  /** 更新编辑文本 */
  setEditingText: (text: string) => void;
}

export function useLyricsEditor(
  options: UseLyricsEditorOptions = {},
): UseLyricsEditorReturn {
  const { initialSections = [], onChange } = options;

  const [sections, setSections] = useState<MusicSection[]>(initialSections);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState("");

  // 当前选中的段落
  const currentSection = useMemo(() => {
    return sections.find((s) => s.id === currentSectionId) || null;
  }, [sections, currentSectionId]);

  // 歌词统计
  const stats = useMemo(() => getLyricsStats(sections), [sections]);

  // 更新段落并触发回调
  const updateSections = useCallback(
    (newSections: MusicSection[]) => {
      setSections(newSections);
      onChange?.(newSections);
    },
    [onChange],
  );

  // 选择段落
  const selectSection = useCallback((sectionId: string | null) => {
    setCurrentSectionId(sectionId);
  }, []);

  // 添加段落
  const addSection = useCallback(
    (type: SectionType, afterId?: string) => {
      const newSection = createSection(type, sections.length + 1);

      let newSections: MusicSection[];
      if (afterId) {
        const index = sections.findIndex((s) => s.id === afterId);
        if (index !== -1) {
          newSections = [
            ...sections.slice(0, index + 1),
            newSection,
            ...sections.slice(index + 1),
          ];
        } else {
          newSections = [...sections, newSection];
        }
      } else {
        newSections = [...sections, newSection];
      }

      // 重新排序
      newSections = newSections.map((s, i) => ({ ...s, order: i + 1 }));
      updateSections(newSections);
      setCurrentSectionId(newSection.id);
    },
    [sections, updateSections],
  );

  // 删除段落
  const deleteSection = useCallback(
    (sectionId: string) => {
      const newSections = sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i + 1 }));
      updateSections(newSections);

      if (currentSectionId === sectionId) {
        setCurrentSectionId(newSections[0]?.id || null);
      }
    },
    [sections, currentSectionId, updateSections],
  );

  // 更新段落歌词
  const updateSectionLyrics = useCallback(
    (sectionId: string, lyrics: string[]) => {
      const newSections = sections.map((s) =>
        s.id === sectionId ? { ...s, lyricsLines: lyrics } : s,
      );
      updateSections(newSections);
    },
    [sections, updateSections],
  );

  // 更新段落名称
  const updateSectionName = useCallback(
    (sectionId: string, name: string) => {
      const newSections = sections.map((s) =>
        s.id === sectionId ? { ...s, name } : s,
      );
      updateSections(newSections);
    },
    [sections, updateSections],
  );

  // 移动段落
  const moveSection = useCallback(
    (sectionId: string, direction: "up" | "down") => {
      const index = sections.findIndex((s) => s.id === sectionId);
      if (index === -1) return;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sections.length) return;

      const newSections = [...sections];
      [newSections[index], newSections[newIndex]] = [
        newSections[newIndex],
        newSections[index],
      ];

      // 重新排序
      const reorderedSections = newSections.map((s, i) => ({
        ...s,
        order: i + 1,
      }));
      updateSections(reorderedSections);
    },
    [sections, updateSections],
  );

  // 从文本导入歌词
  const importFromText = useCallback(
    (text: string) => {
      const parsedSections = parseLyrics(text);
      updateSections(parsedSections);
      if (parsedSections.length > 0) {
        setCurrentSectionId(parsedSections[0].id);
      }
    },
    [updateSections],
  );

  // 导出为文本
  const exportToText = useCallback(() => {
    return sectionsToLyrics(sections);
  }, [sections]);

  // 进入编辑模式
  const startEditing = useCallback(() => {
    setEditingText(sectionsToLyrics(sections));
    setIsEditing(true);
  }, [sections]);

  // 保存编辑
  const saveEditing = useCallback(() => {
    const parsedSections = parseLyrics(editingText);
    updateSections(parsedSections);
    setIsEditing(false);
    setEditingText("");
    if (parsedSections.length > 0) {
      setCurrentSectionId(parsedSections[0].id);
    }
  }, [editingText, updateSections]);

  // 取消编辑
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingText("");
  }, []);

  return {
    sections,
    currentSectionId,
    currentSection,
    stats,
    isEditing,
    editingText,
    selectSection,
    addSection,
    deleteSection,
    updateSectionLyrics,
    updateSectionName,
    moveSection,
    importFromText,
    exportToText,
    startEditing,
    saveEditing,
    cancelEditing,
    setEditingText,
  };
}
