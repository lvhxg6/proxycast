/**
 * @file Hooks 模块入口
 * @module components/content-creator/canvas/music/hooks
 */

export {
  useLyricsEditor,
  type UseLyricsEditorOptions,
  type UseLyricsEditorReturn,
} from "./useLyricsEditor";

export {
  useRhyme,
  type SectionRhymeAnalysis,
  type UseRhymeReturn,
} from "./useRhyme";

export {
  useMidiPlayback,
  type MidiTrack,
  type PlaybackState,
  type UseMidiPlaybackOptions,
  type UseMidiPlaybackReturn,
} from "./useMidiPlayback";

export {
  useMelodyMimic,
  type MimicState,
  type MimicLevel,
  type MelodyAnalysisReport,
  type LyricsAnalysisReport,
  type ConsistencyScore,
  type UseMelodyMimicOptions,
  type UseMelodyMimicReturn,
} from "./useMelodyMimic";

export {
  useMusicExport,
  type ExportFormat,
  type ExportState,
  type UseMusicExportOptions,
  type UseMusicExportReturn,
} from "./useMusicExport";
