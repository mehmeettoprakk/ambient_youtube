/**
 * YouTube URL'sinden video ID'sini çıkarır
 */
export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Saniyeyi dakika:saniye formatına çevirir
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * ISO 8601 süresini saniyeye çevirir (örn: PT1H2M10S -> saniye)
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * YouTube video bilgilerini almak için oEmbed API kullanır
 */
export async function getVideoInfo(videoId: string) {
  try {
    // YouTube oEmbed API'sini kullan
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    
    if (!oembedResponse.ok) {
      throw new Error('Video bilgisi alınamadı');
    }
    
    const oembedData = await oembedResponse.json();
    
    // Süre bilgisi için YouTube Data API v3 kullanmadan tahmin
    // Not: Gerçek süre bilgisi için YouTube Data API key gerekir
    return {
      title: oembedData.title || `Video ${videoId}`,
      duration: 'Bilinmiyor',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  } catch (error) {
    console.error('Video bilgisi alınamadı:', error);
    // Hata durumunda basit bilgi döndür
    return {
      title: 'YouTube Video',
      duration: 'Bilinmiyor',
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };
  }
}

/**
 * URL'in geçerli bir YouTube URL'si olup olmadığını kontrol eder
 */
export function isValidYouTubeUrl(url: string): boolean {
  const videoId = extractVideoId(url);
  return videoId !== null;
}