/**
 * @file 音乐画布模块入口
 * @description 导出音乐画布相关组件和类型
 * @module components/content-creator/canvas/music
 */

// 主组件
export { MusicCanvas } from "./MusicCanvas";
export { MusicToolbar } from "./MusicToolbar";

// 注册函数
export {
  registerMusicCanvas,
  unregisterMusicCanvas,
  musicCanvasPlugin,
} from "./registerMusicCanvas";

// 类型导出
export type {
  // 基础类型
  SongType,
  MusicCreationMode,
  MusicViewMode,
  SectionType,
  MoodType,
  OrnamentType,
  // 调式类型
  WesternMode,
  ChinesePentatonicMode,
  ModeType,
  ModeDetection,
  // 音乐元素
  Note,
  Bar,
  MusicSection,
  ChordInfo,
  // 歌曲规格
  SongSpec,
  // 旋律学习
  BorrowLevel,
  MimicCreationMode,
  RhythmStats,
  IntervalStats,
  ContourStats,
  MelodyAnalysisReport,
  LyricsSectionAnalysis,
  ImageryAnalysis,
  LyricsAnalysisReport,
  ConsistencyScore,
  TrackCandidate,
  TrackMatchResult,
  MelodyMimicState,
  // 画布状态
  MusicVersion,
  MusicCanvasState,
  // Props
  MusicCanvasProps,
  MusicToolbarProps,
  LyricsEditorProps,
  JianpuEditorProps,
  // 导出
  MusicExportFormat,
  MusicExportConfig,
  SunoExport,
  TuneeExport,
} from "./types";

// 工具函数
export {
  createInitialSpec,
  createInitialMusicState,
  createInitialMimicState,
  createSection,
  // 常量
  SECTION_TO_SUNO_TAG,
  MODE_EMOTIONAL_FEATURES,
  SONG_TYPE_LABELS,
  MOOD_LABELS,
  CREATION_MODE_LABELS,
  VIEW_MODE_LABELS,
} from "./types";

// Hooks
export * from "./hooks";

// Utils
export * from "./utils";

// API
export * from "./api";

// Editors
export * from "./editors";

// Player
export * from "./player";

// Analysis
export * from "./analysis";

// Export
export * from "./export";
