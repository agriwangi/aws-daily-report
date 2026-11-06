/* AWS Daily Report v1.0.12 — fungsi bantu umum */
(function (w) {
  'use strict';
  var U = {};
  U.esc = function (s) { return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  U.nf = function (n, d) { if (n === null || n === undefined || n === '' || isNaN(n)) return '–'; return Number(n).toLocaleString('id-ID', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); };
  U.pct = function (n, d) { return (n === null || n === undefined || isNaN(n)) ? '–' : U.nf(n, d === undefined ? 1 : d) + '%'; };
  U.pad = function (n) { return (n < 10 ? '0' : '') + n; };
  U.iso = function (d) { return d.getFullYear() + '-' + U.pad(d.getMonth() + 1) + '-' + U.pad(d.getDate()); };
  U.parse = function (s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  U.addDays = function (s, n) { var d = U.parse(s); d.setDate(d.getDate() + n); return U.iso(d); };
  U.today = function () { return U.iso(new Date()); };
  var BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  U.BLN = BLN;
  U.tglID = function (s, pendek) { if (!s) return '–'; var d = U.parse(String(s).slice(0, 10)); if (isNaN(d)) return String(s); return d.getDate() + ' ' + (pendek ? BLN[d.getMonth()].slice(0, 3) : BLN[d.getMonth()]) + ' ' + d.getFullYear(); };
  U.waktuID = function (s) { if (!s) return '–'; var t = String(s); return U.tglID(t.slice(0, 10), true) + (t.length > 10 ? ' ' + t.slice(11, 16) : ''); };
  U.hariNama = function (s) { return ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][U.parse(s).getDay()]; };
  U.bulanAkhir = function (ym) { var p = ym.split('-'); return U.iso(new Date(+p[0], +p[1], 0)); };
  /* penyimpanan ringan (aman bila diblokir) */
  U.simpan = function (k, v) { try { localStorage.setItem('aws_' + k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) {} };
  U.baca = function (k, d) { try { var v = localStorage.getItem('aws_' + k); return v === null ? d : v; } catch (e) { return d; } };
  U.bacaJson = function (k, d) { try { var v = localStorage.getItem('aws_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  U.hapus = function (k) { try { localStorage.removeItem('aws_' + k); } catch (e) {} };
  /* toast */
  U.toast = function (msg, tipe, ms) {
    var box = document.getElementById('toasts'); if (!box) return;
    var t = document.createElement('div'); t.className = 'toast ' + (tipe || ''); t.setAttribute('role', 'status'); t.textContent = msg; box.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 300); }, ms || (tipe === 'err' ? 6000 : 3200));
  };
  /* modal */
  U.modal = function (html, opsi) {
    opsi = opsi || {};
    var m = document.createElement('div'); m.className = 'mod'; m.innerHTML = '<div class="box' + (opsi.lebar ? ' wide' : '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(m);
    var tutup = function () { m.remove(); document.removeEventListener('keydown', esc); if (opsi.onTutup) opsi.onTutup(); };
    var esc = function (e) { if (e.key === 'Escape') tutup(); };
    document.addEventListener('keydown', esc);
    m.addEventListener('mousedown', function (e) { if (e.target === m && !opsi.kunci) tutup(); });
    U.$$('[data-tutup]', m).forEach(function (b) { b.addEventListener('click', tutup); });
    var f = U.$('input,select,textarea,button', m); if (f && !opsi.tanpaFokus) setTimeout(function () { try { f.focus(); } catch (e) {} }, 30);
    return { el: m, tutup: tutup };
  };
  U.konfirmasi = function (judul, teks, labelOk, bahaya) {
    return new Promise(function (res) {
      var m = U.modal('<h2>' + U.esc(judul) + '</h2><p class="muted">' + U.esc(teks) + '</p><div class="acts"><button class="btn ghost" data-tutup>Batal</button><button class="btn' + (bahaya ? ' danger' : '') + '" id="kOk">' + U.esc(labelOk || 'Ya, lanjut') + '</button></div>', { onTutup: function () { res(false); } });
      U.$('#kOk', m.el).addEventListener('click', function () { res(true); m.el.remove(); });
    });
  };
  U.prompt = function (judul, label, opsi) {
    opsi = opsi || {};
    return new Promise(function (res) {
      var m = U.modal('<h2>' + U.esc(judul) + '</h2><div class="field"><label>' + U.esc(label) + '</label><' + (opsi.area ? 'textarea' : 'input type="' + (opsi.type || 'text') + '"') + ' id="pIn" autocomplete="off">' + (opsi.area ? '</textarea>' : '') + '</div><div class="acts"><button class="btn ghost" data-tutup>Batal</button><button class="btn" id="pOk">' + U.esc(opsi.ok || 'Simpan') + '</button></div>', { onTutup: function () { res(null); } });
      var inp = U.$('#pIn', m.el); if (opsi.nilai) inp.value = opsi.nilai;
      U.$('#pOk', m.el).addEventListener('click', function () { var v = inp.value; m.el.remove(); res(v); });
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !opsi.area) U.$('#pOk', m.el).click(); });
    });
  };
  U.debounce = function (fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms || 250); }; };
  U.unduh = function (nama, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nama; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  U.csvKe = function (baris) { return '﻿' + baris.map(function (r) { return r.map(function (v) { v = v === null || v === undefined ? '' : String(v); return /[",\r\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n'); };
  U.potong = function (arr, n) { var o = []; for (var i = 0; i < arr.length; i += n) o.push(arr.slice(i, i + n)); return o; };
  U.rata = function (a) { return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; };
  /* ikon (garis, 24px) */
  var IK = {
    dash: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    table: '<path d="M12 3v18M3 9h18M3 15h18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
    check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>', plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>', key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>', undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>', search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>',
    print: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'
  };
  U.ik = function (n, ukuran) { return '<svg viewBox="0 0 24 24" width="' + (ukuran || 20) + '" height="' + (ukuran || 20) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IK[n] || '') + '</svg>'; };
  U.kodeBadge = function (k) { return '<span class="kode k-' + U.esc(k) + '">' + U.esc(k) + '</span>'; };
  // v1.0.12 — Daftar kode absensi resmi (sumber tunggal, hanya tampilan; perhitungan tidak berubah)
  U.KODE_DAFTAR = [
    { g: 'I', gn: 'HK dibayar', items: [['K', 'Kerja'], ['H1', 'Cuti Haid (diberikan hak cuti 2 hari)'], ['H2', 'Cuti Hamil (diberikan 3 bulan sebelum melahirkan)'], ['S1', 'Sakit'], ['P3', 'Izin Khitanan / Pernikahan / Pembaktisan / Kematian'], ['P4', 'Izin Pemerintahan (Pembuatan SIM/KK/KTP)'], ['C', 'Cuti Tahunan'], ['HB', 'Hari Besar']] },
    { g: 'II', gn: 'HK tidak dibayar', items: [['P1', 'Izin kepentingan pribadi (Tidak dibayar)'], ['M', 'Mangkir'], ['MG', 'Minggu'], ['OUT', 'Keluar / resign'], ['NEW', 'Karyawan baru / masa training']] }
  ];
  U.KODE_EXTRA = { KL: 'Kerja lembur (tambahan di luar daftar resmi)' };
  U.kodeNama = function (k) {
    for (var i = 0; i < U.KODE_DAFTAR.length; i++) for (var j = 0; j < U.KODE_DAFTAR[i].items.length; j++) if (U.KODE_DAFTAR[i].items[j][0] === k) return U.KODE_DAFTAR[i].items[j][1];
    return U.KODE_EXTRA[k] || '';
  };
  U.kodeGrup = function (k) {
    for (var i = 0; i < U.KODE_DAFTAR.length; i++) for (var j = 0; j < U.KODE_DAFTAR[i].items.length; j++) if (U.KODE_DAFTAR[i].items[j][0] === k) return U.KODE_DAFTAR[i].g;
    return '';
  };
  U.legendaKode = function () {
    return '<div class="card kode-legenda"><h3>Daftar kode absensi</h3>' + U.KODE_DAFTAR.map(function (G) {
      return '<div class="kl-grup"><div class="kl-judul">' + G.g + '. ' + U.esc(G.gn) + '</div>' + G.items.map(function (it) {
        return '<div class="kl-baris">' + U.kodeBadge(it[0]) + '<span>' + U.esc(it[1]) + '</span></div>';
      }).join('') + '</div>';
    }).join('') + '</div>';
  };
  w.U = U;
})(window);
