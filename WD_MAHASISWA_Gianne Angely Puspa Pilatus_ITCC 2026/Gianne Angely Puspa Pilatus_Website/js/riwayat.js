/* ============================================================
   HALO — halaman Riwayat aktivitas
   Enam pengajuan contoh sudah tertulis di HTML. Skrip ini
   menambahkan pengajuan yang dibuat pengguna sendiri, lalu
   menangani penyaringan, grafik, dan rencana hemat.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const daftar = document.getElementById('daftarAjuan');
  if (!daftar) return;

  const pilStatus = { diajukan: 'pil-netral', diverifikasi: 'pil-air', dijadwalkan: 'pil-listrik', terpasang: 'pil-hemat', batal: 'pil-waspada' };
  const namaStatus = { diajukan: 'Diajukan', diverifikasi: 'Diverifikasi', dijadwalkan: 'Dijadwalkan', terpasang: 'Terpasang', batal: 'Batal' };

  /* ---------- Judul menyesuaikan peran yang sedang masuk ---------- */
  const pengguna = Sesi.aktif();
  if (pengguna && pengguna.peran === 'Teknisi') {
    document.getElementById('judulRiwayat').textContent = 'Pekerjaan yang ditugaskan';
    document.getElementById('subRiwayat').textContent =
      'Daftar pekerjaan yang sudah lolos verifikasi pengelola kawasan dan masuk ke antreanmu, lengkap dengan temuan sensor yang menjadi dasarnya.';
  } else if (pengguna) {
    document.getElementById('subRiwayat').textContent =
      'Halo ' + pengguna.nama.split(' ')[0] + '. Setiap pengajuan berjalan melewati verifikasi pengelola kawasan dan penugasan teknisi sebelum hasilnya diukur ulang oleh sensor yang sama.';
  }

  /* ---------- Jejak lima tahap ----------
     Bentuknya sama persis dengan yang tertulis di HTML, supaya
     pengajuan baru tidak terlihat beda dari yang sudah ada. */
  const TAHAP = ['Diajukan', 'Diverifikasi', 'Dijadwalkan', 'Terpasang', 'Terukur'];
  const sampaiTahap = { diajukan: 1, diverifikasi: 2, dijadwalkan: 3, terpasang: 4, batal: 0 };

  function jejakTahap(status, terukur) {
    const capai = terukur ? 5 : (sampaiTahap[status] || 0);
    const batal = status === 'batal';
    return '<span class="jejak' + (batal ? ' jejak-batal' : '') + '" role="img" aria-label="Tahap ' +
      (batal ? 'dibatalkan' : capai + ' dari 5') + '">' +
      TAHAP.map((t, i) => '<span class="jejak-titik' + (i < capai ? ' lewat' : '') + '" data-tahap="' + t + '"></span>').join('') +
      '</span>';
  }

  /* ---------- Sisipkan pengajuan buatan pengguna ---------- */
  Sesi.ajuan().forEach(a => {
    const l = HALO.layanan.find(x => x.id === a.layanan);
    if (!l) return;
    const el = document.createElement('article');
    el.className = 'aj';
    el.dataset.status = a.status;
    el.dataset.tanggal = a.tanggal;
    el.innerHTML =
      '<button class="aj-kepala" aria-expanded="false">' +
        '<span class="aj-kiri"><span class="aj-kode tnum">' + a.id + '</span>' +
        '<span class="aj-nama">' + l.nama + '</span>' +
        '<span class="aj-sub">' + a.unit + ' ' + l.satuan + ' · ' + l.penyedia + ' · ' + F.tanggal(a.tanggal) + '</span>' +
        jejakTahap(a.status, a.hematTerukur) + '</span>' +
        '<span class="aj-kanan"><span class="aj-biaya tnum">' + F.rupiah(a.biaya) + '</span>' +
        '<span class="pil ' + pilStatus[a.status] + '">' + namaStatus[a.status] + '</span>' +
        '<i class="bx bx-chevron-down aj-panah"></i></span>' +
      '</button>' +
      '<div class="aj-isi" hidden><ol class="lini">' +
        a.langkah.map(s => '<li class="kini"><div class="lini-atas"><span class="lini-judul">' + s[1] +
          '</span><span class="lini-tanggal">' + F.tanggal(s[0]) + '</span></div><p>' + s[2] + '</p></li>').join('') +
      '</ol><a class="btn btn-garis btn-kecil" href="detail-layanan.html?id=' + l.id + '">Lihat layanan ini</a></div>';
    daftar.prepend(el);
  });

  const semua = [...daftar.querySelectorAll('.aj')];

  /* ---------- Buka tutup rincian ---------- */
  daftar.addEventListener('click', e => {
    const kepala = e.target.closest('.aj-kepala');
    if (!kepala) return;
    const isi = kepala.nextElementSibling;
    const buka = kepala.getAttribute('aria-expanded') === 'true';
    kepala.setAttribute('aria-expanded', String(!buka));
    isi.hidden = buka;
  });

  /* ---------- Saring menurut status dan rentang waktu ---------- */
  const tab = document.getElementById('tabStatus');
  const rentang = document.getElementById('rentangRiwayat');
  const kosong = document.getElementById('kosongAjuan');
  const jumlahEl = document.getElementById('jumlahAjuan');
  let status = 'semua';

  function saring() {
    const hariIni = new Date();
    const batas = rentang.value === 'semua' ? null : Number(rentang.value);
    let tampil = 0;
    semua.forEach(a => {
      const cocokStatus = status === 'semua' || a.dataset.status === status;
      let cocokWaktu = true;
      if (batas) {
        const selisih = (hariIni - new Date(a.dataset.tanggal)) / 86400000;
        cocokWaktu = selisih <= batas;
      }
      const lolos = cocokStatus && cocokWaktu;
      a.hidden = !lolos;
      if (lolos) tampil++;
    });
    jumlahEl.textContent = 'Menampilkan ' + tampil + ' pengajuan';
    kosong.hidden = tampil !== 0;
  }

  tab.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    tab.querySelectorAll('button').forEach(b => b.setAttribute('aria-selected', String(b === t)));
    status = t.dataset.status;
    saring();
  });
  rentang.addEventListener('change', saring);

  /* ---------- Perbarui angka ringkasan ---------- */
  const hitungStatus = s => semua.filter(a => a.dataset.status === s).length;
  document.getElementById('ringkasTotal').textContent = semua.length;
  document.getElementById('ringkasTerpasang').textContent = hitungStatus('terpasang');
  tab.querySelectorAll('button').forEach(b => {
    const s = b.dataset.status;
    b.querySelector('.jumlah').textContent = s === 'semua' ? semua.length : hitungStatus(s);
  });

  /* ---------- Sebaran tahap ikut menyesuaikan jumlah sebenarnya ---------- */
  const kotakSebaran = document.getElementById('sebaranTahap');
  if (kotakSebaran) {
    const kelas = { terpasang: 'sb-terpasang', dijadwalkan: 'sb-jadwal', diajukan: 'sb-ajukan', diverifikasi: 'sb-ajukan', batal: 'sb-batal' };
    const nama  = { terpasang: 'terpasang', dijadwalkan: 'dijadwalkan', diajukan: 'diajukan', diverifikasi: 'diverifikasi', batal: 'batal' };
    const hitung = {};
    semua.forEach(a => { hitung[a.dataset.status] = (hitung[a.dataset.status] || 0) + 1; });
    const urut = ['terpasang', 'dijadwalkan', 'diverifikasi', 'diajukan', 'batal'].filter(k => hitung[k]);
    kotakSebaran.innerHTML = urut.map(k =>
      '<span class="sebaran-bagian ' + kelas[k] + '" style="flex:' + hitung[k] + '" title="' + hitung[k] + ' ' + nama[k] + '"></span>').join('');
    const kunci = kotakSebaran.parentElement.querySelector('.sebaran-kunci');
    if (kunci) kunci.innerHTML = urut.map(k =>
      '<li><i class="' + kelas[k] + '"></i>' + hitung[k] + ' ' + nama[k] + '</li>').join('');
  }

  /* ---------- Grafik penghematan yang menumpuk ---------- */
  const wadah = document.getElementById('grafikHemat');
  if (wadah) {
    const hematBulanan = HALO.riwayat.filter(r => r.hematTerukur).reduce((a, b) => a + b.hematTerukur, 0);
    const biayaTotal = HALO.riwayat.filter(r => r.status !== 'batal').reduce((a, b) => a + b.biaya, 0);
    const N = 24;
    Grafik.garis(wadah, {
      seri: [
        { nama: 'Penghematan terkumpul', data: Array.from({ length: N }, (_, i) => hematBulanan * (i + 1)), warna: 'var(--hemat)', isi: true },
        { nama: 'Biaya yang dikeluarkan', data: new Array(N).fill(biayaTotal), warna: 'var(--ink-3)' }
      ],
      labelX: Array.from({ length: N }, (_, i) => 'B' + (i + 1)),
      satuan: 'Rupiah', maksLabelX: 8,
      judulAria: 'Penghematan terkumpul dibanding biaya yang dikeluarkan selama dua puluh empat bulan'
    });
  }

  /* ---------- Rencana hemat ---------- */
  const kotakRencana = document.getElementById('daftarRencana');
  function gambarRencana() {
    const isi = Sesi.rencana().map(id => HALO.layanan.find(l => l.id === id)).filter(Boolean);
    if (!isi.length) {
      kotakRencana.innerHTML = '<p class="rencana-kosong">Belum ada layanan yang ditandai. ' +
        'Buka <a href="layanan.html">katalog layanan</a>, lalu tekan “Simpan ke rencana” di halaman detailnya.</p>';
      return;
    }
    const total = isi.reduce((a, b) => a + b.hematBulan, 0);
    kotakRencana.innerHTML =
      '<ul class="rencana">' + isi.map(l =>
        '<li><span><span class="rencana-nama">' + l.nama + '</span><br>' +
        '<span class="rencana-sub">' + l.penyedia + ' · ' + F.rupiah(l.biaya) + '</span></span>' +
        '<span class="rencana-kanan"><span class="rencana-hemat">' + F.rupiah(l.hematBulan) + ' / bln</span>' +
        '<button class="rencana-buang" data-buang="' + l.id + '" aria-label="Keluarkan ' + l.nama + ' dari rencana"><i class="bx bx-x"></i></button>' +
        '</span></li>').join('') + '</ul>' +
      '<p class="rencana-jumlah"><span>Perkiraan hemat kalau semuanya dikerjakan</span>' +
      '<span class="tnum" style="color:var(--hemat)">' + F.rupiah(total) + ' / bulan</span></p>';
  }
  kotakRencana.addEventListener('click', e => {
    const t = e.target.closest('[data-buang]');
    if (!t) return;
    Sesi.hapusRencana(t.dataset.buang);
    gambarRencana();
    pesan('Dikeluarkan dari rencana.');
  });
  gambarRencana();

  document.getElementById('tombolCetak').addEventListener('click', () => window.print());

  saring();
});
