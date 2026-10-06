# jarzx.Env Portfolio Website

Website portofolio neo-brutalism style yang mirip dengan tampilan di video TikTok / browser.

## Struktur Folder

```
jarzx-env-portfolio/
├── index.html              ← Halaman utama (semua section)
├── css/
│   └── styles.css          ← Semua styling (neo-brutalism, grid, pills, dll)
├── js/
│   └── main.js             ← Loading, theme toggle, map, terminal easter egg
├── assets/
│   ├── images/
│   │   └── portrait-placeholder.svg   ← GANTI dengan foto kamu
│   └── icons/              ← (opsional) icon tambahan
└── README.md
```

## Cara Pakai

1. Buka `index.html` di browser (atau pakai Live Server).
2. **Ganti foto portrait:**
   - Letakkan foto kamu di `assets/images/portrait.png` (atau `.jpg`)
   - Edit `index.html` baris yang ada `portrait-img`:
     ```html
     <img src="assets/images/portrait.png" alt="jarzx.Env" class="portrait-img" id="portrait-img" />
     ```
3. **Ganti link sosial:**
   - TikTok, Telegram, channel MANTA'X & DarkVerse sudah diset sesuai video.
   - Cari `https://tiktok.com/@maulcodersdev` dan `https://t.me/...` lalu sesuaikan.
4. **Ganti teks bio / journey** sesuai kebutuhan di `index.html`.

## Section yang Ada (urutan sama seperti video)

| # | Section ID     | Isi |
|---|----------------|-----|
| 0 | Loading        | Yellow screen + floating code icons + progress bar |
| 1 | `#home`        | Hero: Hello, bio, social, coffee, portrait + stickers, tech pills |
| 2 | `#about`       | ABOUT + highlighted keywords + quote box |
| 3 | `#journey`     | Timeline cerita + peta Indonesia + pin + popup + pirate mascot |
| 4 | `#skills`      | Languages, Backend, Cloud, Databases, Tools, Architecture, Methodologies |
| 5 | `#projects`    | MANTA'X & DarkVerse cards |
| 6 | `#education`   | Self-Taught / Autodidact |
| 7 | `#interests`   | Coding, Music, Gaming, AI, Sleep + bar level |
| 8 | `#contact`     | TikTok + Telegram cards |
| 9 | Footer         | Nav + copyright 2026 + Terminal button |

## Fitur

- **Loading screen** animasi progress (seperti video)
- **Dark / Light mode** toggle di header
- **Map interaktif**: klik pin → popup, zoom in/out
- **Terminal easter egg** di footer (`help`, `about`, `skills`, `contact`, `clear`, `exit`)
- **Responsive** mobile-friendly
- **Neo-brutalism**: border tebal, shadow offset, sticky notes, skill pills berwarna

## Icon / Emoji

- Tidak memakai emoji HP generik.
- Dipakai: simbol coding (`</>`, `>_`, `λ`, `⬢`, `⚙`, dll) + SVG untuk TikTok/Telegram.
- Sticker di portrait: `</>`, `>_`, floppy disk style.

## Warna Utama (sesuai video)

- Background: putih + dot grid
- Accent: kuning (`#ffe566`), cyan (`#7dd3fc`), pink (`#f9a8d4`), hijau (`#86efac`)
- Border: hitam tebal 2.5–3px
- Shadow: `4px 4px 0 #111`

## Customisasi Cepat

| Yang ingin diganti          | File & lokasi |
|----------------------------|---------------|
| Nama / title               | `index.html` → `<title>`, logo, hero title |
| Bio & About text           | `index.html` → section `#home` & `#about` |
| Journey cerita             | `index.html` → section `#journey` |
| Skill list                 | `index.html` → section `#skills` |
| Project / channel link     | `index.html` → section `#projects` |
| Foto                       | `assets/images/` + ganti `src` di HTML |
| Warna                      | `css/styles.css` → `:root` variables |

---

Dibuat agar UI/UX sedekat mungkin dengan video yang diberikan.
Buka `index.html` dan langsung coba!
