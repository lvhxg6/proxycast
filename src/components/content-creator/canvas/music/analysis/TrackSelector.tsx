/**
 * @file 音轨选择器组件
 * @description 选择要分析的 MIDI 音轨
 * @module components/content-creator/canvas/music/analysis/TrackSelector
 */

import React, { memo } from "react";
import styled from "styled-components";
import { Music2, Mic, Check } from "lucide-react";

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
`;

const SelectorTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
`;

const TrackItem = styled.button<{ $selected: boolean; $isVocal: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid
    ${(props) =>
      props.$selected
        ? "var(--color-primary, #3b82f6)"
        : "var(--color-border, #e5e7eb)"};
  border-radius: 6px;
  background: ${(props) =>
    props.$selected
      ? "var(--color-primary-light, #eff6ff)"
      : "var(--color-surface, #ffffff)"};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-primary-light, #eff6ff);
  }
`;

const TrackIcon = styled.div<{ $isVocal: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: ${(props) =>
    props.$isVocal
      ? "var(--color-success-light, #dcfce7)"
      : "var(--color-surface-hover, #f3f4f6)"};
  color: ${(props) =>
    props.$isVocal
      ? "var(--color-success, #16a34a)"
      : "var(--color-text-secondary, #6b7280)"};

  svg {
    width: 20px;
    height: 20px;
  }
`;

const TrackInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TrackName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #1f2937);
`;

const TrackMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
`;

const VocalBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-success-light, #dcfce7);
  color: var(--color-success, #16a34a);
  font-size: 11px;
  font-weight: 500;
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #3b82f6);
  color: #ffffff;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export interface Track {
  index: number;
  name: string;
  instrument: string;
  noteCount: number;
  isVocal: boolean;
}

export interface TrackSelectorProps {
  /** 音轨列表 */
  tracks: Track[];
  /** 选中的音轨索引 */
  selectedTrack: number;
  /** 选择回调 */
  onSelectTrack: (trackIndex: number) => void;
}

/**
 * 音轨选择器组件
 */
export const TrackSelector: React.FC<TrackSelectorProps> = memo(
  ({ tracks, selectedTrack, onSelectTrack }) => {
    return (
      <SelectorContainer>
        <SelectorTitle>选择要分析的音轨</SelectorTitle>

        <TrackList>
          {tracks.map((track) => (
            <TrackItem
              key={track.index}
              $selected={track.index === selectedTrack}
              $isVocal={track.isVocal}
              onClick={() => onSelectTrack(track.index)}
            >
              <TrackIcon $isVocal={track.isVocal}>
                {track.isVocal ? <Mic /> : <Music2 />}
              </TrackIcon>

              <TrackInfo>
                <TrackName>{track.name}</TrackName>
                <TrackMeta>
                  {track.instrument} · {track.noteCount} 音符
                  {track.isVocal && <VocalBadge>人声</VocalBadge>}
                </TrackMeta>
              </TrackInfo>

              {track.index === selectedTrack && (
                <CheckIcon>
                  <Check />
                </CheckIcon>
              )}
            </TrackItem>
          ))}
        </TrackList>
      </SelectorContainer>
    );
  },
);

TrackSelector.displayName = "TrackSelector";
