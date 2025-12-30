import { useState, useCallback, useEffect } from 'react';
import { extractVideoId } from '../utils/youtube';

export interface AmbientSound {
  id: string;
  name: string;
  youtubeUrl: string;
  videoId: string;
  volume: number;
  isPlaying: boolean;
  isDefault?: boolean;
}

interface YouTubePlayer {
  playVideo?: () => void;
  pauseVideo?: () => void;
  setVolume?: (volume: number) => void;
}

export const useAudioMixer = () => {
  const [ambientSounds, setAmbientSounds] = useState<AmbientSound[]>([]);
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerRefs, setPlayerRefs] = useState<Record<string, YouTubePlayer>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Veritabanından ambient sesleri yükle
  useEffect(() => {
    fetchAmbientSounds();
  }, []);

  const fetchAmbientSounds = async () => {
    try {
      const response = await fetch('/api/ambient-sounds');
      if (response.ok) {
        const sounds = await response.json();
        setAmbientSounds(sounds.map((s: any) => ({
          id: s.id,
          name: s.name,
          youtubeUrl: s.youtubeUrl,
          videoId: s.videoId,
          volume: 0.5,
          isPlaying: false,
          isDefault: s.isDefault,
        })));
      }
    } catch (error) {
      console.error('Error loading ambient sounds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // YouTube URL'si ile ambient ses ekleme
  const addAmbientSound = useCallback(async (youtubeUrl: string, name: string) => {
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) return false;

    try {
      const response = await fetch('/api/ambient-sounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, youtubeUrl, videoId }),
      });

      if (response.ok) {
        const newSound = await response.json();
        setAmbientSounds(prev => [...prev, {
          id: newSound.id,
          name: newSound.name,
          youtubeUrl: newSound.youtubeUrl,
          videoId: newSound.videoId,
          volume: 0.5,
          isPlaying: false,
          isDefault: false,
        }]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding ambient sound:', error);
      return false;
    }
  }, []);

  // Ambient sesi kaldırma
  const removeAmbientSound = useCallback(async (soundId: string) => {
    const sound = ambientSounds.find(s => s.id === soundId);
    if (sound?.isDefault) {
      alert('Default sesler silinemez!');
      return;
    }

    try {
      const response = await fetch(`/api/ambient-sounds/${soundId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAmbientSounds(prev => prev.filter(s => s.id !== soundId));
        setActiveSounds(prev => {
          const newSet = new Set(prev);
          newSet.delete(soundId);
          return newSet;
        });
        setPlayerRefs(prev => {
          const newRefs = { ...prev };
          delete newRefs[soundId];
          return newRefs;
        });
      }
    } catch (error) {
      console.error('Error removing ambient sound:', error);
    }
  }, [ambientSounds]);

  // Audio context için başlatma
  const initializeAudio = useCallback(() => {
    setIsInitialized(true);
  }, []);

  // Bir ambient sesi başlat/durdur
  const toggleAmbientSound = useCallback((soundId: string, player: YouTubePlayer | null) => {
    if (!player) return;

    setActiveSounds(prev => {
      const isActive = prev.has(soundId);
      const newSet = new Set(prev);
      
      if (isActive) {
        // Sesi durdur
        if (player.pauseVideo) {
          player.pauseVideo();
        }
        newSet.delete(soundId);
      } else {
        // Sesi başlat
        if (player.playVideo) {
          player.playVideo();
        }
        newSet.add(soundId);
      }
      
      return newSet;
    });
    
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Ses seviyesini ayarla
  const setAmbientVolume = useCallback((soundId: string, volume: number, player: YouTubePlayer | null) => {
    if (player?.setVolume) {
      player.setVolume(Math.round(volume * 100));
    }
    setVolumes(prev => ({ ...prev, [soundId]: volume }));
  }, []);

  // Tüm ambient sesleri durdur
  const stopAllAmbient = useCallback(() => {
    setActiveSounds(new Set());
    setPlayerRefs(prev => {
      const newRefs = { ...prev };
      Object.values(newRefs).forEach((player: YouTubePlayer) => {
        if (player?.pauseVideo) {
          try {
            player.pauseVideo();
          } catch {
            // Ignore errors
          }
        }
      });
      return newRefs;
    });
  }, []);

  // Component temizliği
  useEffect(() => {
    return () => {
      Object.values(playerRefs).forEach((player: YouTubePlayer) => {
        if (player?.pauseVideo) {
          try {
            player.pauseVideo();
          } catch {
            // Ignore cleanup errors
          }
        }
      });
    };
  }, [playerRefs]);

  return {
    ambientSounds,
    activeSounds,
    volumes,
    isInitialized,
    isLoading,
    playerRefs,
    setPlayerRefs,
    addAmbientSound,
    removeAmbientSound,
    initializeAudio,
    toggleAmbientSound,
    setAmbientVolume,
    stopAllAmbient,
    fetchAmbientSounds,
  };
};