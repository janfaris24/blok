'use client';

import { useEffect, useRef, useState } from 'react';

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;

    // Preload the audio
    audioRef.current.addEventListener('canplaythrough', () => {
      setIsLoaded(true);
    });

    audioRef.current.addEventListener('error', (e) => {
      console.error('[Notification Sound] Failed to load audio file:', e);
    });

    audioRef.current.load();

    // Load preference from localStorage
    const savedPreference = localStorage.getItem('notificationSoundEnabled');
    if (savedPreference !== null) {
      setIsEnabled(savedPreference === 'true');
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = async () => {
    if (!isEnabled || !audioRef.current || !isLoaded) {
      return;
    }

    try {
      // Reset audio to start
      audioRef.current.currentTime = 0;

      // Play the sound
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      // Autoplay was prevented
      console.warn('[Notification Sound] Browser blocked autoplay:', error);
    }
  };

  const toggleSound = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem('notificationSoundEnabled', String(newValue));
  };

  return {
    playSound,
    isEnabled,
    toggleSound,
  };
}
