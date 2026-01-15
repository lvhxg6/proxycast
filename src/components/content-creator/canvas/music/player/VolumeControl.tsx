/**
 * @file 音量控制组件
 * @description 调整播放音量 (0 - 100%)
 * @module components/content-creator/canvas/music/player/VolumeControl
 */

import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { Volume2, VolumeX, Volume1 } from "lucide-react";

const ControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-secondary, #6b7280);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-surface-hover, #f3f4f6);
    color: var(--color-text, #1f2937);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100px;
`;

const Slider = styled.input`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--color-surface-hover, #f3f4f6);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--color-primary, #3b82f6);
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &::-webkit-slider-thumb {
      cursor: not-allowed;
    }

    &::-moz-range-thumb {
      cursor: not-allowed;
    }
  }
`;

const ValueDisplay = styled.span`
  min-width: 32px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text, #1f2937);
  text-align: right;
`;

export interface VolumeControlProps {
  /** 当前音量 (0 - 1) */
  volume: number;
  /** 音量变化回调 */
  onChange: (volume: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 音量控制组件
 */
export const VolumeControl: React.FC<VolumeControlProps> = memo(
  ({ volume, onChange, disabled = false }) => {
    const [isMuted, setIsMuted] = React.useState(false);
    const [previousVolume, setPreviousVolume] = React.useState(volume);

    const handleSliderChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        onChange(value);
        if (value > 0) {
          setIsMuted(false);
        }
      },
      [onChange],
    );

    const handleMuteToggle = useCallback(() => {
      if (isMuted) {
        // 取消静音，恢复之前的音量
        onChange(previousVolume > 0 ? previousVolume : 0.5);
        setIsMuted(false);
      } else {
        // 静音，保存当前音量
        setPreviousVolume(volume);
        onChange(0);
        setIsMuted(true);
      }
    }, [isMuted, volume, previousVolume, onChange]);

    // 根据音量选择图标
    const VolumeIcon = React.useMemo(() => {
      if (volume === 0 || isMuted) return VolumeX;
      if (volume < 0.5) return Volume1;
      return Volume2;
    }, [volume, isMuted]);

    // 计算百分比
    const percentage = Math.round(volume * 100);

    return (
      <ControlContainer>
        <IconButton
          onClick={handleMuteToggle}
          disabled={disabled}
          title={isMuted ? "取消静音" : "静音"}
        >
          <VolumeIcon />
        </IconButton>

        <SliderContainer>
          <Slider
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleSliderChange}
            disabled={disabled}
            title={`音量: ${percentage}%`}
          />
          <ValueDisplay>{percentage}%</ValueDisplay>
        </SliderContainer>
      </ControlContainer>
    );
  },
);

VolumeControl.displayName = "VolumeControl";
