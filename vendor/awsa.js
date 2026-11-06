/* AWS Daily Report v1.0.5 — Mesin agregasi & aturan penilaian A1–A13 (dipakai bersama browser, Apps Script, uji Node).
   Salinan ke backend/Agg.gs dibuat otomatis oleh build.js. JANGAN edit salinannya. */
(function (root) {
  'use strict';
  var A = {};
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dim(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function addDays(iso, n) { var d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) + n * 86400000); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function diffDays(a, b) { return Math.round((Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000); }
  function r1(x) { return Math.round(x * 10) / 10; }
  function r2(x) { return Math.round(x * 100) / 100; }
  function div(a, b) { return b ? a / b : 0; }
  A.addDays = addDays; A.diffDays = diffDays; A.dim = dim;

  /** Ambang bawaan (angka PRD). Bisa ditimpa dari Pengaturan → Aturan. kuning = perhatian, merah = kritis. */
  A.DEFAULT_RULES = {
    A1: { nama: 'Pencapaian budget (%)', op: '<', kuning: 100, merah: 80, aktif: true },
    A2: { nama: 'Selisih terhadap budget (%)', op: '<=', kuning: -10, merah: -25, aktif: true },
    A3: { nama: 'Porsi Grade III (%)', op: '>', kuning: 40, merah: 50, aktif: true },
    A4: { nama: 'Porsi Grade I (%)', op: '<', kuning: 10, merah: 5, aktif: true },
    A5: { nama: 'Absensi harian divisi (%)', op: '>', kuning: 7, merah: 10, aktif: true },
    A6: { nama: 'Mangkir bulanan (%)', op: '>', kuning: 1.5, merah: 2.5, aktif: true },
    A7: { nama: 'Mangkir beruntun (hari)', op: '>=', kuning: 3, merah: 5, aktif: true },
    A8: { nama: 'Produksi turun beruntun (hari)', op: '>=', kuning: 3, merah: 5, aktif: true },
    A9: { nama: 'Kg per HK terhadap rata-rata divisi (%)', op: '<', kuning: 85, merah: 70, aktif: true },
    A10: { nama: 'Data belum masuk (hari)', op: '>=', kuning: 1, merah: 2, aktif: true },
    A11: { nama: 'Resign dikurangi recruit (orang/bulan)', op: '>=', kuning: 3, merah: 6, aktif: true },
    A12: { nama: 'Kode/kolom baru terdeteksi (orang)', op: '>=', kuning: 1, merah: 10, aktif: true },
    A13: { nama: 'Selisih kebun vs pabrik (%)', op: '>', kuning: 1, merah: 3, aktif: true }
  };
  function level(rule, v) {
    if (!rule || rule.aktif === false) return '';
    var op = rule.op, t = function (th) { return op === '<' ? v < th : op === '<=' ? v <= th : op === '>' ? v > th : v >= th; };
    return t(rule.merah) ? 'merah' : t(rule.kuning) ? 'kuning' : '';
  }
  A.level = level;
  A.mergeRules = function (over) {
    var out = {}; for (var k in A.DEFAULT_RULES) { out[k] = {}; for (var f in A.DEFAULT_RULES[k]) out[k][f] = A.DEFAULT_RULES[k][f]; if (over && over[k]) for (var g in over[k]) out[k][g] = over[k][g]; }
    return out;
  };

  /** Rekomendasi bawaan per aturan (bisa disunting di halaman Isu & Rekomendasi). */
  A.REKOMENDASI = {
    A1: 'Periksa luas petik dan jumlah tenaga petik hari ini; atur ulang rotasi blok agar pencapaian mengejar budget.',
    A2: 'Bandingkan realisasi dengan budget harian; evaluasi penyebab selisih (cuaca, absensi, pucuk).',
    A3: 'Tinjau kualitas petikan dan jarak petik; ingatkan standar pucuk Grade I/II.',
    A4: 'Tingkatkan pembinaan teknik petik agar proporsi Grade I naik.',
    A5: 'Konfirmasi alasan ketidakhadiran ke mandor; siapkan tenaga cadangan.',
    A6: 'Panggil karyawan dengan mangkir berulang; lakukan pembinaan sesuai aturan perusahaan.',
    A7: 'Tindak lanjuti karyawan yang mangkir beruntun: hubungi langsung dan catat keterangan.',
    A8: 'Cari penyebab produksi menurun beberapa hari berturut-turut dan laporkan ke Asisten.',
    A9: 'Periksa produktivitas per tenaga petik dan lakukan pendampingan di blok terkait.',
    A10: 'Segera unggah data harian yang belum masuk agar laporan tidak tertinggal.',
    A11: 'Susun rencana rekrutmen pengganti agar jumlah tenaga kerja tetap terjaga.',
    A12: 'Ada kode atau kolom baru di Excel; konfirmasi artinya dan tetapkan ambang yang sesuai.',
    A13: 'Rekonsiliasi berat kebun dan timbangan pabrik; periksa susut dan pencatatan.'
  };

  function pctRange(from, to) { return from + ' s.d. ' + to; }
  function inRange(d, from, to) { return d >= from && d <= to; }
  function key(o) { return [o.divisi || '', o.sub || '', o.mandor || ''].join('|'); }

  /** Laporan terpadu.
      data = {abs:[orang-bulan], rek:[mandor-hari], upk:[...], grd:[...], resign:[...], timbangan:[...], kodeBaru:{}}
      p = {from,to,today,rules,hariKerja:{'2026-05':23}} */
  A.report = function (data, p) {
    var from = p.from, to = p.to, rules = A.mergeRules(p.rules), hkMap = p.hariKerja || {};
    var out = { from: from, to: to, aturan: rules, kpi: {}, harian: [], mandor: [], asisten: [], divisi: [], orang: [], isu: [], grade: {}, kodeCount: {} };
    var abs = data.abs || [], rek = (data.rek || []).filter(function (r) { return inRange(r.tgl, from, to); }), grd = (data.grd || []).filter(function (r) { return inRange(r.tgl, from, to); });
    var upk = (data.upk || []).filter(function (r) { return inRange(r.tgl, from, to); });
    var lastRek = '', lastAbs = '', lastGrd = '';
    (data.rek || []).forEach(function (r) { if (r.tgl > lastRek) lastRek = r.tgl; });
    (data.grd || []).forEach(function (r) { if (r.tgl > lastGrd) lastGrd = r.tgl; });

    /* ---------- ABSENSI per orang & harian ---------- */
    var harian = {}, orang = [], divAbs = {}, dayDiv = {};
    function hd(d) { return harian[d] || (harian[d] = { tgl: d, tk: 0, hadir: 0, absen: 0, mangkir: 0, libur: 0, kg: 0, g1: 0, g2: 0, g3: 0, tkPetik: 0 }); }
    abs.forEach(function (o) {
      var y = +o.period.slice(0, 4), m = +o.period.slice(5, 7), n = o.hari.length;
      var ov = 0; for (var q0 = 1; q0 <= n; q0++) { var dq = o.period + '-' + pad(q0); if (inRange(dq, from, to)) ov++; }
      if (!ov) return;   // periode absensi di luar rentang laporan: jangan dihitung sebagai karyawan
      var hkb = hkMap[o.period] || n;
      var rec = { hkNorm: (o.hitung === 0 ? 0 : hkb * ov / dim(y, m)), nama: o.nama, reg: o.reg, status: o.STATUS, dept: o.DEPT, kemandoran: o.KEMANDORAN, asisten: o.ASSISTEN, askep: o.ASKEP, divisi: o.DIVISI || o['SUB WILAYAH'] || '-', sub: o['SUB WILAYAH'], kode: {}, hk: 0, hadir: 0, mangkir: 0, absen: 0, maxBeruntun: 0, tglBeruntun: '' };
      var run = 0, runStart = '';
      for (var i = 0; i < n; i++) {
        var d = o.period + '-' + pad(i + 1); if (!inRange(d, from, to)) { run = 0; continue; }
        var c = o.hari[i]; if (!c) { run = 0; continue; }
        rec.kode[c] = (rec.kode[c] || 0) + 1; out.kodeCount[c] = (out.kodeCount[c] || 0) + 1;
        if (d > lastAbs) lastAbs = d;
        var libur = c === 'MG' || c === 'HB' || c === 'OUT';
        var h = hd(d);
        if (libur) { h.libur++; run = 0; continue; }
        rec.hk++; h.tk++;
        if (c === 'K' || c === 'KL') { rec.hadir++; h.hadir++; }
        if (c === 'M' || c === 'P1') { rec.absen++; h.absen++; }
        if (c === 'M') { rec.mangkir++; h.mangkir++; run++; if (!runStart) runStart = d; if (run > rec.maxBeruntun) { rec.maxBeruntun = run; rec.tglBeruntun = runStart; } } else { run = 0; runStart = ''; }
        var dv = rec.divisi, dd = (dayDiv[dv] || (dayDiv[dv] = {})); var x = dd[d] || (dd[d] = { tk: 0, absen: 0 }); x.tk++; if (c === 'M' || c === 'P1') x.absen++;
      }
      rec.pctAbsen = r2(div(rec.absen, rec.hkNorm || rec.hk) * 100);
      orang.push(rec);
    });
    out.orang = orang;

    /* ---------- PRODUKSI per mandor (Rekap Analisa + Grade TK) ---------- */
    var mm = {};
    function mg(r) { var k = key(r); return mm[k] || (mm[k] = { mandor: r.mandor, divisi: r.divisi, sub: r.sub, asisten: r.asisten, budgetBulan: {}, kg: 0, g1: 0, g2: 0, g3: 0, harian: {}, hariData: 0, tkHarvest: 0, hkPetik: 0, absensi: 0 }); }
    rek.forEach(function (r) {
      var o = mg(r); var ym = r.tgl.slice(0, 7); if (r.budget) o.budgetBulan[ym] = r.budget;
      o.kg += r.total; o.g1 += r.g1; o.g2 += r.g2; o.g3 += r.g3; o.harian[r.tgl] = (o.harian[r.tgl] || 0) + r.total;
      var h = hd(r.tgl); h.kg += r.total; h.g1 += r.g1; h.g2 += r.g2; h.g3 += r.g3;
    });
    // budget bulanan harus diambil walau hari tertentu tidak ada produksi: ambil dari seluruh data bulan terkait
    (data.rek || []).forEach(function (r) { if (!r.budget) return; var o = mm[key(r)]; if (o) { var ym = r.tgl.slice(0, 7); if (o.budgetBulan[ym] === undefined) o.budgetBulan[ym] = r.budget; } });
    var byMandorName = {};
    Object.keys(mm).forEach(function (k) { byMandorName[mm[k].mandor] = mm[k]; });
    grd.forEach(function (r) {
      var o = byMandorName[r.mandor]; if (!o) return;
      o.tkHarvest += r.tkHarvest; o.hkPetik += (r.k > 0 ? r.k : Math.max(0, r.tkHarvest - (r.absensi || 0)));   // HK petik = jumlah orang HADIR memetik (kolom K (Org)) per hari o.absensi += (r.abs ? (r.abs.M || 0) + (r.abs.P1 || 0) : 0);
      hd(r.tgl).tkPetik += r.tkHarvest;
    });
    var lastDate = lastRek && lastRek < to ? lastRek : to;
    Object.keys(mm).forEach(function (k) {
      var o = mm[k], bud = 0, budSd = 0;
      Object.keys(o.budgetBulan).forEach(function (ym) {
        var y = +ym.slice(0, 4), m = +ym.slice(5, 7), dm = dim(y, m), awal = ym + '-01', akhir = ym + '-' + pad(dm);
        var s = awal > from ? awal : from, e = akhir < to ? akhir : to;
        if (e >= s) bud += o.budgetBulan[ym] * ((diffDays(s, e) + 1) / dm);          // SAMA DENGAN EXCEL: budget bulan penuh (bulan utuh) / prorata hari kalender (rentang sebagian)
        var e2 = akhir < lastDate ? akhir : lastDate;
        if (e2 >= s) budSd += o.budgetBulan[ym] * ((diffDays(s, e2) + 1) / dm);      // target berjalan s/d tanggal data terakhir (dasar peringatan A1/A2)
      });
      o.budget = Math.round(bud * 10) / 10; o.budgetSd = Math.round(budSd * 10) / 10; o.hariData = Object.keys(o.harian).length;
      o.pctCapai = r1(div(o.kg, o.budget) * 100); o.selisih = r1(o.kg - o.budget); o.pctSelisih = r1(div(o.selisih, o.budget) * 100);
      o.pctCapaiSd = r1(div(o.kg, o.budgetSd) * 100); o.selisihSd = r1(o.kg - o.budgetSd); o.pctSelisihSd = r1(div(o.selisihSd, o.budgetSd) * 100);
      var tot = o.g1 + o.g2 + o.g3; o.pctG1 = r1(div(o.g1, tot) * 100); o.pctG2 = r1(div(o.g2, tot) * 100); o.pctG3 = r1(div(o.g3, tot) * 100);
      o.kgPerHk = r1(div(o.kg, o.hkPetik || o.tkHarvest));
      delete o.budgetBulan;
    });
    out.mandor = Object.keys(mm).map(function (k) { return mm[k]; }).sort(function (a, b) { return (a.divisi + a.sub + a.mandor) < (b.divisi + b.sub + b.mandor) ? -1 : 1; });

    // rollup
    function roll(list, keyFn, label) {
      var m = {};
      list.forEach(function (o) {
        var k = keyFn(o); var r = m[k] || (m[k] = { nama: k, jumlahMandor: 0, budget: 0, kg: 0, g1: 0, g2: 0, g3: 0, hkPetik: 0 });
        r.jumlahMandor++; r.budget = r1(r.budget + o.budget); r.budgetSd = r1((r.budgetSd || 0) + o.budgetSd); r.kg += o.kg; r.g1 += o.g1; r.g2 += o.g2; r.g3 += o.g3; r.hkPetik += (o.hkPetik || o.tkHarvest);
      });
      return Object.keys(m).map(function (k) {
        var r = m[k], tot = r.g1 + r.g2 + r.g3;
        r.pctCapai = r1(div(r.kg, r.budget) * 100); r.selisih = r1(r.kg - r.budget); r.pctG3 = r1(div(r.g3, tot) * 100); r.pctG1 = r1(div(r.g1, tot) * 100); r.kgPerHk = r1(div(r.kg, r.hkPetik));
        return r;
      }).sort(function (a, b) { return a.nama < b.nama ? -1 : 1; });
    }
    out.divisi = roll(out.mandor, function (o) { return (o.divisi || '-') + (o.sub ? ' / ' + o.sub : ''); });
    out.asisten = roll(out.mandor, function (o) { return o.asisten || '-'; });
    // absensi per divisi / asisten (dari data orang)
    function rollAbs(keyFn) {
      var m = {}; orang.forEach(function (o) { var k = keyFn(o) || '-'; var r = m[k] || (m[k] = { nama: k, orang: 0, hk: 0, hkNorm: 0, hadir: 0, mangkir: 0, absen: 0 }); r.orang++; r.hk += o.hk; r.hkNorm += o.hkNorm; r.hadir += o.hadir; r.mangkir += o.mangkir; r.absen += o.absen; });
      return Object.keys(m).map(function (k) { var r = m[k]; r.hkNorm = r2(r.hkNorm); r.pctAbsen = r2(div(r.absen, r.hkNorm || r.hk) * 100); r.pctMangkir = r2(div(r.mangkir, r.hkNorm || r.hk) * 100); return r; }).sort(function (a, b) { return b.pctAbsen - a.pctAbsen; });
    }
    out.absDivisi = rollAbs(function (o) { return o.divisi; });
    out.absAsisten = rollAbs(function (o) { return o.asisten; });
    out.absDept = rollAbs(function (o) { return o.dept; });
    out.absMandor = rollAbs(function (o) { return o.kemandoran; });

    out.harian = Object.keys(harian).sort().map(function (d) { var h = harian[d]; h.pctAbsen = r2(div(h.absen, h.tk) * 100); h.pctMangkir = r2(div(h.mangkir, h.tk) * 100); h.pctHadir = r2(div(h.hadir, h.tk) * 100); return h; });

    var T = { budget: 0, budgetSd: 0, kg: 0, g1: 0, g2: 0, g3: 0, hk: 0, hkNorm: 0, hadir: 0, absen: 0, mangkir: 0, hkPetik: 0 };
    out.mandor.forEach(function (o) { T.budget += o.budget; T.budgetSd += o.budgetSd; T.kg += o.kg; T.g1 += o.g1; T.g2 += o.g2; T.g3 += o.g3; T.hkPetik += (o.hkPetik || o.tkHarvest); });
    orang.forEach(function (o) { T.hk += o.hk; T.hkNorm += o.hkNorm; T.hadir += o.hadir; T.absen += o.absen; T.mangkir += o.mangkir; });
    var tg = T.g1 + T.g2 + T.g3;
    out.kpi = { budget: r1(T.budget), budgetSd: r1(T.budgetSd), tglBerjalan: lastDate, pctCapaiSd: r1(div(T.kg, T.budgetSd) * 100), kg: T.kg, pctCapai: r1(div(T.kg, T.budget) * 100), selisih: r1(T.kg - T.budget), g1: T.g1, g2: T.g2, g3: T.g3, pctG1: r1(div(T.g1, tg) * 100), pctG2: r1(div(T.g2, tg) * 100), pctG3: r1(div(T.g3, tg) * 100),
      karyawan: orang.length, hk: T.hk, hadir: T.hadir, pctHadir: r2(div(T.hadir, T.hk) * 100), pctAbsen: r2(div(T.absen, T.hkNorm || T.hk) * 100), pctMangkir: r2(div(T.mangkir, T.hkNorm || T.hk) * 100), mangkir: T.mangkir, hkNorm: r2(T.hkNorm), kgPerHk: r1(div(T.kg, T.hkPetik)), hariData: out.harian.filter(function (h) { return h.kg > 0; }).length, dataTerakhirProduksi: lastRek, dataTerakhirAbsensi: lastAbs };
    out.grade = { g1: T.g1, g2: T.g2, g3: T.g3 };

    // Upkeep (Gulma) per mandor
    var um = {}; upk.forEach(function (r) { var k = key(r); var o = um[k] || (um[k] = { divisi: r.divisi, sub: r.sub, mandor: r.mandor, kg: 0, g1: 0, g2: 0, g3: 0, hari: {} }); o.kg += r.total; o.g1 += r.g1; o.g2 += r.g2; o.g3 += r.g3; o.hari[r.tgl] = 1; });
    out.upkeep = Object.keys(um).map(function (k) { var o = um[k]; o.hariData = Object.keys(o.hari).length; delete o.hari; return o; }).sort(function (a, b) { return b.kg - a.kg; });
    out.kpi.kgUpkeep = out.upkeep.reduce(function (a, o) { return a + o.kg; }, 0);

    /* ---------- ATURAN A1–A13 ---------- */
    var isu = []; var seq = 0;
    function add(rule, lv, scope, entitas, nilai, teks, tgl) {
      if (!lv) return; var r = rules[rule];
      isu.push({ id: rule + '|' + scope + '|' + entitas + '|' + (tgl || to.slice(0, 7)), aturan: rule, nama: r.nama, level: lv, scope: scope, entitas: entitas, nilai: nilai, ambang: lv === 'merah' ? r.merah : r.kuning, teks: teks, rekomendasi: A.REKOMENDASI[rule], tgl: tgl || '' });
    }
    out.mandor.forEach(function (o) {
      var nm = o.mandor + ' (' + (o.divisi || '-') + (o.sub ? '/' + o.sub : '') + ')';
      if (o.budgetSd > 0 && o.hariData > 0) {
        add('A1', level(rules.A1, o.pctCapaiSd), 'mandor', nm, o.pctCapaiSd, 'Pencapaian ' + o.pctCapaiSd + '% dari target berjalan s/d ' + lastDate);
        add('A2', level(rules.A2, o.pctSelisihSd), 'mandor', nm, o.pctSelisihSd, 'Selisih ' + o.pctSelisihSd + '% terhadap target berjalan (' + Math.round(o.selisihSd) + ' kg)');
      }
      if (o.kg > 0) {
        add('A3', level(rules.A3, o.pctG3), 'mandor', nm, o.pctG3, 'Grade III ' + o.pctG3 + '% dari total petikan');
        add('A4', level(rules.A4, o.pctG1), 'mandor', nm, o.pctG1, 'Grade I hanya ' + o.pctG1 + '% dari total petikan');
      }
      // A8: turun beruntun
      var ds = Object.keys(o.harian).sort(), run = 0, maxRun = 0, endTgl = '';
      for (var i = 1; i < ds.length; i++) { if (o.harian[ds[i]] < o.harian[ds[i - 1]]) { run++; if (run > maxRun) { maxRun = run; endTgl = ds[i]; } } else run = 0; }
      // hanya laporkan bila rangkaian turun masih berlangsung di hari data terakhir
      if (ds.length > 1 && run >= 1) { var cur = run; add('A8', level(rules.A8, cur), 'mandor', nm, cur, 'Produksi turun ' + cur + ' hari berturut-turut sampai ' + ds[ds.length - 1], ds[ds.length - 1]); }
    });
    // A9 kg/HK vs rata-rata divisi
    var avgDiv = {}; out.divisi.forEach(function (d) { avgDiv[d.nama] = d.kgPerHk; });
    out.mandor.forEach(function (o) {
      var dn = (o.divisi || '-') + (o.sub ? ' / ' + o.sub : ''), av = avgDiv[dn]; if (!av || !o.kgPerHk) return;
      var pct = r1(o.kgPerHk / av * 100); add('A9', level(rules.A9, pct), 'mandor', o.mandor + ' (' + dn + ')', pct, 'Kg/HK ' + o.kgPerHk + ' = ' + pct + '% dari rata-rata divisi (' + av + ')');
    });
    // A5 absensi harian divisi (hari data terakhir dalam rentang)
    Object.keys(dayDiv).forEach(function (dv) {
      var ds = Object.keys(dayDiv[dv]).sort(); if (!ds.length) return; var d = ds[ds.length - 1], x = dayDiv[dv][d];
      if (x.tk < 5) return; var pct = r1(div(x.absen, x.tk) * 100);
      add('A5', level(rules.A5, pct), 'divisi', dv, pct, 'Absensi ' + pct + '% pada ' + d + ' (' + x.absen + ' dari ' + x.tk + ' orang)', d);
    });
    // A6 mangkir bulanan per divisi + total
    out.absDivisi.forEach(function (r) { if (r.hk < 20) return; add('A6', level(rules.A6, r.pctMangkir), 'divisi', r.nama, r.pctMangkir, 'Mangkir ' + r.pctMangkir + '% (' + r.mangkir + ' hari dari ' + r.hk + ' HK)'); });
    add('A6', level(rules.A6, out.kpi.pctMangkir), 'divisi', 'Seluruh perusahaan', out.kpi.pctMangkir, 'Mangkir ' + out.kpi.pctMangkir + '% (' + out.kpi.mangkir + ' hari dari ' + out.kpi.hk + ' HK)');
    // A7 mangkir beruntun
    orang.forEach(function (o) { if (o.maxBeruntun >= 1) add('A7', level(rules.A7, o.maxBeruntun), 'orang', o.nama + ' (' + (o.kemandoran || o.dept) + ')', o.maxBeruntun, 'Mangkir ' + o.maxBeruntun + ' hari berturut-turut mulai ' + o.tglBeruntun, o.tglBeruntun); });
    // A10 data belum masuk
    var today = p.today || to;
    [['Produksi (Rekap Analisa)', lastRek], ['Absensi', lastAbs], ['Grade & TK', lastGrd]].forEach(function (z) {
      if (!z[1]) return; var telat = diffDays(z[1], today); if (telat < 0) return; add('A10', level(rules.A10, telat), 'data', z[0], telat, 'Data ' + z[0] + ' terakhir tanggal ' + z[1] + ' (' + telat + ' hari lalu)', today);
    });
    // A11 resign-recruit
    (data.resign || []).forEach(function (r) {
      var ym = (to.slice(0, 4)) + '-' + pad(r.bulan); if (ym < from.slice(0, 7) || ym > to.slice(0, 7)) return; var sel = r.keluar - r.recruit;
      add('A11', level(rules.A11, sel), 'divisi', 'Seluruh perusahaan', sel, 'Bulan ' + pad(r.bulan) + ': keluar ' + r.keluar + ', recruit ' + r.recruit + ' (selisih ' + sel + ')', ym);
    });
    // A12 kode baru
    var kb = data.kodeBaru || {}; Object.keys(kb).forEach(function (k) { add('A12', level(rules.A12, kb[k]), 'data', 'Kode absensi ' + k, kb[k], 'Kode "' + k + '" muncul ' + kb[k] + ' kali dan belum ada di daftar kode baku'); });
    // A13 kebun vs pabrik
    var kebunPerHari = {}; out.harian.forEach(function (h) { kebunPerHari[h.tgl] = h.kg; });
    (data.timbangan || []).forEach(function (t) {
      if (!inRange(t.tgl, from, to)) return; var kebun = t.kgKebun || kebunPerHari[t.tgl] || 0; if (!kebun || !t.kgPabrik) return;
      var pct = r2(Math.abs(kebun - t.kgPabrik) / kebun * 100); add('A13', level(rules.A13, pct), 'data', 'Timbangan ' + t.tgl, pct, 'Kebun ' + Math.round(kebun) + ' kg vs pabrik ' + Math.round(t.kgPabrik) + ' kg (selisih ' + pct + '%)', t.tgl);
    });
    isu.sort(function (a, b) { return (a.level === b.level ? 0 : a.level === 'merah' ? -1 : 1) || (a.aturan < b.aturan ? -1 : 1); });
    out.isu = isu;
    out.ringkasIsu = { merah: isu.filter(function (i) { return i.level === 'merah'; }).length, kuning: isu.filter(function (i) { return i.level === 'kuning'; }).length };
    return out;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = A; else root.AWSA = A;
})(typeof self !== 'undefined' ? self : this);
