/**
 * @file 工具函数模块入口
 * @module components/content-creator/canvas/music/utils
 */

export {
  parseLyrics,
  sectionsToLyrics,
  countLyricsChars,
  countSectionChars,
  countTotalChars,
  getLyricsStats,
  type LyricsStats,
} from "./lyricsParser";

export {
  analyzeRhyme,
  getCharRhyme,
  getRhymeGroup,
  doRhymesMatch,
  getLineRhymeChar,
  analyzeLineRhyme,
  getRhymeSuggestions,
  RHYME_SCHEME_DESCRIPTIONS,
  type RhymeScheme,
  type RhymeQuality,
  type RhymeAnalysis,
  type RhymeDetail,
} from "./rhymeDetector";

export {
  exportToSuno,
  exportToText,
  exportToMarkdown,
  exportToJSON,
  type SunoExport,
} from "./exportFormatters";

export {
  parseNumberedNotation,
  extractLyricsFromSections,
  hasNumberedNotation,
  hasChordMarkers,
} from "./numberedNotationParser";

export {
  CHORD_DATABASE,
  getChordInfo,
  getAllChordNames,
  getChordsByType,
} from "./chordDatabase";
