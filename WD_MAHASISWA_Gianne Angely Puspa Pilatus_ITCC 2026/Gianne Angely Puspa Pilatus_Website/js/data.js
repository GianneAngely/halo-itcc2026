/* ============================================================
   HALO — sumber data tunggal
   Semua angka di seluruh situs diambil dari berkas ini supaya
   Beranda, Dashboard, Riwayat, dan Kawasan tidak pernah
   menampilkan angka yang saling bertentangan.
   Data bersifat simulasi: dalam sistem sungguhan angka-angka ini
   datang dari sensor IoT yang terpasang di meteran.
   ============================================================ */

const HALO = (function () {

  /* Tarif acuan 2026 — golongan R-1/TR 1300 VA dan PDAM rumah tangga */
  const tarif = { listrik: 1444.70, air: 4900 };

  /* Pola pemakaian satu hari, indeks = jam 00–23.
     Listrik dalam kWh, air dalam liter. Bentuk kurvanya meniru
     rumah tangga: air memuncak pagi dan sore, listrik memuncak malam. */
  const polaListrik = [0.18,0.16,0.15,0.15,0.17,0.22,0.38,0.45,0.34,0.28,0.26,0.30,
                       0.35,0.32,0.30,0.29,0.33,0.48,0.72,0.85,0.78,0.62,0.44,0.26];
  const polaAir     = [4,3,3,3,6,18,62,78,54,36,28,24,
                       30,26,22,20,26,38,66,72,54,32,14,6];

  /* Pengacak deterministik — dipakai supaya variasi harian terlihat
     alami tapi angkanya tetap sama setiap halaman dimuat ulang. */
  function goyang(benih) {
    const x = Math.sin(benih * 12.9898) * 43758.5453;
    return (x - Math.floor(x) - 0.5) * 2;          /* rentang -1..1 */
  }

  /* Dua belas bulan terakhir. Tren menurun sejak bergabung karena
     rekomendasi mulai dijalankan. Listrik dalam kWh, air dalam meter kubik. */
  const bulan = ['Sep','Okt','Nov','Des','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags'];
  const listrikBulanan = [312,318,305,331,298,286,279,271,264,258,249,243];
  const airBulanan     = [22.4,23.1,22.0,24.2,21.6,20.9,20.3,19.8,19.4,19.0,18.5,18.1];

  /* Deret 30 hari terakhir; indeks 29 adalah hari ini.
     Hasilnya diskalakan supaya jumlah sebulan persis sama dengan
     angka bulan berjalan di atas — jadi tidak ada angka yang
     bertentangan antara grafik harian dan grafik bulanan. */
  function deretHarian(pola, simpangan, totalSebulan) {
    const sehari = pola.reduce((a, b) => a + b, 0);
    const kasar = Array.from({ length: 30 }, (_, i) => {
      const akhirPekan = (i % 7 === 5 || i % 7 === 6) ? 1.09 : 1;
      return sehari * akhirPekan * (1 + goyang(i + 1) * simpangan);
    });
    const skala = totalSebulan / kasar.reduce((a, b) => a + b, 0);
    return kasar.map(v => Math.round(v * skala * 100) / 100);
  }

  const listrikHarian = deretHarian(polaListrik, 0.11, listrikBulanan[11]);
  const airHarian     = deretHarian(polaAir, 0.13, airBulanan[11] * 1000);

  /* Kurva 24 jam untuk satu hari tertentu, diskalakan ke total hari itu. */
  function kurvaHari(pola, totalHari) {
    const sehari = pola.reduce((a, b) => a + b, 0);
    return pola.map(v => Math.round(v * (totalHari / sehari) * 1000) / 1000);
  }

  /* Peta panas: rata-rata pemakaian listrik per jam untuk tiap hari
     dalam sepekan. Baris = hari, kolom = jam. */
  const hariPekan = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const petaPanas = hariPekan.map((_, h) =>
    polaListrik.map((v, j) => {
      const bobot = (h >= 5 ? 1.14 : 1) * (1 + goyang(h * 24 + j) * 0.16);
      return Math.round(v * bobot * 100) / 100;
    })
  );

  /* Rincian pemakaian listrik per alat, bulan berjalan (kWh) */
  const alat = [
    { nama: 'Pendingin ruangan',  kwh: 78.4, jenis: 'listrik', catatan: 'Dua unit, rata-rata 6 jam per hari' },
    { nama: 'Pompa air',          kwh: 41.2, jenis: 'listrik', catatan: 'Menyala 11 kali sehari' },
    { nama: 'Kulkas',             kwh: 38.6, jenis: 'listrik', catatan: 'Menyala terus, model lama' },
    { nama: 'Pemanas air',        kwh: 32.9, jenis: 'listrik', catatan: 'Terpakai pagi dan malam' },
    { nama: 'Mesin cuci',         kwh: 18.3, jenis: 'listrik', catatan: 'Empat kali sepekan' },
    { nama: 'Penerangan',         kwh: 16.8, jenis: 'listrik', catatan: '24 titik, sebagian belum LED' },
    { nama: 'Televisi & hiburan', kwh: 9.7,  jenis: 'listrik', catatan: 'Rata-rata 4 jam per hari' },
    { nama: 'Lain-lain',          kwh: 7.1,  jenis: 'listrik', catatan: 'Pengisi daya, rice cooker, kipas' }
  ];

  /* Foto yang dipakai pada halaman detail, dikelompokkan per kategori */
  const galeri = {"air": [["pipa-air.jpg", "Sambungan pipa air lama di luar bangunan", "Titik sambungan pipa yang paling sering menjadi sumber rembesan"], ["keran-air.jpg", "Air mengalir dari keran ke sepasang tangan", "Uji aliran setelah pengerjaan selesai"], ["teknisi-lapangan.jpg", "Dua teknisi memeriksa panel peralatan", "Teknisi mitra memverifikasi temuan sensor di lokasi"]], "listrik": [["tiang-listrik.jpg", "Tiang listrik dengan kabel distribusi di atas permukiman", "Jaringan distribusi menuju permukiman warga"], ["kabel-listrik.jpg", "Jalinan kabel listrik yang padat", "Instalasi lama yang belum pernah ditata ulang"], ["teknisi-lapangan.jpg", "Dua teknisi memeriksa panel peralatan", "Teknisi mitra mengerjakan pemasangan di lokasi"]], "sensor": [["tiang-listrik.jpg", "Tiang listrik dengan kabel distribusi di atas permukiman", "Jalur masuk daya sebelum sampai ke kotak MCB rumah"], ["teknisi-lapangan.jpg", "Dua teknisi memeriksa panel peralatan", "Pemasangan sensor pada kotak MCB"], ["kabel-listrik.jpg", "Jalinan kabel listrik yang padat", "Penataan kabel sebelum sensor dipasang"]], "audit": [["teknisi-lapangan.jpg", "Dua teknisi memeriksa panel peralatan", "Penelusuran titik listrik dan air satu per satu"], ["rumah-warga.jpg", "Rumah warga di pedesaan Indonesia", "Audit dikerjakan langsung di rumah, bukan lewat kuesioner"], ["kabel-listrik.jpg", "Jalinan kabel listrik yang padat", "Instalasi lama termasuk yang ikut diperiksa"]]};

  /* Katalog layanan */
  const kategori = { listrik: 'Listrik', air: 'Air', audit: 'Audit', sensor: 'Sensor' };

  const layanan = [
    { id:'audit-rumah', nama:'Audit energi rumah', kategori:'audit', biaya:350000, hematBulan:85000,
      penyedia:'Koperasi Energi Gianyar', nilai:4.8, ulasan:126, durasi:'Sehari',
      ringkas:'Petugas menelusuri seluruh titik listrik dan air di rumah, lalu menyusun daftar prioritas perbaikan.',
      satuan:'paket', maksUnit:1, sensor:false , alasan:'Tagihan listrik rumahmu naik 22 persen dalam dua bulan terakhir, sementara jumlah penghuni tidak berubah. Audit menyeluruh dipakai ketika penyebabnya belum bisa dipersempit ke satu alat.'},
    { id:'sensor-listrik', nama:'Sensor listrik pintar', kategori:'sensor', biaya:680000, hematBulan:120000,
      penyedia:'Nusa Meter', nilai:4.7, ulasan:284, durasi:'2 jam',
      ringkas:'Penjepit arus pada kotak MCB yang mengirim pemakaian tiap 15 menit ke HALO.',
      satuan:'unit', maksUnit:3, sensor:true , alasan:'Rincian pemakaian per alat di rumahmu masih perkiraan karena baru satu jalur yang terpasang sensor. Menambah sensor membuat angka tiap alat terbaca terpisah, bukan hasil pembagian rata.'},
    { id:'sensor-air', nama:'Sensor air ultrasonik', kategori:'sensor', biaya:540000, hematBulan:65000,
      penyedia:'Nusa Meter', nilai:4.6, ulasan:171, durasi:'2 jam',
      ringkas:'Dipasang pada pipa induk, membaca debit tanpa memotong saluran. Mengenali kebocoran dini.',
      satuan:'unit', maksUnit:3, sensor:true , alasan:'Meteran air rumahmu baru terbaca sekali sehari. Dengan pembacaan tiap lima belas menit, kebocoran kecil ketahuan dalam hitungan hari, bukan setelah masuk tagihan.'},
    { id:'lampu-led', nama:'Penggantian lampu LED', kategori:'listrik', biaya:35000, hematBulan:4800,
      penyedia:'Terang Bali', nilai:4.5, ulasan:412, durasi:'1 jam',
      ringkas:'Mengganti lampu pijar dan neon dengan LED setara. Harga dihitung per titik.',
      satuan:'titik', maksUnit:24, sensor:false , alasan:'HALO mencatat beban penerangan rumahmu 16,8 kWh bulan ini, sekitar tujuh persen dari total. Angka itu tergolong tinggi untuk rumah dengan 24 titik lampu, biasanya karena sebagian masih memakai lampu pijar.'},
    { id:'timer-pompa', nama:'Pengatur waktu pompa air', kategori:'air', biaya:310000, hematBulan:47000,
      penyedia:'Tirta Karya', nilai:4.4, ulasan:98, durasi:'3 jam',
      ringkas:'Pompa hanya menyala pada jadwal dan berhenti otomatis saat tandon penuh.',
      satuan:'unit', maksUnit:2, sensor:false , alasan:'Pompa air di rumahmu menyala sebelas kali sehari dengan durasi pendek. Arus awal setiap penyalaan jauh lebih besar daripada saat pompa berjalan tetap, jadi pola ini boros tanpa terlihat.'},
    { id:'kebocoran', nama:'Penelusuran & perbaikan kebocoran', kategori:'air', biaya:275000, hematBulan:92000,
      penyedia:'Tirta Karya', nilai:4.9, ulasan:203, durasi:'Setengah hari',
      ringkas:'Menelusuri pipa tertanam dengan alat dengar, lalu menambal titik bocor yang ditemukan.',
      satuan:'paket', maksUnit:1, sensor:false , alasan:'HALO menandai aliran air yang bertahan di 38 liter per jam antara pukul 02.00 dan 05.00 selama empat hari berturut-turut di rumahmu. Pada rumah dengan pola serupa, angka normal di jam tersebut ada di bawah lima liter per jam.'},
    { id:'surya-450', nama:'Panel surya atap 450 Wp', kategori:'listrik', biaya:4850000, hematBulan:310000,
      penyedia:'Surya Dewata', nilai:4.7, ulasan:64, durasi:'2 hari',
      ringkas:'Satu larik panel dengan inverter, memangkas tagihan siang hari secara langsung.',
      satuan:'larik', maksUnit:4, sensor:false , alasan:'Pemakaian listrik rumahmu terpusat pada siang hingga sore, rentang yang persis bertepatan dengan waktu panel surya menghasilkan daya paling besar. Rumah dengan pola seperti ini memetik hasil paling cepat.'},
    { id:'tampung-hujan', nama:'Penampung air hujan 1.000 L', kategori:'air', biaya:2150000, hematBulan:78000,
      penyedia:'Tirta Karya', nilai:4.3, ulasan:57, durasi:'Sehari',
      ringkas:'Tandon dan penyaring untuk keperluan siram dan cuci, mengurangi tarikan dari PDAM.',
      satuan:'unit', maksUnit:2, sensor:false , alasan:'Sekitar sepertiga pemakaian air rumahmu jatuh pada keperluan siram dan cuci yang tidak menuntut air olahan. Kebutuhan itu bisa dialihkan ke air hujan yang ditampung.'},
    { id:'servis-ac', nama:'Servis dan isi ulang AC', kategori:'listrik', biaya:185000, hematBulan:32000,
      penyedia:'Adem Servis', nilai:4.6, ulasan:389, durasi:'1 jam',
      ringkas:'Pencucian penukar panas dan penyetelan tekanan. AC kotor menyedot daya jauh lebih besar.',
      satuan:'unit', maksUnit:4, sensor:false , alasan:'Konsumsi pendingin ruangan di rumahmu naik sembilan persen dalam tiga pekan tanpa disertai perubahan suhu ruangan. Pola ini biasanya muncul ketika penukar panas mulai tertutup debu.'},
    { id:'kulkas-inverter', nama:'Tukar tambah kulkas inverter', kategori:'listrik', biaya:3400000, hematBulan:96000,
      penyedia:'Koperasi Energi Gianyar', nilai:4.5, ulasan:41, durasi:'Sehari',
      ringkas:'Kulkas lama ditukar dengan model inverter berlabel hemat. Kulkas lama didaur ulang.',
      satuan:'unit', maksUnit:2, sensor:false , alasan:'Kulkas di rumahmu menyala terus-menerus dan menyumbang 38,6 kWh bulan ini. Untuk kulkas satu pintu, angka itu menandakan mesin bekerja lebih berat daripada seharusnya.'},
    { id:'aerator', nama:'Pemasangan aerator keran', kategori:'air', biaya:30000, hematBulan:5100,
      penyedia:'Tirta Karya', nilai:4.2, ulasan:245, durasi:'30 menit',
      ringkas:'Penyaring berudara yang memangkas debit tanpa mengurangi rasa kuat air. Per titik keran.',
      satuan:'titik', maksUnit:12, sensor:false , alasan:'Debit keran di rumahmu terbaca di atas rata-rata rumah sekelas. Aerator menahan debit tanpa mengurangi rasa kuat air, dan biayanya paling ringan di antara semua layanan air.'},
    { id:'pemanas-surya', nama:'Pemanas air tenaga surya', kategori:'listrik', biaya:5900000, hematBulan:185000,
      penyedia:'Surya Dewata', nilai:4.8, ulasan:73, durasi:'2 hari',
      ringkas:'Tabung penyerap panas di atap menggantikan pemanas listrik untuk kebutuhan mandi.',
      satuan:'unit', maksUnit:1, sensor:false , alasan:'Pemanas air menyumbang 32,9 kWh bulan ini di rumahmu, terpakai pagi dan malam. Kebutuhan itu bisa dipindahkan ke panas matahari yang ditampung siang hari.'}
  ];

  /* Riwayat aktivitas — memperlihatkan alur lintas pihak:
     warga mengajukan, pengelola kawasan memverifikasi,
     teknisi ditugaskan, lalu hasilnya terukur. */
  const riwayat = [
    { id:'AJ-2608', layanan:'kebocoran', tanggal:'2026-08-24', status:'terpasang', unit:1, biaya:275000,
      hematTerukur:97400, langkah:[
        ['2026-08-24','Diajukan','Pengajuan dikirim setelah HALO menandai lonjakan pemakaian air dini hari.'],
        ['2026-08-24','Diverifikasi','Pengelola kawasan Peliatan menyetujui, kasus ditandai mendesak.'],
        ['2026-08-25','Dijadwalkan','Teknisi Tirta Karya ditugaskan untuk 26 Agustus pagi.'],
        ['2026-08-26','Terpasang','Ditemukan bocor pada sambungan pipa taman, ditambal dan diuji tekan.'],
        ['2026-08-29','Hasil terukur','Pemakaian dini hari turun dari 41 liter menjadi 4 liter per jam.']
      ]},
    { id:'AJ-2591', layanan:'sensor-listrik', tanggal:'2026-08-11', status:'terpasang', unit:2, biaya:1360000,
      hematTerukur:118200, langkah:[
        ['2026-08-11','Diajukan','Dua unit untuk jalur utama dan jalur dapur.'],
        ['2026-08-12','Diverifikasi','Disetujui pengelola kawasan.'],
        ['2026-08-14','Dijadwalkan','Nusa Meter menjadwalkan 16 Agustus.'],
        ['2026-08-16','Terpasang','Terpasang di kotak MCB, data mulai mengalir pukul 13.20.'],
        ['2026-08-30','Hasil terukur','Rincian per alat kini tersedia, pemborosan pompa terdeteksi.']
      ]},
    { id:'AJ-2577', layanan:'lampu-led', tanggal:'2026-07-28', status:'terpasang', unit:12, biaya:420000,
      hematTerukur:54600, langkah:[
        ['2026-07-28','Diajukan','Dua belas titik di ruang keluarga, dapur, dan teras.'],
        ['2026-07-29','Diverifikasi','Disetujui, masuk program hemat kawasan.'],
        ['2026-07-30','Dijadwalkan','Terang Bali menjadwalkan 1 Agustus.'],
        ['2026-08-01','Terpasang','Dua belas titik selesai diganti.'],
        ['2026-08-25','Hasil terukur','Beban penerangan turun 31 persen.']
      ]},
    { id:'AJ-2612', layanan:'servis-ac', tanggal:'2026-08-28', status:'dijadwalkan', unit:2, biaya:370000,
      hematTerukur:null, langkah:[
        ['2026-08-28','Diajukan','Dua unit AC kamar, terakhir diservis sepuluh bulan lalu.'],
        ['2026-08-29','Diverifikasi','Disetujui pengelola kawasan.'],
        ['2026-08-30','Dijadwalkan','Adem Servis dijadwalkan 2 September pukul 09.00.']
      ]},
    { id:'AJ-2615', layanan:'audit-rumah', tanggal:'2026-08-30', status:'diajukan', unit:1, biaya:350000,
      hematTerukur:null, langkah:[
        ['2026-08-30','Diajukan','Menunggu verifikasi pengelola kawasan.']
      ]},
    { id:'AJ-2534', layanan:'timer-pompa', tanggal:'2026-06-19', status:'batal', unit:1, biaya:310000,
      hematTerukur:null, langkah:[
        ['2026-06-19','Diajukan','Pengajuan pengatur waktu pompa.'],
        ['2026-06-21','Diverifikasi','Disetujui pengelola kawasan.'],
        ['2026-06-24','Batal','Dibatalkan pemilik rumah, menunggu penggantian pompa lebih dulu.']
      ]}
  ];

  /* Kejanggalan yang ditemukan lapisan AI */
  const anomali = [
    { id:'AN-08', jenis:'air', tingkat:'tinggi', judul:'Pemakaian air dini hari tidak wajar',
      alasan:'Antara pukul 02.00 dan 05.00 selama empat hari berturut-turut, aliran air bertahan di 38 liter per jam. Pada rumah dengan pola seperti ini angka normalnya di bawah 5 liter per jam. Aliran yang tetap saat tidak ada aktivitas hampir selalu berarti kebocoran.',
      dampak:'Sekitar 3.400 liter per bulan, setara Rp16.700.', tindakan:'kebocoran' },
    { id:'AN-07', jenis:'listrik', tingkat:'sedang', judul:'Pompa air menyala terlalu sering',
      alasan:'Pompa menyala 11 kali sehari dengan durasi pendek. Pola menyala-mati sesering ini menandakan tekanan tandon tidak stabil, dan arus awal setiap penyalaan jauh lebih besar daripada saat berjalan tetap.',
      dampak:'Sekitar 14 kWh per bulan, setara Rp20.200.', tindakan:'timer-pompa' },
    { id:'AN-06', jenis:'listrik', tingkat:'rendah', judul:'Kulkas bekerja lebih berat dari biasanya',
      alasan:'Konsumsi kulkas naik 9 persen dalam tiga pekan sementara suhu ruangan tidak berubah. Biasanya ini tanda karet pintu mulai longgar atau kisi belakang tertutup debu.',
      dampak:'Sekitar 3,2 kWh per bulan, setara Rp4.600.', tindakan:'kulkas-inverter' }
  ];

  /* Data kawasan — kelurahan dan desa di sekitar Ubud, Gianyar.
     Jumlah rumah menentukan luas petak, pemakaian listrik menentukan warnanya. */
  const kawasan = [
    { nama:'Peliatan',   rumah:412, listrik:243, air:18.1, hemat:14.2, program:3 },
    { nama:'Ubud',       rumah:508, listrik:271, air:19.6, hemat:11.8, program:4 },
    { nama:'Petulu',     rumah:186, listrik:228, air:17.4, hemat: 9.4, program:1 },
    { nama:'Sayan',      rumah:274, listrik:296, air:21.3, hemat: 6.1, program:2 },
    { nama:'Kedewatan',  rumah:159, listrik:318, air:22.8, hemat: 4.3, program:1 },
    { nama:'Lodtunduh',  rumah:233, listrik:214, air:16.9, hemat:16.7, program:3 },
    { nama:'Singakerta', rumah:301, listrik:259, air:20.1, hemat:10.5, program:2 },
    { nama:'Mas',        rumah:264, listrik:237, air:18.7, hemat:12.9, program:2 }
  ];

  /* Antrean verifikasi milik peran pengelola kawasan */
  const antrean = [
    { id:'AJ-2615', rumah:'Jl. Raya Pengosekan 42', layanan:'Audit energi rumah',  diajukan:'30 Ags 2026', alasan:'Tagihan naik 22 persen dalam dua bulan.' },
    { id:'AJ-2617', rumah:'Br. Kalah, Peliatan',    layanan:'Sensor air ultrasonik', diajukan:'30 Ags 2026', alasan:'Curiga bocor, meteran terus berputar.' },
    { id:'AJ-2618', rumah:'Jl. Hanoman 8',          layanan:'Penggantian lampu LED', diajukan:'29 Ags 2026', alasan:'18 titik masih memakai lampu pijar.' },
    { id:'AJ-2620', rumah:'Br. Teges, Peliatan',    layanan:'Servis dan isi ulang AC', diajukan:'29 Ags 2026', alasan:'Tiga unit belum diservis setahun.' }
  ];

  /* Program hemat yang sedang berjalan di kawasan */
  const program = [
    { nama:'Ganti Lampu Serentak', wilayah:'Peliatan & Mas',  sasaran:2400, capai:1631, tutup:'30 Sep 2026' },
    { nama:'Buru Bocor Kawasan',   wilayah:'Sayan & Kedewatan', sasaran:180, capai: 74, tutup:'15 Okt 2026' },
    { nama:'Atap Surya Bersama',   wilayah:'Ubud',            sasaran: 60,  capai: 23, tutup:'31 Des 2026' }
  ];

  /* Pertumbuhan platform, dua belas bulan terakhir.
     Penghematan diturunkan dari jumlah rumah terhubung dikali
     rata-rata penghematan per rumah, jadi kedua deret ini tidak
     bisa saling bertentangan. */
  /* Sembilan kabupaten dan kota se-Bali. Baris Gianyar sengaja tidak
     ditulis tangan: angkanya dihitung dari delapan kelurahan di atas,
     jadi tingkat provinsi dan tingkat kelurahan tidak mungkin
     menunjukkan angka yang berbeda untuk wilayah yang sama. */
  const rumahGianyar   = kawasan.reduce((a, k) => a + k.rumah, 0);
  const rerata = (kunci) =>
    Math.round((kawasan.reduce((a, k) => a + k[kunci] * k.rumah, 0) / rumahGianyar) * 10) / 10;

  const bali = [
    { nama:'Denpasar',   rumah:4128, listrik:331, air:23.6, hemat: 9.2, program:24 },
    { nama:'Badung',     rumah:3406, listrik:344, air:24.4, hemat: 7.4, program:19 },
    { nama:'Gianyar',    rumah:rumahGianyar, listrik:Math.round(rerata('listrik')),
                         air:rerata('air'), hemat:rerata('hemat'),
                         program:kawasan.reduce((a, k) => a + k.program, 0), rinci:true },
    { nama:'Buleleng',   rumah:2015, listrik:239, air:17.9, hemat:10.1, program:16 },
    { nama:'Tabanan',    rumah:1842, listrik:246, air:18.4, hemat:12.6, program:14 },
    { nama:'Karangasem', rumah:1194, listrik:218, air:16.2, hemat:13.8, program:11 },
    { nama:'Jembrana',   rumah:1037, listrik:231, air:17.3, hemat: 8.7, program: 9 },
    { nama:'Klungkung',  rumah: 806, listrik:227, air:17.1, hemat:11.9, program: 8 },
    { nama:'Bangli',     rumah: 742, listrik:209, air:15.6, hemat:15.2, program: 7 }
  ];

  const rumahBulanan = [8270, 9124, 9941, 10870, 11836, 12728, 13649, 14593, 15439, 16241, 16923, 17507];
  const hematKwhPerRumah = 17.81;
  const hematM3PerRumah  = 0.5495;
  const hematListrikBulanan = rumahBulanan.map(r => Math.round(r * hematKwhPerRumah));
  const hematAirBulanan     = rumahBulanan.map(r => Math.round(r * hematM3PerRumah));

  /* Ringkasan tingkat platform — dipakai di Beranda */
  const ringkasan = {
    rumah: rumahBulanan[11],
    kabupaten: bali.length,
    kelurahan: kawasan.length,
    kwhBulanIni: hematListrikBulanan[11],
    literBulanIni: hematAirBulanan[11] * 1000,
    sensorAktif: Math.round(rumahBulanan[11] * 1.675),   /* meteran listrik + sebagian meteran air */
    teknisi: Math.round(rumahBulanan[11] / 86.6)
  };

  return {
    tarif, polaListrik, polaAir, listrikHarian, airHarian,
    bulan, listrikBulanan, airBulanan, hariPekan, petaPanas,
    kurvaHari, rumahBulanan, hematListrikBulanan, hematAirBulanan,
    alat, kategori, galeri, layanan, riwayat, anomali, kawasan, bali, antrean, program, ringkasan
  };
})();
