/* AWS Daily Report v1 — Pengurai "Cermin Excel" (dipakai bersama oleh browser, Apps Script, dan uji Node).
   Satu sumber kebenaran: berkas ini disalin otomatis ke backend/Extract.gs oleh build.js. JANGAN edit salinannya. */
(function (root) {
  'use strict';
  var X = {};
  var BULAN = ['JANUARI','FEBRUARI','MARET','APRIL','MEI','JUNI','JULI','AGUSTUS','SEPTEMBER','OKTOBER','NOVEMBER','DESEMBER'];
  X.BULAN = BULAN;
  X.KODE_ABS = ['K','KL','H1','H2','S1','P3','P4','C','HB','P1','M','MG','OUT'];
  X.KODE_TIDAK_HADIR = ['H1','H2','S1','P3','P4','C','P1','M']; // dipakai Excel pada kolom "Jml Absensi" (terverifikasi pada uji paritas)

  function s(v) { return v === null || v === undefined ? '' : String(v).replace(/\s+/g, ' ').trim(); }
  function up(v) { return s(v).toUpperCase(); }
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var t = s(v); if (!t || t.charAt(0) === '#') return 0;
    var n = parseFloat(t.replace(/\./g, '').replace(',', '.')); // "1.234,5"
    if (/^-?\d+(\.\d+)?$/.test(t)) n = parseFloat(t);
    return isFinite(n) ? n : 0;
  }
  function isNum(v) { return typeof v === 'number' ? isFinite(v) : /^-?\d+(\.\d+)?$/.test(s(v)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isoDate(v) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') { // serial tanggal Excel (hanya rentang tanggal wajar; angka kecil bukan tanggal)
      if (v < 40000 || v > 80000) return '';
      var dt = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
      return dt.getUTCFullYear() + '-' + pad(dt.getUTCMonth() + 1) + '-' + pad(dt.getUTCDate());
    }
    if (Object.prototype.toString.call(v) === '[object Date]') {
      if (isNaN(v.getTime())) return '';
      // tanggal Excel disimpan lokal; ambil komponen lokal agar tidak bergeser zona waktu
      return v.getFullYear() + '-' + pad(v.getMonth() + 1) + '-' + pad(v.getDate());
    }
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s(v)); return m ? m[1] + '-' + m[2] + '-' + m[3] : '';
  }
  X.isoDate = isoDate; X.num = num; X.s = s;

  function hash32(str) { // FNV-1a — sidik jari ringan untuk pratinjau (bukan keamanan)
    var h = 0x811c9dc5; str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return ('00000000' + h.toString(16)).slice(-8);
  }
  X.hash32 = hash32;
  X.fingerprint = function (grid) {
    var n = grid.length, acc = '';
    for (var i = 0; i < n; i++) { var r = grid[i]; for (var j = 0; j < r.length; j++) { var v = r[j]; if (v !== null && v !== '' && v !== undefined) acc = hash32(acc + '|' + i + ',' + j + ':' + (v instanceof Date ? isoDate(v) : v)); } }
    return acc;
  };

  function monthFromName(n) {
    var t = up(n); for (var i = 0; i < 12; i++) if (t === BULAN[i]) return i + 1; return 0;
  }
  function findRow(grid, test, from, to) {
    for (var i = from || 0; i < Math.min(grid.length, to || 25); i++) { var r = grid[i] || []; for (var j = 0; j < r.length; j++) if (test(r[j], j, r)) return i; }
    return -1;
  }
  function rowHas(grid, i, label) { var r = grid[i] || []; for (var j = 0; j < r.length; j++) if (up(r[j]) === label) return j; return -1; }
  function titleYear(grid, def) {
    for (var i = 0; i < 4; i++) { var r = grid[i] || []; for (var j = 0; j < r.length; j++) { var m = /(20\d\d)/.exec(s(r[j])); if (m) return +m[1]; } }
    return def;
  }

  function grdHeader(grid) {
    for (var i = 0; i < Math.min(grid.length, 5); i++) { var r = grid[i] || []; if (up(r[0]) === 'NO') { for (var j = 1; j < 4; j++) if (/^MANDOR HARVEST/.test(up(r[j]))) return i; } }
    return -1;
  }
  X.grdHeader = grdHeader;

  /** Kenali jenis sheet. return {dataset, period, label} atau {dataset:null, alasan} */
  X.detect = function (name, grid, defYear) {
    var nm = s(name), nu = up(name);
    defYear = defYear || (new Date()).getFullYear();
    if (!grid || !grid.length) return { dataset: null, alasan: 'Sheet kosong' };
    var map = { '% ABSENSI': 'PCT_ABS', '% MANGKIR': 'PCT_MGK', 'RESIGN RECRUIT': 'RESIGN', 'R. PETIKAN': 'RPETIK', 'GULMA': 'GULMA', 'SUMMARY': 'UPK_SUM', 'SUMMARY PERIODE GAJI': 'GRD_SUM' };
    if (map[nu]) return { dataset: map[nu], period: String(titleYear(grid, defYear)), label: nm };
    var hrN = findRow(grid, function (v) { return up(v) === 'NAMA'; }, 0, 12);
    if (hrN >= 0 && rowHas(grid, hrN, 'NO') >= 0 && findRow(grid, function (v) { return /^ABSENSI HARIAN/.test(up(v)); }, 0, 3) >= 0) {
      var bln = num((grid[2] || [])[3]), thn = num((grid[3] || [])[3]) || defYear;
      if (!bln) bln = /^\d+$/.test(nm) ? +nm : 0;
      return { dataset: 'ABS', period: thn + '-' + pad(bln), label: nm };
    }
    var gh = grdHeader(grid);
    if (gh >= 0) {
      var cnt = {}, best = '', bn = 0, rr = grid[gh] || [];
      for (var j = 0; j < rr.length; j++) { var di = isoDate(rr[j]); if (di) { var pm = di.slice(0, 7); cnt[pm] = (cnt[pm] || 0) + 1; if (cnt[pm] > bn) { bn = cnt[pm]; best = pm; } } }
      if (!best) best = defYear + '-' + pad(/^\d+$/.test(nm) ? +nm : 1);
      return { dataset: 'GRD', period: best, label: nm };
    }
    var hr = findRow(grid, function (v) { return up(v) === 'DIVISI'; }, 0, 8);
    if (hr >= 0) {
      var mo = monthFromName(nm); if (!mo) return { dataset: null, alasan: 'Nama sheet bukan nama bulan' };
      var yr = titleYear(grid, defYear);
      var hasBud = rowHas(grid, hr, 'BUDGET') >= 0;
      return { dataset: hasBud ? 'REK' : 'UPK', period: yr + '-' + pad(mo), label: nm };
    }
    return { dataset: null, alasan: 'Struktur tidak dikenali' };
  };

  /* ---------- pembantu umum ---------- */
  function colIndexByLabel(row, label) { for (var j = 0; j < row.length; j++) if (up(row[j]) === label) return j; return -1; }

  /* ---------- ABSENSI ---------- */
  X.parseAbs = function (grid) {
    var hr = findRow(grid, function (v) { return up(v) === 'NAMA'; }, 0, 12);
    var head = grid[hr] || [], dateRow = grid[hr + 1] || [];
    var cNama = colIndexByLabel(head, 'NAMA');
    var cols = {}; head.forEach(function (v, j) { var t = up(v); if (t && !(t in cols)) cols[t] = j; });
    var dates = []; var firstDate = -1, lastDate = -1;
    for (var j = 0; j < dateRow.length; j++) { var d = isoDate(dateRow[j]); if (d) { dates.push({ col: j, date: d }); if (firstDate < 0) firstDate = j; lastDate = j; } }
    var recap = {}; for (var k = lastDate + 1; k < dateRow.length; k++) { var t2 = up(dateRow[k]); if (t2 && !(t2 in recap)) recap[t2] = k; }
    var ds = -1;
    for (var i = hr + 2; i < grid.length; i++) { var nm = s((grid[i] || [])[cNama]); if (nm && !/^COLUMN\d+/i.test(nm) && up(nm) !== 'NAMA' && !/^\d+$/.test(nm)) { ds = i; break; } }
    var rows = [];
    if (ds >= 0) for (var i2 = ds; i2 < grid.length; i2++) { var r = grid[i2] || []; if (s(r[cNama])) rows.push(i2); }
    // tabel kemandoran di sisi kanan
    var kemHead = -1, kemCol = -1;
    for (var i3 = hr + 1; i3 < Math.min(grid.length, hr + 6); i3++) { var rr = grid[i3] || []; for (var c = Math.max(lastDate, 60); c < rr.length; c++) if (up(rr[c]) === 'KEMANDORAN') { kemHead = i3; kemCol = c; break; } if (kemHead >= 0) break; }
    return { hr: hr, ds: ds, rows: rows, cols: cols, dates: dates, recap: recap, cNama: cNama, kemHead: kemHead, kemCol: kemCol };
  };
  // Rumus Excel (terverifikasi pada data asli): % ABSENSI = (M + P1) / HARI KERJA ; mangkir = M
  X.KODE_ABSENSI = ['M', 'P1'];
  X.KODE_LIBUR = ['MG', 'HB', 'OUT'];
  X.factsAbs = function (grid, period) {
    var p = X.parseAbs(grid), rows = [], kodeLain = {};
    var C = function (name) { return p.cols[name]; };
    var ident = ['REG', 'STATUS', 'DEPT', 'DEPT BARU (GAJI)', 'KEPANGKATAN', 'JABATAN', 'KEMANDORAN', 'ASSISTEN', 'ASKEP', 'SUB WILAYAH', 'DIVISI'];
    var regCol = -1; // kolom REG ada di sub-header (baris URUT/REG.)
    var sub = grid[p.hr + 1] || [];
    for (var j = 0; j < sub.length; j++) if (/^REG/.test(up(sub[j]))) { regCol = j; break; }
    p.rows.forEach(function (ri) {
      var r = grid[ri], o = { period: period, nama: s(r[p.cNama]), reg: regCol >= 0 ? s(r[regCol]) : '', hitung: isNum(r[0]) ? num(r[0]) : 0 }; // hitung = nilai kolom A yang dijumlahkan Excel sebagai jumlah karyawan
      ident.forEach(function (k) { if (k !== 'REG') o[k] = C(k) !== undefined ? s(r[C(k)]) : ''; });
      var days = 0; p.dates.forEach(function (d) { if (d.date.slice(0, 7) !== period) return; var dd = +d.date.slice(8, 10); if (dd > days) days = dd; });
      var arr = []; for (var q = 0; q < days; q++) arr.push('');
      p.dates.forEach(function (d) {
        if (d.date.slice(0, 7) !== period) return; // kolom ke-29..31 bisa berisi tanggal bulan berikutnya (rumus tanggal)
        var code = up(r[d.col]); var di = +d.date.slice(8, 10) - 1; arr[di] = code;
        if (code && X.KODE_ABS.indexOf(code) < 0) kodeLain[code] = (kodeLain[code] || 0) + 1;
      });
      o.hari = arr; rows.push(o);
    });
    return { rows: rows, kodeBaru: kodeLain, parse: p, hariKerja: X.hariKerja(grid) };
  };

  /* ---------- RESIGN & RECRUIT ---------- */
  X.factsResign = function (grid) {
    var rows = [];
    for (var i = 0; i < grid.length; i++) {
      var r = grid[i] || [], m = monthFromName(r[1]); if (!m || !isNum(r[0])) continue;
      var sumNum = function (a) { var t = 0; a.forEach(function (c) { t += num(r[c]); }); return t; };
      rows.push({ bulan: m, resign: sumNum([2, 3]), pensiun: sumNum([4, 5]), meninggal: sumNum([6, 7]), keluar: num(r[8]) || sumNum([2, 3, 4, 5, 6, 7]), recruit: num(r[11]) || sumNum([9, 10]) });
    }
    return { rows: rows };
  };

  /* ---------- REKAP ANALISA & UPKEEP (blok 3 baris Grade I/II/III) ---------- */
  function parseBlocks(grid, opt) {
    var hr = findRow(grid, function (v) { return up(v) === 'DIVISI'; }, 0, 8);
    var head = grid[hr] || [];
    var cMandor = colIndexByLabel(head, 'MANDOR');
    var cGrade = colIndexByLabel(head, 'GRADE');
    var dayRow = grid[hr + 1] || [];
    var days = []; for (var j = cGrade + 1; j < dayRow.length; j++) { var t = up(dayRow[j]); if (/^\d{1,2}$/.test(t)) days.push({ col: j, day: +t }); else if (t === 'TOTAL') { opt.cTotal = j; break; } }
    var cols = {}; head.forEach(function (v, j) { var t = up(v); if (t && !(t in cols)) cols[t] = j; });
    var blocks = [], last = { divisi: '', sub: '', asisten: '' };
    for (var i = hr + 2; i < grid.length; i++) {
      var r = grid[i] || [];
      var g = up(r[cGrade]);
      if (isNum(r[0]) && /^G\s?(I|1)$/.test(g.replace(/\s+/g, ' '))) {
        var rec = { row: i, no: num(r[0]) };
        ['DIVISI', 'SUB', 'ASISTEN'].forEach(function (k) { var v = s(r[cols[k]]); var key = k.toLowerCase(); if (v) last[key] = v; });
        rec.divisi = last.divisi; rec.sub = last.sub; rec.asisten = last.asisten;
        rec.mandorUpk = cols['MANDOR UPKEEP (GULMA)'] !== undefined ? s(r[cols['MANDOR UPKEEP (GULMA)']]) : '';
        if (!rec.mandorUpk) { for (var k2 in cols) if (/^MANDOR UPK/.test(k2)) rec.mandorUpk = s(r[cols[k2]]); }
        rec.mandor = s(r[cMandor]);
        rec.budget = cols['BUDGET'] !== undefined ? num(r[cols['BUDGET']]) : 0;
        rec.rows = [i, i + 1, i + 2];
        blocks.push(rec); i += 2;
      }
    }
    return { hr: hr, days: days, blocks: blocks, cGrade: cGrade, cols: cols, cTotal: opt.cTotal };
  }
  X.parseBlocks = parseBlocks;
  function dayDate(period, day) { return period + '-' + pad(day); }
  X.factsRek = function (grid, period) {
    var p = parseBlocks(grid, {}), rows = [];
    p.blocks.forEach(function (b) {
      p.days.forEach(function (d) {
        var g = [0, 1, 2].map(function (k) { return num((grid[b.rows[k]] || [])[d.col]); });
        var tot = g[0] + g[1] + g[2]; if (tot === 0) return;
        rows.push({ tgl: dayDate(period, d.day), divisi: b.divisi, sub: b.sub, asisten: b.asisten, mandorUpk: b.mandorUpk, mandor: b.mandor, budget: b.budget, g1: g[0], g2: g[1], g3: g[2], total: tot });
      });
    });
    return { rows: rows, parse: p };
  };
  X.factsUpk = function (grid, period) {
    var p = parseBlocks(grid, {}), rows = [];
    p.blocks.forEach(function (b) {
      p.days.forEach(function (d) {
        var g = [0, 1, 2].map(function (k) { return num((grid[b.rows[k]] || [])[d.col]); });
        var tot = g[0] + g[1] + g[2]; if (tot === 0) return;
        rows.push({ tgl: dayDate(period, d.day), divisi: b.divisi, sub: b.sub, asisten: '', mandorUpk: '', mandor: b.mandor, budget: 0, g1: g[0], g2: g[1], g3: g[2], total: tot });
      });
    });
    return { rows: rows, parse: p };
  };

  /* ---------- DATA GRADE & TK ---------- */
  X.factsGrd = function (grid) {
    var hr = grdHeader(grid); if (hr < 0) return { rows: [], ringkas: [], width: 0, hari: 0 };
    var r0 = grid[hr] || [], g1 = grid[hr + 1] || [], g2 = grid[hr + 2] || [];
    var starts = []; for (var j = 0; j < r0.length; j++) { var d = isoDate(r0[j]); if (d) starts.push({ col: j, date: d }); }
    var width = starts.length > 1 ? starts[1].col - starts[0].col : 17;
    var cMandor = 1; for (var q = 0; q < 4; q++) if (/^MANDOR HARVEST/.test(up(r0[q]))) { cMandor = q; break; }
    var cBud = -1, cPen = -1, cSel = -1, cAbs = -1, abCols = {};
    for (var c = cMandor + 1; c < (starts.length ? starts[0].col : 14); c++) {
      var l = up(g2[c]) || up(g1[c]);
      if (/^BUDGET/.test(l)) cBud = c; else if (/^PENCAPAIAN/.test(l)) cPen = c; else if (/^SELISIH/.test(l)) cSel = c; else if (l === 'ABSENSI') cAbs = c;
      else if (X.KODE_TIDAK_HADIR.indexOf(l) >= 0) abCols[l] = c;
    }
    // label kolom di dalam satu blok harian (dibaca dari blok pertama)
    var lab = [];
    if (starts.length) for (var k = 0; k < width; k++) lab.push(up(g2[starts[0].col + k]) || up(g1[starts[0].col + k]));
    var rows = [], ringkas = [];
    for (var i = hr + 3; i < grid.length; i++) {
      var r = grid[i] || []; if (!isNum(r[0]) || !s(r[cMandor])) break;
      var rg = { mandor: s(r[cMandor]), budget: cBud >= 0 ? num(r[cBud]) : 0, pencapaian: cPen >= 0 ? num(r[cPen]) : 0, selisih: cSel >= 0 ? num(r[cSel]) : 0, absensi: cAbs >= 0 ? num(r[cAbs]) : 0, abs: {} };
      for (var kc in abCols) rg.abs[kc] = num(r[abCols[kc]]);
      ringkas.push(rg);
      starts.forEach(function (st) {
        var o = { tgl: st.date, mandor: rg.mandor, g1: 0, g2: 0, g3: 0, total: 0, tkHarvest: 0, k: 0, upkeep: 0, nempel: 0, absensi: 0, abs: {} }, any = false;
        for (var m = 0; m < width; m++) {
          var v = r[st.col + m]; if (v === null || v === undefined || v === '') continue;
          var lb = lab[m], n = num(v); any = true;
          if (/^GRADE 1/.test(lb)) o.g1 = n; else if (/^GRADE 2/.test(lb)) o.g2 = n; else if (/^GRADE 3/.test(lb)) o.g3 = n;
          else if (/^TOTAL/.test(lb)) o.total = n; else if (/^TK HARVEST/.test(lb)) o.tkHarvest = n; else if (/^K \(ORG\)/.test(lb)) o.k = n;
          else if (/^TK UPKEEP/.test(lb)) o.upkeep = n; else if (/^TK NEMPEL/.test(lb)) o.nempel = n; else if (lb === 'ABSENSI') o.absensi = n;
          else if (X.KODE_TIDAK_HADIR.indexOf(lb) >= 0) o.abs[lb] = n;
        }
        if (!any) return;
        if (!o.total) o.total = o.g1 + o.g2 + o.g3;
        if (o.total > 0 || o.tkHarvest > 0 || o.absensi > 0) rows.push(o);
      });
    }
    return { rows: rows, ringkas: ringkas, width: width, hari: starts.length, labels: lab };
  };

  /** Ekstrak fakta sesuai dataset. */
  X.extract = function (dataset, grid, period) {
    if (dataset === 'ABS') return X.factsAbs(grid, period);
    if (dataset === 'RESIGN') return X.factsResign(grid);
    if (dataset === 'REK') return X.factsRek(grid, period);
    if (dataset === 'UPK') return X.factsUpk(grid, period);
    if (dataset === 'GRD') return X.factsGrd(grid);
    return { rows: [] };
  };

  /** Hari kerja dari sheet Absensi (sel D2); default 26. */
  X.hariKerja = function (grid) { var v = num((grid[1] || [])[3]); return v > 0 ? v : 26; };

  /** Normalisasi tab mirror: tanggal → teks ISO, sel dibersihkan agar aman ditulis ke Sheets. */
  X.cleanGrid = function (grid) {
    var w = 0; grid.forEach(function (r) { if (r.length > w) w = r.length; });
    // pangkas baris kosong di ujung
    var n = grid.length; while (n > 0 && (grid[n - 1] || []).every(function (v) { return v === null || v === '' || v === undefined; })) n--;
    var out = [];
    for (var i = 0; i < n; i++) {
      var r = grid[i] || [], row = [];
      for (var j = 0; j < w; j++) { var v = r[j]; if (v === undefined || v === null) v = ''; else if (Object.prototype.toString.call(v) === '[object Date]') v = isoDate(v) || ''; row.push(v); }
      out.push(row);
    }
    // pangkas kolom kosong di ujung kanan
    var maxc = 0; out.forEach(function (r) { for (var j = r.length - 1; j >= 0; j--) if (r[j] !== '') { if (j + 1 > maxc) maxc = j + 1; break; } });
    return out.map(function (r) { return r.slice(0, maxc); });
  };


  /* ---------- pengemasan untuk unggah ---------- */
  /** Objek fakta → {kolom, baris}. Array/objek di-JSON-kan. Kolom mengikuti gabungan kunci (kolom baru ikut otomatis). */
  X.packRows = function (rows) {
    var kolom = [], seen = {};
    rows.forEach(function (o) { for (var k in o) if (!seen[k]) { seen[k] = 1; kolom.push(k); } });
    var baris = rows.map(function (o) { return kolom.map(function (k) { var v = o[k]; if (v === undefined || v === null) return ''; return typeof v === 'object' ? JSON.stringify(v) : v; }); });
    return { kolom: kolom, baris: baris };
  };
  /** Sidik per tanggal → dipakai dry-run untuk mendeteksi tanggal mana yang berubah. */
  X.hashHarian = function (dataset, rows) {
    var acc = {};
    if (dataset === 'ABS') {
      rows.forEach(function (o) { o.hari.forEach(function (c, i) { if (c === '') return; var d = o.period + '-' + pad(i + 1); acc[d] = hash32((acc[d] || '') + o.nama + o.reg + c); }); });
    } else if (dataset === 'REK' || dataset === 'UPK' || dataset === 'GRD') {
      rows.forEach(function (o) { var d = o.tgl; acc[d] = hash32((acc[d] || '') + o.mandor + '|' + [o.g1, o.g2, o.g3, o.total, o.tkHarvest || 0, o.absensi || 0, o.budget || 0].join(',')); });
    }
    return acc;
  };
  /** Label kolom (untuk deteksi kolom baru) dan jumlah baris kepala (untuk tampilan cermin). */
  X.headInfo = function (dataset, grid) {
    var hr, head, labels = [];
    if (dataset === 'ABS') { hr = findRow(grid, function (v) { return up(v) === 'NAMA'; }, 0, 12); head = hr + 4; (grid[hr] || []).forEach(function (v) { if (s(v)) labels.push(up(v)); }); var rp = X.parseAbs(grid).recap; for (var k in rp) labels.push(k); }
    else if (dataset === 'REK' || dataset === 'UPK') { hr = findRow(grid, function (v) { return up(v) === 'DIVISI'; }, 0, 8); head = hr + 2; (grid[hr] || []).forEach(function (v) { if (s(v)) labels.push(up(v)); }); }
    else if (dataset === 'GRD') { hr = grdHeader(grid); head = hr + 3; var g0 = X.factsGrd(grid); (g0.labels || []).forEach(function (v) { if (v) labels.push(v); }); (grid[hr + 2] || []).slice(0, 14).forEach(function (v) { if (s(v)) labels.push(up(v)); }); (grid[hr + 1] || []).slice(0, 14).forEach(function (v) { if (s(v)) labels.push(up(v)); }); }
    else { head = 3; (grid[2] || []).forEach(function (v) { if (s(v)) labels.push(up(v)); }); }
    var uniq = {}; labels = labels.filter(function (l) { if (uniq[l]) return false; uniq[l] = 1; return true; });
    return { labels: labels, head: Math.max(1, head) };
  };

  /** Rencana unggah satu workbook: kenali semua sheet, ekstrak fakta, siapkan cermin. sheets=[{name,grid,hidden}] */
  X.FAKTA_DS = ['ABS', 'REK', 'UPK', 'GRD', 'RESIGN'];
  X.planWorkbook = function (sheets, defYear) {
    var items = [], seen = {}, dilewati = [];
    sheets.forEach(function (sh) {
      if (sh.hidden) { dilewati.push({ sheet: sh.name, alasan: 'Sheet tersembunyi (dilewati)' }); return; }
      var d = X.detect(sh.name, sh.grid, defYear);
      if (!d.dataset) { dilewati.push({ sheet: sh.name, alasan: d.alasan || 'Tidak dikenali' }); return; }
      var k = d.dataset + '|' + d.period; if (seen[k]) { dilewati.push({ sheet: sh.name, alasan: 'Duplikat ' + d.dataset + ' ' + d.period }); return; } seen[k] = 1;
      var grid = X.cleanGrid(sh.grid), w = 0; grid.forEach(function (r) { if (r.length > w) w = r.length; });
      var hi = X.headInfo(d.dataset, sh.grid);
      var it = { dataset: d.dataset, periode: d.period, label: sh.name, sidik: X.fingerprint(grid), cermin: grid, jmlBarisCermin: grid.length, jmlKolom: w, labels: hi.labels, headBaris: hi.head, jmlFakta: 0, hashHarian: {}, tglMin: '', tglMaks: '', hariKerja: 0, kodeBaru: {}, fakta: null };
      if (X.FAKTA_DS.indexOf(d.dataset) >= 0) {
        var e = X.extract(d.dataset, sh.grid, d.period);
        it.fakta = X.packRows(e.rows); it.jmlFakta = e.rows.length; it.hashHarian = X.hashHarian(d.dataset, e.rows);
        if (d.dataset === 'ABS') { it.hariKerja = e.hariKerja; it.kodeBaru = e.kodeBaru; }
        var ds = Object.keys(it.hashHarian).sort(); if (ds.length) { it.tglMin = ds[0]; it.tglMaks = ds[ds.length - 1]; }
        if (d.dataset === 'GRD') it.ringkas = e.ringkas;
      }
      items.push(it);
    });
    return { items: items, dilewati: dilewati };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = X; else root.AWSX = X;
})(typeof self !== 'undefined' ? self : this);
