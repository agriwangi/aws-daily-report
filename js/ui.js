/* AWS Daily Report v1.0.0 — komponen tampilan: tabel, KPI, kerangka muat, keadaan kosong */
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
      pager.innerHTML = n > 10 ? '<span class="muted">Baris per halaman</span><select style="width:auto;height:30px">' + [10, 25, 50, 100].map(function (u) { return '<option' + (u === st.ukuran ? ' selected' : '') + '>' + u + '</option>'; }).join('') + '</select><button class="btn sm ghost" data-p="-1"' + (hal === 0 ? ' disabled' : '') + '>‹ Sebelumnya</button><span>' + (hal + 1) + ' / ' + hm + '</span><button class="btn sm ghost" data-p="1"' + (hal >= hm - 1 ? ' disabled' : '') + '>Berikutnya ›</button>' : '';
      if (opsi.setelah) opsi.setelah(host, sl);
    }
    thead.addEventListener('click', function (e) { var th = e.target.closest('th'); if (!th) return; var k = th.dataset.k; if (st.urut === k) st.arah = -st.arah; else { st.urut = k; st.arah = -1; } st.hal = 0; gambar(); });
    pager.addEventListener('click', function (e) { var b = e.target.closest('button[data-p]'); if (b) { st.hal += +b.dataset.p; gambar(); } });
    pager.addEventListener('change', function (e) { if (e.target.tagName === 'SELECT') { st.ukuran = +e.target.value; st.hal = 0; gambar(); } });
    if (inp) inp.addEventListener('input', U.debounce(function () { st.q = inp.value.trim(); st.hal = 0; gambar(); }, 200));
    gambar();
    return { set: function (b) { st.baris = b || []; st.hal = 0; gambar(); }, st: st };
  };
  /* tampilan sama persis Excel (cermin) */
  var KODE = /^(K|KL|H1|H2|S1|P1|P3|P4|C|HB|M|MG|OUT)$/;
  UI.sel = function (v, ds) {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number') return U.esc(Number.isInteger(v) ? U.nf(v) : (Math.round(v * 10000) / 10000).toLocaleString('id-ID', { maximumFractionDigits: 4 }));
    var s = String(v); if (ds === 'ABS' && KODE.test(s)) return U.kodeBadge(s);
    return U.esc(s);
  };
  UI.cermin = function (host, dataset, periode) {
    host.innerHTML = '<div class="skel" style="height:240px"></div>';
    var muat = function (offset, tampung) {
      return API.d('cermin.get', { dataset: dataset, periode: periode, offset: offset, limit: 200 });
    };
    muat(0).then(function (d) {
      var baris = d.rows.slice(), head = d.head, total = d.totalData, off = 200;
      function gambar() {
        var html = '<div class="muted" style="margin-bottom:8px">Tampilan sama persis dengan berkas Excel · ' + U.nf(total) + ' baris data · ' + U.nf(d.labels.length) + ' kolom</div><div class="tw card flush"><table class="t xl"><thead>' + head.map(function (r) { return '<tr>' + r.map(function (c) { return '<th>' + UI.sel(c) + '</th>'; }).join('') + '</tr>'; }).join('') + '</thead><tbody>' + baris.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + UI.sel(c, dataset) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
        if (off < total) html += '<div class="center" style="margin-top:12px"><button class="btn sec" id="lagiBtn">Muat 200 baris berikutnya (' + U.nf(Math.min(off, total)) + ' dari ' + U.nf(total) + ')</button></div>';
        host.innerHTML = html;
        var b = U.$('#lagiBtn', host); if (b) b.addEventListener('click', function () { b.disabled = true; b.textContent = 'Memuat…'; muat(off).then(function (n) { baris = baris.concat(n.rows); off += 200; gambar(); }).catch(function (e) { U.toast(e.message, 'err'); b.disabled = false; }); });
      }
      gambar();
    }).catch(function (e) { UI.galat(host, e); });
  };
  w.UI = UI;
})(window);
