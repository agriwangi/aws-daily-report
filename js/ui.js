/* AWS Daily Report v1.0.12 — komponen tampilan: tabel, KPI, kerangka muat, keadaan kosong */
(function (w) {
  'use strict';
  var UI = {};
  UI.skel = function (n) { var h = '<div class="kpi">'; for (var i = 0; i < (n || 4); i++) h += '<div class="skel" style="height:92px"></div>'; return h + '</div><div class="panel c2e"><div class="skel" style="height:320px"></div><div class="skel" style="height:320px"></div></div>'; };
  UI.kosong = function (judul, teks, ikon) { return '<div class="empty">' + U.ik(ikon || 'inbox', 56) + '<h3 style="color:var(--text)">' + U.esc(judul) + '</h3><p>' + U.esc(teks || '') + '</p></div>'; };
  UI.galat = function (host, e, ulang) {
    host.innerHTML = '<div class="card">' + UI.kosong('Tidak dapat memuat data', e && e.message ? e.message : 'Terjadi kesalahan.', 'alert') + (ulang ? '<div class="center"><button class="btn sec" id="ulangBtn">' + U.ik('refresh', 16) + ' Coba lagi</button></div>' : '') + '</div>';
    var b = U.$('#ulangBtn', host); if (b) b.addEventListener('click', ulang);
  };
  UI.kpi = function (arr) {
    return '<div class="kpi">' + arr.map(function (k) { return '<div class="c"><div class="l">' + U.esc(k.l) + '</div><div class="v">' + U.esc(k.v) + '</div>' + (k.s ? '<div class="s ' + (k.kls || '') + '">' + U.esc(k.s) + '</div>' : '') + '</div>'; }).join('') + '</div>';
  };
  UI.lvBadge = function (lv) { return lv === 'merah' ? '<span class="badge bad"><span class="sev merah"></span>Merah</span>' : lv === 'kuning' ? '<span class="badge warn"><span class="sev kuning"></span>Kuning</span>' : '<span class="badge ok">Aman</span>'; };
  UI.capaiBadge = function (p) { return p >= 100 ? '<span class="badge ok">' + U.pct(p) + '</span>' : p >= 80 ? '<span class="badge warn">' + U.pct(p) + '</span>' : '<span class="badge bad">' + U.pct(p) + '</span>'; };
  /* tabel: kolom [{k,l,num,f,urut}]; opsi {cari,ukuran,id,tinggi,kosong} */
  UI.tabel = function (host, kolom, baris, opsi) {
    opsi = opsi || {};
    var st = { baris: baris || [], q: '', urut: opsi.urut || null, arah: opsi.arah || -1, hal: 0, ukuran: opsi.ukuran || 25 };
    host.innerHTML = (opsi.cari === false ? '' : '<div class="bar" style="margin-bottom:10px"><div style="position:relative;flex:1;min-width:200px;max-width:340px"><input type="search" placeholder="Cari…" aria-label="Cari di tabel" style="padding-left:34px"><span style="position:absolute;left:10px;top:9px;color:var(--muted)">' + U.ik('search', 18) + '</span></div><span class="muted" data-info></span>' + (opsi.aksi || '') + '</div>') + '<div class="tw card flush"><table class="t"><thead></thead><tbody></tbody></table></div><div class="pager"></div>';
    var thead = U.$('thead', host), tbody = U.$('tbody', host), pager = U.$('.pager', host), info = U.$('[data-info]', host), inp = U.$('input', host);
    function nilai(r, c) { return r[c.k]; }
    function olah() {
      var a = st.baris;
      if (st.q) { var q = st.q.toLowerCase(); a = a.filter(function (r) { return kolom.some(function (c) { var v = nilai(r, c); return v !== undefined && v !== null && String(v).toLowerCase().indexOf(q) >= 0; }); }); }
      if (st.urut) { var kc = kolom.filter(function (c) { return c.k === st.urut; })[0]; a = a.slice().sort(function (x, y) { var p = nilai(x, kc), q2 = nilai(y, kc); if (typeof p === 'number' && typeof q2 === 'number') return (p - q2) * st.arah * -1; return String(p === undefined || p === null ? '' : p).localeCompare(String(q2 === undefined || q2 === null ? '' : q2), 'id', { numeric: true }) * st.arah * -1; }); }
      return a;
    }
    function gambar() {
      var a = olah(), n = a.length, hal = Math.min(st.hal, Math.max(0, Math.ceil(n / st.ukuran) - 1)); st.hal = hal;
      thead.innerHTML = '<tr>' + kolom.map(function (c) { return '<th class="' + (c.num ? 'num' : '') + '" data-k="' + U.esc(c.k) + '" title="Klik untuk mengurutkan">' + U.esc(c.l) + (st.urut === c.k ? (st.arah === 1 ? ' ▲' : ' ▼') : '') + '</th>'; }).join('') + '</tr>';
      var sl = a.slice(hal * st.ukuran, (hal + 1) * st.ukuran);
      tbody.innerHTML = sl.length ? sl.map(function (r) { return '<tr' + (opsi.kelasBaris ? ' class="' + (opsi.kelasBaris(r) || '') + '"' : '') + '>' + kolom.map(function (c) { var v = nilai(r, c); var h = c.f ? c.f(v, r) : (c.num ? U.nf(v, c.d || 0) : U.esc(v === undefined || v === null ? '' : v)); return '<td class="' + (c.num ? 'num' : '') + '">' + h + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + kolom.length + '"><div class="empty" style="padding:24px">' + U.esc(opsi.kosong || 'Tidak ada data.') + '</div></td></tr>';
      if (info) info.textContent = U.nf(n) + ' baris';
      var hm = Math.max(1, Math.ceil(n / st.ukuran));
      pager.innerHTML = n > 10 ? UI.pager(hal + 1, hm, st.ukuran, [10, 25, 50, 100]) : '';
      if (opsi.setelah) opsi.setelah(host, sl);
    }
    thead.addEventListener('click', function (e) { var th = e.target.closest('th'); if (!th) return; var k = th.dataset.k; if (st.urut === k) st.arah = -st.arah; else { st.urut = k; st.arah = -1; } st.hal = 0; gambar(); });
    pager.addEventListener('click', function (e) { var b = e.target.closest('button[data-g]'); if (b && !b.disabled) { st.hal = +b.dataset.g - 1; gambar(); } });
    pager.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') { st.ukuran = +e.target.value; st.hal = 0; gambar(); } });
    if (inp) inp.addEventListener('input', U.debounce(function () { st.q = inp.value.trim(); st.hal = 0; gambar(); }, 200));
    gambar();
    return { set: function (b) { st.baris = b || []; st.hal = 0; gambar(); }, st: st };
  };
  /* penomoran halaman (hal & hm berbasis 1): Baris per halaman [..]  ‹ Sebelumnya 1 … 4 [5] 6 … 13 Berikutnya › */
  UI.pager = function (hal, hm, uk, daftarUk) {
    var set = {}, i; set[1] = 1; set[hm] = 1; for (i = hal - 1; i <= hal + 1; i++) if (i >= 1 && i <= hm) set[i] = 1;
    var ns = Object.keys(set).map(Number).sort(function (a, b) { return a - b; }), nomor = '', prev = 0;
    ns.forEach(function (n) { if (prev && n - prev > 1) nomor += '<span class="gap" aria-hidden="true">…</span>'; nomor += '<button type="button" class="pg' + (n === hal ? ' on' : '') + '" data-g="' + n + '" aria-label="Halaman ' + n + '"' + (n === hal ? ' aria-current="page"' : '') + '>' + n + '</button>'; prev = n; });
    return '<label class="pg-uk"><span class="muted">Baris per halaman</span><select aria-label="Baris per halaman">' + daftarUk.map(function (u) { return '<option' + (u === uk ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select></label>' +
      '<span class="pgr"><button type="button" class="pg wide" data-g="' + (hal - 1) + '"' + (hal <= 1 ? ' disabled' : '') + ' aria-label="Halaman sebelumnya">‹<span class="tx"> Sebelumnya</span></button><span class="nums">' + nomor + '</span><span class="ring" aria-live="polite">' + hal + ' / ' + hm + '</span><button type="button" class="pg wide" data-g="' + (hal + 1) + '"' + (hal >= hm ? ' disabled' : '') + ' aria-label="Halaman berikutnya"><span class="tx">Berikutnya </span>›</button></span>';
  };
  /* tampilan sama persis Excel (cermin) — berhalaman; ukuran font & kolom menyesuaikan lebar layar */
  var KODE = /^(K|KL|H1|H2|S1|P1|P3|P4|C|HB|M|MG|OUT|NEW)$/;
  UI.sel = function (v, ds, mentah) {
    if (ds === 'ABS') mentah = true; /* absensi: angka kecil/penanda (mis. tahun 2026) — jangan diberi titik ribuan */
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') { if (mentah) { var bulat = Math.abs(v - Math.round(v)) < 1e-6; return U.esc(bulat ? String(Math.round(v)) : String(Math.round(v * 10000) / 10000).replace('.', ',')); } if (Number.isInteger(v)) return U.esc(U.nf(v)); return U.esc((Math.round(v * 10000) / 10000).toLocaleString('id-ID', { maximumFractionDigits: 4 })); }
    var s = String(v); if (ds === 'ABS' && KODE.test(s)) return U.kodeBadge(s);
    return U.esc(s);
  };
  var CM_UK = [25, 50, 100, 200];
  function kosongSel(v) { return v === null || v === undefined || v === ''; }
  function jmlIsi(r) { var k = 0; for (var i = 0; i < r.length; i++) if (!kosongSel(r[i])) k++; return k; }
  /* baris judul/kepala: teks meluber ke sel kosong di kanannya (seperti Excel) agar tidak melebarkan satu kolom */
  function barisKepala(r, kls) {
    if (!jmlIsi(r)) return '<tr class="xl-blank' + (kls ? ' ' + kls : '') + '"><th colspan="' + Math.max(1, r.length) + '"></th></tr>';
    var h = '<tr' + (kls ? ' class="' + kls + '"' : '') + '>';
    for (var i = 0; i < r.length; i++) {
      var c = r[i], span = 1;
      if (typeof c === 'string' && c !== '') while (i + span < r.length && kosongSel(r[i + span])) span++;
      h += '<th' + (span > 1 ? ' colspan="' + span + '"' : '') + '>' + UI.sel(c, null, true) + '</th>';
      i += span - 1;
    }
    return h + '</tr>';
  }
  UI.cermin = function (host, dataset, periode) {
    var tiket = host._cmTiket = (host._cmTiket || 0) + 1;
    var uk0 = +U.baca('cm_uk', '50'), st = { hal: 1, uk: CM_UK.indexOf(uk0) >= 0 ? uk0 : 50, cache: {}, semua: null, sibuk: false };
    var terbatas = !!(w.APP && w.APP.role && /^(asisten|askep)$/.test(w.APP.role()));
    var kok, wrap, thead, tbody;
    host.innerHTML = '<div class="skel" style="height:240px"></div>';
    function blok(offset, limit) { return API.d('cermin.get', { dataset: dataset, periode: periode, offset: offset, limit: limit }); }
    /* peran terbatas: penyaringan dilakukan server per blok, jadi semua blok diambil agar jumlah halaman tepat */
    function ambilSemua() {
      if (st.semua) return Promise.resolve(st.semua);
      var rows = [], d0 = null;
      function lanjut(off) { return blok(off, 500).then(function (d) { d0 = d0 || d; rows = rows.concat(d.rows); return off + 500 < d.totalData ? lanjut(off + 500) : { head: d0.head, labels: d0.labels, rows: rows }; }); }
      return lanjut(0).then(function (r) { st.semua = r; return r; });
    }
    function ambil(hal) {
      var uk = st.uk;
      if (terbatas) return ambilSemua().then(function (a) { return { head: a.head, labels: a.labels, total: a.rows.length, rows: a.rows.slice((hal - 1) * uk, hal * uk) }; });
      var kunci = uk + ':' + hal; if (st.cache[kunci]) return Promise.resolve(st.cache[kunci]);
      return blok((hal - 1) * uk, uk).then(function (d) { var r = { head: d.head, labels: d.labels, total: d.totalData, rows: d.rows }; if (Object.keys(st.cache).length > 40) st.cache = {}; st.cache[kunci] = r; return r; });
    }
    function tataSticky() { /* baris kepala bertingkat: tiap baris menempel tepat di bawah baris sebelumnya */
      var top = 0; U.$$('tr.stk', thead).forEach(function (tr) { var cs = tr.children; for (var i = 0; i < cs.length; i++) cs[i].style.top = top + 'px'; top += tr.getBoundingClientRect().height; });
    }
    function isiHalaman(d) {
      var uk = st.uk, hm = Math.max(1, Math.ceil(d.total / uk)), n = d.head.length ? Math.max(1, d.head[0].length) : 1;
      tbody.innerHTML = d.rows.length ? d.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td' + (typeof c === 'number' ? ' class="num"' : '') + '>' + UI.sel(c, dataset) + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + n + '"><div class="empty" style="padding:24px">' + (d.total ? 'Tidak ada baris pada halaman ini.' : 'Belum ada baris data pada berkas ini.') + '</div></td></tr>';
      var awal = (st.hal - 1) * uk + 1, tx = d.total ? 'Menampilkan ' + U.nf(awal) + '–' + U.nf(awal + Math.max(0, d.rows.length - 1)) + ' dari ' + U.nf(d.total) + ' baris' : 'Belum ada baris data';
      U.$$('[data-ket]', kok).forEach(function (x) { x.textContent = tx; });
      var p = d.total > CM_UK[0] ? UI.pager(st.hal, hm, uk, CM_UK) : '';
      U.$$('.xl-pg', kok).forEach(function (x) { x.innerHTML = p; });
      tataSticky();
    }
    function pindah(hal) {
      if (st.sibuk) return; st.sibuk = true; wrap.classList.add('muat'); wrap.setAttribute('aria-busy', 'true');
      ambil(hal).then(function (d) {
        if (host._cmTiket !== tiket) return;
        st.hal = hal; isiHalaman(d); wrap.scrollTop = 0;
        var t = U.$('.xl-top', kok); if (t && t.scrollIntoView && t.getBoundingClientRect().top < 64) t.scrollIntoView({ block: 'start' });
      }).catch(function (e) { U.toast((e && e.message) || 'Gagal memuat halaman.', 'err'); }).then(function () { st.sibuk = false; wrap.classList.remove('muat'); wrap.removeAttribute('aria-busy'); });
    }
    ambil(1).then(function (d) {
      if (host._cmTiket !== tiket) return;
      var head = d.head || [], nKol = (d.labels && d.labels.length) || (head[0] ? head[0].length : 0), awalStk = -1;
      head.forEach(function (r, i) { if (awalStk < 0 && jmlIsi(r) >= 4) awalStk = i; });
      host.innerHTML = '<div class="xl-kok"><div class="xl-top"><div class="muted">Tampilan sama persis dengan berkas Excel · ' + U.nf(d.total) + ' baris data · ' + U.nf(nKol) + ' kolom</div></div>' +
        '<div class="xl-bar"><span class="muted" data-ket></span><div class="pager xl-pg"></div></div>' +
        '<div class="tw card flush xlw" tabindex="0" role="region" aria-label="Tabel hasil Excel; geser ke samping untuk melihat kolom lain"><table class="t xl"><thead>' + head.map(function (r, i) { return barisKepala(r, awalStk >= 0 && i >= awalStk ? 'stk' : ''); }).join('') + '</thead><tbody></tbody></table></div>' +
        '<div class="xl-bar"><span class="muted" data-ket></span><div class="pager xl-pg"></div></div></div>';
      kok = host.firstChild; wrap = U.$('.xlw', kok); thead = U.$('thead', kok); tbody = U.$('tbody', kok);
      kok.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button[data-g]'); if (b && !b.disabled) pindah(+b.dataset.g); });
      kok.addEventListener('change', function (e) { var s = e.target; if (s && s.tagName === 'SELECT' && s.closest('.pg-uk')) { st.uk = +s.value; U.simpan('cm_uk', String(st.uk)); st.cache = {}; st.hal = 1; pindah(1); } });
      var ukur = U.debounce(function () { if (!document.body.contains(kok)) { w.removeEventListener('resize', ukur); return; } tataSticky(); }, 150); w.addEventListener('resize', ukur);
      st.hal = 1; isiHalaman(d);
    }).catch(function (e) { if (host._cmTiket === tiket) UI.galat(host, e); });
  };
  w.UI = UI;
})(window);
