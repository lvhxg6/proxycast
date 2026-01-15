/**
 * @file 歌词编辑器组件
 * @description 提供歌词编辑、段落管理功能
 * @module components/content-creator/canvas/music/editors/LyricsEditor
 */

import React, { memo, useCallback, useState } from "react";
import styled from "styled-components";
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit3,
  Music,
} from "lucide-react";
import type { MusicSection, SectionType } from "../types";
import { countSectionChars } from "../utils/lyricsParser";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border));
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--foreground));
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled.button<{ $variant?: "default" | "danger" }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $variant }) =>
      $variant === "danger"
        ? "hsl(var(--destructive) / 0.1)"
        : "hsl(var(--muted))"};
    color: ${({ $variant }) =>
      $variant === "danger"
        ? "hsl(var(--destructive))"
        : "hsl(var(--foreground))"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const SectionList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
`;

const SectionCard = styled.div<{ $isSelected: boolean }>`
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 8px;
  background: ${({ $isSelected }) =>
    $isSelected ? "hsl(var(--accent) / 0.1)" : "hsl(var(--muted) / 0.3)"};
  border: 1px solid
    ${({ $isSelected }) =>
      $isSelected ? "hsl(var(--accent))" : "hsl(var(--border))"};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $isSelected }) =>
      $isSelected ? "hsl(var(--accent) / 0.15)" : "hsl(var(--muted) / 0.5)"};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const SectionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: hsl(var(--accent));
  background: hsl(var(--accent) / 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const SectionName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: hsl(var(--foreground));
`;

const SectionStats = styled.span`
  font-size: 11px;
  color: hsl(var(--muted-foreground));
`;

const SectionActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;

  ${SectionCard}:hover & {
    opacity: 1;
  }
`;

const LyricsPreview = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
  max-height: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LyricsLine = styled.p`
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AddSectionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: 2px dashed hsl(var(--border));
  border-radius: 8px;
  background: transparent;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: hsl(var(--accent));
    color: hsl(var(--accent));
    background: hsl(var(--accent) / 0.05);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AddSectionMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 8px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const AddSectionMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: hsl(var(--muted));
  }
`;

const AddSectionWrapper = styled.div`
  position: relative;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  text-align: center;
  color: hsl(var(--muted-foreground));
`;

const EmptyIcon = styled.div`
  font-size: 32px;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  font-size: 13px;
  margin: 0 0 16px 0;
`;

interface LyricsEditorProps {
  sections: MusicSection[];
  currentSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: "up" | "down") => void;
}

const SECTION_TYPES: { type: SectionType; label: string; icon: string }[] = [
  { type: "verse", label: "主歌 (Verse)", icon: "🎤" },
  { type: "chorus", label: "副歌 (Chorus)", icon: "🎵" },
  { type: "pre-chorus", label: "预副歌 (Pre-Chorus)", icon: "🎶" },
  { type: "bridge", label: "桥段 (Bridge)", icon: "🌉" },
  { type: "intro", label: "前奏 (Intro)", icon: "🎬" },
  { type: "outro", label: "尾奏 (Outro)", icon: "🎭" },
  { type: "interlude", label: "间奏 (Interlude)", icon: "🎹" },
];

export const LyricsEditor: React.FC<LyricsEditorProps> = memo(
  ({
    sections,
    currentSectionId,
    onSectionSelect,
    onAddSection,
    onDeleteSection,
    onMoveSection,
  }) => {
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleAddSection = useCallback(
      (type: SectionType) => {
        onAddSection(type);
        setShowAddMenu(false);
      },
      [onAddSection],
    );

    const handleSectionClick = useCallback(
      (sectionId: string) => {
        onSectionSelect(sectionId);
      },
      [onSectionSelect],
    );

    if (sections.length === 0) {
      return (
        <Container>
          <Header>
            <Title>
              <Music size={16} />
              歌词编辑
            </Title>
          </Header>
          <EmptyState>
            <EmptyIcon>🎵</EmptyIcon>
            <EmptyText>还没有歌词段落，点击下方按钮添加</EmptyText>
            <AddSectionWrapper>
              <AddSectionButton onClick={() => setShowAddMenu(!showAddMenu)}>
                <Plus />
                添加段落
              </AddSectionButton>
              {showAddMenu && (
                <AddSectionMenu>
                  {SECTION_TYPES.map(({ type, label, icon }) => (
                    <AddSectionMenuItem
                      key={type}
                      onClick={() => handleAddSection(type)}
                    >
                      <span>{icon}</span>
                      {label}
                    </AddSectionMenuItem>
                  ))}
                </AddSectionMenu>
              )}
            </AddSectionWrapper>
          </EmptyState>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <Title>
            <Music size={16} />
            歌词编辑
          </Title>
          <HeaderActions>
            <IconButton title="编辑模式">
              <Edit3 />
            </IconButton>
          </HeaderActions>
        </Header>

        <SectionList>
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              $isSelected={section.id === currentSectionId}
              onClick={() => handleSectionClick(section.id)}
            >
              <SectionHeader>
                <SectionInfo>
                  <SectionTag>{section.type}</SectionTag>
                  <SectionName>{section.name}</SectionName>
                  <SectionStats>
                    {section.lyricsLines.length} 行 |{" "}
                    {countSectionChars(section)} 字
                  </SectionStats>
                </SectionInfo>
                <SectionActions>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSection(section.id, "up");
                    }}
                    disabled={index === 0}
                    title="上移"
                  >
                    <ChevronUp />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveSection(section.id, "down");
                    }}
                    disabled={index === sections.length - 1}
                    title="下移"
                  >
                    <ChevronDown />
                  </IconButton>
                  <IconButton
                    $variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.id);
                    }}
                    title="删除"
                  >
                    <Trash2 />
                  </IconButton>
                </SectionActions>
              </SectionHeader>
              <LyricsPreview>
                {section.lyricsLines.slice(0, 3).map((line, i) => (
                  <LyricsLine key={i}>{line}</LyricsLine>
                ))}
                {section.lyricsLines.length > 3 && <LyricsLine>...</LyricsLine>}
              </LyricsPreview>
            </SectionCard>
          ))}

          <AddSectionWrapper>
            <AddSectionButton onClick={() => setShowAddMenu(!showAddMenu)}>
              <Plus />
              添加段落
            </AddSectionButton>
            {showAddMenu && (
              <AddSectionMenu>
                {SECTION_TYPES.map(({ type, label, icon }) => (
                  <AddSectionMenuItem
                    key={type}
                    onClick={() => handleAddSection(type)}
                  >
                    <span>{icon}</span>
                    {label}
                  </AddSectionMenuItem>
                ))}
              </AddSectionMenu>
            )}
          </AddSectionWrapper>
        </SectionList>
      </Container>
    );
  },
);

LyricsEditor.displayName = "LyricsEditor";
