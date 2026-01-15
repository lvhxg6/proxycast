/**
 * @file 进度条组件
 * @description 显示播放进度并支持拖拽跳转
 * @module components/content-creator/canvas/music/player/ProgressBar
 */

import React, { memo, useCallback, useRef, useState } from "react";
import styled from "styled-components";

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const TimeDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
`;

const ProgressBarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 6px;
  background: var(--color-surface-hover, #f3f4f6);
  border-radius: 3px;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    height: 8px;
  }
`;

const ProgressFill = styled.div<{ $progress: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${(props) => props.$progress}%;
  background: var(--color-primary, #3b82f6);
  border-radius: 3px;
  transition: width 0.1s linear;
`;

const ProgressHandle = styled.div<{ $progress: number; $visible: boolean }>`
  position: absolute;
  left: ${(props) => props.$progress}%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: var(--color-primary, #3b82f6);
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity 0.2s ease;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }

  ${ProgressBarContainer}:hover & {
    opacity: 1;
  }
`;

const BarInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-secondary, #6b7280);
`;

export interface ProgressBarProps {
  /** 当前时间 (秒) */
  currentTime: number;
  /** 总时长 (秒) */
  duration: number;
  /** 当前小节 */
  currentBar?: number;
  /** 总小节数 */
  totalBars?: number;
  /** 跳转回调 */
  onSeek: (time: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 格式化时间为 MM:SS
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 进度条组件
 */
export const ProgressBar: React.FC<ProgressBarProps> = memo(
  ({
    currentTime,
    duration,
    currentBar,
    totalBars,
    onSeek,
    disabled = false,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverProgress, setHoverProgress] = useState<number | null>(null);

    // 计算进度百分比
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // 处理点击/拖拽
    const handleSeek = useCallback(
      (clientX: number) => {
        if (disabled || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        onSeek(newTime);
      },
      [disabled, duration, onSeek],
    );

    // 鼠标按下
    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return;
        setIsDragging(true);
        handleSeek(e.clientX);
      },
      [disabled, handleSeek],
    );

    // 鼠标移动
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging) return;
        handleSeek(e.clientX);
      },
      [isDragging, handleSeek],
    );

    // 鼠标释放
    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    // 鼠标悬停
    const handleMouseHover = useCallback(
      (e: React.MouseEvent) => {
        if (disabled || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setHoverProgress(percentage);
      },
      [disabled],
    );

    // 鼠标离开
    const handleMouseLeave = useCallback(() => {
      setHoverProgress(null);
    }, []);

    // 添加全局鼠标事件监听
    React.useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      }
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
      <ProgressContainer>
        <TimeDisplay>
          <span>{formatTime(currentTime)}</span>
          {currentBar !== undefined && totalBars !== undefined && (
            <BarInfo>
              小节: {currentBar + 1} / {totalBars}
            </BarInfo>
          )}
          <span>{formatTime(duration)}</span>
        </TimeDisplay>

        <ProgressBarContainer
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseHover}
          onMouseLeave={handleMouseLeave}
        >
          <ProgressFill $progress={progress} />
          <ProgressHandle
            $progress={hoverProgress ?? progress}
            $visible={isDragging || hoverProgress !== null}
          />
        </ProgressBarContainer>
      </ProgressContainer>
    );
  },
);

ProgressBar.displayName = "ProgressBar";
