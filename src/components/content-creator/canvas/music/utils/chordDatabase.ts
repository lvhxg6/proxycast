/**
 * @file 和弦数据库
 * @description 常用吉他和弦指法数据
 */

import type { ChordInfo } from "../types";

/**
 * 吉他和弦数据库
 * fingering: 6弦到1弦的品位，-1表示不弹，0表示空弦
 */
export const CHORD_DATABASE: Record<string, ChordInfo> = {
  // 大三和弦
  C: {
    name: "C",
    notes: ["C", "E", "G"],
    fingering: [-1, 3, 2, 0, 1, 0],
    fret: 0,
  },
  D: {
    name: "D",
    notes: ["D", "F#", "A"],
    fingering: [-1, -1, 0, 2, 3, 2],
    fret: 0,
  },
  E: {
    name: "E",
    notes: ["E", "G#", "B"],
    fingering: [0, 2, 2, 1, 0, 0],
    fret: 0,
  },
  F: {
    name: "F",
    notes: ["F", "A", "C"],
    fingering: [1, 3, 3, 2, 1, 1],
    fret: 1,
  },
  G: {
    name: "G",
    notes: ["G", "B", "D"],
    fingering: [3, 2, 0, 0, 0, 3],
    fret: 0,
  },
  A: {
    name: "A",
    notes: ["A", "C#", "E"],
    fingering: [-1, 0, 2, 2, 2, 0],
    fret: 0,
  },
  B: {
    name: "B",
    notes: ["B", "D#", "F#"],
    fingering: [-1, 2, 4, 4, 4, 2],
    fret: 2,
  },

  // 小三和弦
  Am: {
    name: "Am",
    notes: ["A", "C", "E"],
    fingering: [-1, 0, 2, 2, 1, 0],
    fret: 0,
  },
  Bm: {
    name: "Bm",
    notes: ["B", "D", "F#"],
    fingering: [-1, 2, 4, 4, 3, 2],
    fret: 2,
  },
  Cm: {
    name: "Cm",
    notes: ["C", "Eb", "G"],
    fingering: [-1, 3, 5, 5, 4, 3],
    fret: 3,
  },
  Dm: {
    name: "Dm",
    notes: ["D", "F", "A"],
    fingering: [-1, -1, 0, 2, 3, 1],
    fret: 0,
  },
  Em: {
    name: "Em",
    notes: ["E", "G", "B"],
    fingering: [0, 2, 2, 0, 0, 0],
    fret: 0,
  },
  Fm: {
    name: "Fm",
    notes: ["F", "Ab", "C"],
    fingering: [1, 3, 3, 1, 1, 1],
    fret: 1,
  },
  Gm: {
    name: "Gm",
    notes: ["G", "Bb", "D"],
    fingering: [3, 5, 5, 3, 3, 3],
    fret: 3,
  },

  // 七和弦
  C7: {
    name: "C7",
    notes: ["C", "E", "G", "Bb"],
    fingering: [-1, 3, 2, 3, 1, 0],
    fret: 0,
  },
  D7: {
    name: "D7",
    notes: ["D", "F#", "A", "C"],
    fingering: [-1, -1, 0, 2, 1, 2],
    fret: 0,
  },
  E7: {
    name: "E7",
    notes: ["E", "G#", "B", "D"],
    fingering: [0, 2, 0, 1, 0, 0],
    fret: 0,
  },
  G7: {
    name: "G7",
    notes: ["G", "B", "D", "F"],
    fingering: [3, 2, 0, 0, 0, 1],
    fret: 0,
  },
  A7: {
    name: "A7",
    notes: ["A", "C#", "E", "G"],
    fingering: [-1, 0, 2, 0, 2, 0],
    fret: 0,
  },
  B7: {
    name: "B7",
    notes: ["B", "D#", "F#", "A"],
    fingering: [-1, 2, 1, 2, 0, 2],
    fret: 0,
  },

  // 大七和弦
  Cmaj7: {
    name: "Cmaj7",
    notes: ["C", "E", "G", "B"],
    fingering: [-1, 3, 2, 0, 0, 0],
    fret: 0,
  },
  Dmaj7: {
    name: "Dmaj7",
    notes: ["D", "F#", "A", "C#"],
    fingering: [-1, -1, 0, 2, 2, 2],
    fret: 0,
  },
  Fmaj7: {
    name: "Fmaj7",
    notes: ["F", "A", "C", "E"],
    fingering: [-1, -1, 3, 2, 1, 0],
    fret: 0,
  },
  Gmaj7: {
    name: "Gmaj7",
    notes: ["G", "B", "D", "F#"],
    fingering: [3, 2, 0, 0, 0, 2],
    fret: 0,
  },
  Amaj7: {
    name: "Amaj7",
    notes: ["A", "C#", "E", "G#"],
    fingering: [-1, 0, 2, 1, 2, 0],
    fret: 0,
  },

  // 小七和弦
  Am7: {
    name: "Am7",
    notes: ["A", "C", "E", "G"],
    fingering: [-1, 0, 2, 0, 1, 0],
    fret: 0,
  },
  Bm7: {
    name: "Bm7",
    notes: ["B", "D", "F#", "A"],
    fingering: [-1, 2, 4, 2, 3, 2],
    fret: 2,
  },
  Dm7: {
    name: "Dm7",
    notes: ["D", "F", "A", "C"],
    fingering: [-1, -1, 0, 2, 1, 1],
    fret: 0,
  },
  Em7: {
    name: "Em7",
    notes: ["E", "G", "B", "D"],
    fingering: [0, 2, 0, 0, 0, 0],
    fret: 0,
  },

  // 挂留和弦
  Csus4: {
    name: "Csus4",
    notes: ["C", "F", "G"],
    fingering: [-1, 3, 3, 0, 1, 1],
    fret: 0,
  },
  Dsus4: {
    name: "Dsus4",
    notes: ["D", "G", "A"],
    fingering: [-1, -1, 0, 2, 3, 3],
    fret: 0,
  },
  Gsus4: {
    name: "Gsus4",
    notes: ["G", "C", "D"],
    fingering: [3, 3, 0, 0, 1, 3],
    fret: 0,
  },
  Asus4: {
    name: "Asus4",
    notes: ["A", "D", "E"],
    fingering: [-1, 0, 2, 2, 3, 0],
    fret: 0,
  },

  // 增和弦
  Caug: {
    name: "Caug",
    notes: ["C", "E", "G#"],
    fingering: [-1, 3, 2, 1, 1, 0],
    fret: 0,
  },

  // 减和弦
  Bdim: {
    name: "Bdim",
    notes: ["B", "D", "F"],
    fingering: [-1, 2, 3, 4, 3, -1],
    fret: 0,
  },
};

/**
 * 获取和弦信息
 */
export function getChordInfo(chordName: string): ChordInfo | null {
  // 标准化和弦名称
  const normalized = chordName.trim();
  return CHORD_DATABASE[normalized] || null;
}

/**
 * 获取所有可用的和弦名称
 */
export function getAllChordNames(): string[] {
  return Object.keys(CHORD_DATABASE);
}

/**
 * 根据和弦类型获取和弦列表
 */
export function getChordsByType(
  type: "major" | "minor" | "7" | "maj7" | "m7" | "sus4",
): ChordInfo[] {
  const patterns: Record<string, RegExp> = {
    major: /^[A-G]$/,
    minor: /^[A-G]m$/,
    "7": /^[A-G]7$/,
    maj7: /^[A-G]maj7$/,
    m7: /^[A-G]m7$/,
    sus4: /^[A-G]sus4$/,
  };

  const pattern = patterns[type];
  if (!pattern) return [];

  return Object.entries(CHORD_DATABASE)
    .filter(([name]) => pattern.test(name))
    .map(([, info]) => info);
}
