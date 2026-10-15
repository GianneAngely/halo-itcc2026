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
arus dan sensor air yang mengirim tiap 15 menit. Big Data = perbandingan 17.507
rumah di sembilan kabupaten, yang bisa dibuka sampai kelurahan. Semuanya disimulasikan di sisi klien karena lomba melarang
backend.

---

## 2. Nama dan logo

**HALO = Hemat Air dan Listrik Otomatis.** Kepanjangannya berbahasa Indonesia dan
ditulis di empat tempat: plat di beranda tepat di atas judul, plat yang sama di
puncak kedua panel halaman masuk, baris kecil di kaki kedelapan halaman, dan di
judul serta deskripsi halaman.

Pada plat itu huruf **A** diwarnai biru air dan huruf **L** diwarnai oranye listrik.
Jadi plat namanya sekaligus mengajarkan kode warna seluruh situs sebelum warna itu
muncul di grafik mana pun. Ini jawaban kalau juri bertanya kenapa dua warna itu yang
dipakai.

> **Sudah dicek:** guidebook ITCC 2026 tidak mengatur nama karya maupun bahasanya.
> Aturan penamaan yang ada hanya menyangkut nama folder pengumpulan.

**Logo.** Bentuknya satu tetesan air, dan ruang kosong di dalamnya membentuk
petir. Jadi dua hal yang dipantau HALO — air dan listrik — menyatu dalam satu
bentuk, bukan ditempel bersebelahan.

Syarat yang dipenuhi: satu warna saja, tetap jelas dalam hitam-putih, terbaca di
ukuran 24 piksel, tanpa gradasi, dan digambar sebagai SVG sehingga bisa diwarnai
lewat CSS. Berkasnya di `assets/ill/logo.svg`.

Arah bentuknya dicari lewat Gemini, lalu digambar ulang sendiri sebagai SVG
bersih — keluaran generator berupa raster dan pecah kalau diperbesar.

---

## 2b. Arah desain: situs sebagai alat ukur

Versi pertama situs ini terlihat rapi tapi biasa — seperti brosur institusional yang
bercerita *tentang* meteran. Arahnya diubah: **situs ini berhenti bercerita dan mulai
berlaku sebagai alat ukur.**

Tiga benda yang membawa arah itu:

**1. Grafik cermin dua aliran** — tokoh utama layar pertama, menggantikan foto rumah.
Satu sumbu jam 00–23 di tengah. Listrik naik ke atas dalam watt, air turun ke bawah
dalam liter per jam. Keduanya berskala sendiri-sendiri; kalau dipaksa berbagi satu
sumbu, kurva air akan gepeng menempel dasar karena besarannya jauh berbeda. Bentuk
cermin itulah yang menjelaskan produknya tanpa perlu dibaca: dua hal masuk ke rumah,
HALO membaca keduanya per jam. Garis putus-putus merah di jam 02–05 menandai 38 liter
per jam sebelum kebocoran ditambal — satu titik yang menyampaikan urgensi.
Kodenya `Grafik.aliranGanda()` di `js/grafik.js`.

**2. Plat HALO** — lihat bagian 2 di atas.

**3. Pita ukur bertakik** — pita 30px bernomor register di atas tiap kepala bagian.
Takiknya elemen `<i>` sungguhan yang diisi `js/app.js`, bukan gradasi berulang, karena
gradasi tidak dipakai di mana pun. Bentuk dasarnya garis biasa yang ditulis di CSS,
jadi pita tetap ada kalau JavaScript mati.

### Aturan konsistensi yang diberlakukan

- **Kartu** — satu bentuk untuk seluruh situs: pita kepala, gambar, badan, kaki. Tanpa bayangan.
- **Gambar** — dalam satu kisi, semua bergambar atau tidak sama sekali. Tidak pernah campur.
  Rasio dikunci 16/10 untuk kartu layanan. Sudut foto nol.
- **Kolom** — hanya dua lebar di seluruh situs, 5/12 dan 7/12, sisi lebarnya berselang-seling.
- **Rata atas** — semua kepala bagian dan kartu memakai `align-items: start`.
- **Angka** — huruf tabular, satuan berdiri sendiri, dan tiap angka besar punya satu baris pembanding.

## 2c. Kaitan dengan tema lomba

Guidebook menyebut daftar contoh platform yang diterima, dan salah satunya persis
HALO: *"…dapat berupa carbon market, **sistem monitoring energi pintar**, portal
green supply chain, platform circular economy…"*

Yang perlu disiapkan jawabannya kalau juri menekan:

**"Ini kan cuma dashboard?"** — Guidebook menulis *"tidak terbatas pada sistem
pemantauan (dashboard)"*. HALO menjawabnya lewat lapisan alur kerja di atas
pemantauan: satu temuan sensor berjalan melewati empat pihak sampai hasilnya
terukur. Tunjukkan halaman Riwayat, jejak lima tahapnya.

**"Di mana sisi globalnya?"** — Ini bagian yang paling perlu latihan. Jawabannya:
skala sekarang memang satu provinsi, tapi modelnya tidak terikat tempat.
Yang dibutuhkan cuma sensor, satu pengelola kawasan, dan teknisi setempat —
ketiganya ada di hampir semua daerah. Bagian **Skala** di beranda menghitungnya:
kalau pola yang sama berjalan di satu persen rumah tangga Indonesia, yaitu
710.000 rumah, penghematannya 12,6 juta kWh sebulan dan emisi yang dicegah
132.015 ton CO₂e setahun.

Angka itu dihitung, bukan dikarang: 17,8 kWh dan 0,55 m³ per rumah tiap bulan
(rata-rata rumah yang sudah terhubung), dikali 710.000, dikali faktor emisi
0,87 kg CO₂e per kWh.

**"Kenapa Bali, bukan satu kota saja?"** — Halaman Kawasan sengaja dibuat dua
tingkat. Tingkat atas sembilan kabupaten dan kota se-Bali, supaya terlihat
sistemnya berjalan di wilayah seluas provinsi. Tingkat bawah delapan kelurahan
di Gianyar, karena di situlah verifikasi benar-benar terjadi — pengelola kawasan
memutuskan per kelurahan, bukan per provinsi. Angka Gianyar di tabel atas tidak
ditulis terpisah, melainkan dijumlahkan dari delapan kelurahan itu, jadi dua
tingkatnya tidak mungkin bertentangan. Kalau juri bertanya soal ini, tunjukkan
baris Gianyar lalu gulir ke blok "Di dalam Gianyar".

---

**Empat target SDG yang dibantu** — hafalkan nomornya:
- **SDG 6** air bersih, khususnya target 6.4 soal efisiensi pemakaian air
- **SDG 7** energi bersih, target 7.3 soal menggandakan laju perbaikan efisiensi
- **SDG 11** kota berkelanjutan, target 11.6 soal menekan dampak lingkungan kawasan
- **SDG 13** aksi iklim

UN Sustainable Development Goals adalah salah satu situs rujukan yang panitia
sebut sendiri di guidebook, jadi kaitan ini memakai pintu yang mereka buka.

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
- Petak kawasan sengaja bukan peta: letak dan ketetanggaan antar petak tidak
  membawa arti apa pun, yang membawa data hanya luas dan warnanya
- Model prediksi hanya rata-rata berbobot, bukan model musiman
- Belum diuji dengan pembaca layar secara menyeluruh
