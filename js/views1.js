/* AWS Daily Report v1.0.13 — halaman: Dashboard, Absensi, Produksi, Rekap */
(function (w) {
  'use strict';
  var V = APP.V, $ = U.$;
  var SEMUA_JENIS = CH.JENIS.map(function (j) { return j[0]; });
  var GRID = { kodeKet: { K: 'Kerja', MG: 'Minggu', HB: 'Hari besar', M: 'Mangkir', C: 'Cuti', S1: 'Sakit', H1: 'Haid 1', H2: 'Haid 2', P1: 'Izin/Perusahaan 1', P3: 'Izin 3', P4: 'Izin 4', KL: 'Kerja lembur', OUT: 'Keluar' } };

  /* kerangka halaman berperiode */
  APP.laman = function (host, o) {
    host.innerHTML = '<div class="head"><div><h1>' + U.esc(o.judul) + '</h1>' + (o.desk ? '<p>' + U.esc(o.desk) + '</p>' : '') + '</div></div>';
    var bh = document.createElement('div'), body = document.createElement('div'); host.appendChild(bh); host.appendChild(body);
    var bar = APP.barPeriode(bh, { filter: o.filter !== false, onChange: muat });
    function muat(paksa) {
      CH.bersih(); body.innerHTML = UI.skel();
      APP.laporan(paksa === true).then(function (rep) { if (!document.body.contains(body)) return; bar.perbarui(); body.innerHTML = ''; o.isi(body, rep); })
        .catch(function (e) { UI.galat(body, e, function () { muat(true); }); });
    }
    muat();
  };
  function grid(host, kelas) { var g = document.createElement('div'); g.className = 'panel ' + (kelas || 'c2e'); host.appendChild(g); return g; }
  function tab(host, daftar, awal, onGanti) {
    var bar = document.createElement('div'); bar.className = 'tabs'; bar.setAttribute('role', 'tablist'); var isi = document.createElement('div'); host.appendChild(bar); host.appendChild(isi);
    var aktif = awal || daftar[0][0];
    function pilih(id) { aktif = id; CH.bersih(); U.$$('button', bar).forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); }); isi.innerHTML = ''; daftar.filter(function (d) { return d[0] === id; })[0][2](isi); if (onGanti) onGanti(id); }
    bar.innerHTML = daftar.map(function (d) { return '<button role="tab" data-id="' + d[0] + '">' + U.esc(d[1]) + '</button>'; }).join('');
    bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) pilih(b.dataset.id); });
    pilih(aktif); return { pilih: pilih };
  }
  APP.tab = tab;
  function panel(g, id, judul, fn, jenis, tinggi, catatan) { return CH.panel(g, { id: id, judul: judul, spec: fn, jenis: jenis, boleh: SEMUA_JENIS, tinggi: tinggi, catatan: catatan }); }

  /* ============ DASHBOARD ============ */
  V.dashboard = function (host) {
    APP.laman(host, { judul: 'Dashboard', desk: 'Ringkasan produksi dan absensi untuk periode terpilih.', isi: function (body, rep) {
      var k = rep.kpi, hariIni = (APP.S.status && APP.S.status.hari) || U.today(), telat = k.dataTerakhirProduksi && U.parse(hariIni) - U.parse(k.dataTerakhirProduksi) > 864e5;
      body.insertAdjacentHTML('beforeend', '<div class="row" style="margin-bottom:12px"><span class="badge ' + (telat ? 'warn' : 'ok') + '">Produksi terakhir: ' + U.tglID(k.dataTerakhirProduksi, true) + '</span><span class="badge info">Absensi terakhir: ' + U.tglID(k.dataTerakhirAbsensi, true) + '</span><span class="muted">' + U.nf(k.hariData) + ' hari produksi pada periode ini</span></div>');
      body.insertAdjacentHTML('beforeend', UI.kpi([
        { l: 'Produksi', v: U.nf(k.kg) + ' kg', s: 'Budget ' + U.nf(k.budget) + ' kg' }, { l: 'Pencapaian', v: U.pct(k.pctCapai), s: (k.selisih >= 0 ? '▲ +' : '▼ ') + U.nf(k.selisih) + ' kg', kls: k.selisih >= 0 ? 'up' : 'dn' },
        { l: 'Kehadiran', v: U.pct(k.pctHadir, 2), s: U.nf(k.hadir) + ' dari ' + U.nf(k.hk) + ' HK' }, { l: 'Mangkir', v: U.pct(k.pctMangkir, 2), s: U.nf(k.mangkir) + ' hari', kls: k.pctMangkir > 1.5 ? 'dn' : '' },
        { l: 'Kg per HK', v: U.nf(k.kgPerHk, 1), s: 'Produksi ÷ orang hadir memetik' }, { l: 'Grade I', v: U.pct(k.pctG1), s: 'Grade II ' + U.pct(k.pctG2) }, { l: 'Grade III', v: U.pct(k.pctG3), s: U.nf(k.g3) + ' kg', kls: k.pctG3 > 40 ? 'dn' : '' },
        { l: 'Isu aktif', v: rep.ringkasIsu.merah + ' merah · ' + rep.ringkasIsu.kuning + ' kuning', s: U.nf(k.karyawan) + ' karyawan' }]));
      var g = grid(body, 'c2'); panel(g, 'd_harian', 'Produksi harian', function () { return SPEC.harianKg(rep); }, 'bar'); panel(g, 'd_grade', 'Komposisi grade', function () { return SPEC.gradeMix(rep); }, 'donut');
      g = grid(body); panel(g, 'd_divisi', 'Produksi vs budget per divisi', function () { return SPEC.divisiKg(rep); }, 'bar'); panel(g, 'd_absdiv', 'Absensi & mangkir per divisi (%)', function () { return SPEC.absDivisi(rep); }, 'bar');
      g = grid(body, 'c2'); panel(g, 'd_mandor', 'Mandor teratas (kg)', function () { return SPEC.mandorTop(rep, 12); }, 'hbar', 'tall');
      var isu = rep.isu.slice().sort(function (a, b) { return (a.level === 'merah' ? 0 : 1) - (b.level === 'merah' ? 0 : 1); }).slice(0, 7), kar = document.createElement('div'); kar.className = 'card';
      kar.innerHTML = '<div class="chead"><h3>Isu teratas</h3><a class="btn sm sec" href="#/isu">Lihat semua</a></div>' + (isu.length ? isu.map(function (i) { return '<div class="isu ' + i.level + '" style="margin-bottom:8px"><div class="row" style="gap:8px">' + UI.lvBadge(i.level) + '<b>' + U.esc(i.aturan) + '</b><span class="muted">' + U.esc(i.entitas) + '</span></div><div>' + U.esc(i.teks) + '</div></div>'; }).join('') : UI.kosong('Tidak ada isu', 'Semua indikator berada dalam batas aman.', 'check')); g.appendChild(kar);
      g = grid(body); panel(g, 'd_absen', 'Absensi harian (%)', function () { return SPEC.harianAbsensi(rep); }, 'line'); panel(g, 'd_kode', 'Kode ketidakhadiran (hari)', function () { return SPEC.kodeDist(rep); }, 'bar');
      /* galeri 24 jenis */
      var det = document.createElement('details'); det.className = 'card'; det.style.marginTop = '14px'; det.innerHTML = '<summary style="cursor:pointer;font-weight:700">Galeri 24 jenis grafik <span class="muted" style="font-weight:400">— klik untuk menampilkan</span></summary><div class="panel c3" style="margin-top:14px" id="galeri"></div>';
      body.appendChild(det); var dibuat = false;
      det.addEventListener('toggle', function () { if (!det.open || dibuat) return; dibuat = true; var gl = $('#galeri', det);
        var peta = { line: 'harianKg', area: 'harianHadir', bar: 'divisiKg', hbar: 'mandorTop', stacked: 'gradeDivisi', step: 'harianAbsensi', combo: 'mandorTop', pie: 'gradeMix', donut: 'isuLevel', rose: 'treeDivisi', treemap: 'treeDivisi', sunburst: 'sunDivisi', funnel: 'mandorTop', radar: 'radarDivisi', polar: 'gradeDivisi', gauge: 'gaugeCapai', scatter: 'scatterAsisten', heatmap: 'heatMandor', calendar: 'calKg', boxplot: 'boxHarianDivisi', waterfall: 'waterfallSelisih', bullet: 'divisiCapai', sankey: 'sankeyAlir', river: 'riverGrade' };
        CH.JENIS.forEach(function (j) { CH.panel(gl, { id: 'gal_' + j[0], judul: j[1], spec: function () { return SPEC[peta[j[0]]](rep); }, jenis: j[0], boleh: SEMUA_JENIS, tinggi: 'sm' }); }); });
    } });
  };

  /* ============ ABSENSI ============ */
  V.absensi = function (host) {
    APP.laman(host, { judul: 'Absensi', desk: 'Kehadiran dan ketidakhadiran per orang, kemandoran, asisten, dan divisi.', isi: function (body, rep) {
      var k = rep.kpi;
      body.insertAdjacentHTML('beforeend', UI.kpi([{ l: 'Karyawan', v: U.nf(k.karyawan) }, { l: 'Hari kerja (HK)', v: U.nf(k.hk) }, { l: 'Hadir', v: U.nf(k.hadir), s: U.pct(k.pctHadir, 2) }, { l: 'Absensi', v: U.pct(k.pctAbsen, 2), s: 'M + P1 dibagi HK' }, { l: 'Mangkir', v: U.pct(k.pctMangkir, 2), s: U.nf(k.mangkir) + ' hari', kls: k.pctMangkir > 1.5 ? 'dn' : '' }]));
      tab(body, [
        ['ringkas', 'Ringkasan', function (h) {
          var g = grid(h); panel(g, 'a_div', 'Per divisi (%)', function () { return SPEC.absDivisi(rep); }, 'bar'); panel(g, 'a_as', 'Per asisten (%)', function () { return SPEC.absAsisten(rep); }, 'hbar', 'tall');
          g = grid(h); panel(g, 'a_dept', 'Per departemen (%)', function () { return SPEC.absDept(rep); }, 'bar'); panel(g, 'a_mand', 'Kemandoran tertinggi (%)', function () { return SPEC.absMandorTop(rep, 15); }, 'hbar', 'tall');
          var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<div class="chead"><h3>Tabel rincian</h3><select id="absSel" style="width:auto;height:30px"><option value="absDivisi">Divisi</option><option value="absAsisten">Asisten</option><option value="absDept">Departemen</option><option value="absMandor">Kemandoran</option></select></div><div id="absTbl"></div>'; h.appendChild(c);
          var kol = [{ k: 'nama', l: 'Nama' }, { k: 'orang', l: 'Orang', num: 1 }, { k: 'hk', l: 'HK', num: 1 }, { k: 'hadir', l: 'Hadir', num: 1 }, { k: 'mangkir', l: 'Mangkir', num: 1 }, { k: 'absen', l: 'Tidak hadir', num: 1 }, { k: 'pctAbsen', l: '% Absensi', num: 1, d: 2, f: function (v) { return '<span class="badge ' + (v > 10 ? 'bad' : v > 7 ? 'warn' : 'ok') + '">' + U.pct(v, 2) + '</span>'; } }, { k: 'pctMangkir', l: '% Mangkir', num: 1, d: 2, f: function (v) { return '<span class="badge ' + (v > 2.5 ? 'bad' : v > 1.5 ? 'warn' : 'ok') + '">' + U.pct(v, 2) + '</span>'; } }];
          var t = UI.tabel($('#absTbl', c), kol, rep.absDivisi || [], { urut: 'pctAbsen' }); $('#absSel', c).addEventListener('change', function () { t.set(rep[this.value] || []); });
        }],
        ['orang', 'Per orang', function (h) {
          if (rep.orangTotal) h.insertAdjacentHTML('beforeend', '<div class="badge warn" style="display:block;border-radius:10px;padding:8px 12px;margin-bottom:10px;white-space:normal">Menampilkan ' + U.nf(rep.orang.length) + ' karyawan dengan ketidakhadiran tertinggi dari ' + U.nf(rep.orangTotal) + '. Gunakan filter divisi/asisten/mandor atau periode lebih pendek untuk daftar lengkap, atau ekspor Excel.</div>');
          UI.tabel(h, [{ k: 'nama', l: 'Nama' }, { k: 'reg', l: 'REG', f: function (v) { return '<span class="mono">' + U.esc(v) + '</span>'; } }, { k: 'status', l: 'Status' }, { k: 'dept', l: 'Dept' }, { k: 'kemandoran', l: 'Kemandoran' }, { k: 'asisten', l: 'Asisten' }, { k: 'divisi', l: 'Divisi' }, { k: 'hk', l: 'HK', num: 1 }, { k: 'hadir', l: 'Hadir', num: 1 }, { k: 'mangkir', l: 'Mangkir', num: 1 }, { k: 'absen', l: 'Tdk hadir', num: 1 }, { k: 'maxBeruntun', l: 'Beruntun', num: 1, f: function (v, r) { return v >= 3 ? '<span class="badge ' + (v >= 5 ? 'bad' : 'warn') + '" title="Mulai ' + U.esc(r.tglBeruntun) + '">' + v + ' hari</span>' : (v || '–'); } }, { k: 'kode', l: 'Kode', f: function (v) { return Object.keys(v || {}).filter(function (c) { return ['K', 'MG', 'HB', 'OUT'].indexOf(c) < 0; }).map(function (c) { return U.kodeBadge(c) + '<small>×' + v[c] + '</small>'; }).join(' '); } }], rep.orang, { urut: 'absen', ukuran: 25, geser: true });
        }],
        ['kode', 'Kode absensi', function (h) {
          var g = grid(h); panel(g, 'a_kode', 'Sebaran kode (hari)', function () { return SPEC.kodeAll(rep); }, 'donut');
          var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Keterangan kode</h3>'; g.appendChild(c); var kc = rep.kodeCount || {};
          UI.tabel(c, [{ k: 'kode', l: 'Kode', f: function (v) { return U.kodeBadge(v); } }, { k: 'ket', l: 'Keterangan' }, { k: 'n', l: 'Jumlah hari', num: 1 }], Object.keys(kc).map(function (x) { return { kode: x, ket: U.kodeNama(x) || GRID.kodeKet[x] || 'Kode baru (terdeteksi otomatis)', n: kc[x] }; }), { cari: false, urut: 'n' });
          g.insertAdjacentHTML('beforeend', U.legendaKode());
          if (Object.keys(rep.kodeBaru || {}).length) c.insertAdjacentHTML('beforeend', '<p class="muted">Kode baru di luar daftar standar terdeteksi dan disertakan otomatis.</p>');
        }],
        ['excel', 'Tampilan Excel', function (h) { cerminPilih(h, 'ABS'); }]
      ]);
    } });
  };

  /* pemilih dataset-periode untuk tampilan cermin */
  function cerminPilih(host, dsAwal) {
    var reg = ((APP.S.status && APP.S.status.registri) || []).filter(function (r) { return r.adaCermin; });
    if (!reg.length) { host.innerHTML = '<div class="card">' + UI.kosong('Belum ada data', 'Unggah Excel terlebih dahulu agar tampilan tabel muncul di sini.', 'upload') + '</div>'; return; }
    var ds = {}; reg.forEach(function (r) { ds[r.dataset] = 1; });
    var daftarDs = Object.keys(ds); var awal = daftarDs.indexOf(dsAwal) >= 0 ? dsAwal : daftarDs[0];
    host.innerHTML = '<div class="bar"><select id="cDs" aria-label="Jenis data">' + daftarDs.map(function (d) { return '<option value="' + d + '"' + (d === awal ? ' selected' : '') + '>' + U.esc((XL.NAMA_DS[d] || d) + ' (' + d + ')') + '</option>'; }).join('') + '</select><select id="cPr" aria-label="Periode"></select></div><div id="cIsi"></div>';
    var sDs = $('#cDs', host), sPr = $('#cPr', host), isi = $('#cIsi', host);
    function isiPeriode() { var per = reg.filter(function (r) { return r.dataset === sDs.value; }).map(function (r) { return r.periode; }).sort().reverse(); sPr.innerHTML = per.map(function (p) { return '<option>' + U.esc(p) + '</option>'; }).join(''); var pil = APP.periode().to.slice(0, 7); if (per.indexOf(pil) >= 0) sPr.value = pil; tampil(); }
    function tampil() { UI.cermin(isi, sDs.value, sPr.value); }
    sDs.addEventListener('change', isiPeriode); sPr.addEventListener('change', tampil); isiPeriode();
  }
  APP.cerminPilih = cerminPilih;

  /* ============ PRODUKSI ============ */
  V.produksi = function (host) {
    APP.laman(host, { judul: 'Produksi', desk: 'Budget, realisasi, selisih, dan grade per mandor, asisten, dan divisi.', isi: function (body, rep) {
      var k = rep.kpi;
      body.insertAdjacentHTML('beforeend', UI.kpi([{ l: 'Budget', v: U.nf(k.budget) + ' kg', s: (k.budgetSd && Math.abs(k.budgetSd - k.budget) > 0.5 ? 'Target s/d ' + U.tglID(k.tglBerjalan, true) + ': ' + U.nf(k.budgetSd) + ' kg (' + U.pct(k.pctCapaiSd) + ')' : '') }, { l: 'Produksi', v: U.nf(k.kg) + ' kg' }, { l: 'Pencapaian', v: U.pct(k.pctCapai), s: (k.selisih >= 0 ? '+' : '') + U.nf(k.selisih) + ' kg', kls: k.selisih >= 0 ? 'up' : 'dn' }, { l: 'Kg per HK', v: U.nf(k.kgPerHk, 1), s: 'Produksi ÷ orang hadir memetik' }, { l: 'Grade I / II / III', v: U.pct(k.pctG1, 0) + ' / ' + U.pct(k.pctG2, 0) + ' / ' + U.pct(k.pctG3, 0) }]));
      var kolPr = function (judulNama, kunci) { return [{ k: kunci, l: judulNama }, { k: 'budget', l: 'Budget (kg)', num: 1 }, { k: 'kg', l: 'Produksi (kg)', num: 1 }, { k: 'pctCapai', l: '% Capai', num: 1, f: function (v) { return UI.capaiBadge(v); } }, { k: 'selisih', l: 'Selisih (kg)', num: 1, f: function (v) { return '<span style="color:' + (v < 0 ? 'var(--bad)' : 'var(--ok)') + '">' + (v > 0 ? '+' : '') + U.nf(v) + '</span>'; } }, { k: 'g1', l: 'Grade I', num: 1 }, { k: 'g2', l: 'Grade II', num: 1 }, { k: 'g3', l: 'Grade III', num: 1 }, { k: 'pctG1', l: '% G1', num: 1, d: 1 }, { k: 'pctG3', l: '% G3', num: 1, d: 1, f: function (v) { return '<span class="' + (v > 40 ? 'badge bad' : '') + '">' + U.pct(v) + '</span>'; } }, { k: 'kgPerHk', l: 'Kg/HK', num: 1, d: 1 }]; };
      tab(body, [
        ['mandor', 'Mandor', function (h) {
          var g = grid(h); panel(g, 'p_mand', 'Budget vs produksi per mandor', function () { return SPEC.mandorSebar(rep); }, 'bar'); panel(g, 'p_capai', 'Pencapaian per mandor (%)', function () { return SPEC.mandorCapai(rep); }, 'hbar', 'tall');
          g = grid(h); panel(g, 'p_heat', 'Produksi harian per mandor (12 teratas)', function () { return SPEC.heatMandor(rep, 12); }, 'heatmap', 'tall'); panel(g, 'p_sel', 'Selisih vs budget (kg)', function () { return SPEC.mandorSelisih(rep); }, 'hbar', 'tall');
          var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Rincian per mandor</h3>'; h.appendChild(c);
          UI.tabel(c, [{ k: 'divisi', l: 'Divisi', f: function (v, r) { return U.esc(v + ' / ' + (r.sub || '')); } }, { k: 'asisten', l: 'Asisten' }].concat(kolPr('Mandor', 'mandor')), rep.mandor, { urut: 'kg' });
        }],
        ['asisten', 'Asisten', function (h) { var g = grid(h); panel(g, 'p_asis', 'Produksi vs budget per asisten', function () { return SPEC.asistenKg(rep); }, 'bar'); panel(g, 'p_gras', 'Grade per asisten', function () { return SPEC.gradeAsisten(rep); }, 'stacked'); var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Rincian per asisten</h3>'; h.appendChild(c); UI.tabel(c, kolPr('Asisten', 'nama'), rep.asisten, { urut: 'kg' }); }],
        ['divisi', 'Divisi', function (h) { var g = grid(h); panel(g, 'p_div', 'Produksi vs budget per divisi', function () { return SPEC.divisiKg(rep); }, 'bar'); panel(g, 'p_pdiv', 'Pencapaian per divisi (%)', function () { return SPEC.divisiPersen(rep); }, 'bar'); g = grid(h); panel(g, 'p_grdiv', 'Grade per divisi', function () { return SPEC.gradeDivisi(rep); }, 'stacked'); panel(g, 'p_khk', 'Kg per HK per divisi', function () { return SPEC.divisiKgHk(rep); }, 'bar'); var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Rincian per divisi / sub</h3>'; h.appendChild(c); UI.tabel(c, kolPr('Divisi / Sub', 'nama'), rep.divisi, { urut: 'kg' }); }],
        ['harian', 'Harian', function (h) {
          var g = grid(h); panel(g, 'p_hkg', 'Produksi harian (kg)', function () { return SPEC.harianKg(rep); }, 'bar'); panel(g, 'p_hgr', 'Grade harian', function () { return SPEC.harianGrade(rep); }, 'stacked');
          var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Rincian harian</h3>'; h.appendChild(c);
          UI.tabel(c, [{ k: 'tgl', l: 'Tanggal', f: function (v) { return U.esc(U.hariNama(v) + ', ' + U.tglID(v, true)); } }, { k: 'kg', l: 'Produksi (kg)', num: 1 }, { k: 'g1', l: 'Grade I', num: 1 }, { k: 'g2', l: 'Grade II', num: 1 }, { k: 'g3', l: 'Grade III', num: 1 }, { k: 'hadir', l: 'Hadir', num: 1 }, { k: 'absen', l: 'Tdk hadir', num: 1 }, { k: 'mangkir', l: 'Mangkir', num: 1 }, { k: 'pctAbsen', l: '% Absensi', num: 1, d: 2 }, { k: 'pctMangkir', l: '% Mangkir', num: 1, d: 2 }], rep.harian, { urut: 'tgl', arah: 1, ukuran: 31, cari: false });
        }],
        ['upkeep', 'Upkeep', function (h) {
          if (!(rep.upkeep || []).length) { h.innerHTML = '<div class="card">' + UI.kosong('Belum ada data upkeep', 'Unggah berkas "Produksi Karyawan Upkeep" agar tabel ini terisi.', 'leaf') + '</div>'; return; }
          var g = grid(h, 'c2e'); panel(g, 'p_upk', 'Produksi upkeep per mandor', function () { return SPEC.upkeep(rep); }, 'stacked');
          var c = document.createElement('div'); c.className = 'card'; c.innerHTML = '<h3>Rincian upkeep</h3>'; g.appendChild(c);
          UI.tabel(c, [{ k: 'mandor', l: 'Mandor' }, { k: 'divisi', l: 'Divisi' }, { k: 'kg', l: 'Total (kg)', num: 1 }, { k: 'g1', l: 'Grade I', num: 1 }, { k: 'g2', l: 'Grade II', num: 1 }, { k: 'g3', l: 'Grade III', num: 1 }, { k: 'hariData', l: 'Hari', num: 1 }], rep.upkeep, { urut: 'kg' });
        }],
        ['excel', 'Tampilan Excel', function (h) { cerminPilih(h, 'REK'); }]
      ]);
    } });
  };

  /* ============ REKAP ============ */
  V.rekap = function (host) {
    host.innerHTML = '<div class="head"><div><h1>Rekap</h1><p>Seluruh tabel Excel yang pernah diunggah, ditampilkan sama persis dengan kolom aslinya.</p></div></div><div id="rkTbl"></div><div id="rkIsi" style="margin-top:16px"></div>';
    APP.muatStatus().then(function (st) {
      var reg = st.registri.slice().sort(function (a, b) { return (b.periode + b.dataset) < (a.periode + a.dataset) ? -1 : 1; });
      var c = $('#rkTbl'); c.innerHTML = '<div class="card"><h3>Data yang tersedia</h3><div id="rkT"></div></div>';
      if (!reg.length) { c.innerHTML = '<div class="card">' + UI.kosong('Belum ada data', APP.izin('unggah') ? 'Mulai dengan menu Unggah Excel.' : 'Hubungi Admin untuk mengunggah data.', 'upload') + '</div>'; return; }
      UI.tabel($('#rkT', c), [{ k: 'dataset', l: 'Jenis', f: function (v) { return '<b>' + U.esc(v) + '</b> <span class="muted">' + U.esc(XL.NAMA_DS[v] || '') + '</span>'; } }, { k: 'periode', l: 'Periode' }, { k: 'baris', l: 'Baris', num: 1 }, { k: 'kolom', l: 'Kolom', num: 1 }, { k: 'tglMaks', l: 'Tanggal terakhir', f: function (v) { return v ? U.tglID(v, true) : '–'; } }, { k: 'diperbarui', l: 'Diperbarui', f: function (v, r) { return U.waktuID(v) + ' · ' + U.esc(r.oleh); } }, { k: 'adaCermin', l: '', f: function (v, r) { return v ? '<button class="btn sm sec" data-buka="' + r.dataset + '|' + r.periode + '">Buka tabel</button>' : ''; } }], reg, { ukuran: 10, setelah: function (h) { U.$$('[data-buka]', h).forEach(function (b) { b.onclick = function () { var p = b.dataset.buka.split('|'); var isi = $('#rkIsi'); isi.innerHTML = '<div class="card"><h3>' + U.esc(p[0] + ' — ' + p[1]) + '</h3><div id="rkC"></div></div>'; UI.cermin($('#rkC', isi), p[0], p[1]); isi.scrollIntoView({ behavior: 'smooth' }); }; }); } });
    }).catch(function (e) { UI.galat($('#rkTbl'), e); });
  };
})(window);
