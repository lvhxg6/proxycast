/**
 * @file MIDI 播放 Hook
 * @description 使用 Tone.js 实现 MIDI 文件播放功能
 * @module components/content-creator/canvas/music/hooks/useMidiPlayback
 */

import { useState, useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";

export interface MidiTrack {
  /** 音轨索引 */
  index: number;
  /** 音轨名称 */
  name: string;
  /** 音轨乐器 */
  instrument: string;
  /** 音符数量 */
  noteCount: number;
  /** 是否启用 */
  enabled: boolean;
}

export interface PlaybackState {
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 当前播放位置 (秒) */
  currentTime: number;
  /** 总时长 (秒) */
  duration: number;
  /** 播放速度 (0.5 - 2.0) */
  playbackRate: number;
  /** 音量 (0 - 1) */
  volume: number;
  /** 是否循环播放 */
  loop: boolean;
  /** 当前小节 */
  currentBar: number;
  /** 总小节数 */
  totalBars: number;
}

export interface UseMidiPlaybackOptions {
  /** 初始播放速度 */
  initialPlaybackRate?: number;
  /** 初始音量 */
  initialVolume?: number;
  /** 是否自动播放 */
  autoPlay?: boolean;
  /** 播放位置更新回调 */
  onTimeUpdate?: (time: number) => void;
  /** 播放结束回调 */
  onEnded?: () => void;
}

export interface UseMidiPlaybackReturn {
  /** 播放状态 */
  state: PlaybackState;
  /** 音轨列表 */
  tracks: MidiTrack[];
  /** 加载 MIDI 文件 */
  loadMidi: (file: File | string) => Promise<void>;
  /** 播放 */
  play: () => Promise<void>;
  /** 暂停 */
  pause: () => void;
  /** 停止 */
  stop: () => void;
  /** 跳转到指定位置 */
  seekTo: (time: number) => void;
  /** 设置播放速度 */
  setPlaybackRate: (rate: number) => void;
  /** 设置音量 */
  setVolume: (volume: number) => void;
  /** 设置循环播放 */
  setLoop: (loop: boolean) => void;
  /** 切换音轨启用状态 */
  toggleTrack: (trackIndex: number) => void;
  /** 是否已加载 */
  isLoaded: boolean;
  /** 加载错误 */
  error: string | null;
}

/**
 * MIDI 播放 Hook
 */
export function useMidiPlayback(
  options: UseMidiPlaybackOptions = {},
): UseMidiPlaybackReturn {
  const {
    initialPlaybackRate = 1.0,
    initialVolume = 0.8,
    autoPlay = false,
    onTimeUpdate,
    onEnded,
  } = options;

  // 播放状态
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: initialPlaybackRate,
    volume: initialVolume,
    loop: false,
    currentBar: 0,
    totalBars: 0,
  });

  // 音轨列表
  const [tracks, setTracks] = useState<MidiTrack[]>([]);

  // 加载状态
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const midiRef = useRef<Midi | null>(null);
  const synthsRef = useRef<Tone.PolySynth[]>([]);
  const partsRef = useRef<Tone.Part[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // 清理资源
  const cleanup = useCallback(() => {
    // 停止所有 Parts
    partsRef.current.forEach((part) => {
      part.stop();
      part.dispose();
    });
    partsRef.current = [];

    // 释放所有 Synths
    synthsRef.current.forEach((synth) => {
      synth.dispose();
    });
    synthsRef.current = [];

    // 取消动画帧
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // 更新播放位置
  const updatePosition = useCallback(() => {
    if (!state.isPlaying || !midiRef.current) return;

    const currentTime = Tone.Transport.seconds;
    const duration = midiRef.current.duration;

    setState((prev) => ({
      ...prev,
      currentTime,
      currentBar: Math.floor(currentTime / (60 / Tone.Transport.bpm.value / 4)),
    }));

    onTimeUpdate?.(currentTime);

    // 检查是否播放结束
    if (currentTime >= duration) {
      if (state.loop) {
        Tone.Transport.position = 0;
      } else {
        pause();
        onEnded?.();
        return;
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePosition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPlaying, state.loop, onTimeUpdate, onEnded]);

  // 加载 MIDI 文件
  const loadMidi = useCallback(
    async (file: File | string) => {
      try {
        setError(null);
        setIsLoaded(false);
        cleanup();

        let arrayBuffer: ArrayBuffer;

        if (typeof file === "string") {
          // URL
          const response = await fetch(file);
          arrayBuffer = await response.arrayBuffer();
        } else {
          // File object
          arrayBuffer = await file.arrayBuffer();
        }

        const midi = new Midi(arrayBuffer);
        midiRef.current = midi;

        // 解析音轨信息
        const trackList: MidiTrack[] = midi.tracks.map((track, index) => ({
          index,
          name: track.name || `Track ${index + 1}`,
          instrument: track.instrument?.name || "Piano",
          noteCount: track.notes.length,
          enabled: true,
        }));

        setTracks(trackList);

        // 创建合成器和 Parts
        midi.tracks.forEach((track, trackIndex) => {
          if (track.notes.length === 0) return;

          // 创建 PolySynth
          const synth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
              attack: 0.02,
              decay: 0.1,
              sustain: 0.3,
              release: 1,
            },
          }).toDestination();

          synth.volume.value = Tone.gainToDb(initialVolume);
          synthsRef.current.push(synth);

          // 创建 Part
          const part = new Tone.Part((time, note) => {
            if (trackList[trackIndex].enabled) {
              synth.triggerAttackRelease(
                note.name,
                note.duration,
                time,
                note.velocity,
              );
            }
          }, track.notes);

          part.loop = false;
          partsRef.current.push(part);
        });

        // 设置 BPM
        if (midi.header.tempos.length > 0) {
          Tone.Transport.bpm.value = midi.header.tempos[0].bpm;
        }

        // 更新状态
        setState((prev) => ({
          ...prev,
          duration: midi.duration,
          totalBars: Math.ceil(
            midi.duration / (60 / Tone.Transport.bpm.value / 4),
          ),
        }));

        setIsLoaded(true);

        // 自动播放
        if (autoPlay) {
          await play();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load MIDI file";
        setError(errorMessage);
        console.error("MIDI load error:", err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cleanup, initialVolume, autoPlay],
  );

  // 播放
  const play = useCallback(async () => {
    if (!isLoaded || state.isPlaying) return;

    try {
      // 启动 Tone.js 音频上下文
      await Tone.start();

      // 启动所有 Parts
      partsRef.current.forEach((part) => {
        part.start(0);
      });

      // 启动 Transport
      Tone.Transport.start();

      setState((prev) => ({ ...prev, isPlaying: true }));
      startTimeRef.current = Date.now();

      // 开始更新位置
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    } catch (err) {
      console.error("Play error:", err);
      setError("Failed to start playback");
    }
  }, [isLoaded, state.isPlaying, updatePosition]);

  // 暂停
  const pause = useCallback(() => {
    if (!state.isPlaying) return;

    Tone.Transport.pause();
    setState((prev) => ({ ...prev, isPlaying: false }));

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [state.isPlaying]);

  // 停止
  const stop = useCallback(() => {
    pause();
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    setState((prev) => ({
      ...prev,
      currentTime: 0,
      currentBar: 0,
    }));
  }, [pause]);

  // 跳转
  const seekTo = useCallback(
    (time: number) => {
      const clampedTime = Math.max(0, Math.min(time, state.duration));
      Tone.Transport.seconds = clampedTime;

      setState((prev) => ({
        ...prev,
        currentTime: clampedTime,
        currentBar: Math.floor(
          clampedTime / (60 / Tone.Transport.bpm.value / 4),
        ),
      }));
    },
    [state.duration],
  );

  // 设置播放速度
  const setPlaybackRate = useCallback((rate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, rate));
    Tone.Transport.bpm.value = Tone.Transport.bpm.value * clampedRate;

    setState((prev) => ({ ...prev, playbackRate: clampedRate }));
  }, []);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    const dbValue = Tone.gainToDb(clampedVolume);

    synthsRef.current.forEach((synth) => {
      synth.volume.value = dbValue;
    });

    setState((prev) => ({ ...prev, volume: clampedVolume }));
  }, []);

  // 设置循环
  const setLoop = useCallback((loop: boolean) => {
    setState((prev) => ({ ...prev, loop }));
  }, []);

  // 切换音轨
  const toggleTrack = useCallback((trackIndex: number) => {
    setTracks((prev) =>
      prev.map((track, index) =>
        index === trackIndex ? { ...track, enabled: !track.enabled } : track,
      ),
    );
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      cleanup();
      Tone.Transport.stop();
    };
  }, [cleanup]);

  return {
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
  };
}
