/**
 * @file 简谱解析器
 * @description 解析带简谱和和弦标记的歌词格式
 */

import type { MusicSection, Bar, Note, SectionType } from "../types";

/**
 * 解析后的音乐行
 */
interface ParsedMusicLine {
  chords: string[];
  notes: Note[][];
  lyrics: string;
}

/**
 * 解析后的段落
 */
interface ParsedSection {
  type: SectionType;
  name: string;
  lines: ParsedMusicLine[];
}

/**
 * 段落标记映射
 */
const SECTION_MARKERS: Record<string, SectionType> = {
  intro: "intro",
  前奏: "intro",
  verse: "verse",
  主歌: "verse",
  "pre-chorus": "pre-chorus",
  预副歌: "pre-chorus",
  chorus: "chorus",
  副歌: "chorus",
  bridge: "bridge",
  桥段: "bridge",
  interlude: "interlude",
  间奏: "interlude",
  outro: "outro",
  尾奏: "outro",
};

/**
 * 检测是否为和弦行
 * 和弦行特征：主要由和弦名称和空格组成
 */
function isChordLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // 和弦正则：大写字母开头，可能跟着 m, 7, maj7, dim, aug, sus 等
  const chordPattern =
    /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|7|9|11|13)*[0-9]?$/;
  const parts = trimmed.split(/\s+/);

  // 如果大部分 token 都是和弦，则认为是和弦行
  const chordCount = parts.filter((p) => chordPattern.test(p)).length;
  return chordCount > 0 && chordCount >= parts.length * 0.5;
}

/**
 * 检测是否为简谱行
 * 简谱行特征：包含数字 1-7、0、-、| 等
 */
function isNotationLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // 简谱特征字符
  const notationChars = /[0-7\-|.·]/;
  const hasNotation = notationChars.test(trimmed);

  // 排除纯中文歌词行
  const chineseRatio =
    (trimmed.match(/[\u4e00-\u9fa5]/g) || []).length / trimmed.length;

  return hasNotation && chineseRatio < 0.3;
}

/**
 * 检测是否为段落标记行
 */
/**
 * 检测是否为段落标记行
 */
function isSectionMarker(
  line: string,
): { type: SectionType; name: string } | null {
  const trimmed = line.trim();

  // 匹配 [Verse 1], [Chorus], [主歌1] 等格式
  // 允许后面有额外文本，例如 [Verse 1] 主歌1 - 描述
  const match = trimmed.match(/^\[([^\]]+)\]/);
  if (!match) return null;

  const content = match[1].toLowerCase();

  // 查找匹配的段落类型
  for (const [marker, type] of Object.entries(SECTION_MARKERS)) {
    if (content.includes(marker.toLowerCase())) {
      // 这里的 name 可以更智能一点，比如保留原来的 content 或者 mapping 后的
      // 但现在保留 content 足够
      return { type, name: match[1] };
    }
  }

  // 默认为主歌 (如果看起来像 section tag 但无法识别具体类型)
  // 如果内容看起来像是歌词而不是 tag，返回 null
  // 这里简单处理：如果包含 verse/intro/chorus 等关键字的变体但上面没匹配到，或者就是 unrecognized tag
  // 假设既然是 [...] 开头，大概率是 tag。
  return { type: "verse", name: match[1] };
}

/**
 * 解析和弦行
 */
function parseChordLine(line: string): string[] {
  const chords: string[] = [];
  const parts = line.trim().split(/\s+/);

  for (const part of parts) {
    if (part) {
      chords.push(part);
    }
  }

  return chords;
}

/**
 * 解析简谱行
 */
function parseNotationLine(line: string): Note[][] {
  const bars: Note[][] = [];
  let currentBar: Note[] = [];

  // 按小节线分割
  const segments = line.split("|");

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    currentBar = [];
    let i = 0;

    while (i < trimmed.length) {
      const char = trimmed[i];

      // 跳过空格
      if (char === " ") {
        i++;
        continue;
      }

      // 数字音符 0-7
      if (/[0-7]/.test(char)) {
        const note: Note = {
          pitch: parseInt(char),
          octave: 0,
          duration: 1,
        };

        // 检查后续修饰符
        let j = i + 1;
        while (j < trimmed.length) {
          const modifier = trimmed[j];

          // 高音点 (上点)
          if (modifier === "̇" || modifier === "·" || modifier === "'") {
            note.octave = 1;
            j++;
          }
          // 低音点 (下点)
          else if (modifier === "̣" || modifier === "," || modifier === ".") {
            // 注意：这里的点可能是附点，需要根据上下文判断
            if (j + 1 < trimmed.length && /[0-7]/.test(trimmed[j + 1])) {
              // 如果后面紧跟数字，这个点是低音点
              note.octave = -1;
            } else {
              // 否则是附点
              note.dotted = true;
            }
            j++;
          }
          // 延长线
          else if (modifier === "-") {
            note.duration += 1;
            j++;
          } else {
            break;
          }
        }

        currentBar.push(note);
        i = j;
      }
      // 延长线（独立的）
      else if (char === "-") {
        // 延长前一个音符
        if (currentBar.length > 0) {
          currentBar[currentBar.length - 1].duration += 1;
        }
        i++;
      }
      // 其他字符跳过
      else {
        i++;
      }
    }

    if (currentBar.length > 0) {
      bars.push(currentBar);
    }
  }

  return bars;
}

/**
 * 解析带简谱的歌词内容
 */
export function parseNumberedNotation(text: string): MusicSection[] {
  const lines = text.split("\n");
  const sections: MusicSection[] = [];

  let currentSection: ParsedSection | null = null;
  let pendingChords: string[] = [];
  let pendingNotes: Note[][] = [];
  let sectionOrder = 0;

  const finalizeSection = () => {
    if (currentSection && currentSection.lines.length > 0) {
      const bars: Bar[] = [];
      let barNumber = 1;

      for (const line of currentSection.lines) {
        // 为每个小节创建 Bar
        const maxBars = Math.max(line.chords.length, line.notes.length, 1);

        for (let i = 0; i < maxBars; i++) {
          bars.push({
            id: crypto.randomUUID(),
            barNumber: barNumber++,
            chord: line.chords[i] || "",
            notes: line.notes[i] || [],
            lyrics: i === 0 ? line.lyrics : "",
          });
        }
      }

      sections.push({
        id: crypto.randomUUID(),
        type: currentSection.type,
        name: currentSection.name,
        order: sectionOrder++,
        bars,
        lyricsLines: currentSection.lines.map((l) => l.lyrics).filter(Boolean),
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 空行
    if (!trimmed) {
      continue;
    }

    // 跳过 Markdown 元数据
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("```") ||
      (trimmed.startsWith("-") && trimmed.includes(":")) ||
      trimmed.startsWith("**")
    ) {
      continue;
    }

    // 段落标记
    const sectionMarker = isSectionMarker(trimmed);
    if (sectionMarker) {
      finalizeSection();
      currentSection = {
        type: sectionMarker.type,
        name: sectionMarker.name,
        lines: [],
      };
      pendingChords = [];
      pendingNotes = [];
      continue;
    }

    // 如果还没有段落，创建默认段落
    if (!currentSection) {
      currentSection = {
        type: "verse",
        name: "Verse",
        lines: [],
      };
    }

    // 和弦行
    if (isChordLine(trimmed)) {
      pendingChords = parseChordLine(trimmed);
      continue;
    }

    // 简谱行
    if (isNotationLine(trimmed)) {
      pendingNotes = parseNotationLine(trimmed);
      continue;
    }

    // 歌词行
    currentSection.lines.push({
      chords: pendingChords,
      notes: pendingNotes,
      lyrics: trimmed,
    });

    // 清空待处理的和弦和音符
    pendingChords = [];
    pendingNotes = [];
  }

  // 处理最后一个段落
  finalizeSection();

  return sections;
}

/**
 * 从 MusicSection 提取纯歌词文本
 */
export function extractLyricsFromSections(sections: MusicSection[]): string {
  return sections
    .map((section) => {
      const header = `[${section.name}]`;
      const lyrics = section.lyricsLines.join("\n");
      return `${header}\n${lyrics}`;
    })
    .join("\n\n");
}

/**
 * 检测内容是否包含简谱标记
 */
export function hasNumberedNotation(text: string): boolean {
  const lines = text.split("\n");
  return lines.some((line) => isNotationLine(line));
}

/**
 * 检测内容是否包含和弦标记
 */
export function hasChordMarkers(text: string): boolean {
  const lines = text.split("\n");
  return lines.some((line) => isChordLine(line));
}
