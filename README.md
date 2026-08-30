# HALO — Hemat Air dan Listrik Otomatis

Situs ekosistem pemantauan **listrik dan air rumah tangga**, dibuat untuk Lomba Web
Design ITCC 2026 kategori mahasiswa (perorangan), HMTI Universitas Udayana.

**Peserta:** Gianne Angely Puspa Pilatus — Teknik Informatika, Universitas Dhyana Pura
**Tema lomba:** *Synergizing Intelligence: Developing Integrated Web Ecosystems for Sustainable Global Impact*

`8 halaman` · `HTML/CSS/JS murni` · `tanpa framework` · `nol permintaan internet` · `grafik digambar sendiri`

> **Repositori ini privat sampai hasil lomba diumumkan.** Guidebook ITCC pasal (i)
> mensyaratkan karya belum pernah dipublikasikan di media mana pun sebelumnya.

---

## Apa yang dikerjakan situs ini

Kebanyakan situs sejenis berhenti sebagai dashboard: menampilkan angka, lalu selesai.
HALO menaruh **alur kerja empat pihak** di atas pemantauan itu, jadi satu temuan sensor
punya ujung yang terukur.

```
warga            pengelola kawasan       teknisi            sensor
mengajukan   →   memverifikasi      →    mengerjakan   →    mengukur ulang
```

Hasil pengukuran ulang itu masuk lagi ke data warga sebagai bukti. Halaman **Riwayat**
menampilkan jejak lima tahap ini untuk tiap pekerjaan yang sudah selesai.

Wilayahnya disusun dua tingkat: sembilan kabupaten dan kota se-Bali untuk gambaran
utuh, lalu turun ke delapan kelurahan di Gianyar tempat verifikasi sebenarnya terjadi.
Angka Gianyar tidak ditulis terpisah — dihitung dari kelurahannya, supaya dua tingkat
itu tidak mungkin berselisih.

## Cara membuka

Situs ini **jalan penuh tanpa internet**. Semua library, font, dan gambar tersimpan di
dalam folder.

Cara paling gampang: klik dua kali `index.html` di dalam folder
`Gianne Angely Puspa Pilatus_Website`.

Cara yang disarankan, supaya fitur daftar dan masuk berjalan penuh di semua peramban:

```bash
cd "Gianne Angely Puspa Pilatus_Website" && python3 -m http.server 8000
```

Lalu buka `http://localhost:8000`.

> Sebagian peramban memblokir `localStorage` saat halaman dibuka lewat `file://`.
> Kalau itu terjadi situs tetap tampil utuh, hanya daftar/masuk yang tidak menyimpan.
> Menjalankan server lokal menghilangkan batasan itu.

## Mencoba tanpa mendaftar

Halaman **Masuk** menyediakan tiga tombol akun demo. Masing-masing membuka sisi
platform yang berbeda:

| Akun demo | Diarahkan ke | Yang bisa dilihat |
|---|---|---|
| Warga | Dashboard rumah | Pemakaian per jam, kejanggalan yang terdeteksi, perkiraan tagihan |
| Pengelola kawasan | Data kawasan | Petak se-Bali, peringkat kabupaten, rincian kelurahan, antrean verifikasi |
| Teknisi | Riwayat aktivitas | Daftar pekerjaan yang sudah lolos verifikasi |

Peran ikut mengubah tampilan: antrean verifikasi hanya bisa diputuskan oleh pengelola
kawasan, peran lain melihat tanpa tombol.

## Delapan halaman

| # | Halaman | Berkas | |
|---|---|---|---|
| 1 | Beranda | `index.html` | wajib |
| 2 | Masuk & Daftar | `pages/masuk.html` | wajib |
| 3 | Katalog layanan | `pages/layanan.html` | wajib |
| 4 | Detail layanan | `pages/detail-layanan.html` | wajib |
| 5 | Riwayat aktivitas | `pages/riwayat.html` | wajib |
| 6 | Dashboard rumah | `pages/dashboard.html` | bonus |
| 7 | Data kawasan | `pages/kawasan.html` | bonus |
| 8 | Cara kerja teknologi | `pages/teknologi.html` | bonus |

Tangkapan layar seluruh halaman ada di folder
`Gianne Angely Puspa Pilatus_Screenshot`.

## Yang ada di dalam

**Grafik digambar sendiri.** Lomba melarang library grafik, jadi `js/grafik.js`
(±640 baris) menggambar semuanya sebagai SVG dari nol:

| Fungsi | Bentuk | Dipakai di |
|---|---|---|
| `garis()` | Grafik garis, bisa memutus pada data kosong | Tren bulanan, prediksi tagihan |
| `batang()` | Batang tegak | Perbandingan antar kelurahan |
| `batangDatar()` | Batang mendatar berlabel | Rincian per alat, rincian kelurahan |
| `cincin()` | Cincin satu angka | Skor efisiensi |
| `petaPanas()` | Peta panas hari × jam | Pola pemakaian sepekan |
| `kilau()` | Garis mungil tanpa sumbu | Deret angka di beranda |
| `aliranGanda()` | Grafik cermin dua satuan | Listrik dan air di hero |
| `petakData()` | Treemap *squarified* | Sebaran rumah se-Bali |

`petakData()` memakai algoritma squarified treemap sungguhan — luas tiap petak
sebanding dengan jumlah rumah, warnanya mewakili pemakaian listrik. Jadi dua dimensinya
sama-sama membawa data.

**Satu sumber angka.** Seluruh situs menarik angka dari `js/data.js`. Ringkasan
platform diturunkan dari deretnya, bukan ditulis ulang, supaya Beranda, Dashboard,
Kawasan, dan Riwayat tidak pernah menampilkan angka yang bertentangan.

**Isi dulu, animasi belakangan.** Semua teks dan tabel ada di HTML. JavaScript hanya
memperkaya — kalau skrip gagal dimuat, halaman tetap terbaca. Semua animasi menghormati
`prefers-reduced-motion`, dan tiap halaman punya aturan cetak sendiri.

## Kepatuhan aturan lomba

| Aturan guidebook | Penerapan |
|---|---|
| HTML, CSS, JS murni — tanpa framework | Vanilla, tanpa tahap build |
| Hanya library dari daftar panitia | Boxicons 2.1.4, Fancybox 5.0.36, Swiper 11.1.5 — disalin ke `lib/` |
| Tanpa library grafik | Semua visualisasi SVG buatan sendiri di `js/grafik.js` |
| Tanpa backend atau basis data | Sesi dan rencana hemat disimpan di `localStorage` |
| Lima halaman wajib | Terpenuhi, ditambah tiga halaman bonus |
| Penamaan folder | `WD_MAHASISWA_[Nama]_ITCC 2026` dengan `_Website` dan `_Screenshot` di dalamnya |

Tidak ada satu pun permintaan ke internet: tanpa CDN, font IBM Plex pun disimpan di
`assets/fonts`. Situs bisa dinilai di ruangan tanpa jaringan.

## Struktur folder

```
WD_MAHASISWA_Gianne Angely Puspa Pilatus_ITCC 2026/
├── Gianne Angely Puspa Pilatus_Website/
│   ├── index.html                  Beranda
│   ├── pages/                      7 halaman lainnya
│   ├── css/                        10 berkas gaya (±1.740 baris)
│   ├── js/                         11 berkas skrip (±2.360 baris)
│   ├── lib/                        boxicons · fancybox · swiper
│   └── assets/                     fonts · img · ill
└── Gianne Angely Puspa Pilatus_Screenshot/
    └── 8 tangkapan layar seluruh halaman
```

## Berkas lain

- [CATATAN-DESAIN.md](CATATAN-DESAIN.md) — alasan tiap keputusan desain, cara kerja
  grafik, dan bahan persiapan untuk babak final.

---

Data di situs ini simulasi. Pada sistem sungguhan angka-angkanya datang dari sensor
IoT yang terpasang di meteran listrik dan air.
