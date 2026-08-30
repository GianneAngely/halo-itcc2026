/* ============================================================
   HALO — halaman Detail layanan
   Isi bawaan halaman sudah tertulis di HTML untuk layanan
   "Penelusuran dan perbaikan kebocoran". Skrip ini menukar
   isinya bila alamat memuat ?id= layanan lain, lalu menjalankan
   simulasi penghematan.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* Faktor emisi acuan.
     Listrik memakai faktor jaringan Jawa-Bali, air memakai
     perkiraan energi pengolahan dan pemompaan per meter kubik. */
  const EMISI_LISTRIK = 0.87;   /* kg CO2e per kWh */
  const EMISI_AIR     = 0.45;   /* kg CO2e per meter kubik */
  const DAYA_AC       = 1.2;    /* kW, dipakai sebagai pembanding yang mudah dibayangkan */

  const bawaan = 'kebocoran';
  const id = new URLSearchParams(location.search).get('id') || bawaan;
  const layanan = HALO.layanan.find(l => l.id === id) || HALO.layanan.find(l => l.id === bawaan);
  const airkah = layanan.kategori === 'air';
  const tarifDasar = airkah ? HALO.tarif.air : HALO.tarif.listrik;

  const tulis = (id, teks) => { const el = document.getElementById(id); if (el) el.textContent = teks; };

  /* ---------- Tukar isi halaman ---------- */
  document.title = layanan.nama + ' — HALO';
  tulis('remahNama', layanan.nama);
  tulis('dNama', layanan.nama);
  tulis('dRingkas', layanan.ringkas);
  tulis('dNilai', layanan.nilai.toFixed(1));
  tulis('dUlasan', layanan.ulasan);
  tulis('dPenyedia', layanan.penyedia);
  tulis('dDurasi', layanan.durasi.toLowerCase());
  tulis('dBiaya', F.rupiah(layanan.biaya));
  tulis('rKategori', HALO.kategori[layanan.kategori]);
  tulis('rPenyedia', layanan.penyedia);
  tulis('rDurasi', layanan.durasi);
  tulis('rSatuan', 'Per ' + layanan.satuan);
  tulis('rSensor', layanan.sensor ? 'Layanan ini justru memasang sensornya' : 'Tidak wajib, tapi hasilnya lebih akurat');

  const kelasPil = { listrik: 'pil-listrik', air: 'pil-air', sensor: 'pil-listrik', audit: 'pil-netral' };
  const pil = document.getElementById('dKategori');
  pil.className = 'pil ' + kelasPil[layanan.kategori];
  pil.textContent = HALO.kategori[layanan.kategori];

  tulis('alasanTeks', layanan.alasan);

  /* Foto galeri mengikuti kategori layanan */
  const kunciGaleri = { sensor: 'sensor', audit: 'audit', air: 'air', listrik: 'listrik' }[layanan.kategori];
  const foto = HALO.galeri[kunciGaleri];
  const kotakGaleri = document.getElementById('galeri');
  if (kotakGaleri && foto) {
    kotakGaleri.innerHTML = foto.map(([berkas, alt, ket]) =>
      '<a href="../assets/img/' + berkas + '" data-fancybox="galeri" data-caption="' + ket + '">' +
      '<img src="../assets/img/' + berkas + '" alt="' + alt + '" loading="lazy"></a>').join('');
  }

  /* ---------- Pengatur simulasi ---------- */
  const gUnit  = document.getElementById('simUnit');
  const gTarif = document.getElementById('simTarif');
  const gPakai = document.getElementById('simPakai');

  gUnit.max = layanan.maksUnit;
  gUnit.value = 1;
  gUnit.disabled = layanan.maksUnit === 1;
  tulis('simSatuan', layanan.satuan);

  const labelTarif = document.querySelector('label[for="simTarif"]');
  labelTarif.childNodes[0].nodeValue = airkah
    ? 'Tarif air per meter kubik '
    : 'Tarif listrik per kWh ';
  gTarif.min = airkah ? 3500 : 1000;
  gTarif.max = airkah ? 9000 : 2200;
  gTarif.step = airkah ? 100 : 25;
  gTarif.value = tarifDasar;
  document.querySelector('.geser-bantu').textContent = airkah
    ? 'Tarif PDAM berbeda tiap daerah. Naikkan kalau tarif di tempatmu lebih tinggi.'
    : 'Tarif dasar golongan R-1/TR 1300 VA. Sesuaikan dengan golongan rumahmu.';

  /* ---------- Grafik balik modal ----------
     Dua garis: penghematan yang menumpuk tiap bulan, dan garis
     datar sebesar biaya pemasangan. Titik potongnya adalah bulan
     ketika pemasangan mulai untung. */
  const wadahGrafik = document.getElementById('grafikBalik');
  const BULAN_TAMPIL = 36;
  const labelBulan = Array.from({ length: BULAN_TAMPIL }, (_, i) => 'B' + (i + 1));

  function gambarGrafik(hematBulan, biaya) {
    const kumulatif = Array.from({ length: BULAN_TAMPIL }, (_, i) => hematBulan * (i + 1));
    Grafik.garis(wadahGrafik, {
      seri: [
        { nama: 'Penghematan terkumpul', data: kumulatif, warna: 'var(--hemat)', isi: true },
        { nama: 'Biaya pemasangan', data: new Array(BULAN_TAMPIL).fill(biaya), warna: 'var(--ink-3)' }
      ],
      labelX: labelBulan, satuan: 'Rupiah', satuanTip: '', pecahan: 0,
      judulAria: 'Perbandingan penghematan terkumpul dengan biaya pemasangan selama tiga puluh enam bulan',
      maksLabelX: 9
    });
  }

  /* ---------- Hitung ulang setiap pengatur digeser ---------- */
  const kotakHasil = [...document.querySelectorAll('.sim-angka')];
  let jedaKedip;

  function hitung(pakaiKedip) {
    const unit  = Number(gUnit.value);
    const tarif = Number(gTarif.value);
    const pakai = Number(gPakai.value) / 100;

    const hematBulan = layanan.hematBulan * unit * (tarif / tarifDasar) * pakai;
    const biaya      = layanan.biaya * unit;
    const balik      = Math.ceil(biaya / hematBulan);
    const lima       = hematBulan * 60 - biaya;

    tulis('simUnitNilai', unit);
    tulis('simTarifNilai', F.rupiah(tarif));
    tulis('simPakaiNilai', Math.round(pakai * 100) + '%');
    tulis('hasilBulan', F.rupiah(hematBulan));
    tulis('hasilTahun', F.rupiah(hematBulan * 12));
    tulis('hasilBalik', balik + (balik > 60 ? ' bulan — terlalu lama' : ' bulan'));
    tulis('hasilLima', F.rupiah(lima));

    /* Dampak lingkungan ikut berubah mengikuti penghematan */
    const satuanSetahun = (hematBulan * 12) / tarif;          /* kWh atau meter kubik */
    const kg = satuanSetahun * (airkah ? EMISI_AIR : EMISI_LISTRIK);
    tulis('dampakNilai', F.angka(kg, 0));
    const el = document.getElementById('dampakNilai');
    if (el && !el.querySelector('small')) {
      el.insertAdjacentHTML('beforeend', ' <small>kg CO₂e setahun</small>');
    }
    tulis('dampakBanding', 'Setara dengan tidak menyalakan satu AC selama ' +
      F.angka(kg / (DAYA_AC * EMISI_LISTRIK), 0) + ' jam.');
    tulis('dampakTeks', airkah
      ? 'Air bersih perlu dipompa dan diolah sebelum sampai ke rumah, dan proses itu memakai listrik. Setiap meter kubik yang tidak terbuang ikut memangkas emisinya.'
      : 'Setiap kilowatt jam yang tidak terpakai mengurangi beban pembangkit di jaringan Jawa-Bali, yang sebagian besar masih berbahan bakar fosil.');

    gambarGrafik(hematBulan, biaya);

    if (pakaiKedip) {
      clearTimeout(jedaKedip);
      kotakHasil.forEach(k => k.classList.remove('berubah'));
      requestAnimationFrame(() => kotakHasil.forEach(k => k.classList.add('berubah')));
      jedaKedip = setTimeout(() => kotakHasil.forEach(k => k.classList.remove('berubah')), 500);
    }
  }

  [gUnit, gTarif, gPakai].forEach(g => g.addEventListener('input', () => hitung(true)));
  hitung(false);

  /* ---------- Galeri ---------- */
  if (window.Fancybox) Fancybox.bind('[data-fancybox="galeri"]', { Thumbs: false });

  /* ---------- Tombol tindakan ---------- */
  document.getElementById('tombolAjukan').addEventListener('click', () => {
    if (!Sesi.aktif()) { pesan('Masuk dulu supaya pengajuan bisa dicatat.', 'salah'); setTimeout(() => location.href = 'masuk.html', 900); return; }
    const unit = Number(gUnit.value);
    const hariIni = new Date().toISOString().slice(0, 10);
    Sesi.tambahAjuan({
      id: 'AJ-' + (2700 + Sesi.ajuan().length + 1), layanan: layanan.id, tanggal: hariIni,
      status: 'diajukan', unit: unit, biaya: layanan.biaya * unit, hematTerukur: null,
      langkah: [[hariIni, 'Diajukan', 'Pengajuan dikirim dari halaman detail layanan. Menunggu verifikasi pengelola kawasan.']]
    });
    pesan('Pengajuan tercatat. Cek di halaman Riwayat.');
  });

  const tombolRencana = document.getElementById('tombolRencana');
  function segarkanRencana() {
    const ada = Sesi.rencana().includes(layanan.id);
    tombolRencana.innerHTML = ada
      ? '<i class="bx bxs-bookmark"></i> Tersimpan di rencana'
      : '<i class="bx bx-bookmark"></i> Simpan ke rencana';
  }
  tombolRencana.addEventListener('click', () => {
    if (Sesi.rencana().includes(layanan.id)) { Sesi.hapusRencana(layanan.id); pesan('Dikeluarkan dari rencana.'); }
    else { Sesi.tambahRencana(layanan.id); pesan('Ditambahkan ke rencana hematmu.'); }
    segarkanRencana();
  });
  segarkanRencana();

  /* ---------- Layanan terkait ---------- */
  const rak = document.getElementById('terkaitIsi');
  const terkait = HALO.layanan
    .filter(l => l.id !== layanan.id)
    .sort((a, b) => (a.kategori === layanan.kategori ? -1 : 1) - (b.kategori === layanan.kategori ? -1 : 1))
    .slice(0, 8);
  rak.innerHTML = terkait.map(l =>
    '<div class="swiper-slide"><a class="terkait-kartu" href="detail-layanan.html?id=' + l.id + '">' +
    '<span class="pil ' + kelasPil[l.kategori] + '">' + HALO.kategori[l.kategori] + '</span>' +
    '<h3>' + l.nama + '</h3><p>' + l.penyedia + '</p>' +
    '<span class="harga">' + F.rupiah(l.biaya) + ' <small>/ ' + l.satuan + '</small></span></a></div>').join('');

  if (window.Swiper) {
    new Swiper('#terkait', {
      slidesPerView: 1.15, spaceBetween: 16,
      navigation: { nextEl: '#terkait .swiper-button-next', prevEl: '#terkait .swiper-button-prev' },
      breakpoints: { 620: { slidesPerView: 2.2 }, 900: { slidesPerView: 3.2 }, 1200: { slidesPerView: 4 } }
    });
  }
});
