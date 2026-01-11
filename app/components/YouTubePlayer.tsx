'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string | null;
  onReady?: (duration: number) => void;
}

interface YouTubePlayerInstance {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

export default function YouTubePlayer({ videoId, onReady }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  const opts: YouTubeProps['opts'] = {
    height: 0,
    width: 0,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    
    // Set initial volume and ensure not muted
    try {
      event.target.unMute();
      event.target.setVolume(volume);
      setIsMuted(false);
    } catch (error) {
      console.error('Error setting initial volume:', error);
    }
    
    setIsPlayerReady(true);
    
    // Video süresini al
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    if (onReady && videoDuration) {
      onReady(videoDuration);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    const isCurrentlyPlaying = event.data === 1;
    setIsPlaying(isCurrentlyPlaying);
    
    // If buffering (3) and we expect to be playing, log it
    if (event.data === 3 && isPlaying) {
      console.log('Video is buffering...');
    }
    
    // If video ended unexpectedly while playing
    if (event.data === 0 || event.data === 2) {
      setIsPlaying(false);
    }
  };

  // Süre güncelleyici
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          const current = playerRef.current.getCurrentTime();
          setCurrentTime(current);
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration || !isPlayerReady) return;
    
    try {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;
      
      if (playerRef.current?.seekTo) {
        playerRef.current.seekTo(newTime);
        setCurrentTime(newTime);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isPlaying) {
        playerRef.current?.pauseVideo();
      } else {
        // Unmute first if muted to ensure sound plays
        if (isMuted && playerRef.current?.unMute) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        if (playerRef.current?.playVideo) {
          playerRef.current.playVideo();
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isMuted) {
        if (playerRef.current?.unMute) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
      } else {
        if (playerRef.current?.mute) {
          playerRef.current.mute();
          setIsMuted(true);
        }
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current && isPlayerReady) {
      try {
        // If volume is being increased and player was muted, unmute it
        if (newVolume > 0 && isMuted && playerRef.current?.unMute) {
          playerRef.current.unMute();
          setIsMuted(false);
        }
        if (playerRef.current?.setVolume) {
          playerRef.current.setVolume(newVolume);
        }
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  if (!videoId) {
    return (
      <div className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl p-12 text-center border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
            <Music className="text-sky-300" size={48} />
          </div>
          <p className="text-white text-lg">YouTube videosu yüklenmedi</p>
          <p className="text-white/50 text-sm">Yukarıdan bir video yükleyin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
      <div className="hidden">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      </div>

      {/* Player Controls */}
      <div className="space-y-4">
        {/* Progress Bar - Tıklanabilir */}
        {duration > 0 && (
          <div className="space-y-2">
            <div 
              className="w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-purple-500 transition-all duration-300 group-hover:h-2.5"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-sm text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlayPause}
              className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 text-white rounded-full transition-all transform hover:scale-110 disabled:opacity-50 disabled:scale-100 shadow-xl shadow-sky-500/50 hover:shadow-2xl hover:shadow-sky-500/60"
              disabled={!isPlayerReady}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            <button
              onClick={toggleMute}
              className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-full transition-all border border-white/20 disabled:opacity-50"
              disabled={!isPlayerReady}
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          </div>

          <div className="flex items-center space-x-3 flex-1 max-w-xs">
            <Volume2 size={18} className="text-sky-300" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
              className="flex-1 h-2.5 bg-white/10 backdrop-blur-xl rounded-full appearance-none cursor-pointer accent-sky-500"
              disabled={!isPlayerReady}
            />
            <span className="text-sm text-white font-semibold w-10 text-center">{volume}</span>
          </div>
        </div>
      </div>
    </div>
  );
}