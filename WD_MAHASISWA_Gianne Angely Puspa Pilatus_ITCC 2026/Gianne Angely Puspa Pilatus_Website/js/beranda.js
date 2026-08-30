/* ============================================================
   HALO — perilaku halaman Beranda
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Kartu alat ukur ----------
     Grafik cermin: listrik ke atas dalam watt, air ke bawah dalam
     liter per jam, keduanya berskala sendiri. */
  const wadahAliran = document.getElementById('grafikAliran');
  const dayaPerJam = HALO.kurvaHari(HALO.polaListrik, HALO.listrikHarian[29]).map(v => Math.round(v * 1000));
  const airPerJam  = HALO.kurvaHari(HALO.polaAir, HALO.airHarian[29]).map(v => Math.round(v));

  if (wadahAliran) {
    Grafik.aliranGanda(wadahAliran, {
      listrik: dayaPerJam,
      air: airPerJam,
      tandaAir: { jamAwal: 2, jamAkhir: 5, nilai: 38, teks: 'sebelum perbaikan · 38 L/jam' }
    });
  }

  /* Jam berjalan di kepala kartu — bukti bahwa pembacaannya hidup */
  const kotakJam = document.getElementById('jamAlat');
  if (kotakJam) {
    const tulisJam = () => {
      const t = new Date();
      kotakJam.textContent = String(t.getHours()).padStart(2, '0') + '.' +
                             String(t.getMinutes()).padStart(2, '0') + ' WITA';
    };
    tulisJam();
    setInterval(tulisJam, 20000);
  }

  /* Daya sesaat yang menyegarkan diri, diturunkan dari pola jam berjalan */
  const kotakWatt = document.getElementById('wattKini');
  if (kotakWatt) {
    const dasar = dayaPerJam[new Date().getHours()];
    let sebelum = dasar;
    kotakWatt.textContent = F.angka(dasar);

    const perbarui = () => {
      const nilai = Math.round(dasar * (0.94 + Math.random() * 0.12));
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        kotakWatt.textContent = F.angka(nilai); sebelum = nilai; return;
      }
      const awal = sebelum, mulai = performance.now();
      const jalan = w => {
        const maju = Math.min((w - mulai) / 700, 1);
        kotakWatt.textContent = F.angka(awal + (nilai - awal) * (1 - Math.pow(1 - maju, 3)));
        if (maju < 1) requestAnimationFrame(jalan);
      };
      requestAnimationFrame(jalan);
      sebelum = nilai;
    };
    setInterval(perbarui, 3200);
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

  /* ---------- Peta panas sepekan ---------- */
  const wadahPanas = document.getElementById('petaPanasBeranda');
  if (wadahPanas) {
    Grafik.petaPanas(wadahPanas, {
      matriks: HALO.petaPanas, barisLabel: HALO.hariPekan,
      warna: 'var(--listrik)', satuan: 'kWh'
    });
  }

  /* ---------- Alur empat pemeran ----------
     Saat bagian ini masuk layar, keempat titiknya menyala berurutan
     sekali. Setelah itu tiap pemeran bisa diklik untuk melihat apa
     yang dia lihat dan apa yang tidak boleh dia lihat. */
  const panggung = document.getElementById('alurPanggung');
  if (panggung) {
    const butir = [...panggung.querySelectorAll('.alur-daftar li')];
    const tombol = [...panggung.querySelectorAll('.alur-btn')];
    const panel = [...panggung.querySelectorAll('.alur-isi')];
    const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pilih(peran) {
      tombol.forEach(t => t.setAttribute('aria-selected', String(t.dataset.peran === peran)));
      panel.forEach(p => {
        const aktif = p.dataset.peran === peran;
        p.hidden = !aktif;
        if (aktif && !diam) {
          p.classList.remove('tukar');
          void p.offsetWidth;          /* paksa hitung ulang supaya animasinya terputar lagi */
          p.classList.add('tukar');
        }
      });
    }

    panggung.querySelector('.alur-daftar').addEventListener('click', e => {
      const t = e.target.closest('.alur-btn');
      if (t) pilih(t.dataset.peran);
    });

    /* Panah kiri-kanan untuk berpindah lewat papan ketik */
    tombol.forEach((t, i) => {
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const j = (i + (e.key === 'ArrowRight' ? 1 : -1) + tombol.length) % tombol.length;
        tombol[j].focus();
        pilih(tombol[j].dataset.peran);
      });
    });

    const nyalakan = () => {
      panggung.classList.add('jalan');
      butir.forEach((li, i) => setTimeout(() => li.classList.add('nyala'), diam ? 0 : 320 + i * 240));
    };
    /* Dipicu dari posisi gulir langsung, bukan dari pengamat viewport.
       Pengamat sempat tidak terpanggil pada sebagian keadaan, dan
       hitungan jarak begini tidak punya kasus gagal. */
    if (diam) {
      nyalakan();
    } else {
      let sudah = false;
      const periksa = () => {
        if (sudah) return;
        const k = panggung.getBoundingClientRect();
        if (k.top < window.innerHeight * 0.85 && k.bottom > 0) {
          sudah = true;
          window.removeEventListener('scroll', periksa);
          nyalakan();
        }
      };
      window.addEventListener('scroll', periksa, { passive: true });
      window.addEventListener('resize', periksa);
      periksa();
    }
  }
});
