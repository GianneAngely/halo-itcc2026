/* ============================================================
   HALO — perilaku halaman Beranda
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Pembacaan daya yang berdenyut di kartu meteran ----------
     Angkanya diturunkan dari pola pemakaian jam berjalan, lalu diberi
     variasi kecil supaya terasa seperti data sensor yang terus masuk. */
  const kotakWatt = document.getElementById('wattKini');
  const kotakKilau = document.getElementById('kilauMeteran');
  if (kotakWatt) {
    const jam = new Date().getHours();
    const dasar = HALO.kurvaHari(HALO.polaListrik, HALO.listrikHarian[29])[jam] * 1000;
    let sebelum = 0;

    const perbarui = () => {
      const nilai = Math.round(dasar * (0.94 + Math.random() * 0.12));
      const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (diam) { kotakWatt.textContent = F.angka(nilai); sebelum = nilai; return; }
      const awal = sebelum, mulai = performance.now();
      const jalan = w => {
        const maju = Math.min((w - mulai) / 700, 1);
        kotakWatt.textContent = F.angka(awal + (nilai - awal) * (1 - Math.pow(1 - maju, 3)));
        if (maju < 1) requestAnimationFrame(jalan);
      };
      requestAnimationFrame(jalan);
      sebelum = nilai;
    };
    perbarui();
    setInterval(perbarui, 3200);

    if (kotakKilau) {
      const kurva = HALO.kurvaHari(HALO.polaListrik, HALO.listrikHarian[29])
        .slice(Math.max(0, jam - 11), jam + 1).map(v => v * 1000);
      Grafik.kilau(kotakKilau, kurva.length > 2 ? kurva : [dasar * .9, dasar, dasar * 1.05], 'var(--listrik)');
    }
  }

  /* ---------- Garis mungil di deret angka ---------- */
  document.querySelectorAll('[data-kilau]').forEach(kotak => {
    const jenis = kotak.dataset.kilau;
    const deret = (jenis === 'air' ? HALO.airHarian : HALO.listrikHarian).slice(-14);
    Grafik.kilau(kotak, deret, jenis === 'air' ? 'var(--air)' : 'var(--listrik)');
  });

  /* ---------- Grafik pemakaian dua belas bulan ---------- */
  const wadahBulan = document.getElementById('grafikBulanan');
  if (wadahBulan) {
    Grafik.garis(wadahBulan.parentElement.querySelector('#grafikBulanan'), {
      seri: [{ nama: 'Listrik', data: HALO.listrikBulanan, warna: 'var(--listrik)', isi: true }],
      labelX: HALO.bulan,
      satuan: 'kWh',
      satuanTip: ' kWh',
      judulAria: 'Pemakaian listrik dua belas bulan terakhir dalam kilowatt jam',
      maksLabelX: 12
    });
  }

  /* ---------- Alur empat pemeran, menyala bergantian ---------- */
  const panggung = document.getElementById('alurPanggung');
  if (panggung) {
    const langkah = panggung.querySelectorAll('.alur-daftar li');
    const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nyalakan = () => {
      panggung.classList.add('jalan');
      langkah.forEach((li, i) => setTimeout(() => li.classList.add('nyala'), diam ? 0 : 320 + i * 260));
    };
    if (!('IntersectionObserver' in window) || diam) { nyalakan(); return; }
    const pengamat = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { nyalakan(); pengamat.disconnect(); }
    }, { threshold: 0.35 });
    pengamat.observe(panggung);
  }
});
