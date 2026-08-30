/* ============================================================
   HALO — halaman Dashboard rumah
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const hariIni = HALO.listrikHarian[29], kemarin = HALO.listrikHarian[28];
  const airIni  = HALO.airHarian[29],     airKemarin = HALO.airHarian[28];

  /* ---------- Sapaan sesuai peran ---------- */
  const pengguna = Sesi.aktif();
  if (pengguna) {
    document.getElementById('judulDash').textContent = 'Dashboard rumah ' + pengguna.nama.split(' ')[0];
    if (pengguna.wilayah) {
      document.getElementById('subDash').textContent =
        'Pembacaan sensor jalur utama di ' + pengguna.wilayah + ', diperbarui tiap lima belas menit. ' +
        'Angka bulan berjalan dihitung dari 1 Agustus sampai hari ini.';
    }
  }

  /* ---------- Empat angka ringkas ---------- */
  const beda = (kini, lalu) => {
    const p = ((kini - lalu) / lalu) * 100;
    const naik = p > 0;
    return '<span class="' + (naik ? 'naik' : 'turun') + '">' +
      '<i class="bx bx-' + (naik ? 'up' : 'down') + '-arrow-alt"></i>' + F.angka(Math.abs(p), 1) + '%</span>';
  };
  document.getElementById('nListrik').innerHTML = F.angka(hariIni, 1) + ' <small>kWh</small>';
  document.getElementById('nAir').innerHTML = F.angka(airIni, 0) + ' <small>liter</small>';
  document.getElementById('bandingListrik').innerHTML = beda(hariIni, kemarin);
  document.getElementById('bandingAir').innerHTML = beda(airIni, airKemarin);

  /* Perkiraan tagihan bulan berjalan */
  const tagihanListrik = HALO.listrikBulanan[11] * HALO.tarif.listrik;
  const tagihanAir = HALO.airBulanan[11] * HALO.tarif.air;
  document.getElementById('nTagihan').textContent = F.rupiah(tagihanListrik + tagihanAir);
  document.getElementById('nTagihanKaki').textContent =
    'listrik ' + F.rupiah(tagihanListrik) + ' · air ' + F.rupiah(tagihanAir);

  document.querySelectorAll('[data-kilau]').forEach(kotak => {
    const jenis = kotak.dataset.kilau;
    Grafik.kilau(kotak, (jenis === 'air' ? HALO.airHarian : HALO.listrikHarian).slice(-14),
      jenis === 'air' ? 'var(--air)' : 'var(--listrik)');
  });

  /* ---------- Cincin perbandingan kawasan ---------- */
  const rataKawasan = HALO.kawasan.reduce((a, b) => a + b.listrik, 0) / HALO.kawasan.length;
  const banding = Math.round((HALO.listrikBulanan[11] / rataKawasan) * 100);
  Grafik.cincin(document.getElementById('cincinBanding'), {
    nilai: banding, maks: 150, warna: banding <= 100 ? 'var(--hemat)' : 'var(--waspada)',
    label: 'persen dari rata-rata'
  });

  /* ---------- Grafik pemakaian dengan pilihan rentang ---------- */
  const wadahPakai = document.getElementById('grafikPakai');
  const ketRentang = document.getElementById('ketRentang');
  const nb = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  function gambarPakai(rentang) {
    let data, label, satuanTip, pecahan, ket;
    if (rentang === '24') {
      data = HALO.kurvaHari(HALO.polaListrik, hariIni);
      label = data.map((_, i) => String(i).padStart(2, '0') + '.00');
      satuanTip = ' kWh'; pecahan = 2;
      ket = 'Dua puluh empat jam terakhir, dalam kilowatt jam per jam.';
    } else {
      const n = Number(rentang);
      data = HALO.listrikHarian.slice(-n);
      const acuan = new Date();
      label = data.map((_, i) => {
        const d = new Date(acuan); d.setDate(acuan.getDate() - (n - 1 - i));
        return d.getDate() + ' ' + nb[d.getMonth()];
      });
      satuanTip = ' kWh'; pecahan = 1;
      ket = n + ' hari terakhir, total kilowatt jam per hari.';
    }
    ketRentang.textContent = ket;
    Grafik.garis(wadahPakai, {
      seri: [{ nama: 'Listrik', data: data, warna: 'var(--listrik)', isi: true }],
      labelX: label, satuan: 'kWh', satuanTip: satuanTip, pecahan: pecahan,
      maksLabelX: rentang === '24' ? 8 : 7,
      judulAria: 'Pemakaian listrik ' + ket.toLowerCase()
    });
  }
  const grupRentang = document.getElementById('rentangGrafik');
  grupRentang.addEventListener('click', e => {
    const t = e.target.closest('.cip');
    if (!t) return;
    grupRentang.querySelectorAll('.cip').forEach(c => c.setAttribute('aria-pressed', String(c === t)));
    gambarPakai(t.dataset.rentang);
  });
  gambarPakai('24');

  /* ---------- Peta panas ---------- */
  Grafik.petaPanas(document.getElementById('petaPanas'), {
    matriks: HALO.petaPanas, barisLabel: HALO.hariPekan,
    warna: 'var(--listrik)', satuan: 'kWh'
  });

  /* ---------- Rincian per alat ---------- */
  Grafik.batangDatar(document.getElementById('rincianAlat'), {
    data: HALO.alat.map(a => ({ nama: a.nama, nilai: a.kwh, catatan: a.catatan })),
    warna: 'var(--listrik)', satuan: 'kWh'
  });

  /* ---------- Perkiraan tagihan sampai akhir bulan ----------
     Hari yang sudah lewat memakai angka sensor, sisanya
     diperkirakan dari rata-rata tiga puluh hari terakhir. */
  const wadahPrediksi = document.getElementById('grafikPrediksi');
  if (wadahPrediksi) {
    const lewat = 30, sisa = 5;
    const terbaca = [], perkiraan = [];
    let jumlah = 0;
    HALO.listrikHarian.forEach((v, i) => { jumlah += v; terbaca[i] = Math.round(jumlah * HALO.tarif.listrik); });
    const rataHarian = jumlah / lewat;
    for (let i = 0; i < lewat; i++) perkiraan[i] = terbaca[i];
    for (let i = 0; i < sisa; i++) perkiraan[lewat + i] = Math.round((jumlah + rataHarian * (i + 1)) * HALO.tarif.listrik);
    for (let i = 0; i < sisa; i++) terbaca[lewat + i] = null;

    Grafik.garis(wadahPrediksi, {
      seri: [
        { nama: 'Perkiraan', data: perkiraan, warna: 'var(--air)', isi: true },
        { nama: 'Terbaca sensor', data: terbaca.map((v, i) => v === null ? perkiraan[lewat - 1] : v), warna: 'var(--listrik)' }
      ],
      labelX: Array.from({ length: lewat + sisa }, (_, i) => 'H' + (i + 1)),
      satuan: 'Rupiah', maksLabelX: 7,
      judulAria: 'Perkiraan tagihan listrik sampai akhir bulan'
    });
  }

  /* ---------- Perbandingan antar kelurahan ---------- */
  const urut = [...HALO.kawasan].sort((a, b) => a.listrik - b.listrik);
  Grafik.batang(document.getElementById('grafikKawasan'), {
    data: urut.map(k => k.listrik),
    labelX: urut.map(k => k.nama.slice(0, 4)),
    warna: 'var(--line)',
    warnaPer: (v, i) => urut[i].nama === 'Peliatan' ? 'var(--listrik)' : '#d8d2c6',
    satuan: 'kWh', satuanTip: ' kWh',
    judulAria: 'Perbandingan rata-rata pemakaian listrik per rumah antar kelurahan'
  });
});
