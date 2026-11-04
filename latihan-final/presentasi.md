# Presentasi final HALO — 10 menit

**7 November 2026, giliran 09.30–09.55 WITA.** Tanpa PPT, tanpa catatan.
Share seluruh layar, buka `https://itcc-udayana-wd2-00319-zxs.vercel.app/`

Ini **poin, bukan naskah.** Jangan dihafal kalimatnya — hafal urutannya dan apa yang
mau dibuktikan di tiap bagian. Kalimat penghubungnya biar keluar sendiri tiap latihan.

Sepuluh menit ini untuk **UI**. Kode cuma dibuka kalau juri bertanya.

---

## 0:00–1:00 · Beranda, bagian atas

**Yang di layar:** hero, grafik cermin listrik–air.

Buka dengan masalahnya, bukan dengan nama produk:

> Meteran listrik dan air cuma kasih satu angka di akhir bulan. Waktu tagihan
> melonjak, nggak ada cara tahu jam berapa dan alat mana penyebabnya.

Lalu tunjuk grafik cerminnya:

> Ini satu hari di satu rumah. Listrik ke atas, air ke bawah, sumbu jamnya sama.
> HALO baca keduanya tiap lima belas menit.

**Kalimat yang menentukan** — ini yang bikin Juri 1 ingat, ucapkan pelan:

> Tapi HALO bukan aplikasi pemantauan. Bedanya ada di apa yang terjadi setelah
> kejanggalan ketemu.

Jangan buru-buru lewat bagian ini. Satu menit pertama yang nentuin juri mau
dengerin sisanya atau enggak.

## 1:00–2:30 · Beranda, gulir ke alur empat pihak

**Yang di layar:** deret angka platform, lalu bagian "Empat pemeran, satu alur".

Lewati deret angkanya cepat saja (17.507 rumah, 9 kabupaten) — jangan dibacakan
satu-satu, biarkan kelihatan.

Berhenti di alur empat pihak. Sebut keempatnya sambil nunjuk:

warga ajukan → pengelola kawasan verifikasi → teknisi kerjakan → sensor ukur ulang

**Kalimat kunci, hafal yang ini:**

> Sensor yang menemukan masalah adalah sensor yang mengukur hasil perbaikannya.

Lalu satu kalimat kenapa itu penting:

> Jadi penghematannya bukan klaim. Ada angka sebelum dan sesudah dari alat yang sama.

## 2:30–4:30 · Dashboard rumah

**Yang di layar:** `/pages/dashboard.html`

Tiga hal, jangan lebih:

1. **Pemakaian per jam** — tunjukkan puncaknya malam hari.
2. **Kejanggalan yang ditandai** — buka satu kartu anomali. Tunjukkan dia nggak cuma
   bilang "boros", tapi nyebut alatnya, polanya, dan perkiraan kerugiannya dalam rupiah.
3. **Prediksi tagihan** — ini buat Juri 3. Tunjuk garis sensornya:

> Garis ini berhenti di hari terakhir yang benar-benar terbaca. Sisanya area
> perkiraan. Saya nggak mau menggambar garis sensor di hari yang belum terjadi.

Kalimat terakhir itu kecil tapi mahal. Tipe juri yang teliti nangkep itu.

## 4:30–6:30 · Data kawasan

**Yang di layar:** `/pages/kawasan.html`

Bagian paling kuat secara visual. Kasih waktu.

> Ini sebaran se-Bali. Luas tiap petak sebanding jumlah rumah yang terhubung,
> warnanya rata-rata pemakaian listrik per rumah. Jadi dua dimensinya bawa data.

**Klik satu petak** — Denpasar atau Badung, yang paling gelap. Tunjukkan rinciannya
berubah.

Lalu gulir ke "Di dalam Gianyar":

> Peringkat di atas berhenti di kabupaten, padahal keputusannya diambil lebih ke
> bawah. Angka Gianyar nggak saya tulis terpisah — dijumlahkan dari delapan
> kelurahan ini, jadi dua tingkatnya nggak mungkin bertentangan.

Tutup bagian ini di antrean verifikasi:

> Dan di sinilah pengelola kawasan memutuskan. Satu klik di sini langsung mengubah
> antrean teknisi.

## 6:30–8:00 · Detail layanan, lalu Riwayat

**Detail layanan** (`/pages/detail-layanan.html`) — geser slidernya, biar juri lihat
angka balik modal berubah seketika.

> Warga bisa hitung sendiri untungnya sebelum mengajukan.

**Riwayat** (`/pages/riwayat.html`) — **buka satu baris pengajuan** sampai jejak lima
tahapnya kelihatan, lengkap dengan foto bukti dari teknisi.

> Ini pengajuan yang sudah selesai. Diajukan, diverifikasi, dijadwalkan, dikerjakan,
> lalu diukur ulang. Turun 41 liter per hari — diukur sensor yang sama.

Ini bukti alur tertutupnya benar-benar jalan, bukan cuma diagram di beranda.

> Catatan teknis: fotonya `loading="lazy"`. Pastikan barisnya sudah kamu buka dan
> gulir sedikit sebelum ngomong, biar gambarnya sempat muncul.

## 8:00–9:00 · Teknologi, lalu Skala

**Teknologi** (`/pages/teknologi.html`) — gulir pelan, diagramnya berpindah mengikuti.

> AI, IoT, dan Big Data sering disebut tanpa dijelaskan. Halaman ini menunjukkan
> bagian mana dikerjakan siapa.

Jangan masuk ke kode di sini. Cukup sampai situ.

**Skala** — balik ke beranda, gulir ke bagian gelap.

> Sekarang satu provinsi. Yang dibutuhkan cuma tiga: sensor di meteran, satu
> pengelola kawasan yang mau verifikasi, dan teknisi setempat. Ketiganya ada di
> hampir semua daerah.

Sebut angka 132.015 ton dan dari mana hitungannya, singkat. Sebut SDG-nya.

## 9:00–10:00 · Penutup

Dua hal saja.

**Satu kalimat yang mengikat semuanya:**

> HALO bukan dashboard yang berhenti di angka. Satu temuan sensor berjalan sampai
> hasilnya terukur, dan itu yang bikin dia ekosistem.

**Lalu satu batas karyanya, jujur:**

> Yang belum ada: laporan dampak yang bisa dicetak, dan model prediksinya masih
> rata-rata berbobot, belum musiman.

Juri menghargai peserta yang tahu batas karyanya. Dan menyebut batas duluan bikin
kamu yang pegang kendali, bukan juri yang menemukannya.

---

## Patokan waktu

| Sampai menit | Harus sudah di |
|---|---|
| 1 | selesai hero, sudah bilang "bukan aplikasi pemantauan" |
| 2.5 | selesai alur empat pihak |
| 4.5 | selesai dashboard |
| 6.5 | selesai kawasan |
| 8 | selesai detail + riwayat |
| 9 | selesai teknologi + skala |
| 10 | selesai penutup |

Kalau di menit 5 kamu masih di dashboard, **lompati detail layanan** dan langsung ke
kawasan. Kawasan lebih kuat.

## Yang TIDAK masuk sepuluh menit

Mesin grafik buatan sendiri, algoritma treemap, satu sumber angka, nol CDN,
`localStorage` yang dibungkus. Semua itu bahan tanya jawab. Panitia sudah bilang
sepuluh menitnya untuk UI, dan juri pasti nanya kodenya sendiri.

Kalau kamu mulai cerita kode di menit kelima, kamu buang jatah UI untuk sesuatu yang
sebentar lagi ditanyakan gratis.

## Sebelum mulai

- Baju identitas kampus, kamera hidup
- Tab browser: situs panitia dibuka di beranda, siap
- Tutup tab lain, matikan notifikasi
- VS Code kebuka di belakang buat pertanyaan kode
- Share **seluruh layar**, bukan satu jendela
- Masuk Zoom dari 08.00, giliranmu 09.30
