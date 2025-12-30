'use client';

import { useState } from 'react';
import { Search, Music } from 'lucide-react';
import YouTubePlayer from './components/YouTubePlayer';
import AmbientControls from './components/AmbientControls';
import { extractVideoId, isValidYouTubeUrl, getVideoInfo } from './utils/youtube';

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
}

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!isValidYouTubeUrl(youtubeUrl)) {
        throw new Error('Geçerli bir YouTube URL\'si girin');
      }

      const id = extractVideoId(youtubeUrl);
      if (!id) {
        throw new Error('Video ID\'si çıkarılamadı');
      }

      setVideoId(id);
      
      // Video bilgilerini al
      const info = await getVideoInfo(id);
      if (info) {
        setVideoInfo(info);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setVideoId(null);
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerReady = (duration: number) => {
    if (videoInfo && duration > 0) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      setVideoInfo(prev => prev ? { ...prev, duration: formattedDuration } : null);
    }
  };

  const clearVideo = () => {
    setVideoId(null);
    setVideoInfo(null);
    setYoutubeUrl('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-sky-950 to-blue-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-sky-500/20">
              <Music className="text-sky-300" size={36} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-sky-200 to-blue-200 bg-clip-text text-transparent drop-shadow-2xl">
              Müzik Duygu Mikseri
            </h1>
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg backdrop-blur-sm">
            YouTube müzik videolarınıza ambient ses efektleri ekleyerek duygusal bir deneyim yaratın
          </p>
        </header>

        {/* YouTube URL Input */}
        <div className="max-w-3xl mx-auto mb-12">
          <form onSubmit={handleUrlSubmit} className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
            <label className="block text-sm font-semibold text-white/90 mb-3 uppercase tracking-wide">
              YouTube Video URL'si
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-5 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50 focus:bg-white/10 outline-none text-white placeholder-white/40 transition-all"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-400 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl transition-all transform hover:scale-105 hover:shadow-sky-500/50 hover:shadow-2xl disabled:scale-100 flex items-center gap-2 font-semibold shadow-xl"
              >
                {isLoading ? (
                  'Yükleniyor...'
                ) : (
                  <>
                    <Search size={20} />
                    Yükle
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-red-400 text-sm font-medium">{error}</p>
            )}
          </form>
        </div>

        {/* Video Info */}
        {videoInfo && videoId && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl shadow-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center gap-5">
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-32 h-24 object-cover rounded-2xl shadow-2xl border border-white/10"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{videoInfo.title}</h3>
                  <p className="text-slate-400 text-sm mt-1">{videoInfo.duration}</p>
                </div>
                <button
                  onClick={clearVideo}
                  className="px-5 py-2.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all border border-slate-600 font-medium"
                >
                  Değiştir
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* YouTube Player */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-1.5 h-9 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full shadow-lg shadow-sky-500/50"></div>
              Müzik Çalar
            </h2>
            <YouTubePlayer videoId={videoId} onReady={handlePlayerReady} />
          </div>

          {/* Ambient Controls */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-1.5 h-9 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full shadow-lg shadow-sky-500/50"></div>
              Ambient Sesler
            </h2>
            <AmbientControls />
          </div>
        </div>

        {/* Instructions */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-3xl shadow-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-2 h-10 bg-gradient-to-b from-sky-400 to-blue-500 rounded-full shadow-lg shadow-sky-500/50"></div>
              Nasıl Kullanılır?
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-300 text-base">
              <li className="pl-2">Yukarıdaki alana sevdiğiniz YouTube müzik videosunun URL&apos;sini yapıştırın</li>
              <li className="pl-2">Video yüklendikten sonra müziği çalmaya başlayın</li>
              <li className="pl-2">Sağ taraftaki &quot;Ekle&quot; butonuna tıklayarak ambient efekt ekleyin</li>
              <li className="pl-2">Her efekt için YouTube URL&apos;si ve isim girin (örn: dalga sesi, şömine sesi)</li>
              <li className="pl-2">Eklediğiniz efektleri çalın ve ses seviyelerini ayarlayın</li>
              <li className="pl-2">Müzik ile ambient efektlerin karışımından doğan duygusal deneyimin keyfini çıkarın</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}