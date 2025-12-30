# Müzik Duygu Mikseri 🎵

YouTube müzik videolarına YouTube ambient efektleri ekleyen Next.js uygulaması.

## Özellikler

- 🎵 YouTube video URL'si ile müzik çalma
- 🔗 YouTube ambient efekt linklerini ekleme (dalga, şömine, yağmur, doğa vb.)
- 🎛️ Her ambient efekt için ayrı ses seviyesi kontrolü
- ⚡ Gerçek zamanlı YouTube player ses karıştırma
- 📱 Responsive tasarım
- 🎨 Modern ve kullanıcı dostu arayüz
- ➕ 5 farklı ambient efekt slotu

## Kurulum

1. Projeyi klonlayın:

```bash
git clone [repo-url]
cd mzk_dlg
```

2. Bağımlılıkları yükleyin:

```bash
npm install
```

3. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

4. Tarayıcınızda http://localhost:3000 adresini açın

## Kullanım

### Müzik Ekleme:

1. Ana müzik için YouTube videosunun URL'sini giriş alanına yapıştırın
2. "Yükle" butonuna tıklayın
3. Müziği çalmak için play butonuna basın

### Ambient Efekt Ekleme:

1. Sağ taraftaki "Ekle" butonuna tıklayın
2. Efekt ismi girin (örn: "Dalga Sesi")
3. YouTube ambient ses URL'sini yapıştırın
4. "Kaydet" butonuna tıklayın
5. Efekti çalmak için play butonuna basın
6. Volume seviyesini ayarlayın

### Önerilen Ambient YouTube Videoları:

- **Dalga Sesi**: Okyanus, plaj dalgaları
- **Şömine**: Crackling fireplace, wood burning
- **Yağmur**: Rain sounds, thunderstorm
- **Orman**: Forest ambience, bird sounds
- **Kafe**: Coffee shop ambience, cafe sounds

## Teknolojiler

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React YouTube** - YouTube player
- **Lucide React** - Icons
- **Web Audio API** - Ses işleme

## Yeni Özellikler

- ✅ YouTube linklerle ambient ses ekleme
- ✅ Dinamik ambient efekt yönetimi
- ✅ Efekt ekleme/çıkarma
- ✅ Çoklu YouTube player desteği
- ✅ Real-time ses kontrolü

## Proje Yapısı

```
mzk_dlg/
├── app/
│   ├── components/          # React bileşenleri
│   │   ├── YouTubePlayer.tsx
│   │   └── AmbientControls.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useAudioMixer.ts
│   ├── utils/               # Utility fonksiyonlar
│   │   └── youtube.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   └── ambient/             # Ambient ses dosyaları
└── ...
```

## Geliştirme

### Yeni Ambient Ses Ekleme

1. `app/hooks/useAudioMixer.ts` dosyasında `ambientSounds` dizisine yeni ses ekleyin
2. `app/components/AmbientControls.tsx` dosyasında `soundIcons` objesine ikon ekleyin
3. Ses dosyasını `public/ambient/` klasörüne yerleştirin

### Build ve Deploy

```bash
# Production build
npm run build

# Production başlatma
npm start
```

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Bilinen Sorunlar

- Ambient ses dosyaları yüklenmemişse sessizlik olacaktır
- İlk ambient ses çalmadan önce kullanıcı etkileşimi gereklidir (tarayıcı politikası)

## Geliştirici

Geliştirici: [İsminiz]
İletişim: [email@example.com]
