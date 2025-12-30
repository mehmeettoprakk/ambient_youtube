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
    event.target.setVolume(volume);
    setIsPlayerReady(true);
    
    // Video süresini al
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    if (onReady && videoDuration) {
      onReady(videoDuration);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === 1); // YT.PlayerState.PLAYING = 1
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
    if (!playerRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    playerRef.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;

    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
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