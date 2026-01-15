/**
 * @file 押韵检测工具
 * @description 基于拼音韵母的中文押韵检测
 * @module components/content-creator/canvas/music/utils/rhymeDetector
 */

/**
 * 韵母分组 - 相同组内的韵母可以押韵
 */
const RHYME_GROUPS: Record<string, string[]> = {
  // a 韵
  a: ["a", "ia", "ua"],
  // ai 韵
  ai: ["ai", "uai"],
  // ao 韵
  ao: ["ao", "iao"],
  // an 韵
  an: ["an", "ian", "uan", "üan"],
  // ang 韵
  ang: ["ang", "iang", "uang"],
  // e 韵
  e: ["e", "ie", "üe"],
  // ei 韵
  ei: ["ei", "ui"],
  // en 韵
  en: ["en", "in", "un", "ün"],
  // eng 韵
  eng: ["eng", "ing"],
  // i 韵
  i: ["i", "ü"],
  // o 韵
  o: ["o", "uo"],
  // ou 韵
  ou: ["ou", "iu"],
  // ong 韵
  ong: ["ong", "iong"],
  // u 韵
  u: ["u"],
  // er 韵
  er: ["er"],
};

/**
 * 常用字的韵母映射（简化版，实际应用中可以使用更完整的拼音库）
 */
const CHAR_TO_RHYME: Record<string, string> = {
  // a 韵
  爱: "ai",
  在: "ai",
  来: "ai",
  开: "ai",
  怀: "ai",
  猜: "ai",
  陪: "ei",
  待: "ai",
  // an 韵
  伴: "an",
  暖: "an",
  看: "an",
  汗: "an",
  伞: "an",
  岸: "an",
  山: "an",
  田: "ian",
  // ang 韵
  乡: "ang",
  长: "ang",
  方: "ang",
  香: "ang",
  窗: "ang",
  望: "ang",
  想: "iang",
  强: "iang",
  光: "ang",
  向: "iang",
  // ao 韵
  好: "ao",
  老: "ao",
  少: "ao",
  跑: "ao",
  闹: "ao",
  笑: "ao",
  // e 韵
  别: "ie",
  夜: "ie",
  雪: "üe",
  月: "üe",
  切: "ie",
  说: "uo",
  // ei 韵
  美: "ei",
  回: "ui",
  累: "ei",
  醉: "ui",
  泪: "ei",
  岁: "ui",
  // en 韵
  等: "eng",
  朋: "eng",
  冷: "eng",
  疼: "eng",
  能: "eng",
  层: "eng",
  // eng 韵
  梦: "eng",
  风: "eng",
  空: "ong",
  勇: "ong",
  冲: "ong",
  成: "eng",
  功: "ong",
  // i 韵
  力: "i",
  立: "i",
  起: "i",
  地: "i",
  意: "i",
  义: "i",
  // ian 韵
  年: "ian",
  天: "ian",
  前: "ian",
  甜: "ian",
  变: "ian",
  见: "ian",
  // ing 韵
  情: "ing",
  心: "in",
  真: "en",
  深: "en",
  亲: "in",
  信: "in",
  // iu 韵
  留: "iu",
  久: "iu",
  流: "iu",
  愁: "ou",
  求: "iu",
  收: "ou",
  // o 韵
  我: "o",
  多: "uo",
  过: "uo",
  错: "uo",
  落: "uo",
  // ong 韵
  中: "ong",
  痛: "ong",
  重: "ong",
  懂: "ong",
  动: "ong",
  // ou 韵
  走: "ou",
  守: "ou",
  有: "ou",
  后: "ou",
  手: "ou",
  // u 韵
  路: "u",
  步: "u",
  住: "u",
  哭: "u",
  努: "u",
  苦: "u",
  // 更多常用字...
  你: "i",
  他: "a",
  她: "a",
  是: "i",
  的: "e",
  了: "e",
  不: "u",
  这: "e",
  那: "a",
  就: "iu",
  都: "ou",
  也: "ie",
  要: "ao",
  会: "ui",
  可: "e",
  以: "i",
  和: "e",
  人: "en",
  们: "en",
  到: "ao",
  去: "ü",
  得: "e",
  着: "e",
  把: "a",
  给: "ei",
  让: "ang",
  被: "ei",
  从: "ong",
  对: "ui",
  为: "ei",
  很: "en",
  还: "ai",
  但: "an",
  而: "er",
  如: "u",
  果: "uo",
  所: "uo",
  因: "in",
  时: "i",
  候: "ou",
  间: "ian",
  里: "i",
  面: "ian",
  上: "ang",
  下: "ia",
  左: "uo",
  右: "ou",
  外: "ai",
  内: "ei",
  高: "ao",
  低: "i",
  大: "a",
  小: "ao",
  新: "in",
  旧: "iu",
  坏: "uai",
  快: "uai",
  慢: "an",
  早: "ao",
  晚: "an",
  远: "uan",
  近: "in",
  浅: "ian",
  轻: "ing",
  热: "e",
  黑: "ei",
  白: "ai",
  红: "ong",
  绿: "ü",
  蓝: "an",
  黄: "ang",
  春: "un",
  夏: "ia",
  秋: "iu",
  冬: "ong",
  雨: "ü",
  云: "un",
  花: "ua",
  草: "ao",
  树: "u",
  水: "ui",
  河: "e",
  海: "ai",
  日: "i",
  星: "ing",
  影: "ing",
  声: "eng",
  音: "in",
  歌: "e",
  曲: "ü",
  词: "i",
  诗: "i",
  画: "ua",
  书: "u",
  念: "ian",
  思: "i",
  忆: "i",
  记: "i",
  恨: "en",
  喜: "i",
  悲: "ei",
  乐: "e",
  眼: "an",
  脚: "ao",
  头: "ou",
  身: "en",
  体: "i",
  生: "eng",
  死: "i",
  活: "uo",
  命: "ing",
  运: "un",
  气: "i",
  量: "iang",
};

/**
 * 押韵模式
 */
export type RhymeScheme = "AABB" | "ABAB" | "ABCB" | "AAAA" | "FREE";

/**
 * 押韵质量
 */
export type RhymeQuality = "perfect" | "near" | "weak" | "none";

/**
 * 押韵分析结果
 */
export interface RhymeAnalysis {
  /** 押韵模式 */
  scheme: RhymeScheme;
  /** 押韵质量 (0-100) */
  quality: number;
  /** 质量等级 */
  qualityLevel: RhymeQuality;
  /** 韵脚列表 */
  rhymes: string[];
  /** 详细分析 */
  details: RhymeDetail[];
  /** 建议 */
  suggestions: string[];
}

/**
 * 单行押韵详情
 */
export interface RhymeDetail {
  /** 行号 */
  lineIndex: number;
  /** 行内容 */
  line: string;
  /** 韵脚字 */
  rhymeChar: string;
  /** 韵母 */
  rhyme: string;
  /** 韵组 */
  rhymeGroup: string;
  /** 与上一行是否押韵 */
  rhymesWithPrevious: boolean;
}

/**
 * 获取字符的韵母
 */
export function getCharRhyme(char: string): string | null {
  return CHAR_TO_RHYME[char] || null;
}

/**
 * 获取韵母所属的韵组
 */
export function getRhymeGroup(rhyme: string): string | null {
  for (const [group, rhymes] of Object.entries(RHYME_GROUPS)) {
    if (rhymes.includes(rhyme)) {
      return group;
    }
  }
  return null;
}

/**
 * 判断两个韵母是否押韵
 */
export function doRhymesMatch(rhyme1: string, rhyme2: string): boolean {
  if (rhyme1 === rhyme2) return true;

  const group1 = getRhymeGroup(rhyme1);
  const group2 = getRhymeGroup(rhyme2);

  return group1 !== null && group1 === group2;
}

/**
 * 获取行尾韵脚字
 */
export function getLineRhymeChar(line: string): string | null {
  // 移除标点符号
  const cleanLine = line.replace(/[，。！？、；：""''（）【】《》…—\s]/g, "");
  if (cleanLine.length === 0) return null;

  // 返回最后一个字
  return cleanLine[cleanLine.length - 1];
}

/**
 * 分析单行的韵脚
 */
export function analyzeLineRhyme(
  line: string,
  lineIndex: number,
  previousRhyme?: string,
): RhymeDetail {
  const rhymeChar = getLineRhymeChar(line);
  const rhyme = rhymeChar ? getCharRhyme(rhymeChar) || "" : "";
  const rhymeGroup = rhyme ? getRhymeGroup(rhyme) || "" : "";

  return {
    lineIndex,
    line,
    rhymeChar: rhymeChar || "",
    rhyme,
    rhymeGroup,
    rhymesWithPrevious: previousRhyme
      ? doRhymesMatch(rhyme, previousRhyme)
      : false,
  };
}

/**
 * 检测押韵模式
 */
function detectRhymeScheme(details: RhymeDetail[]): RhymeScheme {
  if (details.length < 2) return "FREE";

  const groups = details.map((d) => d.rhymeGroup);

  // 检测 AAAA (全部相同)
  if (groups.every((g) => g === groups[0] && g !== "")) {
    return "AAAA";
  }

  // 检测 AABB (两两相同)
  if (details.length >= 4) {
    let isAABB = true;
    for (let i = 0; i < details.length - 1; i += 2) {
      if (groups[i] !== groups[i + 1] || groups[i] === "") {
        isAABB = false;
        break;
      }
    }
    if (isAABB) return "AABB";
  }

  // 检测 ABAB (交错押韵)
  if (details.length >= 4) {
    const oddGroups = groups.filter((_, i) => i % 2 === 0);
    const evenGroups = groups.filter((_, i) => i % 2 === 1);

    const oddSame = oddGroups.every((g) => g === oddGroups[0] && g !== "");
    const evenSame = evenGroups.every((g) => g === evenGroups[0] && g !== "");

    if (oddSame && evenSame && oddGroups[0] !== evenGroups[0]) {
      return "ABAB";
    }
  }

  // 检测 ABCB (隔行押韵)
  if (details.length >= 4) {
    const evenGroups = groups.filter((_, i) => i % 2 === 1);
    const evenSame = evenGroups.every((g) => g === evenGroups[0] && g !== "");

    if (evenSame) {
      return "ABCB";
    }
  }

  return "FREE";
}

/**
 * 计算押韵质量分数
 */
function calculateRhymeQuality(details: RhymeDetail[]): number {
  if (details.length < 2) return 0;

  let matchCount = 0;
  let totalPairs = 0;

  for (let i = 1; i < details.length; i++) {
    if (details[i].rhyme && details[i - 1].rhyme) {
      totalPairs++;
      if (details[i].rhymesWithPrevious) {
        matchCount++;
      }
    }
  }

  if (totalPairs === 0) return 0;

  return Math.round((matchCount / totalPairs) * 100);
}

/**
 * 获取质量等级
 */
function getQualityLevel(quality: number): RhymeQuality {
  if (quality >= 80) return "perfect";
  if (quality >= 60) return "near";
  if (quality >= 30) return "weak";
  return "none";
}

/**
 * 生成押韵建议
 */
function generateSuggestions(
  details: RhymeDetail[],
  scheme: RhymeScheme,
  quality: number,
): string[] {
  const suggestions: string[] = [];

  if (quality < 50) {
    suggestions.push("押韵质量较低，建议调整部分行尾用词");
  }

  // 找出不押韵的行
  const nonRhymingLines = details.filter(
    (d, i) => i > 0 && !d.rhymesWithPrevious && d.rhyme,
  );

  if (nonRhymingLines.length > 0) {
    const lineNumbers = nonRhymingLines.map((d) => d.lineIndex + 1).join("、");
    suggestions.push(`第 ${lineNumbers} 行与前一行不押韵，可考虑调整`);
  }

  // 根据模式给出建议
  if (scheme === "FREE" && details.length >= 4) {
    suggestions.push("当前为自由韵，可尝试 AABB 或 ABAB 模式增强节奏感");
  }

  return suggestions;
}

/**
 * 分析歌词押韵
 * @param lines 歌词行数组
 * @returns 押韵分析结果
 */
export function analyzeRhyme(lines: string[]): RhymeAnalysis {
  // 过滤空行
  const validLines = lines.filter((line) => line.trim().length > 0);

  if (validLines.length === 0) {
    return {
      scheme: "FREE",
      quality: 0,
      qualityLevel: "none",
      rhymes: [],
      details: [],
      suggestions: ["请添加歌词内容"],
    };
  }

  // 分析每行
  const details: RhymeDetail[] = [];
  for (let i = 0; i < validLines.length; i++) {
    const previousRhyme = i > 0 ? details[i - 1].rhyme : undefined;
    details.push(analyzeLineRhyme(validLines[i], i, previousRhyme));
  }

  // 检测押韵模式
  const scheme = detectRhymeScheme(details);

  // 计算质量分数
  const quality = calculateRhymeQuality(details);
  const qualityLevel = getQualityLevel(quality);

  // 提取韵脚
  const rhymes = details.map((d) => d.rhymeChar).filter(Boolean);

  // 生成建议
  const suggestions = generateSuggestions(details, scheme, quality);

  return {
    scheme,
    quality,
    qualityLevel,
    rhymes,
    details,
    suggestions,
  };
}

/**
 * 获取押韵词建议
 * @param rhymeGroup 韵组
 * @param theme 主题（可选）
 * @returns 押韵词列表
 */
export function getRhymeSuggestions(
  rhymeGroup: string,
  _theme?: string,
): string[] {
  // 基于韵组返回常用押韵词
  const suggestions: Record<string, string[]> = {
    ai: ["爱", "在", "来", "开", "怀", "猜", "等待", "期待"],
    an: ["伴", "暖", "看", "岸", "山", "田", "温暖", "陪伴"],
    ang: ["乡", "长", "方", "香", "望", "想", "希望", "远方"],
    ao: ["好", "老", "少", "跑", "笑", "闹", "美好", "年少"],
    ei: ["美", "累", "泪", "岁", "醉", "回", "珍贵", "无悔"],
    en: ["等", "冷", "疼", "能", "深", "真", "永恒", "认真"],
    eng: ["梦", "风", "成", "冲", "勇", "空", "成功", "感动"],
    i: ["力", "立", "起", "地", "意", "义", "坚毅", "奇迹"],
    ian: ["年", "天", "前", "甜", "变", "见", "遇见", "青春"],
    ing: ["情", "心", "亲", "信", "星", "影", "心情", "感情"],
    iu: ["留", "久", "流", "求", "收", "秋", "停留", "不朽"],
    ong: ["中", "痛", "重", "懂", "动", "梦", "感动", "心痛"],
    ou: ["走", "守", "有", "后", "手", "头", "拥有", "温柔"],
    u: ["路", "步", "住", "哭", "努", "苦", "付出", "坚持"],
  };

  return suggestions[rhymeGroup] || [];
}

/**
 * 押韵模式描述
 */
export const RHYME_SCHEME_DESCRIPTIONS: Record<RhymeScheme, string> = {
  AABB: "两行一韵，连续押韵 - 适合流行歌曲，容易上口",
  ABAB: "交错押韵 - 增加节奏变化，适合抒情歌曲",
  ABCB: "隔行押韵 - 常用于民谣和说唱",
  AAAA: "通韵到底 - 适合短小精悍的段落",
  FREE: "自由韵 - 不拘泥于固定模式",
};
