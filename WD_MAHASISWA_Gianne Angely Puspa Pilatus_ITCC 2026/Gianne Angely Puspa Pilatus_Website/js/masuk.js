/* ============================================================
   HALO — halaman Masuk & Daftar
   Akun disimpan di localStorage peramban. Tidak ada server.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const tabMasuk   = document.getElementById('tabMasuk');
  const tabDaftar  = document.getElementById('tabDaftar');
  const formMasuk  = document.getElementById('panelMasuk');
  const formDaftar = document.getElementById('panelDaftar');

  /* ---------- Perpindahan tab ---------- */
  function pilihTab(keDaftar) {
    tabMasuk.setAttribute('aria-selected', String(!keDaftar));
    tabDaftar.setAttribute('aria-selected', String(keDaftar));
    formMasuk.hidden = keDaftar;
    formDaftar.hidden = !keDaftar;
  }
  tabMasuk.addEventListener('click', () => pilihTab(false));
  tabDaftar.addEventListener('click', () => pilihTab(true));
  if (new URLSearchParams(location.search).get('tab') === 'daftar') pilihTab(true);

  /* ---------- Tombol intip kata sandi ---------- */
  document.querySelectorAll('[data-intip]').forEach(tombol => {
    tombol.addEventListener('click', () => {
      const kolom = document.getElementById(tombol.dataset.intip);
      const tampil = kolom.type === 'password';
      kolom.type = tampil ? 'text' : 'password';
      tombol.querySelector('i').className = tampil ? 'bx bx-hide' : 'bx bx-show';
      tombol.setAttribute('aria-label', tampil ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
    });
  });

  /* ---------- Penanda salah pada satu kolom ---------- */
  function salah(idKolom, teks) {
    const kolom = document.getElementById(idKolom);
    const bungkus = kolom.closest('.kolom');
    bungkus.classList.remove('benar');
    bungkus.classList.add('salah');
    const pesanEl = bungkus.querySelector('[data-untuk="' + idKolom + '"]');
    if (pesanEl) pesanEl.textContent = teks;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      kolom.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
        { duration: 240, easing: 'ease-in-out' });
    }
    return false;
  }
  function benar(idKolom) {
    const bungkus = document.getElementById(idKolom).closest('.kolom');
    bungkus.classList.remove('salah');
    bungkus.classList.add('benar');
    return true;
  }
  function bersihkan(form) {
    form.querySelectorAll('.kolom').forEach(k => k.classList.remove('salah', 'benar'));
  }

  const polaSurel = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  /* ---------- Ukuran kekuatan kata sandi ---------- */
  const kolomSandi = document.getElementById('dSandi');
  const batang = document.querySelectorAll('#kuatSandi span');
  const kuatTeks = document.getElementById('kuatTeks');
  const warnaKuat = ['var(--waspada)', 'var(--waspada)', 'var(--listrik)', 'var(--hemat)'];
  const namaKuat = ['Terlalu mudah ditebak', 'Masih lemah', 'Cukup', 'Kuat'];

  function nilaiSandi(s) {
    let n = 0;
    if (s.length >= 8) n++;
    if (s.length >= 12) n++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++;
    if (/\d/.test(s) || /[^\w\s]/.test(s)) n++;
    return Math.min(n, 4);
  }
  if (kolomSandi) {
    kolomSandi.addEventListener('input', () => {
      const n = kolomSandi.value ? nilaiSandi(kolomSandi.value) : 0;
      batang.forEach((b, i) => { b.style.background = i < n ? warnaKuat[n - 1] : 'var(--line)'; });
      kuatTeks.textContent = n ? namaKuat[n - 1] : '';
      kuatTeks.style.color = n ? warnaKuat[n - 1] : 'var(--ink-3)';
    });
  }

  /* ---------- Tombol pilihan ---------- */
  function siapkanPilihan(idKotak) {
    const kotak = document.getElementById(idKotak);
    if (!kotak) return () => '';
    kotak.addEventListener('click', e => {
      const t = e.target.closest('.pilihan-btn');
      if (!t) return;
      kotak.querySelectorAll('.pilihan-btn').forEach(b => b.setAttribute('aria-pressed', String(b === t)));
    });
    return () => kotak.querySelector('[aria-pressed="true"]').dataset.nilai;
  }
  const ambilPeran  = siapkanPilihan('pilihPeran');
  const ambilTempat = siapkanPilihan('pilihTempat');

  /* ---------- Ke mana pengguna diarahkan setelah masuk ---------- */
  function tujuan(peran) {
    if (peran === 'Pengelola kawasan') return 'kawasan.html';
    if (peran === 'Teknisi') return 'riwayat.html';
    return 'dashboard.html';
  }

  /* ---------- Daftar ---------- */
  formDaftar.addEventListener('submit', e => {
    e.preventDefault();
    bersihkan(formDaftar);
    const nama = document.getElementById('dNama').value.trim();
    const surel = document.getElementById('dEmail').value.trim();
    const sandi = document.getElementById('dSandi').value;
    let lolos = true;

    if (nama.length < 3) lolos = salah('dNama', 'Nama diisi sedikitnya tiga huruf.'); else benar('dNama');
    if (!polaSurel.test(surel)) lolos = salah('dEmail', 'Alamat surel belum benar formatnya.');
    else if (Sesi.semuaPengguna().some(u => u.surel === surel.toLowerCase())) lolos = salah('dEmail', 'Surel ini sudah terdaftar di peramban ini.');
    else benar('dEmail');
    if (sandi.length < 8) lolos = salah('dSandi', 'Kata sandi sedikitnya delapan huruf.'); else benar('dSandi');
    if (!lolos) return;

    const pengguna = {
      nama: nama, surel: surel.toLowerCase(), sandi: sandi,
      peran: ambilPeran(), tempat: ambilTempat(),
      wilayah: document.getElementById('dWilayah').value.trim() || 'Gianyar, Bali',
      demo: false
    };
    const daftar = Sesi.semuaPengguna();
    daftar.push(pengguna);
    if (!Sesi.simpanPengguna(daftar)) { pesan('Peramban ini menolak menyimpan data.', 'salah'); return; }
    Sesi.masuk(pengguna);
    pesan('Akun dibuat. Selamat datang, ' + nama.split(' ')[0] + '.');
    setTimeout(() => { location.href = tujuan(pengguna.peran); }, 700);
  });

  /* ---------- Masuk ---------- */
  formMasuk.addEventListener('submit', e => {
    e.preventDefault();
    bersihkan(formMasuk);
    const surel = document.getElementById('mEmail').value.trim().toLowerCase();
    const sandi = document.getElementById('mSandi').value;
    let lolos = true;

    if (!polaSurel.test(surel)) lolos = salah('mEmail', 'Alamat surel belum benar formatnya.'); else benar('mEmail');
    if (!sandi) lolos = salah('mSandi', 'Kata sandi belum diisi.'); else benar('mSandi');
    if (!lolos) return;

    const pengguna = Sesi.semuaPengguna().find(u => u.surel === surel);
    if (!pengguna) { salah('mEmail', 'Surel ini belum terdaftar di peramban ini. Daftar dulu atau pakai akun demo.'); return; }
    if (pengguna.sandi !== sandi) { salah('mSandi', 'Kata sandi tidak cocok.'); return; }

    Sesi.masuk(pengguna);
    pesan('Berhasil masuk.');
    setTimeout(() => { location.href = tujuan(pengguna.peran); }, 600);
  });

  /* ---------- Akun demo per peran ---------- */
  const demoNama = { 'Warga': 'Kadek Ayu', 'Pengelola kawasan': 'Wayan Suardika', 'Teknisi': 'Putu Bagas' };
  document.querySelectorAll('.demo').forEach(tombol => {
    tombol.addEventListener('click', () => {
      const peran = tombol.dataset.peran;
      Sesi.masuk({
        nama: demoNama[peran], surel: 'demo.' + peran.split(' ')[0].toLowerCase() + '@halo.id',
        peran: peran, tempat: 'Rumah', wilayah: 'Peliatan, Gianyar', demo: true
      });
      pesan('Masuk sebagai ' + peran.toLowerCase() + ' (akun demo).');
      setTimeout(() => { location.href = tujuan(peran); }, 600);
    });
  });
});
