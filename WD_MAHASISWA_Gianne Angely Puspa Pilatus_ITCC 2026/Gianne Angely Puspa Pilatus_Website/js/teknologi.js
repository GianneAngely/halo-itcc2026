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

  if (diam) {
    diagram.querySelectorAll('g').forEach(g => g.classList.add('nyala'));
    langkah.forEach(li => li.classList.add('aktif'));
  } else {
    /* Langkah yang aktif dipilih dari jaraknya ke tengah layar.
       Cara ini tidak punya zona mati seperti pengamat berambang:
       berapa pun tinggi tiap langkah, selalu ada satu yang terpilih. */
    let kunciTerakhir = null;
    let menunggu = false;

    function pilihTerdekat() {
      menunggu = false;
      const tengah = window.innerHeight / 2;
      let terdekat = langkah[0], jarakTerdekat = Infinity;
      langkah.forEach(li => {
        const k = li.getBoundingClientRect();
        const jarak = Math.abs((k.top + k.bottom) / 2 - tengah);
        if (jarak < jarakTerdekat) { jarakTerdekat = jarak; terdekat = li; }
      });
      const kunci = terdekat.dataset.sorot;
      if (kunci !== kunciTerakhir) { kunciTerakhir = kunci; sorot(kunci); }
    }

    const saatGulir = () => {
      if (menunggu) return;
      menunggu = true;
      requestAnimationFrame(pilihTerdekat);
    };
    window.addEventListener('scroll', saatGulir, { passive: true });
    window.addEventListener('resize', saatGulir);
    pilihTerdekat();
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
