/**
 * @file 吉他谱渲染组件
 * @description 渲染吉他和弦图和歌词
 */

import React, { memo, useMemo } from "react";
import styled from "styled-components";
import type { MusicSection } from "../types";
import { ChordDiagram } from "./ChordDiagram";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 16px;
  overflow-y: auto;
`;

const SectionBlock = styled.div<{ $isSelected: boolean }>`
  padding: 16px;
  border-radius: 8px;
  background: ${({ $isSelected }) =>
    $isSelected ? "hsl(var(--accent) / 0.1)" : "hsl(var(--muted) / 0.3)"};
  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected ? "hsl(var(--accent))" : "hsl(var(--border))"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: hsl(var(--accent) / 0.05);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const SectionTag = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--accent));
  background: hsl(var(--accent) / 0.1);
  padding: 2px 8px;
  border-radius: 4px;
`;

const ChordRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const ChordWithLyrics = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 70px;
`;

const LyricsText = styled.div`
  font-size: 14px;
  color: hsl(var(--foreground));
  text-align: center;
  max-width: 100px;
  word-break: break-all;
`;

const LyricsOnlyRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid hsl(var(--border));
  margin-top: 8px;
`;

const LyricsLine = styled.div`
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  line-height: 1.8;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: hsl(var(--muted-foreground));
  text-align: center;
`;

const HintBox = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: hsl(var(--muted) / 0.5);
  border-radius: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

interface GuitarTabRendererProps {
  sections: MusicSection[];
  currentSectionId: string | null;
  onSectionSelect: (id: string) => void;
}

/**
 * 从段落中提取唯一的和弦列表
 */
function extractUniqueChords(section: MusicSection): string[] {
  const chords = new Set<string>();
  for (const bar of section.bars) {
    if (bar.chord) {
      chords.add(bar.chord);
    }
  }
  return Array.from(chords);
}

/**
 * 吉他谱渲染组件
 */
export const GuitarTabRenderer: React.FC<GuitarTabRendererProps> = memo(
  ({ sections, currentSectionId, onSectionSelect }) => {
    // 检查是否有和弦数据
    const hasChordData = useMemo(() => {
      return sections.some((section) => section.bars.some((bar) => bar.chord));
    }, [sections]);

    if (sections.length === 0) {
      return (
        <EmptyState>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎸</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            暂无吉他谱数据
          </div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            请在创作时要求 AI 生成带和弦标记的歌词
          </div>
        </EmptyState>
      );
    }

    if (!hasChordData) {
      // 没有和弦数据，显示歌词和提示
      return (
        <Container>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              $isSelected={section.id === currentSectionId}
              onClick={() => onSectionSelect(section.id)}
            >
              <SectionHeader>
                <SectionTag>[{section.type.toUpperCase()}]</SectionTag>
                <span
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "13px",
                  }}
                >
                  {section.name}
                </span>
              </SectionHeader>
              <div>
                {section.lyricsLines.map((line, index) => (
                  <LyricsLine key={index}>{line}</LyricsLine>
                ))}
              </div>
              <HintBox>
                💡 提示：要显示吉他和弦图，请在创作时要求 AI
                在歌词上方标注和弦（如 C, Am, G 等）
              </HintBox>
            </SectionBlock>
          ))}
        </Container>
      );
    }

    return (
      <Container>
        {sections.map((section) => {
          const uniqueChords = extractUniqueChords(section);

          return (
            <SectionBlock
              key={section.id}
              $isSelected={section.id === currentSectionId}
              onClick={() => onSectionSelect(section.id)}
            >
              <SectionHeader>
                <SectionTag>[{section.type.toUpperCase()}]</SectionTag>
                <span
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "13px",
                  }}
                >
                  {section.name}
                </span>
              </SectionHeader>

              {/* 和弦图展示 */}
              {uniqueChords.length > 0 && (
                <ChordRow>
                  {uniqueChords.map((chord) => (
                    <ChordDiagram key={chord} chord={chord} size="medium" />
                  ))}
                </ChordRow>
              )}

              {/* 带和弦的歌词 */}
              <div>
                {section.bars.map((bar) => {
                  if (!bar.chord && !bar.lyrics) return null;
                  return (
                    <ChordWithLyrics
                      key={bar.id}
                      style={{ display: "inline-flex", marginRight: "8px" }}
                    >
                      {bar.chord && (
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "hsl(var(--primary))",
                          }}
                        >
                          {bar.chord}
                        </span>
                      )}
                      {bar.lyrics && <LyricsText>{bar.lyrics}</LyricsText>}
                    </ChordWithLyrics>
                  );
                })}
              </div>

              {/* 纯歌词行（如果有） */}
              {section.lyricsLines.length > 0 &&
                section.bars.every((b) => !b.lyrics) && (
                  <LyricsOnlyRow>
                    {section.lyricsLines.map((line, index) => (
                      <LyricsLine key={index}>{line}</LyricsLine>
                    ))}
                  </LyricsOnlyRow>
                )}
            </SectionBlock>
          );
        })}
      </Container>
    );
  },
);

GuitarTabRenderer.displayName = "GuitarTabRenderer";

export default GuitarTabRenderer;
