import { useState } from 'react';
import { Card } from '@/shared/types/api';

export const useAudioPlayback = () => {
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);

  const playAudio = async (card: Card) => {
    if (!card.audio_url) return;

    try {
      setPlayingAudio(card.id);
      const audio = new Audio(card.audio_url);

      audio.onended = () => setPlayingAudio(null);
      audio.onerror = () => {
        setPlayingAudio(null);
        console.error('Failed to play audio for:', card.front);
      };

      await audio.play();
    } catch (error) {
      setPlayingAudio(null);
      console.error('Audio playback failed:', error);
    }
  };

  return {
    playingAudio,
    playAudio
  };
};