/* ============================================================
   HALO — penyaringan, pencarian, dan pengurutan katalog layanan
   Semua kartu sudah tertulis di HTML. Skrip ini hanya
   menyembunyikan, menampilkan, dan menyusun ulang urutannya,
   sehingga halaman tetap utuh walau skrip gagal dimuat.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const kisi     = document.getElementById('kisiLayanan');
  if (!kisi) return;
  const kartu    = [...kisi.querySelectorAll('.kl')];
  const kotakCari = document.getElementById('cariLayanan');
  const grupKat  = document.getElementById('saringKategori');
  const pilihUrut = document.getElementById('urutLayanan');
  const jumlahEl = document.getElementById('jumlahHasil');
  const kosong   = document.getElementById('kosongLayanan');

  let kategori = 'semua';
  let kata = '';

  function saring() {
    let tampil = 0;
    kartu.forEach(k => {
      const cocokKat = kategori === 'semua' || k.dataset.kategori === kategori;
      const cocokKata = !kata || k.dataset.nama.includes(kata);
      const lolos = cocokKat && cocokKata;
      k.hidden = !lolos;
      if (lolos) tampil++;
    });
    jumlahEl.textContent = tampil;
    kosong.hidden = tampil !== 0;
  }

  function urutkan() {
    const cara = pilihUrut.value;
    const nilai = k => cara === 'hemat' ? -Number(k.dataset.hemat)
                     : cara === 'murah' ? Number(k.dataset.biaya)
                     : Number(k.dataset.balik);
    [...kartu].sort((a, b) => nilai(a) - nilai(b)).forEach(k => kisi.appendChild(k));
  }

  kotakCari.addEventListener('input', () => { kata = kotakCari.value.trim().toLowerCase(); saring(); });

  grupKat.addEventListener('click', e => {
    const t = e.target.closest('.cip');
    if (!t) return;
    grupKat.querySelectorAll('.cip').forEach(c => c.setAttribute('aria-pressed', String(c === t)));
    kategori = t.dataset.kategori;
    saring();
  });

  pilihUrut.addEventListener('change', urutkan);

  document.querySelectorAll('.tampilan-btn').forEach(tombol => {
    tombol.addEventListener('click', () => {
      document.querySelectorAll('.tampilan-btn').forEach(b => b.setAttribute('aria-pressed', String(b === tombol)));
      kisi.classList.toggle('daftar', tombol.dataset.tampilan === 'daftar');
    });
  });

  document.getElementById('hapusSaring').addEventListener('click', () => {
    kategori = 'semua'; kata = ''; kotakCari.value = '';
    grupKat.querySelectorAll('.cip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.kategori === 'semua')));
    saring();
  });

  urutkan();
  saring();
});
