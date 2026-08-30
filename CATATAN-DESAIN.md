# Catatan desain HALO — bahan belajar untuk babak final

Berkas ini bukan bagian dari karya yang dikumpulkan. Isinya alasan di balik
setiap keputusan, supaya saya bisa menjawab pertanyaan juri tanpa membaca catatan.

> **Ingat:** babak penyisihan hanya 40% dari nilai akhir. Presentasi 10 menit dan
> tanya jawab 15 menit pada 7 November menyumbang 60%, tanpa boleh membawa catatan.

---

## 1. Konsep

**Masalah yang diambil.** Meteran listrik dan air hanya memberi satu angka di akhir
bulan. Saat tagihan melonjak, tidak ada cara menelusuri jam berapa dan alat mana
penyebabnya. Kebocoran pipa tertanam bisa berjalan berbulan-bulan tanpa disadari.

**Kenapa bukan sekadar dashboard.** Guidebook meminta *ekosistem web yang
komprehensif dan terintegrasi, tidak terbatas pada sistem pemantauan*, dengan
alur kerja yang kompleks. Karena itu HALO dirancang melibatkan empat pihak:

1. **Rumah tangga** — sensor membaca, warga melihat dan mengajukan
2. **Pengelola kawasan** — melihat agregat wilayah, memverifikasi pengajuan
3. **Teknisi mitra** — menerima pekerjaan yang sudah diverifikasi
4. **Lapisan data** — AI menandai kejanggalan, Big Data memberi pembanding

Alurnya tertutup: **sensor yang menemukan masalah adalah sensor yang mengukur
hasil perbaikannya.** Itu kalimat kunci kalau ditanya "apa bedanya dengan aplikasi
monitoring biasa".

**Kaitan dengan tema.** AI = deteksi anomali dan prediksi tagihan. IoT = sensor
arus dan sensor air yang mengirim tiap 15 menit. Big Data = perbandingan 2.337
rumah dan 8 kelurahan. Semuanya disimulasikan di sisi klien karena lomba melarang
backend.

---

## 2. Nama dan logo

**HALO** = *Home And Living Optimizer*. Kata "halo" juga berarti lingkaran cahaya,
dan dalam bahasa Indonesia dipakai sebagai sapaan — cocok untuk platform yang
bicara langsung ke pemilik rumah.

> **Sudah dicek:** guidebook ITCC 2026 tidak mengatur nama karya maupun bahasanya.
> Aturan penamaan yang ada hanya menyangkut nama folder pengumpulan. Jadi nama
> HALO tidak melanggar apa pun.

**Logo.** Bentuknya satu tetesan air, dan ruang kosong di dalamnya membentuk
petir. Jadi dua hal yang dipantau HALO — air dan listrik — menyatu dalam satu
bentuk, bukan ditempel bersebelahan.

Syarat yang dipenuhi: satu warna saja, tetap jelas dalam hitam-putih, terbaca di
ukuran 24 piksel, tanpa gradasi, dan digambar sebagai SVG sehingga bisa diwarnai
lewat CSS. Berkasnya di `assets/ill/logo.svg`.

Arah bentuknya dicari lewat Gemini, lalu digambar ulang sendiri sebagai SVG
bersih — keluaran generator berupa raster dan pecah kalau diperbesar.

---

## 3. Warna

Semua warna **rata, tanpa satu pun gradasi**. Referensi yang panitia sebut
(Microsoft Sustainability, IBM Environmental Intelligence, ClimateTrade, UN SDG)
semuanya memakai blok warna solid — gradasi justru ciri templat generik.

| Peran | Kode | Alasan |
|---|---|---|
| Tinta | `#14201c` | Hitam kehijauan, lebih hangat dari hitam murni |
| Kertas | `#f5f2ec` | Latar krem, mengurangi silau dibanding putih |
| Listrik | `#b8501a` | Oranye bakar — hangat, mengingatkan pada energi |
| Air | `#16607a` | Biru laut dalam |
| Hemat | `#38684a` | Hijau lumut, dipakai untuk angka penghematan |
| Waspada | `#9d3419` | Merah bata untuk peringatan |

**Warna dipakai untuk menandai arti, bukan hiasan.** Oranye selalu berarti
listrik, biru selalu berarti air. Konsistensi ini berlaku di semua halaman,
termasuk di dalam grafik.

---

## 4. Huruf

Satu keluarga huruf, dua peran:

- **IBM Plex Serif 600** untuk judul — memberi kesan editorial dan institusional,
  bukan tampilan startup
- **IBM Plex Sans** untuk isi dan antarmuka — angkanya *tabular*, artinya setiap
  digit selebar sama sehingga angka dalam tabel dan grafik sejajar rapi

Kenapa IBM Plex: keluarga huruf terbuka yang dirancang untuk data dan
dokumentasi teknis. Kebetulan juga bertaut dengan IBM Environmental Intelligence,
salah satu referensi yang panitia sebut.

Kedua berkas huruf disimpan lokal di `assets/fonts/` dan dideklarasikan sendiri
lewat `@font-face`. Tidak ada Google Fonts, karena panitia membatasi library ke
daftar mereka dan situs harus jalan tanpa internet.

---

## 5. Library — kenapa hanya tiga dari delapan

Panitia mengizinkan delapan library. Saya memakai **tiga**, dan setiap satu punya
alasan yang jelas:

| Library | Dipakai untuk | Kenapa tidak dikerjakan sendiri |
|---|---|---|
| **Boxicons 2.1.4** | Ikon antarmuka | Menggambar 40+ ikon sendiri buang waktu tanpa hasil lebih baik |
| **Fancybox 5.0.36** | Galeri foto halaman detail | Sudah menangani papan ketik, sentuh, dan aksesibilitas |
| **Swiper 11.1.5** | Geseran layanan terkait | Sudah menangani sentuh dan responsif |

**Yang sengaja tidak dipakai, dan alasannya:**

- **jQuery** — semua yang dibutuhkan sudah ada di JavaScript modern
- **OwlCarousel2** — fungsinya sama dengan Swiper, memasang dua library carousel
  untuk satu kebutuhan itu pemborosan
- **Typed.js** — efek mesin ketik terasa hiasan, tidak menjelaskan apa pun
- **AOS** — animasi muncul saya tulis sendiri dengan `IntersectionObserver`
  supaya tiap bagian bisa punya gerakan berbeda, bukan satu efek untuk semuanya
- **GSAP** — sempat disalin lalu dihapus karena tidak ada satu pun yang memakainya

> Kalau ditanya "kenapa tidak memakai semua library yang diizinkan": memasang
> library yang tidak dipakai menambah berkas mati dan memperberat halaman. Yang
> dinilai kerapian kode, bukan jumlah library.

---

## 6. Grafik — semuanya digambar sendiri

Lomba melarang library grafik, jadi seluruh visualisasi dibuat di
`js/grafik.js` (365 baris). Isinya enam jenis:

| Fungsi | Jenis | Dipakai di |
|---|---|---|
| `garis()` | Grafik garis, bisa banyak seri | Beranda, dashboard, detail, riwayat, kawasan, teknologi |
| `batang()` | Batang tegak | Perbandingan antar kelurahan |
| `batangDatar()` | Batang mendatar | Rincian pemakaian per alat |
| `cincin()` | Cincin | Perbandingan dengan rata-rata kawasan |
| `petaPanas()` | Peta panas jam × hari | Dashboard |
| `kilau()` | Garis mungil tanpa sumbu | Kartu ringkas |

**Cara kerjanya, kalau ditanya:**
- Semua digambar sebagai elemen SVG lewat `createElementNS`
- Memakai `viewBox` dengan koordinat tetap, lalu diskalakan CSS — itu sebabnya
  ikut menyesuaikan lebar layar tanpa digambar ulang
- Ambang sumbu dihitung fungsi `tangga()` supaya jatuh di angka bulat
  (0, 100, 200) bukan angka acak
- Garis digambar bertahap dengan `stroke-dasharray` dan `stroke-dashoffset`:
  panjang garis diukur dulu, dijadikan panjang putus-putus, lalu pergeserannya
  dianimasikan dari panjang penuh ke nol
- Kotak keterangan mengikuti kursor lewat perhitungan posisi relatif

---

## 7. Angka — dari mana asalnya

Semua data ada di satu berkas, `js/data.js`, supaya tidak ada angka yang
bertentangan antar halaman. Ini yang sering diperiksa juri.

| Angka | Sumber / cara hitung |
|---|---|
| Tarif listrik Rp1.444,70 / kWh | Golongan R-1/TR 1300 VA |
| Tarif air Rp4.900 / m³ | Perkiraan tarif PDAM rumah tangga |
| Faktor emisi listrik 0,87 kg CO₂e/kWh | Perkiraan jaringan Jawa-Bali |
| Faktor emisi air 0,45 kg CO₂e/m³ | Perkiraan energi pengolahan dan pemompaan |
| Pemakaian harian | Dihitung dari pola 24 jam, **diskalakan** agar jumlah 30 harinya persis sama dengan angka bulanan |
| Balik modal | biaya ÷ hemat per bulan, dibulatkan ke atas |

**Penting:** deret harian sengaja dinormalkan supaya jumlahnya sama persis dengan
angka bulan berjalan (243 kWh dan 18,1 m³). Kalau juri menjumlahkan grafik harian
lalu membandingkannya dengan grafik bulanan, angkanya cocok.

---

## 8. Animasi — aturannya satu

**Setiap animasi harus menjelaskan sesuatu atau memberi umpan balik.** Kalau cuma
hiasan, dibuang.

| Gerakan | Menjelaskan apa |
|---|---|
| Layar muat menggambar logo | Menandai situs sedang siap |
| Angka menghitung naik | Menarik perhatian ke besarnya angka |
| Garis grafik menggambar diri | Menunjukkan arah data mengalir dari kiri ke kanan |
| Alur empat pemeran menyala berurutan | Menunjukkan urutan pihak yang terlibat |
| Diagram teknologi dipaku saat digulir | Satu diagram, lima penjelasan — pembaca tidak kehilangan konteks |
| Denyut pada titik sensor | Menandai data yang masuk terus-menerus |

**Aturan teknis yang dipatuhi:**
- Hanya `transform` dan `opacity` yang dianimasikan. Menganimasikan `width` atau
  `top` memaksa peramban menghitung ulang tata letak setiap bingkai dan membuat
  gerakan tersendat
- Tidak ada animasi yang menggeser tata letak halaman
- `prefers-reduced-motion` dihormati: kalau pengguna mematikan animasi di
  pengaturan sistem, seluruh isi tetap tampil, hanya gerakannya dilewati
- Layar muat punya pengaman — kalau JavaScript gagal, penghitung waktu tetap
  menghilangkannya setelah 2,2 detik

---

## 9. Keputusan yang mungkin ditanya

**"Kenapa isinya ditulis di HTML, bukan disuntik JavaScript?"**
Kalau satu skrip gagal, halaman yang isinya disuntik JavaScript jadi kosong
melompong. Semua konten ditulis langsung di HTML; JavaScript hanya menyaring,
menyembunyikan, dan menambah interaksi. Buka View Source, isinya ada semua.

**"Kenapa situsnya tidak butuh internet?"**
Kalau penjurian dilakukan offline, wifi lemot, atau CDN diblokir firewall kampus,
situs yang bergantung CDN akan tampil rusak. Semua library, font, dan gambar
disalin ke dalam folder.

**"Kenapa tidak pakai framework?"**
Dilarang aturan lomba. Tapi memang tidak dibutuhkan — situs ini statis dan
seluruh keadaannya cukup ditangani `localStorage`.

**"Data ini nyata atau karangan?"**
Simulasi, dan itu dinyatakan di kaki setiap halaman. Yang nyata adalah tarif,
faktor emisi, dan cara hitungnya. Dalam sistem sungguhan, angka pemakaian datang
dari sensor.

**"Apa bagian tersulitnya?"**
Membuat mesin grafik sendiri tanpa library — terutama menghitung ambang sumbu
supaya jatuh di angka yang enak dibaca, dan membuat animasi garis yang tetap
mulus saat data diganti.

---

## 10. Sumber bahan

- **Foto:** Pexels (lisensi bebas pakai, tanpa kewajiban atribusi). Sembilan foto
  diunduh ke `assets/img/`, tidak ada yang diambil langsung dari internet saat
  halaman dibuka.
- **Huruf:** IBM Plex Sans dan IBM Plex Serif, lisensi SIL Open Font License.
- **Ikon:** Boxicons 2.1.4 dari bundel panitia.
- **Ilustrasi:** logo, diagram teknologi, dan ilustrasi keadaan kosong digambar
  sendiri sebagai SVG. Tidak ada gambar hasil generator.

---

## 11. Yang masih bisa ditingkatkan

Jujur saja kalau ditanya kekurangan — juri menghargai peserta yang tahu batas
karyanya:

- Belum ada halaman laporan dampak yang bisa dicetak sebagai berkas
- Peta kawasan berupa blok geometris, bukan bentuk wilayah sebenarnya
- Model prediksi hanya rata-rata berbobot, bukan model musiman
- Belum diuji dengan pembaca layar secara menyeluruh
