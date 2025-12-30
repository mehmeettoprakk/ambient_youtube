'use client';

import { useState } from 'react';
import { Volume2, Plus, X, Play, Pause, Link } from 'lucide-react';
import YouTube from 'react-youtube';
import { useAudioMixer } from '../hooks/useAudioMixer';
import { isValidYouTubeUrl } from '../utils/youtube';

export default function AmbientControls() {
  const {
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
  } = useAudioMixer();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSoundUrl, setNewSoundUrl] = useState('');
  const [newSoundName, setNewSoundName] = useState('');

  const handleAddSound = async () => {
    if (!isValidYouTubeUrl(newSoundUrl) || !newSoundName.trim()) {
      alert('Lütfen geçerli bir YouTube URL\'si ve isim girin');
      return;
    }

    const success = await addAmbientSound(newSoundUrl, newSoundName.trim());
    if (success) {
      setNewSoundUrl('');
      setNewSoundName('');
      setShowAddForm(false);
    } else {
      alert('Ses eklenemedi');
    }
  };

  const handleRemoveSound = (soundId: string) => {
    const player = playerRefs[soundId];
    if (player?.pauseVideo) {
      try {
        player.pauseVideo();
      } catch (err) {
        // Ignore errors if player not ready
      }
    }
    removeAmbientSound(soundId);
  };

  const handleToggleSound = (soundId: string) => {
    if (!isInitialized) {
      initializeAudio();
    }

    const sound = ambientSounds.find(s => s.id === soundId);
    if (!sound?.videoId) return;

    const player = playerRefs[soundId];
    if (!player) return;

    toggleAmbientSound(soundId, player);
  };

  const handleVolumeChange = (soundId: string, newVolume: number) => {
    const player = playerRefs[soundId];
    if (player?.setVolume) {
      try {
        player.setVolume(Math.round(newVolume * 100));
      } catch (err) {
        // Ignore errors if player not ready
      }
    }
    setAmbientVolume(soundId, newVolume, player || null);
  };

  const handlePlayerReady = (soundId: string) => (event: { target: unknown }) => {
    const player = event.target as Record<string, unknown>;
    setPlayerRefs((prev) => ({
      ...prev,
      [soundId]: player as never,
    }));
  };

  const handlePlayerStateChange = (soundId: string) => (event: { data: number }) => {
    // 0 = ended, sadece aktif sesler için tekrar başlat
    if (event.data === 0 && activeSounds.has(soundId)) {
      const player = playerRefs[soundId];
      if (player?.playVideo) {
        (player.playVideo as () => void)();
      }
    }
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-white">Ambient Efektler</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white rounded-xl transition-all transform hover:scale-105 font-semibold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40"
          >
            Yeni Ekle
          </button>
          <button
            onClick={stopAllAmbient}
            className="px-5 py-2.5 text-sm bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white rounded-xl transition-all transform hover:scale-105 font-semibold shadow-xl shadow-rose-500/30 hover:shadow-2xl hover:shadow-rose-500/40"
          >
            Tümünü Durdur
          </button>
        </div>
      </div>

      {/* Add New Sound Form */}
      {showAddForm && (
        <div className="mb-6 p-5 bg-white/[0.03] backdrop-blur-2xl rounded-2xl space-y-3 border border-sky-400/30">
          <input
            type="text"
            placeholder="Efekt ismi (örn: Yağmur Sesi)"
            value={newSoundName}
            onChange={(e) => setNewSoundName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 focus:bg-white/10 outline-none text-white placeholder-white/40 text-sm"
          />
          <input
            type="url"
            placeholder="YouTube URL'si"
            value={newSoundUrl}
            onChange={(e) => setNewSoundUrl(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 focus:bg-white/10 outline-none text-white placeholder-white/40 text-sm"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleAddSound}
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-white rounded-xl transition-all text-sm font-semibold shadow-xl shadow-teal-400/30 hover:shadow-2xl hover:shadow-teal-400/40"
            >
              Kaydet
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSoundUrl('');
                setNewSoundName('');
              }}
              className="px-4 py-2 bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white rounded-xl transition-all text-sm border border-white/20"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-white/60">Yükleniyor...</div>
      ) : (
        <div className="space-y-4">{ambientSounds.map((sound) => {
          const isActive = activeSounds.has(sound.id);
          const currentVolume = volumes[sound.id] ?? sound.volume;

          return (
            <div key={sound.id} className="bg-white/[0.02] backdrop-blur-2xl rounded-2xl p-5 border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all">
              {/* YouTube Player - Hidden */}
              {sound.videoId && (
                <div className="hidden">
                  <YouTube
                    videoId={sound.videoId}
                    opts={{
                      height: 0,
                      width: 0,
                      playerVars: {
                        autoplay: 0,
                        controls: 0,
                        loop: 1,
                        playlist: sound.videoId,
                        enablejsapi: 1,
                      },
                    }}
                    onReady={handlePlayerReady(sound.id)}
                    onStateChange={handlePlayerStateChange(sound.id)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-xl shadow-lg shadow-teal-400/30">
                    <Link size={18} className="text-white" />
                  </div>
                  <span className="font-semibold text-white">{sound.name}</span>
                  {sound.isDefault && (
                    <span className="px-2 py-1 text-xs bg-sky-500/20 text-sky-300 rounded-lg border border-sky-400/30">
                      Default
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleSound(sound.id)}
                    className={`p-2.5 rounded-xl transition-all transform hover:scale-110 ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-xl shadow-sky-500/30'
                        : 'bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isActive ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  {!sound.isDefault && (
                    <button
                      onClick={() => handleRemoveSound(sound.id)}
                      className="p-2.5 bg-rose-500/20 backdrop-blur-xl hover:bg-rose-500/30 text-rose-300 rounded-xl transition-all border border-rose-500/30"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center space-x-3">
                <Volume2 size={18} className="text-sky-300" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(currentVolume * 100)}
                  onChange={(e) => {
                    const volume = parseInt(e.target.value) / 100;
                    handleVolumeChange(sound.id, volume);
                  }}
                  className="flex-1 h-2.5 bg-white/10 backdrop-blur-xl rounded-full appearance-none cursor-pointer accent-sky-500 disabled:opacity-30"
                  disabled={!isActive}
                />
                <span className="text-sm text-white font-semibold w-12 text-right">
                  {Math.round(currentVolume * 100)}%
                </span>
              </div>
            </div>
          );
        })}</div>
      )}

      {!isInitialized && ambientSounds.length > 0 && (
        <div className="mt-6 p-4 bg-sky-500/10 backdrop-blur-2xl border border-sky-400/20 rounded-2xl">
          <p className="text-sm text-white">
            İlk kez bir ambient ses çalmak için butona tıklayın.
          </p>
        </div>
      )}
    </div>
  );
}
