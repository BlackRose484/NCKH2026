'use client';

import { useEffect, useRef } from 'react';

export const useSoundPlayer = () => {
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const incorrectAudioRef = useRef<HTMLAudioElement | null>(null);
  const finishAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Preload audio files
    correctAudioRef.current = new Audio('/correct.wav');
    incorrectAudioRef.current = new Audio('/incorrect.wav');
    finishAudioRef.current = new Audio('/finish.mp3');

    // Set volume
    if (correctAudioRef.current) correctAudioRef.current.volume = 0.5;
    if (incorrectAudioRef.current) incorrectAudioRef.current.volume = 0.5;
    if (finishAudioRef.current) finishAudioRef.current.volume = 0.4;
  }, []);

  const playCorrect = () => {
    if (correctAudioRef.current) {
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playIncorrect = () => {
    if (incorrectAudioRef.current) {
      incorrectAudioRef.current.currentTime = 0;
      incorrectAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  const playFinish = () => {
    if (finishAudioRef.current) {
      finishAudioRef.current.currentTime = 0;
      finishAudioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  return { playCorrect, playIncorrect, playFinish };
};
