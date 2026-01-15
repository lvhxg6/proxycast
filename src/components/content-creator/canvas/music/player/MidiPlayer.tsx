/**
 * @file MIDI 播放器主组件
 * @description 整合播放控制、进度条、速度和音量控制
 * @module components/content-creator/canvas/music/player/MidiPlayer
 */

import React, { memo, useCallback } from "react";
import styled from "styled-components";
import { Upload, Repeat } from "lucide-react";
import { useMidiPlayback } from "../hooks/useMidiPlayback";
import { PlaybackControls } from "./PlaybackControls";
import { ProgressBar } from "./ProgressBar";
import { TempoControl } from "./TempoControl";
import { VolumeControl } from "./VolumeControl";

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
`;

const TopSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MiddleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BottomSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #1f2937);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-surface-hover, #f3f4f6);
    border-color: var(--color-primary, #3b82f6);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoopButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid
    ${(props) =>
      props.$active
        ? "var(--color-primary, #3b82f6)"
        : "var(--color-border, #e5e7eb)"};
  border-radius: 6px;
  background: ${(props) =>
    props.$active ? "var(--color-primary-light, #eff6ff)" : "transparent"};
  color: ${(props) =>
    props.$active
      ? "var(--color-primary, #3b82f6)"
      : "var(--color-text-secondary, #6b7280)"};
  font-size: 13px;
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

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 14px;
`;

const TrackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  background: var(--color-surface-hover, #f9fafb);
  border-radius: 6px;
`;

const TrackItem = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
  opacity: ${(props) => (props.$enabled ? 1 : 0.5)};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--color-primary, #3b82f6);
  }
`;

const TrackCheckbox = styled.input`
  width: 16px;
  height: 16px;
  cursor: pointer;
`;

const TrackInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TrackName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text, #1f2937);
`;

const TrackMeta = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary, #6b7280);
`;

const HiddenFileInput = styled.input`
  display: none;
`;

export interface MidiPlayerProps {
  /** 初始 MIDI 文件 URL */
  initialMidiUrl?: string;
  /** 是否显示音轨列表 */
  showTracks?: boolean;
  /** 播放结束回调 */
  onEnded?: () => void;
}

/**
 * MIDI 播放器主组件
 */
export const MidiPlayer: React.FC<MidiPlayerProps> = memo(
  ({ initialMidiUrl, showTracks = true, onEnded }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const {
      state,
      tracks,
      loadMidi,
      play,
      pause,
      stop,
      seekTo,
      setPlaybackRate,
      setVolume,
      setLoop,
      toggleTrack,
      isLoaded,
      error,
    } = useMidiPlayback({
      onEnded,
    });

    // 加载初始 MIDI 文件
    React.useEffect(() => {
      if (initialMidiUrl) {
        loadMidi(initialMidiUrl);
      }
    }, [initialMidiUrl, loadMidi]);

    // 处理文件上传
    const handleFileUpload = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          loadMidi(file);
        }
      },
      [loadMidi],
    );

    // 处理循环切换
    const handleLoopToggle = useCallback(() => {
      setLoop(!state.loop);
    }, [state.loop, setLoop]);

    return (
      <PlayerContainer>
        {/* 顶部：上传按钮和播放控制 */}
        <TopSection>
          <UploadButton onClick={handleFileUpload}>
            <Upload />
            上传 MIDI
          </UploadButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept=".mid,.midi"
            onChange={handleFileChange}
          />

          <PlaybackControls
            isPlaying={state.isPlaying}
            isLoaded={isLoaded}
            onPlay={play}
            onPause={pause}
            onStop={stop}
          />

          <LoopButton
            $active={state.loop}
            onClick={handleLoopToggle}
            disabled={!isLoaded}
            title={state.loop ? "取消循环" : "循环播放"}
          >
            <Repeat />
            循环
          </LoopButton>
        </TopSection>

        {/* 中部：进度条 */}
        {isLoaded && (
          <MiddleSection>
            <ProgressBar
              currentTime={state.currentTime}
              duration={state.duration}
              currentBar={state.currentBar}
              totalBars={state.totalBars}
              onSeek={seekTo}
              disabled={!isLoaded}
            />
          </MiddleSection>
        )}

        {/* 底部：速度和音量控制 */}
        <BottomSection>
          <TempoControl
            playbackRate={state.playbackRate}
            onChange={setPlaybackRate}
            disabled={!isLoaded}
            showPresets={false}
          />

          <VolumeControl
            volume={state.volume}
            onChange={setVolume}
            disabled={!isLoaded}
          />
        </BottomSection>

        {/* 音轨列表 */}
        {showTracks && isLoaded && tracks.length > 0 && (
          <TrackList>
            {tracks.map((track) => (
              <TrackItem
                key={track.index}
                $enabled={track.enabled}
                onClick={() => toggleTrack(track.index)}
              >
                <TrackCheckbox
                  type="checkbox"
                  checked={track.enabled}
                  onChange={() => toggleTrack(track.index)}
                  onClick={(e) => e.stopPropagation()}
                />
                <TrackInfo>
                  <TrackName>{track.name}</TrackName>
                  <TrackMeta>
                    {track.instrument} · {track.noteCount} 音符
                  </TrackMeta>
                </TrackInfo>
              </TrackItem>
            ))}
          </TrackList>
        )}

        {/* 错误提示 */}
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </PlayerContainer>
    );
  },
);

MidiPlayer.displayName = "MidiPlayer";
