/* AWS Daily Report v1.0.15 — ekspor Excel, CSV, PowerPoint, PDF (cetak) */
(function (w) {
  'use strict';
  var EX = {};
  function judulMeta(rep, meta) { return (meta && meta.judul) || 'Laporan Harian'; }
  function rentang(rep) { return rep.from === rep.to ? U.tglID(rep.from) : U.tglID(rep.from) + ' – ' + U.tglID(rep.to); }
  EX.nama = function (rep, ekst) { return 'AWS-Laporan_' + rep.from + (rep.from === rep.to ? '' : '_sd_' + rep.to) + '.' + ekst; };

  /* tabel-tabel yang dipakai bersama oleh Excel/CSV/PDF */
  EX.tabel = function (rep) {
    var k = rep.kpi;
    var T = {};
    T.Ringkasan = [['Indikator', 'Nilai'], ['Periode', rentang(rep)], ['Budget (kg)', k.budget], ['Produksi (kg)', k.kg], ['Pencapaian (%)', k.pctCapai], ['Selisih (kg)', k.selisih], ['Grade I (kg)', k.g1], ['Grade II (kg)', k.g2], ['Grade III (kg)', k.g3], ['Grade I (%)', k.pctG1], ['Grade II (%)', k.pctG2], ['Grade III (%)', k.pctG3], ['Karyawan', k.karyawan], ['HK', k.hk], ['Hadir (HK)', k.hadir], ['Kehadiran (%)', k.pctHadir], ['Absensi (%)', k.pctAbsen], ['Mangkir (hari)', k.mangkir], ['Mangkir (%)', k.pctMangkir], ['Kg per HK', k.kgPerHk], ['Isu merah', rep.ringkasIsu.merah], ['Isu kuning', rep.ringkasIsu.kuning]];
    T.Harian = [['Tanggal', 'Hadir', 'Tidak hadir', 'Mangkir', 'Libur', 'Produksi (kg)', 'Grade I', 'Grade II', 'Grade III', '% Absensi', '% Mangkir']].concat(rep.harian.map(function (h) { return [h.tgl, h.hadir, h.absen, h.mangkir, h.libur, h.kg, h.g1, h.g2, h.g3, h.pctAbsen, h.pctMangkir]; }));
    T.Mandor = [['Divisi', 'Sub', 'Asisten', 'Mandor', 'Budget (kg)', 'Produksi (kg)', 'Pencapaian (%)', 'Selisih (kg)', 'Grade I', 'Grade II', 'Grade III', '% G1', '% G3', 'Kg/HK']].concat(rep.mandor.map(function (m) { return [m.divisi, m.sub, m.asisten, m.mandor, m.budget, m.kg, m.pctCapai, m.selisih, m.g1, m.g2, m.g3, m.pctG1, m.pctG3, m.kgPerHk]; }));
    T.Asisten = [['Asisten', 'Mandor', 'Budget (kg)', 'Produksi (kg)', 'Pencapaian (%)', 'Selisih (kg)', 'Grade I', 'Grade II', 'Grade III', 'Kg/HK']].concat(rep.asisten.map(function (a) { return [a.nama, a.jumlahMandor, a.budget, a.kg, a.pctCapai, a.selisih, a.g1, a.g2, a.g3, a.kgPerHk]; }));
    T.Divisi = [['Divisi / Sub', 'Mandor', 'Budget (kg)', 'Produksi (kg)', 'Pencapaian (%)', 'Selisih (kg)', 'Grade I', 'Grade II', 'Grade III', 'Kg/HK']].concat(rep.divisi.map(function (a) { return [a.nama, a.jumlahMandor, a.budget, a.kg, a.pctCapai, a.selisih, a.g1, a.g2, a.g3, a.kgPerHk]; }));
    var ab = function (arr, judul) { return [[judul, 'Orang', 'HK', 'Hadir', 'Mangkir', 'Tidak hadir', '% Absensi', '% Mangkir']].concat((arr || []).map(function (a) { return [a.nama, a.orang, a.hk, a.hadir, a.mangkir, a.absen, a.pctAbsen, a.pctMangkir]; })); };
    T['Absensi Divisi'] = ab(rep.absDivisi, 'Divisi'); T['Absensi Asisten'] = ab(rep.absAsisten, 'Asisten'); T['Absensi Dept'] = ab(rep.absDept, 'Departemen'); T['Absensi Mandor'] = ab(rep.absMandor, 'Kemandoran');
    T['Per Orang'] = [['Nama', 'REG', 'Status', 'Dept', 'Kemandoran', 'Asisten', 'Askep', 'Divisi', 'Sub', 'HK', 'Hadir', 'Mangkir', 'Tidak hadir', 'Mangkir beruntun maks', 'Kode']].concat((rep.orang || []).map(function (o) { return [o.nama, o.reg, o.status, o.dept, o.kemandoran, o.asisten, o.askep, o.divisi, o.sub, o.hk, o.hadir, o.mangkir, o.absen, o.maxBeruntun, Object.keys(o.kode || {}).map(function (c) { return c + ':' + o.kode[c]; }).join(' ')]; }));
    T.Isu = [['Aturan', 'Tingkat', 'Cakupan', 'Entitas', 'Nilai', 'Uraian', 'Rekomendasi', 'Status', 'Catatan']].concat(rep.isu.map(function (i) { return [i.aturan, i.level, i.scope, i.entitas, i.nilai, i.teks, i.rekomendasi, i.status, i.catatan]; }));
    return T;
  };
  EX.excel = function (rep) {
    var T = EX.tabel(rep), wb = XLSX.utils.book_new();
    Object.keys(T).forEach(function (n) {
      var ws = XLSX.utils.aoa_to_sheet(T[n]), lebar = []; T[n].slice(0, 200).forEach(function (r) { r.forEach(function (v, i) { lebar[i] = Math.max(lebar[i] || 8, Math.min(48, String(v === null || v === undefined ? '' : v).length + 2)); }); });
      ws['!cols'] = lebar.map(function (x) { return { wch: x }; }); ws['!freeze'] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(wb, ws, n.slice(0, 31));
    });
    var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    U.unduh(EX.nama(rep, 'xlsx'), new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  };
  EX.csv = function (rep, bagian) {
    var T = EX.tabel(rep); if (!T[bagian]) throw new Error('Bagian tidak dikenal.');
    U.unduh('AWS-' + bagian.replace(/\s+/g, '_') + '_' + rep.from + (rep.from === rep.to ? '' : '_sd_' + rep.to) + '.csv', new Blob([U.csvKe(T[bagian])], { type: 'text/csv;charset=utf-8' }));
  };
  EX.logoData = function () {
    if (EX._logo) return Promise.resolve(EX._logo);
    return fetch('assets/logo.png').then(function (r) { return r.blob(); }).then(function (b) { return new Promise(function (res) { var f = new FileReader(); f.onload = function () { EX._logo = f.result; res(f.result); }; f.readAsDataURL(b); }); }).catch(function () { return ''; });
  };
  /* kumpulan grafik standar untuk PPT/PDF */
  EX.grafik = function (rep) {
    var G = [
      ['Produksi harian (kg)', 'bar', SPEC.harianKg(rep)], ['Komposisi grade', 'donut', SPEC.gradeMix(rep)], ['Produksi vs budget per divisi', 'bar', SPEC.divisiKg(rep)],
      ['Grade per divisi', 'stacked', SPEC.gradeDivisi(rep)], ['Absensi & mangkir per divisi (%)', 'bar', SPEC.absDivisi(rep)], ['Absensi harian (%)', 'line', SPEC.harianAbsensi(rep)]
    ];
    return G.filter(function (g) { return g[2].cats && g[2].cats.length; }).map(function (g) { return { judul: g[0], img: CH.png(g[1], g[2], 900, 400) }; }).filter(function (g) { return g.img; });
  };
  EX.ppt = function (rep, meta) {
    if (!w.PptxGenJS) return Promise.reject(new Error('Pustaka PowerPoint belum termuat.'));
    return EX.logoData().then(function (logo) {
      var p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.title = 'Laporan Harian AWS'; p.company = (meta && meta.perusahaan) || 'PT. Agri Wangi Sentosa';
      var HIJAU = '166534', K = rep.kpi, f = function (n, d) { return U.nf(n, d); };
      var kop = function (s, judul) { s.background = { color: 'FFFFFF' }; s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: HIJAU } }); s.addText(judul, { x: 0.5, y: 0.12, w: 9.5, h: 0.66, fontSize: 22, bold: true, color: 'FFFFFF', fontFace: 'Calibri' }); if (logo) s.addImage({ data: logo, x: 10.6, y: 0.1, w: 2.4, h: 0.7, sizing: { type: 'contain', w: 2.4, h: 0.7 } }); s.addText(rentang(rep) + ' · ' + ((meta && meta.perusahaan) || 'PT. Agri Wangi Sentosa'), { x: 0.5, y: 7.05, w: 12.3, h: 0.3, fontSize: 10, color: '6B7280' }); };
      var s = p.addSlide(); s.background = { color: HIJAU };
      if (logo) s.addShape(p.ShapeType.roundRect, { x: 0.8, y: 0.8, w: 4.2, h: 1.4, fill: { color: 'FFFFFF' }, rectRadius: 0.15 }), s.addImage({ data: logo, x: 0.95, y: 0.9, w: 3.9, h: 1.2, sizing: { type: 'contain', w: 3.9, h: 1.2 } });
      s.addText('Laporan Harian Produksi & Absensi', { x: 0.8, y: 3, w: 11.5, h: 1, fontSize: 38, bold: true, color: 'FFFFFF' }); s.addText(rentang(rep), { x: 0.8, y: 4.1, w: 11.5, h: 0.6, fontSize: 22, color: 'D1FAE5' }); s.addText((meta && meta.perusahaan) || 'PT. Agri Wangi Sentosa', { x: 0.8, y: 6.6, w: 11.5, h: 0.4, fontSize: 14, color: 'D1FAE5' });
      s = p.addSlide(); kop(s, 'Ringkasan Utama');
      var kartu = [['Budget', f(K.budget) + ' kg'], ['Produksi', f(K.kg) + ' kg'], ['Pencapaian', U.pct(K.pctCapai)], ['Selisih', f(K.selisih) + ' kg'], ['Kehadiran', U.pct(K.pctHadir, 2)], ['Mangkir', U.pct(K.pctMangkir, 2)], ['Kg per HK', f(K.kgPerHk, 1)], ['Isu merah / kuning', rep.ringkasIsu.merah + ' / ' + rep.ringkasIsu.kuning]];
      kartu.forEach(function (c, i) { var x = 0.5 + (i % 4) * 3.1, y = 1.3 + Math.floor(i / 4) * 1.7; s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: 2.9, h: 1.5, fill: { color: 'F4F7F5' }, line: { color: 'DCE5DF', width: 1 }, rectRadius: 0.12 }); s.addText(c[0], { x: x + 0.15, y: y + 0.12, w: 2.6, h: 0.35, fontSize: 12, color: '5B6F63', bold: true }); s.addText(c[1], { x: x + 0.15, y: y + 0.55, w: 2.6, h: 0.7, fontSize: 24, bold: true, color: '0F1F17' }); });
      s.addText('Grade I ' + U.pct(K.pctG1) + '  ·  Grade II ' + U.pct(K.pctG2) + '  ·  Grade III ' + U.pct(K.pctG3) + '  ·  Karyawan ' + f(K.karyawan) + '  ·  HK ' + f(K.hk), { x: 0.5, y: 5, w: 12.3, h: 0.5, fontSize: 14, color: '334155' });
      EX.grafik(rep).forEach(function (g) { var sl = p.addSlide(); kop(sl, g.judul); sl.addImage({ data: g.img, x: 0.6, y: 1.15, w: 12.1, h: 5.4, sizing: { type: 'contain', w: 12.1, h: 5.4 } }); });
      var th = { bold: true, color: 'FFFFFF', fill: { color: HIJAU }, fontSize: 10 };
      var tab = function (judul, kepala, baris) {
        U.potong(baris, 13).forEach(function (bag, i) { var sl = p.addSlide(); kop(sl, judul + (i ? ' (lanj.)' : '')); sl.addTable([kepala.map(function (h) { return { text: h, options: th }; })].concat(bag.map(function (r) { return r.map(function (v) { return { text: String(v === undefined || v === null ? '' : v), options: { fontSize: 10 } }; }); })), { x: 0.5, y: 1.15, w: 12.3, border: { type: 'solid', color: 'DCE5DF', pt: 0.5 }, colW: kepala.map(function () { return 12.3 / kepala.length; }) }); });
      };
      if (rep.mandor.length) tab('Produksi per Mandor', ['Divisi', 'Mandor', 'Budget', 'Produksi', '% Capai', 'Selisih', '% G1', '% G3'], rep.mandor.slice().sort(function (a, b) { return b.kg - a.kg; }).slice(0, 26).map(function (m) { return [m.divisi + ' / ' + m.sub, m.mandor, f(m.budget), f(m.kg), U.pct(m.pctCapai), f(m.selisih), U.pct(m.pctG1), U.pct(m.pctG3)]; }));
      if (rep.isu.length) tab('Isu & Rekomendasi', ['Aturan', 'Tingkat', 'Entitas', 'Uraian', 'Rekomendasi'], rep.isu.slice(0, 26).map(function (i) { return [i.aturan, i.level === 'merah' ? 'Merah' : 'Kuning', i.entitas, i.teks, i.rekomendasi]; }));
      return p.write({ outputType: 'blob' }).then(function (blob) { U.unduh(EX.nama(rep, 'pptx'), blob); });
    });
  };
  /* PPTX dari deck Presentasi (slide + narasi yang sama dengan layar) */
  EX.pptDeck = function (deck, rep) {
    if (!w.PptxGenJS) return Promise.reject(new Error('Pustaka PowerPoint belum termuat.'));
    return EX.logoData().then(function (logo) {
      var p = new PptxGenJS(); p.layout = 'LAYOUT_WIDE'; p.title = 'Presentasi Data AWS'; p.company = 'PT. Agri Wangi Sentosa';
      var HIJAU = '166534', WARNA = { ok: '166534', warn: 'B45309', bad: 'B91C1C' }, N = deck.slides.length;
      function kop(s, sl, i) {
        s.background = { color: 'FFFFFF' }; s.addShape(p.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: HIJAU } });
        s.addText(sl.judul, { x: 0.4, y: 0.1, w: 10, h: 0.7, fontSize: 20, bold: true, color: 'FFFFFF', fontFace: 'Calibri', fit: 'shrink' });
        if (logo) { s.addShape(p.ShapeType.roundRect, { x: 10.85, y: 0.1, w: 2.3, h: 0.7, fill: { color: 'FFFFFF' }, rectRadius: 0.08 }); s.addImage({ data: logo, x: 10.9, y: 0.12, w: 2.2, h: 0.66, sizing: { type: 'contain', w: 2.2, h: 0.66 } }); }
        if (sl.sub) s.addText(sl.sub, { x: 0.4, y: 0.95, w: 9.5, h: 0.35, fontSize: 11, color: '6B7280', italic: true });
        if (sl.status1) s.addText('Penilaian: ' + sl.status1[0], { x: 9.9, y: 0.95, w: 3, h: 0.35, fontSize: 12, bold: true, align: 'right', color: WARNA[sl.status1[1]] });
        s.addText('PT. Agri Wangi Sentosa · ' + (i + 1) + ' / ' + N, { x: 0.4, y: 7.1, w: 12.5, h: 0.3, fontSize: 9, color: '6B7280' });
      }
      function teks(arr) { return arr.map(function (t) { return { text: t, options: { bullet: true, breakLine: true } }; }); }
      var th = { bold: true, color: 'FFFFFF', fill: { color: HIJAU }, fontSize: 10 };
      deck.slides.forEach(function (sl, i) {
        var s = p.addSlide();
        if (sl.tipe === 'cover') {
          s.background = { color: HIJAU };
          if (logo) { s.addShape(p.ShapeType.roundRect, { x: 0.8, y: 0.8, w: 4.2, h: 1.4, fill: { color: 'FFFFFF' }, rectRadius: 0.15 }); s.addImage({ data: logo, x: 0.95, y: 0.9, w: 3.9, h: 1.2, sizing: { type: 'contain', w: 3.9, h: 1.2 } }); }
          s.addText(sl.judul, { x: 0.8, y: 2.9, w: 11.5, h: 1, fontSize: 38, bold: true, color: 'FFFFFF' }); s.addText(sl.sub, { x: 0.8, y: 3.9, w: 11.5, h: 0.5, fontSize: 18, color: 'D1FAE5' });
          s.addText(sl.catatan, { x: 0.8, y: 4.6, w: 11.5, h: 0.5, fontSize: 20, color: 'FFFFFF' }); s.addText(sl.catatan2, { x: 0.8, y: 6.6, w: 11.5, h: 0.4, fontSize: 12, color: 'D1FAE5' }); return;
        }
        kop(s, sl, i); var y = 1.4;
        if (sl.peringatan) { s.addText('⚠ ' + sl.peringatan, { x: 0.4, y: y, w: 12.5, h: 0.45, fontSize: 11, color: '92400E', fill: { color: 'FEF3C7' } }); y += 0.55; }
        if (sl.status) { var w4 = 12.5 / sl.status.length; sl.status.forEach(function (b, j) { var x = 0.4 + j * w4; s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: w4 - 0.15, h: 1.5, fill: { color: 'F4F7F5' }, line: { color: WARNA[b.kls], width: 1.5 }, rectRadius: 0.1 }); s.addText(b.n, { x: x + 0.1, y: y + 0.05, w: w4 - 0.35, h: 0.3, fontSize: 11, bold: true, color: '5B6F63' }); s.addText(b.v, { x: x + 0.1, y: y + 0.38, w: w4 - 0.35, h: 0.5, fontSize: 20, bold: true, color: '0F1F17' }); s.addText(b.s + ' · ' + b.label, { x: x + 0.1, y: y + 0.95, w: w4 - 0.35, h: 0.45, fontSize: 10, bold: true, color: WARNA[b.kls] }); }); y += 1.65; }
        if (sl.kpi) { var wk = 12.5 / sl.kpi.length; sl.kpi.forEach(function (c, j) { var x = 0.4 + j * wk; s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: wk - 0.15, h: 1.15, fill: { color: 'F4F7F5' }, line: { color: 'DCE5DF', width: 1 }, rectRadius: 0.1 }); s.addText(c.l, { x: x + 0.1, y: y + 0.05, w: wk - 0.35, h: 0.28, fontSize: 10, bold: true, color: '5B6F63' }); s.addText(String(c.v), { x: x + 0.1, y: y + 0.33, w: wk - 0.35, h: 0.45, fontSize: 18, bold: true, color: '0F1F17', fit: 'shrink' }); if (c.s) s.addText(c.s, { x: x + 0.1, y: y + 0.8, w: wk - 0.35, h: 0.28, fontSize: 9, color: '6B7280', fit: 'shrink' }); }); y += 1.3; }
        var ch = (sl.charts || []).map(function (c) { try { return { j: c.judul, img: CH.png(c.jenis, c.spec(), 900, 400) }; } catch (e) { return null; } }).filter(function (c) { return c && c.img; });
        var sisa = 7.0 - y, nar = sl.narasi && sl.narasi.length;
        if (ch.length) { var hc = nar || sl.tabel ? Math.min(3.0, sisa * 0.55) : sisa - 0.1, wc = 12.5 / ch.length; ch.forEach(function (c, j) { s.addText(c.j, { x: 0.4 + j * wc, y: y, w: wc - 0.1, h: 0.25, fontSize: 10, bold: true, color: HIJAU }); s.addImage({ data: c.img, x: 0.4 + j * wc, y: y + 0.27, w: wc - 0.1, h: hc - 0.3, sizing: { type: 'contain', w: wc - 0.1, h: hc - 0.3 } }); }); y += hc; }
        if (sl.tabel) { var bar = sl.tabel.baris.slice(0, Math.max(3, Math.floor((7.0 - y - 0.5) / 0.27))); if (sl.tabel.judul) { s.addText(sl.tabel.judul, { x: 0.4, y: y, w: 12.5, h: 0.25, fontSize: 10, bold: true, color: HIJAU }); y += 0.27; } s.addTable([sl.tabel.kepala.map(function (h) { return { text: h, options: th }; })].concat(bar.map(function (r) { return r.map(function (v) { return { text: String(v === undefined || v === null ? '' : v), options: { fontSize: 9 } }; }); })), { x: 0.4, y: y, w: 12.5, border: { type: 'solid', color: 'DCE5DF', pt: 0.5 }, colW: sl.tabel.kepala.map(function () { return 12.5 / sl.tabel.kepala.length; }) }); y += (bar.length + 1) * 0.27 + 0.1; }
        if (nar) { s.addText([{ text: (sl.judulNarasi || 'Penjelasan'), options: { bold: true, color: HIJAU, breakLine: true } }].concat(teks(sl.narasi)), { x: 0.4, y: y, w: 12.5, h: Math.max(0.8, 7.0 - y), fontSize: 12, color: '1F2937', valign: 'top', fit: 'shrink' }); }
        if (sl.kol3) {
          var kk = [], k3 = sl.kol3;
          if (k3.kel && k3.kel.length) kk.push(['✔ Kelebihan', '166534', 'F0FDF4', k3.kel]);
          if (k3.kur && k3.kur.length) kk.push(['✖ Kekurangan', 'B91C1C', 'FEF2F2', k3.kur]);
          if (k3.rek && k3.rek.length) kk.push(['➜ Rekomendasi', '1D4ED8', 'EFF6FF', k3.rek.map(function (r) { return '[' + r.p + '] ' + r.t; })]);
          var wk3 = 12.5 / (kk.length || 1), hk = Math.min(7.0 - y, 4.6), fk = kk.length === 1 ? 14 : 12.5;
          kk.forEach(function (c, j) { var x = 0.4 + j * wk3; s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: wk3 - 0.15, h: hk, fill: { color: c[2] }, line: { color: c[1], width: 1 }, rectRadius: 0.08 }); s.addText([{ text: c[0], options: { bold: true, color: c[1], breakLine: true, fontSize: 13 } }].concat(teks(c[3])), { x: x + 0.1, y: y + 0.05, w: wk3 - 0.35, h: hk - 0.1, fontSize: fk, color: '1F2937', valign: 'top', fit: 'shrink' }); });
        }
        if (sl.kartu) {
          var wg = 12.5 / sl.kartu.length;
          sl.kartu.forEach(function (c, j) { var x = 0.4 + j * wg, hg = Math.min(7.0 - y, 5.6); s.addShape(p.ShapeType.roundRect, { x: x, y: y, w: wg - 0.15, h: hg, fill: { color: 'F8FAFC' }, line: { color: 'CBD5E1', width: 1 }, rectRadius: 0.08 });
            var runs = [{ text: c.aturan + ' — ' + c.nama + '  (' + c.merah + ' merah · ' + c.kuning + ' kuning)', options: { bold: true, color: HIJAU, breakLine: true, fontSize: 12 } }, { text: 'Bukti data', options: { bold: true, breakLine: true } }].concat(teks(c.bukti));
            if (c.penyebab.length) runs.push({ text: 'Indikasi penyebab', options: { bold: true, breakLine: true } }), runs = runs.concat(teks(c.penyebab));
            runs.push({ text: 'Gagasan / tindakan', options: { bold: true, breakLine: true } }); runs = runs.concat(teks(c.tindakan)); runs.push({ text: 'Target: ' + c.target, options: { bold: true, color: '1D4ED8' } });
            s.addText(runs, { x: x + 0.1, y: y + 0.05, w: wg - 0.35, h: hg - 0.1, fontSize: 10.5, color: '1F2937', valign: 'top', fit: 'shrink' }); });
        }
        if (sl.lintas) { var tx = sl.lintas.length ? sl.lintas.reduce(function (a, l) { return a.concat([{ text: l.j, options: { bold: true, color: HIJAU, breakLine: true } }, { text: 'Bukti: ' + l.bukti, options: { breakLine: true } }, { text: 'Gagasan: ' + l.g, options: { breakLine: true } }]); }, []) : [{ text: 'Tidak ada pola lintas data yang menonjol pada periode ini.' }]; s.addText(tx, { x: 0.4, y: y, w: 12.5, h: 7.0 - y, fontSize: 11, color: '1F2937', valign: 'top', fit: 'shrink' }); }
      });
      return p.write({ outputType: 'blob' }).then(function (blob) { U.unduh('AWS-Presentasi_' + rep.from + (rep.from === rep.to ? '' : '_sd_' + rep.to) + '.pptx', blob); });
    });
  };
  /* PDF = tata letak cetak A4 lalu "Simpan sebagai PDF" dari dialog cetak */
  EX.pdf = function (rep, meta) {
    return EX.logoData().then(function (logo) {
      var K = rep.kpi, T = EX.tabel(rep), area = document.getElementById('printArea'), sh = function (nama, maks, kolomIdx) {
        var t = T[nama]; if (!t || t.length < 2) return ''; var bar = t.slice(1, 1 + maks);
        return '<h2>' + U.esc(nama) + '</h2><table><thead><tr>' + t[0].filter(function (_, i) { return !kolomIdx || kolomIdx.indexOf(i) >= 0; }).map(function (h) { return '<th>' + U.esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + bar.map(function (r) { return '<tr>' + r.filter(function (_, i) { return !kolomIdx || kolomIdx.indexOf(i) >= 0; }).map(function (v) { return '<td>' + U.esc(typeof v === 'number' ? U.nf(v, v % 1 ? 1 : 0) : v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>' + (t.length - 1 > maks ? '<div class="muted">… dan ' + (t.length - 1 - maks) + ' baris lainnya (lihat ekspor Excel).</div>' : '');
      };
      var imgs = EX.grafik(rep).slice(0, 4).map(function (g) { return '<h2>' + U.esc(g.judul) + '</h2><img class="ch" src="' + g.img + '" alt="' + U.esc(g.judul) + '">'; }).join('');
      var ttd = meta && meta.ttd ? meta.ttd : { disusun: '', diperiksa: '', disetujui: '' };
      area.innerHTML = '<div class="kop">' + (logo ? '<img src="' + logo + '" alt="Agri Wangi">' : '') + '<div><h1>Laporan Harian Produksi & Absensi</h1><div>' + U.esc((meta && meta.perusahaan) || 'PT. Agri Wangi Sentosa') + ' · ' + U.esc(rentang(rep)) + '</div></div></div>' +
        '<div class="kpis">' + [['Budget (kg)', U.nf(K.budget)], ['Produksi (kg)', U.nf(K.kg)], ['Pencapaian', U.pct(K.pctCapai)], ['Selisih (kg)', U.nf(K.selisih)], ['Kehadiran', U.pct(K.pctHadir, 2)], ['Mangkir', U.pct(K.pctMangkir, 2)], ['Grade I', U.pct(K.pctG1)], ['Grade III', U.pct(K.pctG3)], ['Kg per HK', U.nf(K.kgPerHk, 1)], ['Isu merah/kuning', rep.ringkasIsu.merah + '/' + rep.ringkasIsu.kuning]].map(function (c) { return '<div>' + U.esc(c[0]) + '<b>' + U.esc(c[1]) + '</b></div>'; }).join('') + '</div>' +
        imgs + sh('Divisi', 20) + sh('Asisten', 20) + sh('Mandor', 40, [0, 1, 2, 3, 4, 5, 6, 7]) + sh('Absensi Divisi', 20) + sh('Isu', 25, [0, 1, 3, 5, 6]) +
        '<div class="ttd"><div>Disusun oleh<br><b>' + U.esc(ttd.disusun || '') + '</b></div><div>Diperiksa oleh<br><b>' + U.esc(ttd.diperiksa || '') + '</b></div><div>Disetujui oleh<br><b>' + U.esc(ttd.disetujui || '') + '</b></div></div>';
      var judulAsli = document.title; document.title = EX.nama(rep, 'pdf').replace(/\.pdf$/, '');
      setTimeout(function () { w.print(); setTimeout(function () { document.title = judulAsli; }, 800); }, 250);
    });
  };
  w.EX = EX;
})(window);
