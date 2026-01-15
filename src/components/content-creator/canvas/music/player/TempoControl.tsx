/**
 * @file 速度控制组件
 * @description 调整播放速度 (0.5x - 2.0x)
 * @module components/content-creator/canvas/music/player/TempoControl
 */

import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { Gauge } from "lucide-react";

const ControlContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  color: var(--color-text-secondary, #6b7280);

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
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
  min-width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text, #1f2937);
  text-align: right;
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 4px;
`;

const PresetButton = styled.button<{ $active?: boolean }>`
  padding: 2px 8px;
  font-size: 11px;
  border: 1px solid
    ${(props) =>
      props.$active
        ? "var(--color-primary, #3b82f6)"
        : "var(--color-border, #e5e7eb)"};
  border-radius: 4px;
  background: ${(props) =>
    props.$active ? "var(--color-primary-light, #eff6ff)" : "transparent"};
  color: ${(props) =>
    props.$active
      ? "var(--color-primary, #3b82f6)"
      : "var(--color-text-secondary, #6b7280)"};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-primary, #3b82f6);
    color: var(--color-primary, #3b82f6);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export interface TempoControlProps {
  /** 当前播放速度 (0.5 - 2.0) */
  playbackRate: number;
  /** 速度变化回调 */
  onChange: (rate: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示预设按钮 */
  showPresets?: boolean;
}

const PRESET_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

/**
 * 速度控制组件
 */
export const TempoControl: React.FC<TempoControlProps> = memo(
  ({ playbackRate, onChange, disabled = false, showPresets = true }) => {
    const handleSliderChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        onChange(value);
      },
      [onChange],
    );

    const handlePresetClick = useCallback(
      (rate: number) => {
        onChange(rate);
      },
      [onChange],
    );

    return (
      <ControlContainer>
        <IconWrapper title="播放速度">
          <Gauge />
        </IconWrapper>

        <SliderContainer>
          <Slider
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={playbackRate}
            onChange={handleSliderChange}
            disabled={disabled}
            title={`速度: ${playbackRate.toFixed(1)}x`}
          />
          <ValueDisplay>{playbackRate.toFixed(1)}x</ValueDisplay>
        </SliderContainer>

        {showPresets && (
          <PresetButtons>
            {PRESET_RATES.map((rate) => (
              <PresetButton
                key={rate}
                $active={Math.abs(playbackRate - rate) < 0.05}
                onClick={() => handlePresetClick(rate)}
                disabled={disabled}
                title={`${rate}x 速度`}
              >
                {rate}x
              </PresetButton>
            ))}
          </PresetButtons>
        )}
      </ControlContainer>
    );
  },
);

TempoControl.displayName = "TempoControl";
