/* ============================================================
   HALO — halaman Data kawasan
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  const NS = 'http://www.w3.org/2000/svg';
  const maksListrik = Math.max(...HALO.kawasan.map(k => k.listrik));
  const minListrik  = Math.min(...HALO.kawasan.map(k => k.listrik));

  /* ---------- Peta blok kelurahan ----------
     Digambar sebagai SVG sederhana. Letak dan ukuran tiap blok
     diambil dari data, warnanya mengikuti besar pemakaian. */
  const wadahPeta = document.getElementById('petaKawasan');
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 476 386');
  svg.setAttribute('class', 'gr');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Peta blok delapan kelurahan dengan warna menurut besar pemakaian listrik');

  const blok = {};
  HALO.kawasan.forEach(k => {
    const kuat = 0.18 + ((k.listrik - minListrik) / (maksListrik - minListrik)) * 0.82;
    const g = document.createElementNS(NS, 'g');

    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', k.x); r.setAttribute('y', k.y);
    r.setAttribute('width', k.w); r.setAttribute('height', k.h);
    r.setAttribute('rx', 4);
    r.setAttribute('fill', 'var(--listrik)');
    r.setAttribute('fill-opacity', kuat.toFixed(2));
    r.setAttribute('stroke', 'var(--paper)');
    r.setAttribute('stroke-width', 2);
    r.setAttribute('class', 'peta-blok');
    g.appendChild(r);

    /* Blok yang warnanya pekat memakai tulisan terang supaya tetap terbaca */
    const terang = kuat > 0.58;

    const nama = document.createElementNS(NS, 'text');
    nama.setAttribute('x', k.x + 10); nama.setAttribute('y', k.y + 22);
    nama.setAttribute('class', 'peta-nama' + (terang ? ' peta-balik' : ''));
    nama.textContent = k.nama;
    g.appendChild(nama);

    const nilai = document.createElementNS(NS, 'text');
    nilai.setAttribute('x', k.x + 10); nilai.setAttribute('y', k.y + 38);
    nilai.setAttribute('class', 'peta-nilai' + (terang ? ' peta-balik' : ''));
    nilai.textContent = k.listrik + ' kWh · ' + k.rumah + ' rumah';
    g.appendChild(nilai);

    svg.appendChild(g);
    blok[k.nama] = r;
    r.addEventListener('click', () => pilih(k.nama));
    r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pilih(k.nama); } });
    r.setAttribute('tabindex', '0');
    r.setAttribute('role', 'button');
    r.setAttribute('aria-label', k.nama + ', ' + k.listrik + ' kilowatt jam per rumah');
  });
  wadahPeta.appendChild(svg);

  /* ---------- Rincian kelurahan terpilih ---------- */
  const rataKawasan = HALO.kawasan.reduce((a, b) => a + b.listrik, 0) / HALO.kawasan.length;
  function pilih(nama) {
    const k = HALO.kawasan.find(x => x.nama === nama);
    Object.values(blok).forEach(b => b.classList.remove('peta-terpilih'));
    blok[nama].classList.add('peta-terpilih');

    document.getElementById('rkNama').textContent = k.nama;
    document.getElementById('rkRumah').textContent = F.angka(k.rumah);
    document.getElementById('rkListrik').textContent = F.angka(k.listrik) + ' kWh';
    document.getElementById('rkAir').textContent = F.angka(k.air, 1) + ' m³';
    const hemat = document.getElementById('rkHemat');
    hemat.textContent = F.angka(k.hemat, 1) + '%';
    document.getElementById('rkProgram').textContent = k.program;

    const selisih = ((k.listrik / rataKawasan) - 1) * 100;
    document.getElementById('rkCatatan').textContent = selisih < 0
      ? k.nama + ' berada ' + F.angka(Math.abs(selisih), 1) + ' persen di bawah rata-rata kawasan. Ada ' + k.program + ' program hemat yang sedang berjalan di sini.'
      : k.nama + ' berada ' + F.angka(selisih, 1) + ' persen di atas rata-rata kawasan. Wilayah ini layak didahulukan untuk program berikutnya.';

    document.querySelectorAll('#tubuhKawasan tr').forEach(tr => tr.classList.toggle('baris-sorot', tr.dataset.nama === nama));
  }
  pilih('Peliatan');

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
        const k = HALO.kawasan.find(x => x.nama === tr.dataset.nama);
        return kolom === 'nama' ? k.nama : k[kolom];
      };
      baris.sort((a, b) => {
        const x = nilai(a), y = nilai(b);
        const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
        return arah[kolom] === 'naik' ? c : -c;
      }).forEach((tr, i) => { tubuh.appendChild(tr); tr.querySelector('td').textContent = i + 1; });
    });
  });

  /* ---------- Tren kawasan ---------- */
  /* Rata-rata kawasan mengikuti bentuk tren rumah contoh,
     digeser ke tingkat rata-rata delapan kelurahan. */
  const geser = rataKawasan / HALO.listrikBulanan[11];
  Grafik.garis(document.getElementById('grafikTren'), {
    seri: [{ nama: 'Rata-rata kawasan', data: HALO.listrikBulanan.map(v => Math.round(v * geser)), warna: 'var(--air)', isi: true }],
    labelX: HALO.bulan, satuan: 'kWh', satuanTip: ' kWh', maksLabelX: 12,
    judulAria: 'Tren rata-rata pemakaian listrik per rumah di kawasan selama dua belas bulan'
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
