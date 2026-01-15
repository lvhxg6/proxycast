/**
 * @file 简谱渲染组件
 * @description 渲染简谱音符、和弦和歌词
 */

import React, { memo } from "react";
import styled from "styled-components";
import type { MusicSection, Bar, Note } from "../types";

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
      $isSelected ? "hsl(var(--primary))" : "hsl(var(--border))"};
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

const SECTION_DISPLAY_NAMES: Record<string, string> = {
  intro: "前奏",
  verse: "主歌",
  "pre-chorus": "预副歌",
  chorus: "副歌",
  bridge: "桥段",
  interlude: "间奏",
  outro: "尾奏",
};

const SectionTag = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--primary));
  background: hsl(var(--primary) / 0.1);
  padding: 2px 8px;
  border-radius: 4px;
`;

const BarsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const BarGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  padding: 8px;
  border-right: 1px solid hsl(var(--border));

  &:last-child {
    border-right: none;
  }
`;

const ChordName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--primary));
  height: 20px;
  margin-bottom: 4px;
`;

const NotesRow = styled.div`
  display: flex;
  gap: 4px;
  font-family: "Courier New", monospace;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
  min-height: 32px;
  align-items: center;
  justify-content: center;
`;

const NoteCell = styled.span<{ $isRest?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 20px;
  line-height: 1;
  color: ${({ $isRest }) =>
    $isRest ? "hsl(var(--muted-foreground))" : "inherit"};
`;

const OctaveDot = styled.span<{ $position: "top" | "bottom" }>`
  font-size: 16px;
  line-height: 0.5;
  height: 4px;
  font-weight: bold;
  ${({ $position }) =>
    $position === "top" ? "margin-bottom: -4px;" : "margin-top: -4px;"}
`;

const LyricsRow = styled.div`
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  margin-top: 4px;
  text-align: center;
  min-height: 20px;
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

interface NumberedNotationRendererProps {
  sections: MusicSection[];
  currentSectionId: string | null;
  onSectionSelect: (id: string) => void;
}

/**
 * 渲染单个音符
 */
const NoteDisplay: React.FC<{ note: Note }> = memo(({ note }) => {
  const isRest = note.pitch === 0;
  const displayPitch = isRest ? "0" : note.pitch.toString();

  // 计算延长线
  const dashes = note.duration > 1 ? " -".repeat(note.duration - 1) : "";

  return (
    <NoteCell $isRest={isRest}>
      {note.octave > 0 && <OctaveDot $position="top">·</OctaveDot>}
      <span>
        {displayPitch}
        {note.dotted && <span style={{ fontSize: "10px" }}>.</span>}
        {dashes}
      </span>
      {note.octave < 0 && <OctaveDot $position="bottom">·</OctaveDot>}
    </NoteCell>
  );
});

NoteDisplay.displayName = "NoteDisplay";

/**
 * 渲染单个小节
 */
const BarDisplay: React.FC<{ bar: Bar }> = memo(({ bar }) => {
  return (
    <BarGroup>
      <ChordName>{bar.chord || "\u00A0"}</ChordName>
      <NotesRow>
        {bar.notes.length > 0 ? (
          bar.notes.map((note, index) => (
            <NoteDisplay key={index} note={note} />
          ))
        ) : (
          <span style={{ color: "hsl(var(--muted-foreground))" }}>-</span>
        )}
      </NotesRow>
      <LyricsRow>{bar.lyrics || "\u00A0"}</LyricsRow>
    </BarGroup>
  );
});

BarDisplay.displayName = "BarDisplay";

/**
 * 简谱渲染组件
 */
export const NumberedNotationRenderer: React.FC<NumberedNotationRendererProps> =
  memo(({ sections, currentSectionId, onSectionSelect }) => {
    if (sections.length === 0) {
      return (
        <EmptyState>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎼</div>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>暂无简谱数据</div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            请在创作时要求 AI 生成带简谱的歌词
          </div>
        </EmptyState>
      );
    }

    // 检查是否有任何小节包含音符数据
    const hasNotationData = sections.some((section) =>
      section.bars.some((bar) => bar.notes.length > 0),
    );

    if (!hasNotationData) {
      // 如果没有简谱数据，显示歌词和和弦
      return (
        <Container>
          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              $isSelected={section.id === currentSectionId}
              onClick={() => onSectionSelect(section.id)}
            >
              <SectionHeader>
                <SectionTag>
                  [
                  {SECTION_DISPLAY_NAMES[section.type] ||
                    section.type.toUpperCase()}
                  ]
                </SectionTag>
                <span
                  style={{
                    color: "hsl(var(--muted-foreground))",
                    fontSize: "13px",
                  }}
                >
                  {section.name}
                </span>
              </SectionHeader>
              <div
                style={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "14px",
                }}
              >
                {section.lyricsLines.length > 0 ? (
                  section.lyricsLines.map((line, index) => (
                    <div key={index} style={{ marginBottom: "8px" }}>
                      {line}
                    </div>
                  ))
                ) : (
                  <div>暂无歌词</div>
                )}
              </div>
              <div
                style={{
                  marginTop: "12px",
                  padding: "8px",
                  background: "hsl(var(--muted) / 0.5)",
                  borderRadius: "4px",
                  fontSize: "12px",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                💡 提示：要显示简谱，请在创作时要求 AI 使用简谱格式输出
              </div>
            </SectionBlock>
          ))}
        </Container>
      );
    }

    return (
      <Container>
        {sections.map((section) => (
          <SectionBlock
            key={section.id}
            $isSelected={section.id === currentSectionId}
            onClick={() => onSectionSelect(section.id)}
          >
            <SectionHeader>
              <SectionTag>
                [
                {SECTION_DISPLAY_NAMES[section.type] ||
                  section.type.toUpperCase()}
                ]
              </SectionTag>
              <span
                style={{
                  color: "hsl(var(--muted-foreground))",
                  fontSize: "13px",
                }}
              >
                {section.name}
              </span>
            </SectionHeader>
            <BarsContainer>
              {section.bars.map((bar) => (
                <BarDisplay key={bar.id} bar={bar} />
              ))}
            </BarsContainer>
          </SectionBlock>
        ))}
      </Container>
    );
  });

NumberedNotationRenderer.displayName = "NumberedNotationRenderer";

export default NumberedNotationRenderer;
