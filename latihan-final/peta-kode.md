# Peta kode HALO — bahan hafalan untuk pertanyaan kode di final

Panitia sudah memastikan **salah satu juri akan bertanya soal kode program**.
Kamu tidak boleh membawa catatan, jadi berkas ini untuk dipelajari sebelumnya,
bukan dibuka saat tampil.

Nomor baris di bawah sudah dicocokkan dengan berkas yang dikumpulkan.

---

## Kalau juri minta buka satu berkas

Sebelas berkas JavaScript, 2.360 baris. Hafal pembagiannya saja, bukan isinya:

| Berkas | Baris | Isinya |
|---|---|---|
| `js/grafik.js` | 640 | Mesin grafik. Delapan bentuk, semua SVG buatan sendiri. |
| `js/data.js` | 274 | Semua angka situs. Tidak ada angka yang diketik di tempat lain. |
| `js/app.js` | 235 | Dipakai semua halaman: format angka, sesi, navigasi, animasi. |
| `js/detail.js` | 234 | Simulator balik modal di halaman detail layanan. |
| `js/riwayat.js` | 210 | Jejak lima tahap, saringan, cetak. |
| `js/masuk.js` | 170 | Daftar, masuk, akun demo. |
| `js/dashboard.js` | 160 | Dashboard rumah. |
| `js/beranda.js` | 154 | Beranda. |
| `js/kawasan.js` | 150 | Petak se-Bali, tabel, rincian Gianyar. |
| `js/layanan.js` | 69 | Saringan dan pencarian katalog. |
| `js/teknologi.js` | 64 | Diagram yang berpindah saat digulir. |

Satu kalimat kalau ditanya pembagiannya: *satu berkas untuk data, satu untuk grafik,
satu untuk yang dipakai bersama, sisanya satu berkas per halaman.*

---

## Lima yang paling mungkin ditanya

### 1. Treemap squarified — `grafik.js:523` `petakData()`

Yang paling mungkin dibongkar, karena paling tidak biasa.

**Cara kerjanya, dengan kata sendiri:** luas tiap petak harus sebanding jumlah rumah.
Kalau dibagi asal, petaknya jadi panjang-panjang seperti pita dan tidak terbaca. Jadi:

1. Semua wilayah diurutkan dari yang terbesar.
2. Ambil satu per satu, tumpuk jadi satu lajur di sisi **terpendek** bidang yang tersisa.
3. Tiap kali mau menambah satu lagi, hitung **perbandingan sisi terburuk** di lajur itu.
   Kalau menambah bikin lebih mendekati persegi, tambahkan. Kalau malah makin pipih,
   tutup lajurnya, potong bidang yang terpakai, mulai lajur baru di sisa bidang.
4. Ulangi sampai habis.

**Fungsi `terburuk(r, sisi)`** mengembalikan perbandingan sisi terjelek di satu lajur —
`max(sisi² × terbesar / jumlah², jumlah² / (sisi² × terkecil))`. Makin dekat ke 1 makin
persegi. Itu yang jadi dasar keputusan tambah atau tutup.

**Kalau ditanya "kamu tahu dari mana algoritma ini benar?"** — luasnya diverifikasi:
galat luas 0,00 persen, bidang terisi 100 persen, tidak ada petak bertumpuk,
perbandingan sisi terburuk 1,97.

**Detail kecil yang enak disebut:** pekat warnanya `0.16 + normalisasi × 0.84`, bukan
`0 + × 1`. Dasarnya 0,16 supaya petak dengan nilai terendah tetap kelihatan, tidak
hilang jadi putih.

### 2. Ambang sumbu — `grafik.js:30` `tangga()`

**Masalahnya:** kalau nilai tertinggi 243 dibagi 5, langkahnya 48,6. Sumbu jadi
0 / 48,6 / 97,2 — tidak ada yang membaca grafik seperti itu.

**Caranya:** hitung langkah kasar, lalu bulatkan **ke atas** ke angka enak terdekat
dari `[1, 2, 2.5, 5, 10]` dikali pangkat sepuluh yang sesuai. Jadi 48,6 naik ke 50.

**Kenapa ada `desimal` yang ikut dikembalikan:** kalau langkahnya 0,25 tapi labelnya
dibulatkan satu angka di belakang koma, sumbu terbaca 0 / 0,3 / 0,5 / 0,8 — kelihatan
tidak rata padahal jaraknya sama. Jadi jumlah desimal dihitung dari langkahnya sendiri,
bukan ditetapkan di awal.

### 3. Garis yang putus saat data kosong — `grafik.js:136`

```js
let mulaiBaru = true;
if (v === null || v === undefined) { mulaiBaru = true; return ''; }
const perintah = mulaiBaru ? 'M' : 'L';
mulaiBaru = false;
```

**Kenapa:** di grafik perkiraan tagihan, hari yang belum terjadi belum punya pembacaan
sensor. Versi sebelumnya mengulang nilai terakhir, jadi garisnya mendatar sampai akhir
bulan — seolah sensor sudah membaca hari yang belum datang. Sekarang nilai kosong
menyetel ulang `mulaiBaru`, titik berikutnya memakai `M` (pindah) bukan `L` (tarik
garis), jadi garisnya benar-benar putus.

### 4. Angka yang diturunkan — `data.js:251`

```js
const rumahBulanan = [8270, …, 17507];
const hematKwhPerRumah = 17.81;
const hematListrikBulanan = rumahBulanan.map(r => Math.round(r * hematKwhPerRumah));
```

`ringkasan` di baris 258 mengambil dari deret ini, tidak diketik ulang.

**Kenapa penting:** waktu masih diketik terpisah, beranda pernah menulis 41.628
sementara perhitungannya 41.622. Angka yang diketik dua kali pasti suatu saat berbeda.
Sekarang satu-satunya cara mengubahnya adalah mengubah deretnya.

### 5. `localStorage` yang dibungkus — `app.js:25` `Simpanan`

Sebagian peramban melempar galat saat `localStorage` diakses dalam mode tertentu —
jendela penyamaran, atau penyimpanan situs diblokir. Tanpa pembungkus, satu galat di
situ mematikan seluruh skrip halaman. Dibungkus `try/catch`, fitur simpannya mati
tapi situsnya tetap jalan.

---

## Pertanyaan yang jawabannya pendek

**"Kenapa isinya ditulis di HTML, bukan disuntik JavaScript?"**
Kalau satu skrip gagal, halaman yang isinya disuntik jadi kosong. Semua teks dan tabel
ada di HTML; JavaScript hanya menyaring, menyembunyikan, menambah interaksi. Buka View
Source, isinya ada semua.

**"Kenapa tidak pakai library grafik?"**
Dilarang aturan lomba. Delapan bentuk digambar sendiri di `grafik.js`.

**"Animasinya bagaimana kalau pengguna tidak kuat gerakan?"**
`app.js:142` membaca `prefers-reduced-motion`. Kalau pengguna menyetel itu di sistemnya,
seluruh animasi dilewati, isinya langsung tampil.

**"Kenapa situsnya tidak butuh internet?"**
Semua library, font, gambar disalin ke dalam folder. Nol permintaan keluar. Kalau wifi
penjurian bermasalah, situsnya tetap utuh — dan itu bisa dibuktikan saat itu juga.

---

## Kalau tidak tahu jawabannya

Jangan mengarang. Juri lebih menghargai *"bagian itu saya tulis dengan pendekatan X,
tapi saya tidak hafal barisnya — boleh saya buka berkasnya?"* daripada penjelasan
yang terdengar yakin tapi salah. Mengarang satu kali merusak kepercayaan pada semua
jawaban sebelumnya.
