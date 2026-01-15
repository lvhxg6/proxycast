/**
 * @file 和弦图组件
 * @description SVG 渲染吉他和弦指法图
 */

import React, { memo } from "react";
import styled from "styled-components";
import type { ChordInfo } from "../types";
import { getChordInfo } from "../utils/chordDatabase";

const ChordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const ChordName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
`;

const ChordSvg = styled.svg`
  display: block;
`;

interface ChordDiagramProps {
  /** 和弦名称或和弦信息 */
  chord: string | ChordInfo;
  /** 尺寸 */
  size?: "small" | "medium" | "large";
  /** 是否显示和弦名称 */
  showName?: boolean;
}

const SIZES = {
  small: { width: 50, height: 60, fretHeight: 10, stringGap: 8 },
  medium: { width: 70, height: 85, fretHeight: 14, stringGap: 11 },
  large: { width: 90, height: 110, fretHeight: 18, stringGap: 14 },
};

/**
 * 吉他和弦图组件
 */
export const ChordDiagram: React.FC<ChordDiagramProps> = memo(
  ({ chord, size = "medium", showName = true }) => {
    // 获取和弦信息
    const chordInfo: ChordInfo | null =
      typeof chord === "string" ? getChordInfo(chord) : chord;

    if (!chordInfo) {
      return (
        <ChordContainer>
          {showName && (
            <ChordName style={{ color: "hsl(var(--muted-foreground))" }}>
              {typeof chord === "string" ? chord : "?"}
            </ChordName>
          )}
          <div
            style={{
              width: SIZES[size].width,
              height: SIZES[size].height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            未知和弦
          </div>
        </ChordContainer>
      );
    }

    const { width, height, fretHeight, stringGap } = SIZES[size];
    const padding = 10;
    const nutHeight = 4;
    const fretCount = 4;
    const dotRadius = size === "small" ? 3 : size === "medium" ? 4 : 5;

    // 计算位置
    const startX = padding;
    const startY = padding + nutHeight + 5;
    const gridWidth = stringGap * 5;
    const gridHeight = fretHeight * fretCount;

    // 计算起始品位（用于横按和弦）
    const minFret = Math.min(...chordInfo.fingering.filter((f) => f > 0));
    const baseFret = minFret > 3 ? minFret : 1;
    const showBaseFret = baseFret > 1;

    return (
      <ChordContainer>
        {showName && <ChordName>{chordInfo.name}</ChordName>}
        <ChordSvg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* 琴枕（如果是第一品位） */}
          {!showBaseFret && (
            <rect
              x={startX}
              y={startY - nutHeight}
              width={gridWidth}
              height={nutHeight}
              fill="hsl(var(--foreground))"
            />
          )}

          {/* 品位数字（如果不是第一品位） */}
          {showBaseFret && (
            <text
              x={startX - 8}
              y={startY + fretHeight / 2 + 4}
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
              textAnchor="middle"
            >
              {baseFret}
            </text>
          )}

          {/* 横线（品丝） */}
          {Array.from({ length: fretCount + 1 }).map((_, i) => (
            <line
              key={`fret-${i}`}
              x1={startX}
              y1={startY + i * fretHeight}
              x2={startX + gridWidth}
              y2={startY + i * fretHeight}
              stroke="hsl(var(--border))"
              strokeWidth={i === 0 && !showBaseFret ? 0 : 1}
            />
          ))}

          {/* 竖线（琴弦） */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`string-${i}`}
              x1={startX + i * stringGap}
              y1={startY}
              x2={startX + i * stringGap}
              y2={startY + gridHeight}
              stroke="hsl(var(--foreground))"
              strokeWidth={1}
            />
          ))}

          {/* 手指位置 */}
          {chordInfo.fingering.map((fret, stringIndex) => {
            const x = startX + stringIndex * stringGap;

            // 不弹的弦
            if (fret === -1) {
              return (
                <text
                  key={`mute-${stringIndex}`}
                  x={x}
                  y={startY - 8}
                  fontSize="12"
                  fill="hsl(var(--muted-foreground))"
                  textAnchor="middle"
                >
                  ×
                </text>
              );
            }

            // 空弦
            if (fret === 0) {
              return (
                <circle
                  key={`open-${stringIndex}`}
                  cx={x}
                  cy={startY - 8}
                  r={dotRadius - 1}
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={1.5}
                />
              );
            }

            // 按弦位置
            const adjustedFret = fret - baseFret + 1;
            const y = startY + (adjustedFret - 0.5) * fretHeight;

            return (
              <circle
                key={`finger-${stringIndex}`}
                cx={x}
                cy={y}
                r={dotRadius}
                fill="hsl(var(--foreground))"
              />
            );
          })}

          {/* 横按标记（如果所有弦在同一品位有相同的最小值） */}
          {chordInfo.fret > 0 && (
            <rect
              x={startX - dotRadius}
              y={startY + (1 - 0.5) * fretHeight - dotRadius}
              width={gridWidth + dotRadius * 2}
              height={dotRadius * 2}
              rx={dotRadius}
              fill="hsl(var(--foreground))"
              opacity={0.8}
            />
          )}
        </ChordSvg>
      </ChordContainer>
    );
  },
);

ChordDiagram.displayName = "ChordDiagram";

export default ChordDiagram;
