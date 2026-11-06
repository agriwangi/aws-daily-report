/* AWS Daily Report v1.0.15 — mesin analisis otomatis untuk halaman Presentasi.
   Berbasis aturan (deterministik): setiap kalimat memakai angka langsung dari data laporan (rep) dan ambang A1–A13
   dari Pengaturan, sehingga hasilnya dapat diperiksa ulang. Bukan perkiraan acak. */
(function (w) {
  'use strict';
  var AN = {}, f = function (n, d) { return U.nf(n, d); }, p = function (n, d) { return U.pct(n, d); };
  var DEF = {
    A1: { nama: 'Pencapaian budget (%)', op: '<', kuning: 100, merah: 80 }, A3: { nama: 'Porsi Grade III (%)', op: '>', kuning: 40, merah: 50 },
    A4: { nama: 'Porsi Grade I (%)', op: '<', kuning: 10, merah: 5 }, A5: { nama: 'Absensi harian divisi (%)', op: '>', kuning: 7, merah: 10 },
    A6: { nama: 'Mangkir bulanan (%)', op: '>', kuning: 1.5, merah: 2.5 }, A7: { nama: 'Mangkir beruntun (hari)', op: '>=', kuning: 3, merah: 5 }
  };
  var STAT = { '': ['Baik', 'ok'], kuning: ['Perhatian', 'warn'], merah: ['Kritis', 'bad'] };
  /* kelompok kode absensi resmi (HK dibayar / tidak dibayar) */
  var DIBAYAR = ['K', 'H1', 'H2', 'S1', 'P3', 'P4', 'C', 'HB'], TIDAK = ['P1', 'M', 'MG', 'OUT', 'NEW'];

  function aturan(rep, k) { return (rep.aturan && rep.aturan[k]) || DEF[k]; }
  function lv(r, v) {
    if (!r || r.aktif === false || v === null || v === undefined || isNaN(v)) return '';
    var t = function (th) { return r.op === '<' ? v < th : r.op === '<=' ? v <= th : r.op === '>' ? v > th : v >= th; };
    return t(r.merah) ? 'merah' : t(r.kuning) ? 'kuning' : '';
  }
  function buruk(a, b) { var o = { '': 0, kuning: 1, merah: 2 }; return o[a] >= o[b] ? a : b; }
  function urut(a, fn, turun) { return a.slice().sort(function (x, y) { return turun ? fn(y) - fn(x) : fn(x) - fn(y); }); }
  function rata(a, fn) { return a.length ? a.reduce(function (s, x) { return s + fn(x); }, 0) / a.length : 0; }
  function th(n) { return U.pct(n, n % 1 === 0 ? 0 : 1); }
  function daftar(a, fn, n) { var x = a.slice(0, n || 3).map(fn); return x.join(x.some(function (t) { return /\d/.test(t); }) ? '; ' : ', '); }
  var UNIT = { A1: '%', A2: '%', A3: '%', A4: '%', A5: '%', A6: '%', A7: ' hari', A8: ' hari', A9: '%', A10: ' hari', A11: ' orang', A12: ' orang', A13: '%' };
  function tren(h, pakai, nilai) {
    var a = (h || []).filter(pakai); if (a.length < 12) return null;
    var s = a.slice(-7), b = a.slice(-14, -7), rs = rata(s, nilai), rb = rata(b, nilai);
    return { akhir: rs, awal: rb, poin: rs - rb, persen: rb ? (rs - rb) / rb * 100 : null, dari: s[0].tgl, sampai: s[s.length - 1].tgl };
  }
  function ada(a) { return a && a.length; }
  function nm(s) { return String(s || '').replace(/\s*\(.*$/, '').trim(); }

  /* ============ ABSENSI ============ */
  function absensi(rep) {
    var k = rep.kpi, A5 = aturan(rep, 'A5'), A6 = aturan(rep, 'A6'), A7 = aturan(rep, 'A7');
    var st = lv(A6, k.pctMangkir), kc = rep.kodeCount || {};
    var divs = urut((rep.absDivisi || []).filter(function (d) { return d.hk > 0 && d.orang >= 5; }), function (d) { return d.pctAbsen; }, true);
    var mand = urut((rep.absMandor || []).filter(function (m) { return m.hk >= 200; }), function (m) { return m.pctAbsen; }, true);
    var ber = urut((rep.orang || []).filter(function (o) { return o.maxBeruntun >= A7.kuning; }), function (o) { return o.maxBeruntun; }, true);
    var berM = ber.filter(function (o) { return o.maxBeruntun >= A7.merah; });
    var tr = tren(rep.harian, function (x) { return x.tk > 0; }, function (x) { return x.pctAbsen; });
    var sum = function (arr) { return arr.reduce(function (s, c) { return s + (kc[c] || 0); }, 0); };
    var dib = sum(DIBAYAR), tdk = sum(TIDAK), kl = kc.KL || 0, tot = dib + tdk;
    var nonHadir = ['S1', 'C', 'H1', 'H2', 'P1', 'P3', 'P4', 'M'].map(function (c) { return [c, kc[c] || 0]; }).sort(function (a, b) { return b[1] - a[1]; });
    var kel = [], kur = [], rek = [];

    if (st === '') kel.push('Kehadiran ' + p(k.pctHadir, 2) + ' dari ' + f(k.hk) + ' HK; mangkir ' + p(k.pctMangkir, 2) + ' (' + f(k.mangkir) + ' hari) masih di bawah ambang perhatian ' + th(A6.kuning) + '.');
    var divsAda = divs.filter(function (d) { return d.absen > 0; });
    if (divsAda.length) { var b = divsAda[divsAda.length - 1]; kel.push('Divisi/bagian terbaik (yang memiliki catatan ketidakhadiran): ' + b.nama + ' dengan ketidakhadiran ' + p(b.pctAbsen, 2) + ' (' + f(b.orang) + ' orang).'); }
    if (tr && tr.poin <= -0.3) kel.push('Ketidakhadiran 7 hari terakhir (' + p(tr.akhir, 2) + ') lebih rendah ' + f(Math.abs(tr.poin), 2) + ' poin dari 7 hari sebelumnya.');
    if (!ber.length) kel.push('Tidak ada karyawan dengan mangkir beruntun ≥ ' + A7.kuning + ' hari pada data yang dimuat.');

    if (st) kur.push('Mangkir ' + p(k.pctMangkir, 2) + ' (' + f(k.mangkir) + ' hari) melampaui ambang ' + (st === 'merah' ? 'kritis ' + th(A6.merah) : 'perhatian ' + th(A6.kuning)) + '.');
    var dAtas = divs.filter(function (d) { return d.pctAbsen > A5.kuning; });
    if (dAtas.length) kur.push(dAtas.length + ' divisi/bagian di atas ' + th(A5.kuning) + ' ketidakhadiran: ' + daftar(dAtas, function (d) { return d.nama + ' ' + p(d.pctAbsen, 2); }, 4) + '.');
    var mAtas = mand.filter(function (m) { return m.pctAbsen > A5.merah; });
    if (mAtas.length) kur.push(mAtas.length + ' kemandoran melebihi ' + th(A5.merah) + ' ketidakhadiran; tertinggi: ' + daftar(mAtas, function (m) { return m.nama + ' ' + p(m.pctAbsen, 1); }, 3) + '.');
    if (ber.length) kur.push(ber.length + ' karyawan mangkir beruntun ≥ ' + A7.kuning + ' hari (' + berM.length + ' di antaranya ≥ ' + A7.merah + ' hari); terlama: ' + daftar(ber, function (o) { return o.nama + ' ' + o.maxBeruntun + ' hari'; }, 3) + '.');
    if (tr && tr.poin >= 0.3) kur.push('Ketidakhadiran 7 hari terakhir naik ' + f(tr.poin, 2) + ' poin (' + p(tr.awal, 2) + ' → ' + p(tr.akhir, 2) + ').');
    if (tot && tdk / tot > 0.4) kur.push('Hari tidak dibayar mencapai ' + p(tdk / tot * 100) + ' dari seluruh kode (' + f(tdk) + ' hari), didominasi Minggu dan izin pribadi.');

    if (dAtas.length || mAtas.length) rek.push({ p: dAtas.some(function (d) { return d.pctAbsen > A5.merah; }) || mAtas.length ? 'Tinggi' : 'Sedang', t: 'Fokuskan pembinaan kehadiran pada ' + (dAtas.length ? daftar(dAtas, function (d) { return d.nama; }, 3) : '') + (dAtas.length && mAtas.length ? ' dan ' : '') + (mAtas.length ? 'kemandoran ' + daftar(mAtas, function (m) { return m.nama; }, 3) : '') + '; minta mandor mengonfirmasi alasan tiap ketidakhadiran dan siapkan tenaga cadangan.' });
    if (ber.length) rek.push({ p: berM.length ? 'Tinggi' : 'Sedang', t: 'Panggil dan catat keterangan ' + ber.length + ' karyawan mangkir beruntun (prioritas ' + daftar(berM.length ? berM : ber, function (o) { return o.nama; }, 3) + ') sesuai aturan perusahaan.' });
    if (st) rek.push({ p: st === 'merah' ? 'Tinggi' : 'Sedang', t: 'Turunkan mangkir ke bawah ' + th(A6.kuning) + ' melalui pemantauan mingguan per kemandoran.' });
    if (tr && tr.poin >= 0.3) rek.push({ p: 'Sedang', t: 'Telusuri penyebab kenaikan ketidakhadiran pekan terakhir (cuaca, hari besar, gajian) sebelum menjadi pola.' });
    if (!rek.length) rek.push({ p: 'Rendah', t: 'Pertahankan: lanjutkan pemantauan harian; tidak ada indikator absensi yang melampaui ambang.' });

    var narasi = ['Pada periode ' + U.tglID(rep.from) + ' – ' + U.tglID(rep.to) + ' tercatat ' + f(k.hk) + ' hari kerja karyawan (HK) dengan kehadiran ' + p(k.pctHadir, 2) + ', ketidakhadiran ' + p(k.pctAbsen, 2) + ' dan mangkir ' + p(k.pctMangkir, 2) + ' (' + f(k.mangkir) + ' hari).'];
    if (divs.length) narasi.push('Ketidakhadiran tertinggi pada ' + divs[0].nama + ' (' + p(divs[0].pctAbsen, 2) + ')' + (divsAda.length > 1 ? ' dan terendah (yang memiliki catatan) pada ' + divsAda[divsAda.length - 1].nama + ' (' + p(divsAda[divsAda.length - 1].pctAbsen, 2) + ')' : '') + '.');
    if (tr) narasi.push('Tren 7 hari terakhir (' + U.tglID(tr.dari, true) + ' – ' + U.tglID(tr.sampai, true) + '): ' + p(tr.akhir, 2) + ' ketidakhadiran, ' + (Math.abs(tr.poin) < 0.15 ? 'relatif stabil' : tr.poin > 0 ? 'naik ' + f(tr.poin, 2) + ' poin' : 'turun ' + f(Math.abs(tr.poin), 2) + ' poin') + ' dibanding 7 hari sebelumnya.');
    return { status: st, k: k, divs: divs, mand: mand, ber: ber, tr: tr, dib: dib, tdk: tdk, kl: kl, tot: tot, nonHadir: nonHadir, kel: kel, kur: kur, rek: rek, narasi: narasi };
  }

  /* ============ PRODUKSI & BUDGET ============ */
  function produksi(rep) {
    var k = rep.kpi, A1 = aturan(rep, 'A1'), A3 = aturan(rep, 'A3'), A4 = aturan(rep, 'A4');
    var sd = k.pctCapaiSd, st = lv(A1, sd), sel = (k.kg || 0) - (k.budgetSd || 0);
    var stG = buruk(lv(A3, k.pctG3), lv(A4, k.pctG1));
    var dv = (rep.divisi || []).filter(function (d) { return d.budgetSd > 0; }).map(function (d) { var o = {}; for (var x in d) o[x] = d[x]; o.pctSd = d.kg / d.budgetSd * 100; o.selSd = d.kg - d.budgetSd; return o; });
    var dvU = urut(dv, function (d) { return d.pctSd; }, true), dBawah = dv.filter(function (d) { return d.pctSd < A1.kuning; }), dKritis = dv.filter(function (d) { return d.pctSd < A1.merah; });
    var mn = (rep.mandor || []).filter(function (m) { return m.budgetSd > 0 && m.kg > 0; }), mU = urut(mn, function (m) { return m.pctCapaiSd; }, true);
    var mBawah = mn.filter(function (m) { return m.pctCapaiSd < A1.kuning; }), mKritis = mn.filter(function (m) { return m.pctCapaiSd < A1.merah; });
    var asi = urut((rep.asisten || []).filter(function (a) { return a.hkPetik > 0; }), function (a) { return a.kgPerHk; }, true);
    var tr = tren(rep.harian, function (x) { return x.kg > 0; }, function (x) { return x.kg; });
    var g3U = urut(dv.filter(function (d) { return d.kg > 0; }), function (d) { return d.pctG3; }, true), g1U = urut(dv.filter(function (d) { return d.kg > 0; }), function (d) { return d.pctG1; }, true);
    var kel = [], kur = [], rek = [], kelB = [], kurB = [], rekB = [];

    /* — produksi & kualitas — */
    if (k.pctG3 < A3.kuning) kel.push('Grade III hanya ' + p(k.pctG3) + ' (di bawah ambang perhatian ' + th(A3.kuning) + '); Grade I + II ' + p(k.pctG1 + k.pctG2) + ' dari ' + f(k.kg) + ' kg.');
    if (k.pctG1 >= A4.kuning) kel.push('Grade I ' + p(k.pctG1) + ' di atas batas minimal ' + th(A4.kuning) + '; divisi terbaik ' + (g1U[0] ? g1U[0].nama + ' (' + p(g1U[0].pctG1) + ')' : '–') + '.');
    if (tr && tr.persen !== null && tr.persen >= 3) kel.push('Rata-rata produksi harian 7 hari terakhir ' + f(tr.akhir) + ' kg, naik ' + p(tr.persen) + ' dari 7 hari sebelumnya.');
    if (asi.length) kel.push('Produktivitas ' + f(k.kgPerHk, 1) + ' kg/HK petik; asisten tertinggi ' + asi[0].nama + ' (' + f(asi[0].kgPerHk, 1) + ' kg/HK).');
    if (tr && tr.persen !== null && tr.persen <= -3) kur.push('Rata-rata produksi harian 7 hari terakhir ' + f(tr.akhir) + ' kg turun ' + p(Math.abs(tr.persen)) + ' dari 7 hari sebelumnya (' + f(tr.awal) + ' kg).');
    if (stG) kur.push('Kualitas petikan: Grade III ' + p(k.pctG3) + ' (ambang ' + th(A3.kuning) + ') dan Grade I ' + p(k.pctG1) + ' (batas ' + th(A4.kuning) + ').');
    if (g3U.length && g3U[0].pctG3 > A3.kuning) kur.push('Grade III tertinggi pada ' + daftar(g3U.filter(function (d) { return d.pctG3 > A3.kuning; }), function (d) { return d.nama + ' ' + p(d.pctG3); }, 3) + '.');
    if (asi.length > 1 && asi[asi.length - 1].kgPerHk < 0.85 * k.kgPerHk) kur.push('Produktivitas terendah ' + asi[asi.length - 1].nama + ' ' + f(asi[asi.length - 1].kgPerHk, 1) + ' kg/HK, ' + p((1 - asi[asi.length - 1].kgPerHk / k.kgPerHk) * 100, 0) + ' di bawah rata-rata ' + f(k.kgPerHk, 1) + '.');
    var g3Lok = g3U[0] && g3U[0].pctG3 > A3.kuning;
    if (stG || g3Lok) rek.push({ p: stG === 'merah' || (g3Lok && g3U[0].pctG3 > A3.merah) ? 'Tinggi' : 'Sedang', t: 'Perketat standar pucuk dan jarak petik' + (g3U[0] && g3U[0].pctG3 > A3.kuning ? ' terutama di ' + daftar(g3U.filter(function (d) { return d.pctG3 > A3.kuning; }), function (d) { return d.nama; }, 2) : '') + '; lakukan pembinaan teknik petik agar Grade I naik.' });
    if (asi.length > 1 && asi[asi.length - 1].kgPerHk < 0.85 * k.kgPerHk) rek.push({ p: 'Sedang', t: 'Dampingi tenaga petik di bawah ' + asi[asi.length - 1].nama + ' (kg/HK ' + f(asi[asi.length - 1].kgPerHk, 1) + ') dengan praktik terbaik dari ' + asi[0].nama + '.' });
    if (tr && tr.persen !== null && tr.persen <= -3) rek.push({ p: 'Tinggi', t: 'Telusuri penyebab penurunan produksi pekan terakhir (cuaca, tenaga petik, luas petik) dan laporkan ke Asisten.' });
    if (!rek.length) rek.push({ p: 'Rendah', t: 'Pertahankan kualitas dan produktivitas; lanjutkan pemantauan harian.' });

    /* — budget vs pencapaian — */
    if (st === '') kelB.push('Pencapaian ' + p(sd) + ' dari target berjalan — memenuhi target.');
    if (dv.length && dvU[0].pctSd >= A1.kuning) kelB.push(dv.filter(function (d) { return d.pctSd >= A1.kuning; }).length + ' dari ' + dv.length + ' divisi memenuhi target; terbaik ' + dvU[0].nama + ' ' + p(dvU[0].pctSd) + '.');
    if (mn.length) { var ok = mn.filter(function (m) { return m.pctCapaiSd >= A1.kuning; }); if (ok.length) kelB.push(ok.length + ' dari ' + mn.length + ' mandor mencapai ≥ ' + th(A1.kuning) + '; teratas ' + daftar(urut(ok, function (m) { return m.pctCapaiSd; }, true), function (m) { return m.mandor + ' ' + p(m.pctCapaiSd); }, 3) + '.'); }
    if (st) kurB.push('Pencapaian ' + p(sd) + ' dari target berjalan s.d. ' + U.tglID(k.tglBerjalan, true) + ' — kurang ' + f(Math.abs(sel)) + ' kg (' + (st === 'merah' ? 'kritis, di bawah ' + th(A1.merah) : 'di bawah target ' + th(A1.kuning)) + ').');
    if (dBawah.length) kurB.push(dBawah.length + ' dari ' + dv.length + ' divisi belum memenuhi target; terendah ' + daftar(urut(dBawah, function (d) { return d.pctSd; }), function (d) { return d.nama + ' ' + p(d.pctSd) + ' (' + f(d.selSd) + ' kg)'; }, 3) + '.');
    if (mKritis.length) kurB.push(mKritis.length + ' mandor di bawah ' + th(A1.merah) + ' (kritis); terendah ' + daftar(urut(mKritis, function (m) { return m.pctCapaiSd; }), function (m) { return m.mandor + ' ' + p(m.pctCapaiSd); }, 3) + '.');
    if (dBawah.length) rekB.push({ p: dKritis.length ? 'Tinggi' : 'Sedang', t: 'Prioritaskan pengejaran target di ' + daftar(urut(dBawah, function (d) { return d.pctSd; }), function (d) { return d.nama; }, 3) + ': periksa luas petik, jumlah tenaga petik, dan rotasi blok.' });
    if (mKritis.length) rekB.push({ p: 'Tinggi', t: 'Tinjau mingguan ' + mKritis.length + ' mandor kritis bersama Asisten; mulai dari ' + daftar(urut(mKritis, function (m) { return m.pctCapaiSd; }), function (m) { return m.mandor; }, 3) + '.' });
    if (st && !dBawah.length) rekB.push({ p: 'Sedang', t: 'Kekurangan tersebar merata antar divisi: tinjau faktor umum (cuaca, pucuk, absensi) dan sesuaikan budget harian.' });
    if (!rekB.length) rekB.push({ p: 'Rendah', t: 'Pertahankan ritme produksi; tidak ada divisi atau mandor di bawah target.' });

    var narasi = ['Produksi periode ini ' + f(k.kg) + ' kg dari budget s.d. ' + U.tglID(k.tglBerjalan, true) + ' sebesar ' + f(k.budgetSd) + ' kg: pencapaian ' + p(sd) + ', ' + (sel >= 0 ? 'lebih ' : 'kurang ') + f(Math.abs(sel)) + ' kg. Budget periode penuh ' + f(k.budget) + ' kg (baru ' + p(k.pctCapai) + ' terealisasi).'];
    narasi.push('Komposisi grade: Grade I ' + p(k.pctG1) + ', Grade II ' + p(k.pctG2) + ', Grade III ' + p(k.pctG3) + '. Produktivitas ' + f(k.kgPerHk, 1) + ' kg per HK petik pada ' + f(k.hariData) + ' hari data.');
    if (dv.length) narasi.push('Dari ' + dv.length + ' divisi, ' + (dv.length - dBawah.length) + ' memenuhi target dan ' + dBawah.length + ' di bawah target; kesenjangan terbaik–terendah ' + f(dvU[0].pctSd - dvU[dvU.length - 1].pctSd, 1) + ' poin.');
    return { status: st, statusG: stG, k: k, sd: sd, sel: sel, dv: dv, dvU: dvU, dBawah: dBawah, dKritis: dKritis, mn: mn, mU: mU, mBawah: mBawah, mKritis: mKritis, asi: asi, tr: tr, g3U: g3U, g1U: g1U, kel: kel, kur: kur, rek: rek, kelB: kelB, kurB: kurB, rekB: rekB, narasi: narasi };
  }

  /* ============ ISU & GAGASAN PENANGANAN ============ */
  function peringkat(i, op) { return (i.level === 'merah' ? 0 : 1e6) + (op === '<' || op === '<=' ? i.nilai : -i.nilai); }
  function cariMandor(rep, e) {
    var m = /^(.*?)\s*\((.*?)\/(.*?)\)\s*$/.exec(String(e || '')); if (!m) return null;
    return (rep.mandor || []).filter(function (x) { return x.mandor === m[1] && String(x.divisi) === m[2] && x.sub === m[3]; })[0] || null;
  }
  function kartu(rep, aturanId, grp, ctx) {
    var r = aturan(rep, aturanId) || { nama: grp[0].nama, op: '<', kuning: grp[0].ambang }, k = rep.kpi;
    var merah = grp.filter(function (i) { return i.level === 'merah'; }).length, kuning = grp.length - merah;
    var top = grp.slice().sort(function (a, b) { return peringkat(a, r.op) - peringkat(b, r.op); }), c = { aturan: aturanId, nama: grp[0].nama, jumlah: grp.length, merah: merah, kuning: kuning, bukti: [], penyebab: [], tindakan: [], target: '' };
    var sel = function (n) { return daftar(top, function (i) { return (i.scope === 'mandor' || i.scope === 'divisi' ? i.entitas : nm(i.entitas)) + (i.tgl && i.scope !== 'orang' ? ' [' + i.tgl + ']' : '') + ' ' + f(i.nilai, 1) + (UNIT[aturanId] || ''); }, n || 3); };
    var dasar = (top[0].rekomendasi || '').replace(/\s+$/, '');
    c.bukti.push(grp.length + ' temuan (' + merah + ' merah, ' + kuning + ' kuning). Terburuk: ' + sel(3) + '.');
    var tumpang = aturanId === 'A2' && ctx.a1ent ? grp.filter(function (i) { return ctx.a1ent[i.entitas]; }).length : 0;
    if (aturanId === 'A2' && tumpang >= grp.length / 2) {
      c.penyebab.push(tumpang + ' dari ' + grp.length + ' entitas sama dengan temuan A1 (pencapaian budget) — analisis penyebab dan tindakan rinci ada di kartu A1.');
      c.tindakan.push(dasar || 'Bandingkan realisasi dengan budget harian dan evaluasi penyebab selisih.');
      c.target = 'Selisih terhadap budget membaik hingga lebih baik dari ' + th(r.kuning) + '.';
    } else if (aturanId === 'A1' || aturanId === 'A2') {
      var avg = k.kgPerHk, rendah = [], setara = [];
      top.slice(0, 5).forEach(function (i) { var m = cariMandor(rep, i.entitas); if (!m || !avg) return; (m.kgPerHk < 0.85 * avg ? rendah : setara).push(m); });
      if (rendah.length) c.penyebab.push('Indikasi produktivitas per tenaga petik rendah: ' + daftar(rendah, function (m) { return m.mandor + ' ' + f(m.kgPerHk, 1) + ' kg/HK'; }, 3) + ' (rata-rata ' + f(avg, 1) + ').');
      if (setara.length) c.penyebab.push('Produktivitas setara rata-rata pada ' + daftar(setara, function (m) { return m.mandor + ' ' + f(m.kgPerHk, 1); }, 3) + ' — kekurangan lebih mungkin pada jumlah tenaga petik/luas petik/pucuk, bukan teknik petik.');
      if (ctx.abs.status) c.penyebab.push('Mangkir keseluruhan ' + p(k.pctMangkir, 2) + ' ikut menekan jumlah tenaga petik.');
      if (!c.penyebab.length) c.penyebab.push('Data pembanding per mandor tidak lengkap; periksa luas petik dan tenaga petik langsung di lapangan.');
      if (rendah.length) c.tindakan.push('Pendampingan teknik petik dan target harian untuk ' + daftar(rendah, function (m) { return m.mandor; }, 3) + '.');
      if (setara.length) c.tindakan.push('Tambah/realokasi tenaga petik dan tinjau rotasi blok untuk ' + daftar(setara, function (m) { return m.mandor; }, 3) + '.');
      c.tindakan.push('Bandingkan realisasi dengan budget harian tiap pagi dan koreksi alokasi sebelum siang.');
      c.target = aturanId === 'A2' ? 'Selisih terhadap budget lebih baik dari ' + th(r.kuning) + '.' : 'Capaian kembali ≥ ' + th(r.kuning) + ' dari target berjalan.';
    } else if (aturanId === 'A3' || aturanId === 'A4') {
      var dd = aturanId === 'A3' ? ctx.prod.g3U : ctx.prod.g1U.slice().reverse();
      c.penyebab.push((aturanId === 'A3' ? 'Grade III tertinggi: ' : 'Grade I terendah: ') + daftar(dd, function (d) { return d.nama + ' ' + p(aturanId === 'A3' ? d.pctG3 : d.pctG1); }, 3) + ' (rata-rata ' + p(aturanId === 'A3' ? k.pctG3 : k.pctG1) + ').');
      c.tindakan.push('Ingatkan standar pucuk (1 tunas + 2–3 daun) dan jarak petik; supervisi petikan di lokasi terburuk.');
      c.tindakan.push('Pembinaan teknik petik terarah bagi tenaga petik dengan Grade III tinggi.');
      c.target = aturanId === 'A3' ? 'Grade III ≤ ' + th(r.kuning) + '.' : 'Grade I ≥ ' + th(r.kuning) + '.';
    } else if (aturanId === 'A5') {
      var kodeT = ctx.abs.nonHadir.filter(function (x) { return x[1] > 0; }).slice(0, 2);
      if (kodeT.length) c.penyebab.push('Kode ketidakhadiran terbesar: ' + kodeT.map(function (x) { return x[0] + ' ' + f(x[1]) + ' hari'; }).join(', ') + '.');
      c.tindakan.push('Konfirmasi alasan ketidakhadiran ke mandor pada hari yang sama dan siapkan tenaga cadangan.');
      c.target = 'Ketidakhadiran harian ≤ ' + th(r.kuning) + '.';
    } else if (aturanId === 'A6' || aturanId === 'A7') {
      var po = {}, idx = {}; (rep.orang || []).forEach(function (o) { idx[o.nama] = o; });
      grp.forEach(function (i) { var o = idx[nm(i.entitas)]; if (o) { var g = o.kemandoran || o.asisten || o.dept || '-'; po[g] = (po[g] || 0) + 1; } });
      var tk = Object.keys(po).sort(function (a, b) { return po[b] - po[a]; }).slice(0, 2);
      if (tk.length && grp.length >= 4) c.penyebab.push('Kasus terkonsentrasi pada ' + tk.map(function (g) { return g + ' (' + po[g] + ' kasus)'; }).join(', ') + '.');
      else c.penyebab.push('Kasus tersebar, tidak ada kemandoran yang dominan.');
      c.tindakan.push('Panggil karyawan terkait, catat keterangan, dan beri pembinaan sesuai aturan perusahaan.');
      c.tindakan.push('Pantau ulang dalam 7 hari; eskalasi ke Asisten bila berulang.');
      c.target = aturanId === 'A6' ? 'Mangkir bulanan ≤ ' + th(r.kuning) + '.' : 'Tidak ada mangkir beruntun ≥ ' + r.kuning + ' hari.';
    } else if (aturanId === 'A10') {
      c.penyebab.push('Produksi terakhir ' + U.tglID(k.dataTerakhirProduksi, true) + ', absensi terakhir ' + U.tglID(k.dataTerakhirAbsensi, true) + '.');
      c.tindakan.push('Unggah Excel harian yang belum masuk agar laporan dan analisis ini tidak tertinggal.');
      c.target = 'Data masuk setiap hari.';
    } else {
      if (dasar) c.tindakan.push(dasar);
      c.target = r.nama + ' kembali di luar ambang perhatian (' + (r.op || '') + ' ' + r.kuning + ').';
    }
    if (dasar && c.tindakan.indexOf(dasar) < 0 && aturanId !== 'A10') c.tindakan.push(dasar);
    return c;
  }
  function isuAnalisis(rep, ctx) {
    var isu = rep.isu || [], ring = rep.ringkasIsu || { merah: 0, kuning: 0 }, per = {}, ent = {};
    isu.forEach(function (i) { (per[i.aturan] = per[i.aturan] || []).push(i); var e = ent[i.entitas] = ent[i.entitas] || { e: i.entitas, n: 0, m: 0, aturan: {} }; e.n++; if (i.level === 'merah') e.m++; e.aturan[i.aturan] = 1; });
    var ids = Object.keys(per).sort(function (a, b) { var ma = per[a].filter(function (i) { return i.level === 'merah'; }).length, mb = per[b].filter(function (i) { return i.level === 'merah'; }).length; return mb - ma || per[b].length - per[a].length; });
    var ents = Object.keys(ent).map(function (e) { return ent[e]; }).sort(function (a, b) { return b.m - a.m || b.n - a.n; });
    ctx.a1ent = {}; (per.A1 || []).forEach(function (i) { ctx.a1ent[i.entitas] = 1; });
    var cards = ids.map(function (id) { return kartu(rep, id, per[id], ctx); });
    var st = ring.merah > 0 ? 'merah' : ring.kuning > 0 ? 'kuning' : '';
    var narasi = isu.length ? ['Sistem mengevaluasi 13 aturan terhadap data periode ini dan menemukan ' + f(isu.length) + ' isu aktif: ' + f(ring.merah) + ' merah (kritis) dan ' + f(ring.kuning) + ' kuning (perhatian), tersebar pada ' + ids.length + ' jenis aturan.',
      'Jenis isu terbanyak: ' + daftar(ids.map(function (id) { return { id: id, n: per[id].length, nama: per[id][0].nama }; }).sort(function (a, b) { return b.n - a.n; }), function (x) { return x.id + ' ' + x.nama + ' (' + x.n + ')'; }, 3) + '.'] : ['Tidak ada isu aktif pada periode ini; seluruh indikator berada di dalam ambang yang ditetapkan.'];
    var kel = [], kur = [];
    if (!ring.merah) kel.push('Tidak ada isu berstatus merah (kritis).');
    if (ids.length <= 3 && isu.length) kel.push('Isu terkonsentrasi pada ' + ids.length + ' jenis aturan sehingga penanganan dapat difokuskan.');
    if (ring.merah) kur.push(f(ring.merah) + ' isu merah memerlukan penanganan segera.');
    if (ents.length && ents[0].m) kur.push('Entitas dengan isu merah terbanyak: ' + daftar(ents.filter(function (e) { return e.m > 0; }), function (e) { return e.e + ' (' + e.m + ' merah, ' + e.n + ' total)'; }, 3) + '.');
    return { status: st, ring: ring, isu: isu, per: per, ids: ids, ents: ents, cards: cards, narasi: narasi, kel: kel, kur: kur };
  }

  /* ============ POLA LINTAS DATA (gagasan strategis) ============ */
  function lintas(rep, a, pr, is) {
    var k = rep.kpi, out = [], A3 = aturan(rep, 'A3'), A1 = aturan(rep, 'A1');
    if (pr.status && !a.status) out.push({ j: 'Kekurangan target bukan disebabkan kehadiran', bukti: 'Pencapaian ' + p(pr.sd) + ' sementara mangkir hanya ' + p(k.pctMangkir, 2) + ' (di bawah ambang).', g: 'Fokus pada produktivitas per tenaga petik, luas petik, dan kualitas pucuk — bukan pada kedisiplinan.' });
    if (pr.status && a.status) out.push({ j: 'Absensi dan capaian target sama-sama bermasalah', bukti: 'Pencapaian ' + p(pr.sd) + ' dan mangkir ' + p(k.pctMangkir, 2) + ' (ambang ' + p(aturan(rep, 'A6').kuning) + ').', g: 'Tangani kehadiran lebih dulu pada divisi dengan capaian terendah (' + (pr.dvU.length ? pr.dvU[pr.dvU.length - 1].nama : '–') + '): tiap tenaga petik yang hadir langsung menambah kg.' });
    if (pr.dvU.length > 1) { var gap = pr.dvU[0].pctSd - pr.dvU[pr.dvU.length - 1].pctSd; if (gap >= 15) out.push({ j: 'Kesenjangan capaian antar divisi', bukti: pr.dvU[0].nama + ' ' + p(pr.dvU[0].pctSd) + ' vs ' + pr.dvU[pr.dvU.length - 1].nama + ' ' + p(pr.dvU[pr.dvU.length - 1].pctSd) + ' (selisih ' + f(gap, 1) + ' poin).', g: 'Pindahkan praktik terbaik dari ' + pr.dvU[0].nama + ' (rotasi blok, penjadwalan, pendampingan) ke ' + pr.dvU[pr.dvU.length - 1].nama + '.' }); }
    if (pr.status && pr.statusG && k.pctG3 > A3.kuning) out.push({ j: 'Kuantitas dan kualitas sama-sama tertekan', bukti: 'Capaian ' + p(pr.sd) + ' dan Grade III ' + p(k.pctG3) + ' (ambang ' + th(A3.kuning) + ').', g: 'Hindari mengejar volume dengan petikan kasar; perbaiki jarak petik dan standar pucuk agar volume dan mutu naik bersamaan.' });
    if (pr.asi.length > 1) { var sp = (pr.asi[0].kgPerHk - pr.asi[pr.asi.length - 1].kgPerHk) / pr.asi[0].kgPerHk * 100; if (sp >= 20) out.push({ j: 'Produktivitas antar asisten timpang', bukti: pr.asi[0].nama + ' ' + f(pr.asi[0].kgPerHk, 1) + ' vs ' + pr.asi[pr.asi.length - 1].nama + ' ' + f(pr.asi[pr.asi.length - 1].kgPerHk, 1) + ' kg/HK (selisih ' + p(sp, 0) + ').', g: 'Adakan pertukaran praktik antar wilayah asisten dan tetapkan target kg/HK minimum per kemandoran.' }); }
    if (a.tdk && a.tot && a.nonHadir[0] && a.nonHadir[0][1] > 0 && a.nonHadir[0][0] === 'P1') out.push({ j: 'Izin kepentingan pribadi menjadi ketidakhadiran terbesar', bukti: 'Kode P1 (izin tidak dibayar) ' + f(a.nonHadir[0][1]) + ' hari — terbesar di antara kode ketidakhadiran.', g: 'Tinjau pola izin pribadi (hari, divisi) dan sepakati aturan pengajuan agar tenaga petik bisa direncanakan.' });
    if (a.tr && pr.tr && a.tr.poin >= 0.3 && pr.tr.persen !== null && pr.tr.persen <= -3) out.push({ j: 'Absensi naik bersamaan produksi turun (7 hari terakhir)', bukti: 'Ketidakhadiran naik ' + f(a.tr.poin, 2) + ' poin; produksi harian turun ' + p(Math.abs(pr.tr.persen)) + '.', g: 'Indikasi kuat keterkaitan: tindak lanjuti absensi pekan ini sebelum produksi turun lebih jauh. (Korelasi, bukan bukti sebab-akibat.)' });
    var telat = k.dataTerakhirProduksi && rep.hariIni && U.parse(rep.hariIni) - U.parse(k.dataTerakhirProduksi) > 2 * 864e5;
    if (telat) out.push({ j: 'Data produksi tertinggal', bukti: 'Produksi terakhir ' + U.tglID(k.dataTerakhirProduksi, true) + '.', g: 'Unggah data terbaru agar kesimpulan mencerminkan kondisi saat ini.' });
    return out;
  }

  /* ============ SUSUN SELURUH SLIDE ============ */
  AN.susun = function (rep, o) {
    o = o || {}; var k = rep.kpi, hari = o.hari || U.today(); rep.hariIni = hari;
    var a = absensi(rep), pr = produksi(rep), is = isuAnalisis(rep, { abs: a, prod: pr }), ln = lintas(rep, a, pr, is);
    var periode = U.tglID(rep.from) + ' – ' + U.tglID(rep.to);
    var telat = k.dataTerakhirProduksi && U.parse(hari) - U.parse(k.dataTerakhirProduksi) > 864e5 ? Math.round((U.parse(hari) - U.parse(k.dataTerakhirProduksi)) / 864e5) : 0;
    var stIsu = is.status;
    var bidang = [
      { n: 'Absensi', st: a.status, v: p(k.pctHadir, 1) + ' hadir', s: 'Mangkir ' + p(k.pctMangkir, 2) },
      { n: 'Produksi vs budget', st: pr.status, v: p(pr.sd, 1), s: (pr.sel >= 0 ? '+' : '−') + f(Math.abs(pr.sel)) + ' kg' },
      { n: 'Kualitas grade', st: pr.statusG, v: 'G1 ' + p(k.pctG1, 1), s: 'G3 ' + p(k.pctG3, 1) },
      { n: 'Isu & temuan', st: stIsu, v: f(is.ring.merah) + ' merah', s: f(is.ring.kuning) + ' kuning' }
    ].map(function (b) { b.label = STAT[b.st][0]; b.kls = STAT[b.st][1]; return b; });
    var semuaRek = [].concat(a.rek, pr.rek, pr.rekB), prio = { Tinggi: 0, Sedang: 1, Rendah: 2 };
    var rekUrut = semuaRek.slice().sort(function (x, y) { return prio[x.p] - prio[y.p]; });
    var kelAll = [].concat(a.kel.slice(0, 2), pr.kelB.slice(0, 2), pr.kel.slice(0, 2), is.kel.slice(0, 1));
    var kurAll = [].concat(is.kur.slice(0, 1), pr.kurB.slice(0, 2), a.kur.slice(0, 2), pr.kur.slice(0, 2));
    var sorot = [].concat(pr.kurB.slice(0, 1), a.kur.slice(0, 1), is.kur.slice(0, 1)).concat(kelAll.slice(0, 1));
    var S = [];

    S.push({ id: 'cover', tipe: 'cover', judul: 'Presentasi Data Operasional', sub: 'Absensi · Produksi · Budget vs Pencapaian · Isu & Gagasan', catatan: periode, catatan2: 'Dianalisis otomatis dari data aplikasi · ' + U.tglID(hari) });
    S.push({ id: 'ringkasan', bidang: 'Ringkasan', judul: 'Ringkasan Eksekutif', sub: periode, status: bidang,
      kpi: [{ l: 'Produksi', v: f(k.kg) + ' kg', s: 'Budget s.d. ' + f(k.budgetSd) + ' kg' }, { l: 'Pencapaian', v: p(pr.sd, 1), s: (pr.sel >= 0 ? '▲ +' : '▼ −') + f(Math.abs(pr.sel)) + ' kg', kls: pr.sel >= 0 ? 'up' : 'dn' }, { l: 'Kehadiran', v: p(k.pctHadir, 2), s: f(k.hadir) + ' dari ' + f(k.hk) + ' HK' }, { l: 'Kg per HK', v: f(k.kgPerHk, 1), s: 'Grade I ' + p(k.pctG1) }],
      narasi: sorot.filter(Boolean), judulNarasi: 'Sorotan utama',
      peringatan: telat > 0 ? 'Data produksi terakhir ' + U.tglID(k.dataTerakhirProduksi, true) + ' (' + telat + ' hari tertinggal). Kesimpulan mencerminkan data hingga tanggal tersebut.' : '' });
    S.push({ id: 'abs1', bidang: 'Absensi', judul: 'Absensi — Gambaran Kehadiran', sub: periode,
      kpi: [{ l: 'Kehadiran', v: p(k.pctHadir, 2), s: f(k.hadir) + ' dari ' + f(k.hk) + ' HK' }, { l: 'Ketidakhadiran', v: p(k.pctAbsen, 2), s: 'Seluruh kode tidak hadir' }, { l: 'Mangkir', v: p(k.pctMangkir, 2), s: f(k.mangkir) + ' hari', kls: a.status ? 'dn' : '' }, { l: 'Karyawan', v: f(k.karyawan), s: 'Terdata pada periode' }],
      charts: [{ id: 'abs_harian', judul: 'Absensi harian (%)', jenis: 'line', spec: function () { return SPEC.harianAbsensi(rep); } }, { id: 'abs_div', judul: 'Absensi & mangkir per divisi/bagian (%)', jenis: 'bar', spec: function () { return SPEC.absDivisi(rep); } }], narasi: a.narasi });
    S.push({ id: 'abs2', bidang: 'Absensi', judul: 'Absensi — Kelebihan, Kekurangan & Rekomendasi', sub: 'Dinilai terhadap ambang A5–A7 di Pengaturan', status1: STAT[a.status], kol3: { kel: a.kel, kur: a.kur, rek: a.rek } });
    S.push({ id: 'abs3', bidang: 'Absensi', judul: 'Kode Absensi — HK Dibayar & Tidak Dibayar', sub: 'Berdasarkan daftar kode resmi perusahaan',
      kpi: [{ l: 'HK dibayar', v: f(a.dib), s: 'K, H1, H2, S1, P3, P4, C, HB' }, { l: 'HK tidak dibayar', v: f(a.tdk), s: 'P1, M, MG, OUT, NEW' }, { l: 'Kerja lembur (KL)', v: f(a.kl), s: 'Tambahan di luar daftar resmi' }, { l: 'Kode terbesar tidak hadir', v: a.nonHadir[0] ? a.nonHadir[0][0] : '–', s: a.nonHadir[0] ? f(a.nonHadir[0][1]) + ' hari' : '' }],
      charts: [{ id: 'abs_kode', judul: 'Sebaran kode absensi (hari)', jenis: 'donut', spec: function () { return SPEC.kodeAll(rep); } }, { id: 'abs_kode2', judul: 'Kode ketidakhadiran (hari)', jenis: 'bar', spec: function () { return SPEC.kodeDist(rep); } }],
      narasi: ['Dari seluruh kode tercatat, ' + f(a.dib) + ' hari termasuk HK dibayar dan ' + f(a.tdk) + ' hari HK tidak dibayar (Minggu, izin pribadi, mangkir, keluar, karyawan baru).' + (a.nonHadir[0] ? ' Kode ketidakhadiran terbesar: ' + a.nonHadir[0][0] + ' (' + (U.kodeNama ? U.kodeNama(a.nonHadir[0][0]) : '') + ') ' + f(a.nonHadir[0][1]) + ' hari.' : '')] });
    S.push({ id: 'prd1', bidang: 'Produksi', judul: 'Produksi — Realisasi & Kualitas', sub: periode,
      kpi: [{ l: 'Produksi', v: f(k.kg) + ' kg', s: f(k.hariData) + ' hari data' }, { l: 'Kg per HK petik', v: f(k.kgPerHk, 1), s: 'Produktivitas' }, { l: 'Grade I', v: p(k.pctG1), s: 'Grade II ' + p(k.pctG2) }, { l: 'Grade III', v: p(k.pctG3), s: f(k.g3) + ' kg', kls: pr.statusG ? 'dn' : '' }],
      charts: [{ id: 'prd_harian', judul: 'Produksi harian (kg)', jenis: 'bar', spec: function () { return SPEC.harianKg(rep); } }, { id: 'prd_grade', judul: 'Komposisi grade', jenis: 'donut', spec: function () { return SPEC.gradeMix(rep); } }], narasi: pr.narasi.slice(1) });
    S.push({ id: 'prd2', bidang: 'Produksi', judul: 'Produksi — Kelebihan, Kekurangan & Rekomendasi', sub: 'Dinilai terhadap ambang A3, A4 dan A9', status1: STAT[pr.statusG], kol3: { kel: pr.kel, kur: pr.kur, rek: pr.rek } });
    S.push({ id: 'bvp1', bidang: 'Budget vs Pencapaian', judul: 'Budget vs Pencapaian per Divisi', sub: 'Target berjalan s.d. ' + U.tglID(k.tglBerjalan, true),
      kpi: [{ l: 'Budget s.d. tanggal', v: f(k.budgetSd) + ' kg', s: 'Periode penuh ' + f(k.budget) + ' kg' }, { l: 'Realisasi', v: f(k.kg) + ' kg', s: p(pr.sd, 1) + ' dari budget s.d.' }, { l: 'Selisih', v: (pr.sel >= 0 ? '+' : '−') + f(Math.abs(pr.sel)) + ' kg', s: pr.sel >= 0 ? 'Di atas target' : 'Di bawah target', kls: pr.sel >= 0 ? 'up' : 'dn' }, { l: 'Divisi memenuhi target', v: (pr.dv.length - pr.dBawah.length) + ' / ' + pr.dv.length, s: pr.dKritis.length + ' kritis (< ' + p(aturan(rep, 'A1').merah, 0) + ')' }],
      charts: [{ id: 'bvp_div', judul: 'Produksi vs budget per divisi', jenis: 'bar', spec: function () { return SPEC.divisiKg(rep); } }, { id: 'bvp_selisih', judul: 'Selisih terhadap budget per divisi', jenis: 'bar', spec: function () { var sp = SPEC.waterfallSelisih(rep); sp.warna = ['#DC2626']; return sp; } }],
      tabel: { judul: 'Mandor teratas & terbawah (capaian s.d. tanggal)', kepala: ['Mandor', 'Divisi / Sub', 'Budget s.d. (kg)', 'Produksi (kg)', '% Capai', 'Kg/HK'], baris: [].concat(pr.mU.slice(0, 3), pr.mU.length > 6 ? pr.mU.slice(-3) : []).map(function (m) { return [m.mandor, m.divisi + ' / ' + m.sub, f(m.budgetSd), f(m.kg), p(m.pctCapaiSd, 1), f(m.kgPerHk, 1)]; }) } });
    S.push({ id: 'bvp2', bidang: 'Budget vs Pencapaian', judul: 'Budget vs Pencapaian — Kelebihan, Kekurangan & Rekomendasi', sub: 'Dinilai terhadap ambang A1 (kuning < ' + p(aturan(rep, 'A1').kuning, 0) + ', merah < ' + p(aturan(rep, 'A1').merah, 0) + ')', status1: STAT[pr.status], kol3: { kel: pr.kelB, kur: pr.kurB, rek: pr.rekB } });
    S.push({ id: 'isu1', bidang: 'Isu', judul: 'Isu — Peta Temuan Otomatis', sub: 'Evaluasi 13 aturan A1–A13',
      kpi: [{ l: 'Isu merah (kritis)', v: f(is.ring.merah), s: 'Perlu tindakan segera', kls: is.ring.merah ? 'dn' : '' }, { l: 'Isu kuning (perhatian)', v: f(is.ring.kuning), s: 'Perlu dipantau' }, { l: 'Jenis aturan terkena', v: f(is.ids.length), s: 'dari 13 aturan' }, { l: 'Entitas terdampak', v: f(is.ents.length), s: 'mandor, divisi, orang' }],
      charts: [{ id: 'isu_level', judul: 'Isu menurut tingkat', jenis: 'donut', spec: function () { return SPEC.isuLevel(rep); } }, { id: 'isu_aturan', judul: 'Isu menurut aturan', jenis: 'bar', spec: function () { return SPEC.isuAturan(rep); } }], narasi: is.narasi });
    if (is.ents.length) S.push({ id: 'isu2', bidang: 'Isu', judul: 'Isu — Entitas Prioritas', sub: 'Diurutkan menurut jumlah isu merah',
      tabel: { judul: '', kepala: ['Entitas', 'Merah', 'Total isu', 'Aturan terkait'], baris: is.ents.slice(0, 10).map(function (e) { return [e.e, f(e.m), f(e.n), Object.keys(e.aturan).sort().join(', ')]; }) },
      kol3: { kel: is.kel, kur: is.kur, rek: [] } });
    U.potong(is.cards, 2).slice(0, 4).forEach(function (grp, i) { S.push({ id: 'gag' + (i + 1), bidang: 'Gagasan', judul: 'Gagasan Penanganan Isu' + (i ? ' (lanj. ' + (i + 1) + ')' : ''), sub: 'Bukti data → indikasi penyebab → tindakan → target', kartu: grp }); });
    S.push({ id: 'lintas', bidang: 'Gagasan', judul: 'Gagasan Strategis Lintas Data', sub: 'Pola yang muncul saat absensi, produksi, grade dan isu dibaca bersama', lintas: ln });
    S.push({ id: 'simpul', bidang: 'Kesimpulan', judul: 'Kesimpulan & Prioritas Tindakan', sub: periode, status: bidang, kol3: { kel: kelAll.slice(0, 5), kur: kurAll.slice(0, 5), rek: rekUrut.slice(0, 5) } });
    S.push({ id: 'metode', bidang: 'Metode', judul: 'Metode, Ambang & Kualitas Data', sub: 'Mengapa analisis ini dapat dipertanggungjawabkan',
      narasi: ['Seluruh angka dihitung langsung dari data yang diunggah (absensi, rekap analisa, grade TK) dan diperbarui otomatis saat halaman ini dibuka atau disegarkan.', 'Penilaian memakai aturan A1–A13 pada Pengaturan; ubah ambang di Pengaturan dan analisis ini ikut berubah. Penyebab yang disebut bersifat indikasi dari pola data — bukan bukti sebab-akibat — dan perlu dikonfirmasi di lapangan.', 'Data produksi terakhir: ' + U.tglID(k.dataTerakhirProduksi, true) + ' · data absensi terakhir: ' + U.tglID(k.dataTerakhirAbsensi, true) + ' · ' + f(k.hariData) + ' hari produksi · ' + f(k.karyawan) + ' karyawan.'],
      tabel: { judul: 'Ambang aturan yang dipakai', kepala: ['Aturan', 'Uraian', 'Perhatian (kuning)', 'Kritis (merah)'], baris: Object.keys(rep.aturan || DEF).filter(function (id) { return (rep.aturan || DEF)[id].aktif !== false; }).map(function (id) { var r = (rep.aturan || DEF)[id]; return [id, r.nama, r.op + ' ' + r.kuning, r.op + ' ' + r.merah]; }) } });
    return { slides: S, meta: { periode: periode, hari: hari, bidang: bidang, isu: is.ring }, abs: a, prod: pr, isu: is, lintas: ln };
  };
  AN.STAT = STAT; AN.lv = lv;
  w.AN = AN;
})(window);
