# HALO — Karya Lomba Web Design ITCC 2026

Situs ekosistem pemantauan **listrik dan air rumah tangga**, dibuat untuk
Lomba Web Design ITCC 2026 kategori mahasiswa (perorangan) yang
diselenggarakan HMTI Universitas Udayana.

**Peserta:** Gianne Angely Puspa Pilatus — Teknik Informatika, Universitas Dhyana Pura

---

## Cara membuka

Situs ini **tidak butuh koneksi internet sama sekali**. Semua library, font, dan
gambar sudah tersimpan di dalam folder.

**Cara paling gampang** — klik dua kali `index.html` di dalam folder
`Gianne Angely Puspa Pilatus_Website`.

**Cara yang disarankan** — jalankan server lokal supaya `localStorage`
(fitur daftar dan masuk) berjalan penuh di semua peramban:

```bash
cd "Gianne Angely Puspa Pilatus_Website" && python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

> Catatan: sebagian peramban memblokir `localStorage` ketika halaman dibuka
> lewat `file://`. Kalau itu terjadi, situs tetap tampil utuh — hanya fitur
> daftar/masuk yang tidak menyimpan. Menjalankan server lokal menghilangkan
> batasan tersebut.

## Mencoba tanpa mendaftar

Di halaman **Masuk** tersedia tiga tombol akun demo. Masing-masing membuka
sisi platform yang berbeda:

| Akun demo | Diarahkan ke | Yang bisa dilihat |
|---|---|---|
| Warga | Dashboard rumah | Pemakaian per jam, kejanggalan, perkiraan tagihan |
| Pengelola kawasan | Data kawasan | Petak se-Bali, peringkat kabupaten, rincian kelurahan, antrean verifikasi |
| Teknisi | Riwayat aktivitas | Daftar pekerjaan yang sudah diverifikasi |

## Isi folder

```
WD_MAHASISWA_Gianne Angely Puspa Pilatus_ITCC 2026/
├── Gianne Angely Puspa Pilatus_Website/
│   ├── index.html          Beranda
│   ├── css/                7 berkas gaya
│   ├── js/                 9 berkas skrip
│   ├── lib/                Library dari panitia (boxicons, fancybox, swiper)
│   ├── assets/             Font, foto, dan ilustrasi
│   └── pages/              7 halaman lainnya
└── Gianne Angely Puspa Pilatus_Screenshot/
    └── 8 tangkapan layar seluruh halaman
```

## Delapan halaman

| # | Halaman | Berkas | Poin |
|---|---|---|---|
| 1 | Beranda | `index.html` | Wajib |
| 2 | Masuk & Daftar | `pages/masuk.html` | Wajib |
| 3 | Katalog layanan | `pages/layanan.html` | Wajib |
| 4 | Detail layanan | `pages/detail-layanan.html` | Wajib |
| 5 | Riwayat aktivitas | `pages/riwayat.html` | Wajib |
| 6 | Dashboard rumah | `pages/dashboard.html` | Bonus |
| 7 | Data kawasan | `pages/kawasan.html` | Bonus |
| 8 | Cara kerja teknologi | `pages/teknologi.html` | Bonus |

## Kepatuhan aturan lomba

- HTML, CSS, dan JavaScript murni — **tanpa framework apa pun**
- Penyimpanan hanya `localStorage`, tidak ada backend maupun basis data
- **Tanpa library grafik** — seluruh visualisasi digambar sendiri sebagai SVG
  (lihat `js/grafik.js`)
- Library yang dipakai hanya dari daftar panitia: **Boxicons 2.1.4,
  Fancybox 5.0.36, Swiper 11.1.5** — ketiganya disalin ke folder `lib/`
- Nol permintaan ke internet: tidak ada CDN, font pun disimpan lokal

Alasan pemilihan tiap library, makna logo, dan penjelasan teknis tiap fitur
ada di [CATATAN-DESAIN.md](CATATAN-DESAIN.md).
