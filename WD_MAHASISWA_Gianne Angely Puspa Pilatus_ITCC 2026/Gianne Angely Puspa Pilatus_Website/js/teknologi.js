/* ============================================================
   HALO — halaman Cara kerja teknologi
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Diagram menyala mengikuti langkah yang sedang dibaca ---------- */
  const langkah = [...document.querySelectorAll('#ceritaLangkah li')];
  const diagram = document.getElementById('diagram');
  const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sorot(kunci) {
    diagram.querySelectorAll('g').forEach(g => g.classList.toggle('nyala', g.id === kunci || g.id === 'dRumah'));
    langkah.forEach(li => li.classList.toggle('aktif', li.dataset.sorot === kunci));
  }

  if (diam || !('IntersectionObserver' in window)) {
    diagram.querySelectorAll('g').forEach(g => g.classList.add('nyala'));
    langkah.forEach(li => li.classList.add('aktif'));
  } else {
    sorot(langkah[0].dataset.sorot);
    const pengamat = new IntersectionObserver(entri => {
      /* Ambil langkah yang paling dekat ke tengah layar */
      const terlihat = entri.filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (terlihat) sorot(terlihat.target.dataset.sorot);
    }, { threshold: [0.35, 0.6], rootMargin: '-20% 0px -20% 0px' });
    langkah.forEach(li => pengamat.observe(li));
  }

  /* ---------- Ketepatan perkiraan ----------
     Perkiraan dibuat dengan menggeser angka sebenarnya sedikit,
     memakai simpangan tetap supaya nilainya sama setiap dimuat. */
  const sebenarnya = HALO.listrikBulanan;
  const simpangan = [3.1, -2.4, 4.6, -8.9, 2.2, -3.5, 1.8, 4.1, -2.7, 3.3, -1.9, 2.6];
  const perkiraan = sebenarnya.map((v, i) => Math.round(v * (1 + simpangan[i] / 100)));

  Grafik.garis(document.getElementById('grafikTepat'), {
    seri: [
      { nama: 'Sebenarnya', data: sebenarnya, warna: 'var(--listrik)', isi: true },
      { nama: 'Perkiraan', data: perkiraan, warna: 'var(--air)' }
    ],
    labelX: HALO.bulan, satuan: 'kWh', satuanTip: ' kWh', maksLabelX: 12,
    judulAria: 'Perbandingan pemakaian listrik sebenarnya dengan perkiraan awal bulan'
  });
});
