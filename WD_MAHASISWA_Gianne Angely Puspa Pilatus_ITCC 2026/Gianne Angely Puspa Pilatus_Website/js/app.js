/* ============================================================
   HALO — perilaku yang dipakai di semua halaman
   Berisi: format angka, sesi pengguna, bilah navigasi,
   layar muat, pemberitahuan singkat, dan gerakan saat digulir.
   ============================================================ */

/* ---------- Format angka dan tanggal ---------- */
const F = {
  rupiah:  n => 'Rp' + Math.round(n).toLocaleString('id-ID'),
  angka:   (n, d = 0) => Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }),
  kwh:     n => F.angka(n, 1) + ' kWh',
  liter:   n => F.angka(n, 0) + ' L',
  m3:      n => F.angka(n, 1) + ' m³',
  persen:  n => F.angka(n, 1) + '%',
  tanggal(iso) {
    const namaBulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
    const [t, b, h] = iso.split('-');
    return Number(h) + ' ' + namaBulan[Number(b) - 1] + ' ' + t;
  }
};

/* ---------- Penyimpanan lokal yang aman ---------- */
/* Beberapa peramban memblokir localStorage pada mode tertentu,
   jadi setiap akses dibungkus supaya halaman tidak ikut berhenti. */
const Simpanan = {
  baca(kunci, cadangan) {
    try { const v = localStorage.getItem(kunci); return v ? JSON.parse(v) : cadangan; }
    catch (e) { return cadangan; }
  },
  tulis(kunci, nilai) {
    try { localStorage.setItem(kunci, JSON.stringify(nilai)); return true; }
    catch (e) { return false; }
  },
  hapus(kunci) { try { localStorage.removeItem(kunci); } catch (e) {} }
};

/* ---------- Sesi pengguna ---------- */
const Sesi = {
  K_PENGGUNA: 'halo.pengguna',
  K_SESI:     'halo.sesi',
  K_RENCANA:  'halo.rencana',
  K_AJUAN:    'halo.ajuan',

  semuaPengguna() { return Simpanan.baca(this.K_PENGGUNA, []); },
  simpanPengguna(daftar) { return Simpanan.tulis(this.K_PENGGUNA, daftar); },

  aktif() { return Simpanan.baca(this.K_SESI, null); },
  masuk(pengguna) { Simpanan.tulis(this.K_SESI, pengguna); },
  keluar() { Simpanan.hapus(this.K_SESI); },

  rencana() { return Simpanan.baca(this.K_RENCANA, []); },
  tambahRencana(idLayanan) {
    const r = this.rencana();
    if (r.includes(idLayanan)) return false;
    r.push(idLayanan); Simpanan.tulis(this.K_RENCANA, r); return true;
  },
  hapusRencana(idLayanan) {
    Simpanan.tulis(this.K_RENCANA, this.rencana().filter(x => x !== idLayanan));
  },

  /* Pengajuan yang dibuat pengguna selama sesi berlangsung.
     Digabung dengan riwayat contoh di halaman Riwayat. */
  ajuan() { return Simpanan.baca(this.K_AJUAN, []); },
  tambahAjuan(entri) {
    const a = this.ajuan(); a.unshift(entri); Simpanan.tulis(this.K_AJUAN, a);
  }
};

/* ---------- Pemberitahuan singkat ---------- */
function pesan(teks, jenis) {
  let rak = document.querySelector('.toast-rak');
  if (!rak) { rak = document.createElement('div'); rak.className = 'toast-rak'; document.body.appendChild(rak); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.innerHTML = '<i class="bx ' + (jenis === 'salah' ? 'bx-error-circle' : 'bx-check-circle') + '"></i><span></span>';
  t.querySelector('span').textContent = teks;
  rak.appendChild(t);
  t.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'ease-out' });
  setTimeout(() => {
    t.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220 }).onfinish = () => t.remove();
  }, 2600);
}

/* ---------- Bilah navigasi ---------- */
function siapkanBilah() {
  const tombol = document.getElementById('bilahTombol');
  const menu = document.getElementById('menu');
  if (tombol && menu) {
    tombol.addEventListener('click', () => {
      const buka = menu.classList.toggle('buka');
      tombol.setAttribute('aria-expanded', String(buka));
    });
  }

  /* Tandai tautan halaman yang sedang dibuka */
  const berkas = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a').forEach(a => {
    if (a.getAttribute('href').split('/').pop().split('#')[0] === berkas) a.setAttribute('aria-current', 'page');
  });

  /* Bagian kanan bilah menyesuaikan keadaan masuk atau keluar */
  const kotak = document.getElementById('bilahAksi');
  if (!kotak) return;
  const p = Sesi.aktif();
  const kePages = document.body.dataset.dalam === 'pages' ? '' : 'pages/';
  const keAkar  = document.body.dataset.dalam === 'pages' ? '../' : '';
  if (p) {
    const inisial = p.nama.trim().split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase();
    kotak.innerHTML =
      '<a class="akun" href="' + kePages + 'dashboard.html">' +
        '<span class="akun-inisial">' + inisial + '</span>' +
        '<span class="akun-teks"><strong></strong><small></small></span>' +
      '</a>' +
      '<button class="btn btn-garis btn-kecil" id="tombolKeluar">Keluar</button>';
    kotak.querySelector('strong').textContent = p.nama.split(' ')[0];
    kotak.querySelector('small').textContent = p.peran;
    document.getElementById('tombolKeluar').addEventListener('click', () => {
      Sesi.keluar();
      location.href = keAkar + 'index.html';
    });
  } else {
    kotak.innerHTML =
      '<a class="btn btn-polos btn-kecil" href="' + kePages + 'masuk.html">Masuk</a>' +
      '<a class="btn btn-utama btn-kecil" href="' + kePages + 'masuk.html?tab=daftar">Daftar</a>';
  }
}

/* ---------- Layar muat ---------- */
/* Pengaman: apa pun yang terjadi, layar muat wajib hilang.
   Kalau skrip lain gagal, penghitung waktu di bawah tetap jalan. */
function siapkanLayarMuat() {
  const layar = document.getElementById('muat');
  if (!layar) return;
  const tutup = () => layar.classList.add('pergi');
  window.addEventListener('load', () => setTimeout(tutup, 380));
  setTimeout(tutup, 2200);
}

/* ---------- Gerakan muncul saat digulir ---------- */
function siapkanMuncul() {
  const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sasaran = document.querySelectorAll('[data-muncul], [data-urut]');
  if (diam || !('IntersectionObserver' in window)) {
    sasaran.forEach(el => el.classList.add('tampil'));
    return;
  }
  const pengamat = new IntersectionObserver((entri) => {
    entri.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const tunda = Number(el.dataset.tunda || 0);
      setTimeout(() => {
        el.classList.add('tampil');
        if (el.hasAttribute('data-urut')) {
          [...el.children].forEach((anak, i) => { anak.style.transitionDelay = (i * 70) + 'ms'; });
        }
      }, tunda);
      pengamat.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  sasaran.forEach(el => pengamat.observe(el));
}

/* ---------- Angka yang menghitung naik ---------- */
function hitungNaik(el, akhir, pecahan, akhiran) {
  const diam = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tulis = v => { el.textContent = F.angka(v, pecahan || 0) + (akhiran || ''); };
  if (diam) { tulis(akhir); return; }
  const lama = 1100;
  let mulai = null;
  function langkah(waktu) {
    if (mulai === null) mulai = waktu;
    const maju = Math.min((waktu - mulai) / lama, 1);
    const halus = 1 - Math.pow(1 - maju, 3);
    tulis(akhir * halus);
    if (maju < 1) requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
}

function siapkanPencacah() {
  const kotak = document.querySelectorAll('[data-hitung]');
  if (!kotak.length) return;
  if (!('IntersectionObserver' in window)) {
    kotak.forEach(el => hitungNaik(el, Number(el.dataset.hitung), Number(el.dataset.pecahan || 0), el.dataset.akhiran));
    return;
  }
  const pengamat = new IntersectionObserver(entri => {
    entri.forEach(e => {
      if (!e.isIntersecting) return;
      hitungNaik(e.target, Number(e.target.dataset.hitung), Number(e.target.dataset.pecahan || 0), e.target.dataset.akhiran);
      pengamat.unobserve(e.target);
    });
  }, { threshold: 0.5 });
  kotak.forEach(el => pengamat.observe(el));
}

/* ---------- Pita ukur bertakik ----------
   Takiknya elemen sungguhan, bukan gradasi berulang, karena
   gradasi tidak dipakai di mana pun pada situs ini. Bentuk dasar
   pitanya sudah ada di CSS, jadi kalau skrip gagal pita tetap
   tampil sebagai garis biasa. */
function siapkanPita() {
  document.querySelectorAll('.rel-tik').forEach(pita => {
    if (pita.children.length) return;
    const potong = document.createDocumentFragment();
    for (let i = 0; i < 40; i++) {
      const t = document.createElement('i');
      t.className = 'tik' + (i % 5 === 0 ? ' panjang' : '');
      potong.appendChild(t);
    }
    const reg = document.createElement('span');
    reg.className = 'reg';
    reg.textContent = 'REG ' + (pita.dataset.reg || '01');
    potong.appendChild(reg);
    pita.appendChild(potong);
  });
}

/* ---------- Tahun berjalan di kaki halaman ---------- */
function siapkanTahun() {
  document.querySelectorAll('[data-tahun]').forEach(el => { el.textContent = new Date().getFullYear(); });
}

/* ---------- Jalankan ---------- */
document.documentElement.classList.remove('tanpa-js');
document.addEventListener('DOMContentLoaded', () => {
  siapkanLayarMuat();
  siapkanBilah();
  siapkanMuncul();
  siapkanPencacah();
  siapkanPita();
  siapkanTahun();
});
