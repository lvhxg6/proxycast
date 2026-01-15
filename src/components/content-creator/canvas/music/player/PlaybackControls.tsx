/**
 * @file 播放控制组件
 * @description 提供播放、暂停、停止按钮
 * @module components/content-creator/canvas/music/player/PlaybackControls
 */

import React, { memo } from "react";
import styled from "styled-components";
import { Play, Pause, Square } from "lucide-react";

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$primary ? "48px" : "40px")};
  height: ${(props) => (props.$primary ? "48px" : "40px")};
  border: none;
  border-radius: 50%;
  background: ${(props) =>
    props.$primary
      ? "var(--color-primary, #3b82f6)"
      : "var(--color-surface-hover, #f3f4f6)"};
  color: ${(props) =>
    props.$primary ? "#ffffff" : "var(--color-text, #1f2937)"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$primary
        ? "var(--color-primary-hover, #2563eb)"
        : "var(--color-surface-active, #e5e7eb)"};
    transform: scale(1.05);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: ${(props) => (props.$primary ? "24px" : "20px")};
    height: ${(props) => (props.$primary ? "24px" : "20px")};
  }
`;

export interface PlaybackControlsProps {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 是否已加载 */
  isLoaded: boolean;
  /** 播放回调 */
  onPlay: () => void;
  /** 暂停回调 */
  onPause: () => void;
  /** 停止回调 */
  onStop: () => void;
}

/**
 * 播放控制组件
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = memo(
  ({ isPlaying, isLoaded, onPlay, onPause, onStop }) => {
    return (
      <ControlsContainer>
        {/* 播放/暂停按钮 */}
        <ControlButton
          $primary
          disabled={!isLoaded}
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? "暂停" : "播放"}
        >
          {isPlaying ? <Pause /> : <Play />}
        </ControlButton>

        {/* 停止按钮 */}
        <ControlButton
          disabled={!isLoaded || !isPlaying}
          onClick={onStop}
          title="停止"
        >
          <Square />
        </ControlButton>
      </ControlsContainer>
    );
  },
);

PlaybackControls.displayName = "PlaybackControls";
