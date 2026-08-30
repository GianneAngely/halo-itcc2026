/* ============================================================
   HALO — halaman Data kawasan
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const maksListrik = Math.max(...HALO.bali.map(k => k.listrik));
  const minListrik  = Math.min(...HALO.bali.map(k => k.listrik));

  /* ---------- Petak berukuran data ----------
     Luas tiap petak sebanding dengan jumlah rumah yang terhubung,
     warnanya mewakili rata-rata pemakaian listrik per rumah.
     Jadi kedua dimensinya membawa data — bukan kotak yang ukurannya
     ditentukan sembarangan seperti versi sebelumnya. */
  let petak = null;
  const wadahPetak = document.getElementById('petakKawasan');
  if (wadahPetak) {
    petak = Grafik.petakData(wadahPetak, {
      data: HALO.bali.map(k => ({
        nama: k.nama,
        luas: k.rumah,
        warnaNilai: k.listrik,
        keterangan: F.angka(k.rumah) + ' rumah · ' + k.listrik + ' kWh'
      })),
      warna: 'var(--listrik)',
      minWarna: minListrik,
      maksWarna: maksListrik,
      judulAria: 'Petak sembilan kabupaten dan kota di Bali, luasnya sebanding jumlah rumah dan warnanya mewakili pemakaian listrik per rumah',
      saatPilih: nama => pilih(nama)
    });
  }

  /* ---------- Rincian wilayah terpilih ---------- */
  const rumahBali = HALO.bali.reduce((a, b) => a + b.rumah, 0);
  const rataBali  = HALO.bali.reduce((a, b) => a + b.listrik * b.rumah, 0) / rumahBali;

  function pilih(nama) {
    const k = HALO.bali.find(x => x.nama === nama);
    if (petak) petak.sorot(nama);

    document.getElementById('rkNama').textContent = k.nama;
    document.getElementById('rkRumah').textContent = F.angka(k.rumah);
    document.getElementById('rkListrik').textContent = F.angka(k.listrik) + ' kWh';
    document.getElementById('rkAir').textContent = F.angka(k.air, 1) + ' m³';
    document.getElementById('rkHemat').textContent = F.angka(k.hemat, 1) + '%';
    document.getElementById('rkProgram').textContent = k.program;

    const selisih = ((k.listrik / rataBali) - 1) * 100;
    let catatan = selisih < 0
      ? k.nama + ' berada ' + F.angka(Math.abs(selisih), 1) + ' persen di bawah rata-rata Bali. Ada ' + k.program + ' program hemat yang sedang berjalan di sini.'
      : k.nama + ' berada ' + F.angka(selisih, 1) + ' persen di atas rata-rata Bali. Wilayah ini layak didahulukan untuk program berikutnya.';
    if (k.rinci) catatan += ' Angka Gianyar dihitung dari delapan kelurahan yang dirinci di bawah.';
    document.getElementById('rkCatatan').textContent = catatan;

    document.querySelectorAll('#tubuhKawasan tr').forEach(tr => tr.classList.toggle('baris-sorot', tr.dataset.nama === nama));
  }
  pilih('Gianyar');

  /* ---------- Pengurutan tabel ---------- */
  const tubuh = document.getElementById('tubuhKawasan');
  const baris = [...tubuh.querySelectorAll('tr')];
  let arah = {};
  document.querySelectorAll('.tabel-urut').forEach(tombol => {
    tombol.addEventListener('click', () => {
      const kolom = tombol.dataset.kolom;
      arah[kolom] = arah[kolom] === 'naik' ? 'turun' : 'naik';
      document.querySelectorAll('.tabel-urut').forEach(t => t.removeAttribute('aria-sort'));
      tombol.setAttribute('aria-sort', arah[kolom] === 'naik' ? 'ascending' : 'descending');
      const nilai = tr => {
        const k = HALO.bali.find(x => x.nama === tr.dataset.nama);
        return kolom === 'nama' ? k.nama : k[kolom];
      };
      baris.sort((a, b) => {
        const x = nilai(a), y = nilai(b);
        const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
        return arah[kolom] === 'naik' ? c : -c;
      }).forEach((tr, i) => { tubuh.appendChild(tr); tr.querySelector('td').textContent = i + 1; });
    });
  });

  /* ---------- Gianyar dibuka sampai kelurahan ----------
     Satu kabupaten dirinci penuh supaya terlihat bahwa verifikasi
     sebenarnya terjadi di tingkat kelurahan, bukan di tingkat provinsi. */
  const wadahKel = document.getElementById('grafikKelurahan');
  if (wadahKel) {
    const urut = [...HALO.kawasan].sort((a, b) => b.listrik - a.listrik);
    Grafik.batangDatar(wadahKel, {
      data: urut.map(k => ({
        nama: k.nama,
        nilai: k.listrik,
        catatan: F.angka(k.rumah) + ' rumah · hemat ' + F.angka(k.hemat, 1) + '% tahun ini'
                 + (k.nama === 'Peliatan' ? ' · kelurahan rumah contoh di Dashboard' : '')
      })),
      satuan: 'kWh',
      warna: 'var(--listrik)',
      judulAria: 'Rata-rata pemakaian listrik per rumah di delapan kelurahan Gianyar'
    });
  }

  /* ---------- Tren se-Bali ---------- */
  /* Rata-rata provinsi mengikuti bentuk tren rumah contoh,
     digeser ke tingkat rata-rata sembilan kabupaten dan kota. */
  const geser = rataBali / HALO.listrikBulanan[11];
  Grafik.garis(document.getElementById('grafikTren'), {
    seri: [{ nama: 'Rata-rata Bali', data: HALO.listrikBulanan.map(v => Math.round(v * geser)), warna: 'var(--air)', isi: true }],
    labelX: HALO.bulan, satuan: 'kWh', satuanTip: ' kWh', maksLabelX: 12,
    judulAria: 'Tren rata-rata pemakaian listrik per rumah di seluruh Bali selama dua belas bulan'
  });

  /* ---------- Bilah kemajuan program ---------- */
  const prog = document.querySelectorAll('.prog-isi');
  const jalankan = () => prog.forEach((s, i) => setTimeout(() => { s.style.width = s.dataset.lebar; }, i * 120));
  if ('IntersectionObserver' in window) {
    const p = new IntersectionObserver(e => { if (e[0].isIntersecting) { jalankan(); p.disconnect(); } }, { threshold: 0.3 });
    p.observe(prog[0].closest('.prog'));
  } else { jalankan(); }

  /* ---------- Antrean verifikasi ---------- */
  const daftar = document.getElementById('antreDaftar');
  const kosong = document.getElementById('antreKosong');
  const jumlahEl = document.getElementById('antreJumlah');

  function hitungAntre() {
    const sisa = daftar.querySelectorAll('.antre').length;
    jumlahEl.textContent = sisa + ' menunggu';
    kosong.hidden = sisa !== 0;
    daftar.hidden = sisa === 0;
  }

  daftar.addEventListener('click', e => {
    const tombol = e.target.closest('[data-putusan]');
    if (!tombol) return;
    const baris = tombol.closest('.antre');
    const terima = tombol.dataset.putusan === 'terima';
    baris.classList.add('pergi');
    setTimeout(() => { baris.remove(); hitungAntre(); }, 320);
    pesan(terima
      ? baris.dataset.id + ' disetujui, diteruskan ke antrean teknisi.'
      : baris.dataset.id + ' ditolak, warga akan diberi tahu alasannya.');
  });
  hitungAntre();

  /* Peran selain pengelola kawasan hanya melihat, tidak memutuskan */
  const pengguna = Sesi.aktif();
  if (pengguna && pengguna.peran !== 'Pengelola kawasan') {
    document.getElementById('antreSub').textContent =
      'Antrean ini menjadi tanggung jawab pengelola kawasan. Kamu masuk sebagai ' +
      pengguna.peran.toLowerCase() + ', jadi tampilan di bawah hanya untuk dilihat.';
    daftar.querySelectorAll('.btn').forEach(b => { b.disabled = true; });
  }
});
