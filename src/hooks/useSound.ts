/**
 * @file useSound.ts
 * @description 音效管理 Hook，提供工具调用和打字机音效播放功能
 * @module hooks/useSound
 * @requires react
 */

import { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "proxycast_sound_enabled";
const SOUND_INTERVAL = 120; // 打字音效间隔 120ms

export interface UseSoundReturn {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playToolcallSound: () => void;
  playTypewriterSound: () => void;
}

export function useSound(): UseSoundReturn {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  });

  const toolcallAudioRef = useRef<HTMLAudioElement | null>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSoundTimeRef = useRef<number>(0);

  // 初始化音频
  useEffect(() => {
    if (!toolcallAudioRef.current) {
      toolcallAudioRef.current = new Audio("/sounds/tool-call.mp3");
      toolcallAudioRef.current.volume = 1;
      toolcallAudioRef.current.load();
    }
    if (!typewriterAudioRef.current) {
      typewriterAudioRef.current = new Audio("/sounds/typing.mp3");
      typewriterAudioRef.current.volume = 0.6;
      typewriterAudioRef.current.load();
    }
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
  }, []);

  const playToolcallSound = useCallback(() => {
    if (!soundEnabled || !toolcallAudioRef.current) return;
    toolcallAudioRef.current.currentTime = 0;
    toolcallAudioRef.current.play().catch(console.error);
  }, [soundEnabled]);

  const playTypewriterSound = useCallback(() => {
    const now = Date.now();
    if (!soundEnabled || !typewriterAudioRef.current) return;
    if (now - lastSoundTimeRef.current > SOUND_INTERVAL) {
      typewriterAudioRef.current.currentTime = 0;
      typewriterAudioRef.current.play().catch(console.error);
      lastSoundTimeRef.current = now;
    }
  }, [soundEnabled]);

  return {
    soundEnabled,
    setSoundEnabled,
    playToolcallSound,
    playTypewriterSound,
  };
}
