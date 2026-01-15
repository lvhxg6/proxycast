/**
 * @file 歌词解析工具
 * @description 解析歌词文本，识别段落标记和结构
 * @module components/content-creator/canvas/music/utils/lyricsParser
 */

import type { MusicSection, SectionType } from "../types";
import { createSection } from "../types";

/**
 * 段落标记正则表达式
 * 支持格式：[Verse 1], [Chorus], [verse1], [主歌1] 等
 */
const SECTION_TAG_REGEX = /^\[(.*?)\]/i;

/**
 * 段落类型映射
 */
const SECTION_TYPE_MAP: Record<string, SectionType> = {
  // 英文标记
  intro: "intro",
  verse: "verse",
  "pre-chorus": "pre-chorus",
  prechorus: "pre-chorus",
  chorus: "chorus",
  bridge: "bridge",
  interlude: "interlude",
  outro: "outro",
  // 中文标记
  前奏: "intro",
  主歌: "verse",
  预副歌: "pre-chorus",
  副歌: "chorus",
  桥段: "bridge",
  间奏: "interlude",
  尾声: "outro",
};

/**
 * 解析段落标记
 */
function parseSectionTag(
  tagLine: string,
): { type: SectionType; index?: number } | null {
  const match = tagLine.match(SECTION_TAG_REGEX);
  if (!match) return null;

  const content = match[1].toLowerCase().trim();

  // 检查是否为 info 标记（跳过）
  if (content === "info" || content === "信息") {
    return null;
  }

  // 尝试匹配类型和序号
  // 先尝试直接匹配
  for (const [key, type] of Object.entries(SECTION_TYPE_MAP)) {
    if (content.startsWith(key)) {
      // 提取可能的序号
      const rest = content.slice(key.length).trim();
      const numMatch = rest.match(/^(\d+)/);
      return {
        type,
        index: numMatch ? parseInt(numMatch[1], 10) : undefined,
      };
    }
  }

  // 如果没有匹配到标准类型，尝试更宽松的匹配
  if (content.includes("verse") || content.includes("主歌"))
    return { type: "verse" };
  if (content.includes("chorus") || content.includes("副歌"))
    return { type: "chorus" };
  if (content.includes("intro") || content.includes("前奏"))
    return { type: "intro" };
  if (
    content.includes("outro") ||
    content.includes("尾奏") ||
    content.includes("尾声")
  )
    return { type: "outro" };
  if (content.includes("bridge") || content.includes("桥段"))
    return { type: "bridge" };
  if (content.includes("pre") || content.includes("预"))
    return { type: "pre-chorus" };

  return null;
}

/**
 * 解析歌词文本
 * @param text 歌词文本
 * @returns 解析后的段落列表
 */
export function parseLyrics(text: string): MusicSection[] {
  const lines = text.split("\n");
  const sections: MusicSection[] = [];
  let currentSection: MusicSection | null = null;
  let sectionOrder = 0;
  let inInfoBlock = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // 跳过空行
    if (!trimmedLine) {
      continue;
    }

    // 跳过 Markdown 标题和列表标记 (除非看起来像歌词)
    // 假设歌词不会以 #, *, - 开头，或者是 ``` 代码块标记
    // 统一过滤非歌词内容
    if (
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith("```") ||
      trimmedLine.startsWith("**") ||
      ((trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) &&
        trimmedLine.includes(":")) ||
      /^(title|artist|songtype|mood|theme|tempo|bpm|key|date|author|composer|lyricist)\s*[:：]/i.test(
        trimmedLine,
      )
    ) {
      continue;
    }

    // 检查是否为段落标记
    if (SECTION_TAG_REGEX.test(trimmedLine)) {
      // 检查是否为 info 块
      const tagMatch = trimmedLine.match(SECTION_TAG_REGEX);
      const tagContent = tagMatch ? tagMatch[1].toLowerCase() : "";

      if (tagContent === "info" || tagContent === "信息") {
        inInfoBlock = true;
        continue;
      }

      // 结束 info 块
      inInfoBlock = false;

      // 保存当前段落
      if (currentSection && currentSection.lyricsLines.length > 0) {
        sections.push(currentSection);
      }

      // 解析新段落
      const parsed = parseSectionTag(trimmedLine);
      if (parsed) {
        sectionOrder++;
        currentSection = createSection(parsed.type, sectionOrder);
        if (parsed.index) {
          currentSection.name = `${currentSection.name} ${parsed.index}`;
        }
      } else {
        // 如果是 [xxx] 但无法解析为已知段落，可能是歌词的一部分或者是未知的元数据
        // 如果我们还没有任何段落，或者当前是默认段落，我们可能应该忽略它或者把它当歌词
        // 这里选择安全的做法：如果看起来像段落标记但无法识别，且我们已经在段落中，就当作歌词
        if (currentSection) {
          // 只有当它不包含 "info" 等关键字时才当作歌词
          currentSection.lyricsLines.push(trimmedLine);
        }
      }
      continue;
    }

    // 跳过 info 块内容
    if (inInfoBlock) {
      continue;
    }

    // 添加歌词行到当前段落
    if (currentSection) {
      currentSection.lyricsLines.push(trimmedLine);
    } else {
      // 如果没有段落标记，且这行看起来像有效歌词（不是元数据），创建默认主歌段落
      if (!trimmedLine.startsWith("songType") && !trimmedLine.includes("BPM")) {
        sectionOrder++;
        currentSection = createSection("verse", sectionOrder);
        currentSection.lyricsLines.push(trimmedLine);
      }
    }
  }

  // 保存最后一个段落
  if (currentSection && currentSection.lyricsLines.length > 0) {
    sections.push(currentSection);
  }

  return sections;
}

/**
 * 将段落列表转换为歌词文本
 * @param sections 段落列表
 * @returns 歌词文本
 */
export function sectionsToLyrics(sections: MusicSection[]): string {
  const lines: string[] = [];

  for (const section of sections) {
    // 添加段落标记
    const tag = getSectionTag(section.type);
    lines.push(`[${tag}]`);

    // 添加歌词行
    for (const line of section.lyricsLines) {
      lines.push(line);
    }

    // 段落之间添加空行
    lines.push("");
  }

  return lines.join("\n").trim();
}

/**
 * 获取段落标记
 */
function getSectionTag(type: SectionType): string {
  const tagMap: Record<SectionType, string> = {
    intro: "Intro",
    verse: "Verse",
    "pre-chorus": "Pre-Chorus",
    chorus: "Chorus",
    bridge: "Bridge",
    interlude: "Interlude",
    outro: "Outro",
  };
  return tagMap[type];
}

/**
 * 统计歌词字数（排除标点和空格）
 */
export function countLyricsChars(text: string): number {
  // 排除标点符号和空白字符
  const cleanText = text.replace(
    /[\s，。！？、；：""''（）【】《》…—[\]]/g,
    "",
  );
  // 只计算有效字符
  const validChars = cleanText.match(/[\u4e00-\u9fa5a-zA-Z0-9]/g);
  return validChars ? validChars.length : 0;
}

/**
 * 统计段落字数
 */
export function countSectionChars(section: MusicSection): number {
  return section.lyricsLines.reduce(
    (sum, line) => sum + countLyricsChars(line),
    0,
  );
}

/**
 * 统计所有段落总字数
 */
export function countTotalChars(sections: MusicSection[]): number {
  return sections.reduce((sum, section) => sum + countSectionChars(section), 0);
}

/**
 * 获取歌词统计信息
 */
export interface LyricsStats {
  totalSections: number;
  totalLines: number;
  totalChars: number;
  sectionStats: {
    type: SectionType;
    name: string;
    lines: number;
    chars: number;
  }[];
}

export function getLyricsStats(sections: MusicSection[]): LyricsStats {
  const sectionStats = sections.map((section) => ({
    type: section.type,
    name: section.name,
    lines: section.lyricsLines.length,
    chars: countSectionChars(section),
  }));

  return {
    totalSections: sections.length,
    totalLines: sectionStats.reduce((sum, s) => sum + s.lines, 0),
    totalChars: sectionStats.reduce((sum, s) => sum + s.chars, 0),
    sectionStats,
  };
}
