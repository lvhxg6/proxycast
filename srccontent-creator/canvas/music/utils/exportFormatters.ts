/**
 * @file 导出格式化工具
 * @description 将歌词和音乐数据格式化为不同平台的格式
 * @module components/content-creator/canvas/music/utils/exportFormatters
 */

import type { MusicSection, SongSpec } from "../types";

/**
 * Suno 导出格式
 */
export interface SunoExport {
  /** 带标记的歌词 */
  lyrics: string;
  /** 风格提示词 */
  style: string;
  /** 标签 */
  tags: string[];
}

/**
 * 导出为 Suno 格式
 */
export function exportToSuno(
  sections: MusicSection[],
  spec: SongSpec,
): SunoExport {
  // 生成带标记的歌词
  const lyrics = sections
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const marker = getSectionMarker(section.type);
      const lines = section.lyricsLines.join("\n");
      return `${marker}\n${lines}`;
    })
    .join("\n\n");

  // 生成风格提示词
  const style = generateStylePrompt(spec);

  // 生成标签
  const tags = generateTags(spec);

  return { lyrics, style, tags };
}

/**
 * 导出为纯文本格式
 */
export function exportToText(
  sections: MusicSection[],
  spec: SongSpec,
): string {
  const header = `# ${spec.title}\n\n`;
  const meta = `调式: ${spec.key} | 拍号: ${spec.timeSignature} | 速度: ${spec.tempo} BPM\n\n`;

  const content = sections
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const marker = getSectionMarker(section.type);
      const lines = section.lyricsLines.join("\n");
      return `${marker}\n${lines}`;
    })
    .join("\n\n");

  return header + meta + content;
}

/**
 * 导出为 Markdown 格式
 */
export function exportToMarkdown(
  sections: MusicSection[],
  spec: SongSpec,
): string {
  const header = `# ${spec.title}\n\n`;
  const meta = `**调式**: ${spec.key} | **拍号**: ${spec.timeSignature} | **速度**: ${spec.tempo} BPM\n\n`;

  const content = sections
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const marker = getSectionMarker(section.type);
      const lines = section.lyricsLines.map((line) => `> ${line}`).join("\n");
      return `## ${marker}\n\n${lines}`;
    })
    .join("\n\n");

  return header + meta + content;
}

/**
 * 获取段落标记
 */
function getSectionMarker(type: MusicSection["type"]): string {
  const markers: Record<MusicSection["type"], string> = {
    intro: "[Intro]",
    verse: "[Verse]",
    "pre-chorus": "[Pre-Chorus]",
    chorus: "[Chorus]",
    bridge: "[Bridge]",
    outro: "[Outro]",
  };
  return markers[type] || `[${type}]`;
}

/**
 * 生成风格提示词
 */
function generateStylePrompt(spec: SongSpec): string {
  const parts: string[] = [];

  // 歌曲类型
  const typeMap: Record<SongSpec["songType"], string> = {
    pop: "pop",
    folk: "folk",
    rock: "rock",
    guofeng: "chinese traditional, guofeng",
    rap: "rap, hip-hop",
    other: "contemporary",
  };
  parts.push(typeMap[spec.songType]);

  // 情绪
  const moodMap: Record<SongSpec["mood"], string> = {
    joyful: "upbeat, cheerful",
    gentle: "gentle, soft",
    sorrowful: "melancholic, emotional",
    passionate: "passionate, powerful",
  };
  parts.push(moodMap[spec.mood]);

  // 语言
  parts.push("chinese");

  return parts.join(", ");
}

/**
 * 生成标签
 */
function generateTags(spec: SongSpec): string[] {
  const tags: string[] = [];

  // 歌曲类型标签
  const typeTagMap: Record<SongSpec["songType"], string[]> = {
    pop: ["流行", "pop"],
    folk: ["民谣", "folk"],
    rock: ["摇滚", "rock"],
    guofeng: ["国风", "中国风", "traditional"],
    rap: ["说唱", "rap"],
    other: ["原创"],
  };
  tags.push(...(typeTagMap[spec.songType] || []));

  // 情绪标签
  const moodTagMap: Record<SongSpec["mood"], string[]> = {
    joyful: ["欢快", "cheerful"],
    gentle: ["温柔", "gentle"],
    sorrowful: ["伤感", "emotional"],
    passionate: ["激情", "passionate"],
  };
  tags.push(...(moodTagMap[spec.mood] || []));

  // 语言标签
  tags.push("中文", "chinese");

  return tags;
}

/**
 * 导出为 JSON 格式
 */
export function exportToJSON(
  sections: MusicSection[],
  spec: SongSpec,
): string {
  const data = {
    title: spec.title,
    songType: spec.songType,
    theme: spec.theme,
    key: spec.key,
    timeSignature: spec.timeSignature,
    tempo: spec.tempo,
    mood: spec.mood,
    sections: sections.map((section) => ({
      type: section.type,
      name: section.name,
      order: section.order,
      lyrics: section.lyricsLines,
      repeatCount: section.repeatCount,
    })),
  };

  return JSON.stringify(data, null, 2);
}
