/* ============================================================
   HALO — mesin grafik
   Aturan lomba melarang pemakaian library grafik, jadi seluruh
   visualisasi di situs ini digambar sendiri sebagai SVG.
   Semua grafik memakai sistem koordinat tetap lalu diskalakan
   lewat viewBox, sehingga ikut menyesuaikan lebar layar.
   ============================================================ */

const Grafik = (function () {

  const NS = 'http://www.w3.org/2000/svg';
  const diam = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function el(nama, sifat) {
    const n = document.createElementNS(NS, nama);
    for (const k in sifat) n.setAttribute(k, sifat[k]);
    return n;
  }

  function bingkai(lebar, tinggi, kelas) {
    const svg = el('svg', {
      viewBox: '0 0 ' + lebar + ' ' + tinggi,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'gr ' + (kelas || ''), role: 'img'
    });
    return svg;
  }

  /* Ambang sumbu yang enak dibaca: 0, 5, 10 … bukan 0, 4.7, 9.4 */
  function tangga(maks, banyak) {
    const kasar = maks / banyak;
    const pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
    const bagus = [1, 2, 2.5, 5, 10].find(x => x * pangkat >= kasar) || 10;
    const langkah = bagus * pangkat;
    const atas = Math.ceil(maks / langkah) * langkah;
    const nilai = [];
    for (let v = 0; v <= atas + 1e-9; v += langkah) nilai.push(Math.round(v * 1000) / 1000);
    /* Berapa angka di belakang koma yang perlu ditampilkan supaya
       ambang sumbu tidak terlihat tidak rata karena pembulatan. */
    const pecahan = String(langkah).split('.')[1];
    const desimal = Math.min(2, pecahan ? pecahan.length : 0);
    return { atas, nilai, desimal };
  }

  /* Kotak keterangan yang mengikuti kursor */
  function pasangKotak(wadah) {
    let k = wadah.querySelector('.gr-tip');
    if (!k) { k = document.createElement('div'); k.className = 'gr-tip'; wadah.appendChild(k); }
    return {
      tampil(html, x, y) {
        k.innerHTML = html;
        k.classList.add('nyala');
        /* Ditempatkan dulu, baru diukur, baru dikoreksi — kotaknya
           tidak boleh keluar dari wadah grafiknya sendiri. */
        k.style.left = x + 'px';
        k.style.top = y + 'px';
        const lebarWadah = wadah.clientWidth;
        const lebarTip = k.offsetWidth;
        const tinggiTip = k.offsetHeight;
        const tepi = 6;
        /* Mendatar: pusat kotak dijaga supaya kedua sisinya tetap di dalam */
        const minX = lebarTip / 2 + tepi;
        const maksX = lebarWadah - lebarTip / 2 - tepi;
        k.style.left = Math.max(minX, Math.min(maksX, x)) + 'px';
        /* Tegak: dibalik ke bawah kalau ruang di atasnya tidak cukup */
        k.classList.toggle('bawah', y < tinggiTip + 10);
      },
      sembunyi() { k.classList.remove('nyala'); }
    };
  }

  /* Menggambar garis secara bertahap saat grafik masuk layar */
  function gambarkan(jalur) {
    if (diam()) return;
    const panjang = jalur.getTotalLength();
    jalur.style.strokeDasharray = panjang;
    jalur.style.strokeDashoffset = panjang;
    requestAnimationFrame(() => {
      jalur.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)';
      jalur.style.strokeDashoffset = '0';
    });
  }

  function saatTerlihat(node, kerja) {
    if (!('IntersectionObserver' in window)) { kerja(); return; }
    const p = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { kerja(); p.disconnect(); }
    }, { threshold: 0.25 });
    p.observe(node);
  }

  /* ---------------------------------------------------------
     Grafik garis. Bisa lebih dari satu seri.
     opsi: { seri:[{nama,data,warna}], labelX:[], satuan, pecahan, tinggiLabelX }
     --------------------------------------------------------- */
  function garis(wadah, opsi) {
    const W = 760, H = 300, kiri = 52, kanan = 14, atas = 18, bawah = 34;
    const seri = opsi.seri, n = seri[0].data.length;
    const maks = Math.max(...seri.flatMap(s => s.data));
    const sk = tangga(maks, 4);
    const px = i => kiri + (i / (n - 1)) * (W - kiri - kanan);
    const py = v => H - bawah - (v / sk.atas) * (H - atas - bawah);

    const svg = bingkai(W, H);
    svg.setAttribute('aria-label', opsi.judulAria || 'Grafik garis');

    /* Garis bantu mendatar dan angka sumbu tegak */
    sk.nilai.forEach(v => {
      svg.appendChild(el('line', { x1: kiri, y1: py(v), x2: W - kanan, y2: py(v), class: 'gr-bantu' }));
      const t = el('text', { x: kiri - 9, y: py(v) + 4, class: 'gr-sumbu', 'text-anchor': 'end' });
      t.textContent = ringkas(v, sk.desimal);
      svg.appendChild(t);
    });

    /* Label sumbu mendatar, dijarangkan supaya tidak bertumpuk */
    const lompat = Math.ceil(n / (opsi.maksLabelX || 8));
    opsi.labelX.forEach((l, i) => {
      if (i % lompat !== 0 && i !== n - 1) return;
      const t = el('text', { x: px(i), y: H - 12, class: 'gr-sumbu', 'text-anchor': 'middle' });
      t.textContent = l;
      svg.appendChild(t);
    });

    /* Satuan di pojok kiri atas */
    if (opsi.satuan) {
      const t = el('text', { x: kiri - 44, y: 12, class: 'gr-satuan' });
      t.textContent = opsi.satuan;
      svg.appendChild(t);
    }

    const jalurSeri = [];
    seri.forEach(s => {
      const d = s.data.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1)).join(' ');
      if (s.isi) {
        svg.appendChild(el('path', {
          d: d + ' L' + px(n - 1) + ' ' + py(0) + ' L' + px(0) + ' ' + py(0) + ' Z',
          fill: s.warna, opacity: '.08'
        }));
      }
      const j = el('path', { d: d, fill: 'none', stroke: s.warna, 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      svg.appendChild(j);
      jalurSeri.push(j);
    });

    /* Titik penanda saat kursor mendekat */
    const penanda = el('circle', { r: 4.5, fill: '#fff', 'stroke-width': 2.5, class: 'gr-penanda', opacity: 0 });
    svg.appendChild(penanda);

    wadah.innerHTML = '';
    wadah.appendChild(svg);
    const tip = pasangKotak(wadah);

    /* Lapisan tak terlihat untuk menangkap gerak kursor */
    const tangkap = el('rect', { x: kiri, y: atas, width: W - kiri - kanan, height: H - atas - bawah, fill: 'transparent' });
    svg.appendChild(tangkap);

    function di(ev) {
      const kotak = svg.getBoundingClientRect();
      const rasio = W / kotak.width;
      const x = (ev.clientX - kotak.left) * rasio;
      let i = Math.round(((x - kiri) / (W - kiri - kanan)) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      penanda.setAttribute('cx', px(i)); penanda.setAttribute('cy', py(seri[0].data[i]));
      penanda.setAttribute('stroke', seri[0].warna); penanda.setAttribute('opacity', 1);
      const baris = seri.map(s =>
        '<span class="gr-tip-baris"><i style="background:' + s.warna + '"></i>' + s.nama + ' <b>' +
        F.angka(s.data[i], opsi.pecahan || 0) + (opsi.satuanTip || '') + '</b></span>').join('');
      tip.tampil('<strong>' + opsi.labelX[i] + '</strong>' + baris,
        (px(i) / rasio), (py(seri[0].data[i]) / rasio));
    }
    tangkap.addEventListener('mousemove', di);
    tangkap.addEventListener('mouseleave', () => { penanda.setAttribute('opacity', 0); tip.sembunyi(); });

    saatTerlihat(wadah, () => jalurSeri.forEach(gambarkan));
    return svg;
  }

  /* ---------------------------------------------------------
     Grafik batang tegak
     opsi: { data:[], labelX:[], warna, satuan, pecahan }
     --------------------------------------------------------- */
  function batang(wadah, opsi) {
    const W = 760, H = 300, kiri = 52, kanan = 14, atas = 18, bawah = 34;
    const n = opsi.data.length;
    const sk = tangga(Math.max(...opsi.data), 4);
    const lebarSel = (W - kiri - kanan) / n;
    const lebarBatang = Math.min(lebarSel * 0.58, 46);
    const py = v => H - bawah - (v / sk.atas) * (H - atas - bawah);

    const svg = bingkai(W, H);
    svg.setAttribute('aria-label', opsi.judulAria || 'Grafik batang');

    sk.nilai.forEach(v => {
      svg.appendChild(el('line', { x1: kiri, y1: py(v), x2: W - kanan, y2: py(v), class: 'gr-bantu' }));
      const t = el('text', { x: kiri - 9, y: py(v) + 4, class: 'gr-sumbu', 'text-anchor': 'end' });
      t.textContent = ringkas(v, sk.desimal);
      svg.appendChild(t);
    });
    if (opsi.satuan) {
      const t = el('text', { x: kiri - 44, y: 12, class: 'gr-satuan' });
      t.textContent = opsi.satuan; svg.appendChild(t);
    }

    wadah.innerHTML = ''; wadah.appendChild(svg);
    const tip = pasangKotak(wadah);
    const batangan = [];

    opsi.data.forEach((v, i) => {
      const x = kiri + i * lebarSel + (lebarSel - lebarBatang) / 2;
      const warna = (opsi.warnaPer && opsi.warnaPer(v, i)) || opsi.warna;
      const r = el('rect', { x: x, y: py(v), width: lebarBatang, height: H - bawah - py(v), fill: warna, rx: 2, class: 'gr-batang' });
      svg.appendChild(r); batangan.push({ r, v, i });

      const t = el('text', { x: x + lebarBatang / 2, y: H - 12, class: 'gr-sumbu', 'text-anchor': 'middle' });
      t.textContent = opsi.labelX[i]; svg.appendChild(t);

      r.addEventListener('mouseenter', () => {
        const kotak = svg.getBoundingClientRect(), rasio = W / kotak.width;
        tip.tampil('<strong>' + opsi.labelX[i] + '</strong><span class="gr-tip-baris"><b>' +
          F.angka(v, opsi.pecahan || 0) + (opsi.satuanTip || '') + '</b></span>',
          (x + lebarBatang / 2) / rasio, py(v) / rasio);
      });
      r.addEventListener('mouseleave', () => tip.sembunyi());
    });

    saatTerlihat(wadah, () => {
      if (diam()) return;
      batangan.forEach(({ r }, i) => {
        const tinggi = r.getAttribute('height'), y = r.getAttribute('y');
        r.setAttribute('height', 0); r.setAttribute('y', H - bawah);
        r.animate([{ height: 0, y: H - bawah }, { height: tinggi, y: y }],
          { duration: 620, delay: i * 34, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' })
          .onfinish = () => { r.setAttribute('height', tinggi); r.setAttribute('y', y); };
      });
    });
    return svg;
  }

  /* ---------------------------------------------------------
     Batang mendatar — untuk rincian per alat
     opsi: { data:[{nama,nilai,catatan}], warna, satuan }
     --------------------------------------------------------- */
  function batangDatar(wadah, opsi) {
    const maks = Math.max(...opsi.data.map(d => d.nilai));
    wadah.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'gr-datar';
    opsi.data.forEach((d, i) => {
      const li = document.createElement('li');
      li.innerHTML =
        '<div class="gr-datar-atas"><span class="gr-datar-nama"></span>' +
        '<span class="gr-datar-nilai tnum"></span></div>' +
        '<div class="gr-datar-alur"><span class="gr-datar-isi"></span></div>' +
        '<p class="gr-datar-catatan"></p>';
      li.querySelector('.gr-datar-nama').textContent = d.nama;
      li.querySelector('.gr-datar-nilai').textContent = F.angka(d.nilai, 1) + ' ' + (opsi.satuan || '');
      li.querySelector('.gr-datar-catatan').textContent = d.catatan || '';
      const isi = li.querySelector('.gr-datar-isi');
      isi.style.background = opsi.warna;
      isi.dataset.lebar = ((d.nilai / maks) * 100).toFixed(1) + '%';
      ul.appendChild(li);
    });
    wadah.appendChild(ul);
    saatTerlihat(wadah, () => {
      ul.querySelectorAll('.gr-datar-isi').forEach((s, i) => {
        setTimeout(() => { s.style.width = s.dataset.lebar; }, diam() ? 0 : i * 60);
      });
    });
  }

  /* ---------------------------------------------------------
     Cincin — satu angka utama dalam lingkaran
     opsi: { nilai, maks, warna, label, satuan }
     --------------------------------------------------------- */
  function cincin(wadah, opsi) {
    const S = 180, R = 74, tebal = 13, keliling = 2 * Math.PI * R;
    const bagian = Math.max(0, Math.min(1, opsi.nilai / opsi.maks));
    const svg = bingkai(S, S, 'gr-cincin');
    svg.setAttribute('aria-label', opsi.label + ' ' + opsi.nilai + ' dari ' + opsi.maks);

    svg.appendChild(el('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', stroke: 'var(--line-2)', 'stroke-width': tebal }));
    const busur = el('circle', {
      cx: S / 2, cy: S / 2, r: R, fill: 'none', stroke: opsi.warna,
      'stroke-width': tebal, 'stroke-linecap': 'round',
      transform: 'rotate(-90 ' + S / 2 + ' ' + S / 2 + ')',
      'stroke-dasharray': keliling, 'stroke-dashoffset': keliling
    });
    svg.appendChild(busur);

    const angka = el('text', { x: S / 2, y: S / 2 + 4, class: 'gr-cincin-angka', 'text-anchor': 'middle' });
    angka.textContent = '0';
    svg.appendChild(angka);
    const lab = el('text', { x: S / 2, y: S / 2 + 26, class: 'gr-cincin-label', 'text-anchor': 'middle' });
    lab.textContent = opsi.label;
    svg.appendChild(lab);

    wadah.innerHTML = ''; wadah.appendChild(svg);
    saatTerlihat(wadah, () => {
      const tujuan = keliling * (1 - bagian);
      if (diam()) { busur.style.strokeDashoffset = tujuan; angka.textContent = F.angka(opsi.nilai, 0); return; }
      busur.style.transition = 'stroke-dashoffset 1.15s cubic-bezier(.22,.61,.36,1)';
      busur.style.strokeDashoffset = tujuan;
      let mulai = null;
      const jalan = w => {
        if (mulai === null) mulai = w;
        const maju = Math.min((w - mulai) / 1150, 1);
        angka.textContent = F.angka(opsi.nilai * (1 - Math.pow(1 - maju, 3)), 0);
        if (maju < 1) requestAnimationFrame(jalan);
      };
      requestAnimationFrame(jalan);
    });
  }

  /* ---------------------------------------------------------
     Peta panas jam terhadap hari
     opsi: { matriks:[[..24]x7], barisLabel:[], warna, satuan }
     --------------------------------------------------------- */
  function petaPanas(wadah, opsi) {
    const kiri = 34, atasR = 16, sel = 27, jarak = 2;
    const baris = opsi.matriks.length, kolom = opsi.matriks[0].length;
    const W = kiri + kolom * sel, H = atasR + baris * sel + 18;
    const maks = Math.max(...opsi.matriks.flat());
    const svg = bingkai(W, H, 'gr-panas');
    svg.setAttribute('aria-label', 'Peta panas pemakaian per jam untuk tiap hari');

    for (let j = 0; j < kolom; j += 3) {
      const t = el('text', { x: kiri + j * sel + sel / 2, y: 10, class: 'gr-sumbu', 'text-anchor': 'middle' });
      t.textContent = String(j).padStart(2, '0');
      svg.appendChild(t);
    }
    wadah.innerHTML = ''; wadah.appendChild(svg);
    const tip = pasangKotak(wadah);

    opsi.matriks.forEach((deret, b) => {
      const t = el('text', { x: kiri - 8, y: atasR + b * sel + sel / 2 + 4, class: 'gr-sumbu', 'text-anchor': 'end' });
      t.textContent = opsi.barisLabel[b];
      svg.appendChild(t);
      deret.forEach((v, k) => {
        const kuat = 0.12 + (v / maks) * 0.88;
        const r = el('rect', {
          x: kiri + k * sel, y: atasR + b * sel,
          width: sel - jarak, height: sel - jarak, rx: 2,
          fill: opsi.warna, 'fill-opacity': kuat.toFixed(3), class: 'gr-sel'
        });
        r.addEventListener('mouseenter', () => {
          const kotak = svg.getBoundingClientRect(), rasio = W / kotak.width;
          tip.tampil('<strong>' + opsi.barisLabel[b] + ' pukul ' + String(k).padStart(2, '0') + '.00</strong>' +
            '<span class="gr-tip-baris"><b>' + F.angka(v, 2) + ' ' + (opsi.satuan || '') + '</b></span>',
            (kiri + k * sel + sel / 2) / rasio, (atasR + b * sel) / rasio);
        });
        r.addEventListener('mouseleave', () => tip.sembunyi());
        svg.appendChild(r);
      });
    });
  }

  /* ---------------------------------------------------------
     Garis mungil tanpa sumbu, untuk di dalam kartu ringkas
     --------------------------------------------------------- */
  function kilau(wadah, data, warna) {
    const W = 120, H = 34, p = 3;
    const maks = Math.max(...data), min = Math.min(...data);
    const rentang = maks - min || 1;
    const px = i => p + (i / (data.length - 1)) * (W - p * 2);
    const py = v => H - p - ((v - min) / rentang) * (H - p * 2);
    const d = data.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(v).toFixed(1)).join(' ');
    const svg = bingkai(W, H, 'gr-kilau');
    svg.setAttribute('aria-hidden', 'true');
    svg.appendChild(el('path', { d: d + ' L' + px(data.length - 1) + ' ' + H + ' L' + px(0) + ' ' + H + ' Z', fill: warna, opacity: '.12' }));
    svg.appendChild(el('path', { d: d, fill: 'none', stroke: warna, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }));
    svg.appendChild(el('circle', { cx: px(data.length - 1), cy: py(data[data.length - 1]), r: 2.6, fill: warna }));
    wadah.innerHTML = ''; wadah.appendChild(svg);
  }

  /* ---------------------------------------------------------
     Grafik cermin dua aliran.
     Satu sumbu jam di tengah. Listrik naik ke atas dalam watt,
     air turun ke bawah dalam liter per jam. Keduanya berskala
     sendiri-sendiri — kalau dipaksa berbagi satu sumbu, kurva air
     akan gepeng menempel dasar karena besarannya jauh berbeda.
     opsi: { listrik:[24], air:[24], tandaAir:{jamAwal,jamAkhir,nilai,teks} }
     --------------------------------------------------------- */
  function aliranGanda(wadah, opsi) {
    const W = 760, H = 340, kiri = 46, kanan = 14, atas = 16, bawah = 22;
    const sumbuY = 170;
    const n = 24;
    const maksL = Math.max(...opsi.listrik);
    const maksA = Math.max(...opsi.air);
    const tinggiAtas = sumbuY - atas;
    const tinggiBawah = (H - bawah) - sumbuY;

    const px = i => kiri + (i / (n - 1)) * (W - kiri - kanan);
    const pyL = v => sumbuY - (v / maksL) * tinggiAtas;
    const pyA = v => sumbuY + (v / maksA) * tinggiBawah;

    const svg = bingkai(W, H, 'gr-aliran');
    svg.setAttribute('aria-label',
      'Grafik cermin: pemakaian listrik dalam watt ke arah atas dan pemakaian air dalam liter per jam ke arah bawah, sepanjang dua puluh empat jam');

    /* Bidang listrik di atas sumbu */
    const jalurL = opsi.listrik.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + pyL(v).toFixed(1)).join(' ');
    svg.appendChild(el('path', {
      d: jalurL + ' L' + px(n - 1) + ' ' + sumbuY + ' L' + px(0) + ' ' + sumbuY + ' Z',
      fill: 'var(--listrik)', 'fill-opacity': '.10'
    }));
    const garisL = el('path', { d: jalurL, fill: 'none', stroke: 'var(--listrik)', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    svg.appendChild(garisL);

    /* Bidang air di bawah sumbu */
    const jalurA = opsi.air.map((v, i) => (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + pyA(v).toFixed(1)).join(' ');
    svg.appendChild(el('path', {
      d: jalurA + ' L' + px(n - 1) + ' ' + sumbuY + ' L' + px(0) + ' ' + sumbuY + ' Z',
      fill: 'var(--air)', 'fill-opacity': '.10'
    }));
    const garisA = el('path', { d: jalurA, fill: 'none', stroke: 'var(--air)', 'stroke-width': 2.4, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
    svg.appendChild(garisA);

    /* Sumbu jam di tengah */
    svg.appendChild(el('line', { x1: kiri, y1: sumbuY, x2: W - kanan, y2: sumbuY, stroke: 'var(--ink)', 'stroke-width': 1 }));
    for (let j = 0; j < n; j += 3) {
      const t = el('text', { x: px(j), y: sumbuY + 14, class: 'gr-sumbu', 'text-anchor': 'middle' });
      t.textContent = String(j).padStart(2, '0');
      svg.appendChild(t);
    }

    /* Nama arah di tepi kiri */
    const namaAtas = el('text', { x: 4, y: atas + 10, class: 'gr-satuan' });
    namaAtas.textContent = 'WATT';
    svg.appendChild(namaAtas);
    const namaBawah = el('text', { x: 4, y: H - bawah - 2, class: 'gr-satuan' });
    namaBawah.textContent = 'LITER/JAM';
    svg.appendChild(namaBawah);

    /* Penanda puncak listrik, angkanya dihitung bukan ditulis tangan */
    const jamPuncak = opsi.listrik.indexOf(maksL);
    svg.appendChild(el('circle', { cx: px(jamPuncak), cy: pyL(maksL), r: 4, fill: 'var(--listrik)' }));
    const labelPuncak = el('text', { x: px(jamPuncak), y: pyL(maksL) - 11, class: 'gr-tanda', 'text-anchor': 'middle' });
    labelPuncak.textContent = 'puncak ' + Math.round(maksL) + ' W · ' + String(jamPuncak).padStart(2, '0') + '.00';
    svg.appendChild(labelPuncak);

    /* Penanda kebocoran sebelum diperbaiki */
    if (opsi.tandaAir) {
      const ta = opsi.tandaAir;
      const y = pyA(ta.nilai);
      svg.appendChild(el('line', {
        x1: px(ta.jamAwal), y1: y, x2: px(ta.jamAkhir), y2: y,
        stroke: 'var(--waspada)', 'stroke-width': 2, 'stroke-dasharray': '6 5', 'stroke-linecap': 'round'
      }));
      const t = el('text', { x: px(ta.jamAkhir) + 8, y: y + 4, class: 'gr-tanda gr-tanda-waspada' });
      t.textContent = ta.teks;
      svg.appendChild(t);
    }

    wadah.innerHTML = '';
    wadah.appendChild(svg);
    const tip = pasangKotak(wadah);

    /* Garis bidik yang menampilkan kedua nilai sekaligus */
    const bidik = el('line', { y1: atas, y2: H - bawah, stroke: 'var(--ink-3)', 'stroke-width': 1, opacity: 0 });
    svg.appendChild(bidik);
    const titikL = el('circle', { r: 4, fill: '#fff', stroke: 'var(--listrik)', 'stroke-width': 2.5, opacity: 0 });
    const titikA = el('circle', { r: 4, fill: '#fff', stroke: 'var(--air)', 'stroke-width': 2.5, opacity: 0 });
    svg.appendChild(titikL); svg.appendChild(titikA);

    const tangkap = el('rect', { x: kiri, y: atas, width: W - kiri - kanan, height: H - atas - bawah, fill: 'transparent' });
    svg.appendChild(tangkap);

    tangkap.addEventListener('mousemove', ev => {
      const kotak = svg.getBoundingClientRect();
      const rasio = W / kotak.width;
      let i = Math.round((((ev.clientX - kotak.left) * rasio - kiri) / (W - kiri - kanan)) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      bidik.setAttribute('x1', px(i)); bidik.setAttribute('x2', px(i)); bidik.setAttribute('opacity', .45);
      titikL.setAttribute('cx', px(i)); titikL.setAttribute('cy', pyL(opsi.listrik[i])); titikL.setAttribute('opacity', 1);
      titikA.setAttribute('cx', px(i)); titikA.setAttribute('cy', pyA(opsi.air[i])); titikA.setAttribute('opacity', 1);
      tip.tampil(
        '<strong>Pukul ' + String(i).padStart(2, '0') + '.00</strong>' +
        '<span class="gr-tip-baris"><i style="background:var(--listrik)"></i>Listrik <b>' + F.angka(opsi.listrik[i], 0) + ' W</b></span>' +
        '<span class="gr-tip-baris"><i style="background:var(--air)"></i>Air <b>' + F.angka(opsi.air[i], 0) + ' L/jam</b></span>',
        px(i) / rasio, atas / rasio);
    });
    tangkap.addEventListener('mouseleave', () => {
      bidik.setAttribute('opacity', 0);
      titikL.setAttribute('opacity', 0); titikA.setAttribute('opacity', 0);
      tip.sembunyi();
    });

    saatTerlihat(wadah, () => { gambarkan(garisL); gambarkan(garisA); });
    return svg;
  }

  /* Angka sumbu dipendekkan supaya tidak memakan tempat.
     Jumlah angka di belakang koma mengikuti besar langkah sumbunya,
     supaya ambang seperti 0,25 tidak terbaca menjadi 0,3. */
  function ringkas(v, desimal) {
    if (v >= 1000000) return F.angka(v / 1000000, 1) + 'jt';
    if (v >= 1000) return F.angka(v / 1000, v % 1000 === 0 ? 0 : 1) + 'rb';
    return F.angka(v, desimal !== undefined ? desimal : (v % 1 === 0 ? 0 : 1));
  }

  return { garis, batang, batangDatar, cincin, petaPanas, kilau, aliranGanda, ringkas };
})();
