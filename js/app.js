/* AWS Daily Report v1.0.0 — kerangka aplikasi: halaman awal, masuk, menu, tema, periode, rute */
(function (w) {
  'use strict';
  var APP = { S: { me: null, boot: null, status: null, rep: null, repKey: '', per: null, filter: {} }, V: {} };
  var SEMUA = ['superadmin', 'admin', 'spv', 'manager', 'askep', 'asisten'], ADM = ['superadmin', 'admin'], PEN = ['superadmin', 'admin', 'spv', 'manager'];
  var MENU = [
    { id: 'dashboard', l: 'Dashboard', ik: 'dash', r: SEMUA }, { id: 'absensi', l: 'Absensi', ik: 'users', r: SEMUA }, { id: 'produksi', l: 'Produksi', ik: 'leaf', r: SEMUA },
    { id: 'rekap', l: 'Rekap', ik: 'table', r: SEMUA }, { id: 'isu', l: 'Isu & Rekomendasi', ik: 'alert', r: SEMUA }, { id: 'unggah', l: 'Unggah Excel', ik: 'upload', r: ADM },
    { id: 'manual', l: 'Input Manual', ik: 'edit', r: ADM }, { id: 'ekspor', l: 'Ekspor & Laporan', ik: 'download', r: SEMUA }, { id: 'riwayat', l: 'Riwayat Perubahan', ik: 'clock', r: PEN },
    { id: 'pengaturan', l: 'Pengaturan', ik: 'gear', r: SEMUA }, { id: 'pengguna', l: 'Kelola Pengguna', ik: 'shield', r: ['superadmin'] }
  ];
  APP.MENU = MENU;
  APP.ROLE_NAMA = { superadmin: 'Superadmin', admin: 'Admin', spv: 'SPV', manager: 'Manager', askep: 'Askep', asisten: 'Asisten' };
  APP.TEMA = [['tea-green', 'Tea Green', '#166534'], ['ocean-blue', 'Ocean Blue', '#1D4ED8'], ['indigo', 'Indigo', '#4338CA'], ['teal', 'Teal', '#0F766E'], ['harvest-amber', 'Harvest Amber', '#B45309'], ['slate', 'Slate', '#334155']];
  var $ = U.$;
  /* hak akses: boot.hak dari server (diatur Superadmin); bila belum ada, memakai bawaan di MENU */
  APP.izin = function (k) {
    var r = APP.role(); if (!r) return false; if (r === 'superadmin') return true;
    var h = APP.S.boot && APP.S.boot.hak && APP.S.boot.hak[k];
    if (h) return h.indexOf(r) >= 0;
    var m = MENU.filter(function (x) { return x.id === k; })[0]; if (m) return m.r.indexOf(r) >= 0;
    return PEN.indexOf(r) >= 0;   /* tindakan: bawaan = penilai */
  };
  APP.awal = function () { var m = MENU.filter(function (x) { return APP.boleh(x.id); })[0]; return '#/' + (m ? m.id : 'pengaturan'); };   /* halaman pertama yang boleh dibuka */
  APP.boleh = function (idMenu) {
    var m = MENU.filter(function (x) { return x.id === idMenu; })[0]; if (!m || !APP.S.me) return false;
    if (idMenu === 'pengaturan' || idMenu === 'pengguna') return m.r.indexOf(APP.S.me.role) >= 0;   /* tetap */
    return APP.izin(idMenu);
  };
  APP.role = function () { return APP.S.me ? APP.S.me.role : ''; };
  APP.adm = function () { return ADM.indexOf(APP.role()) >= 0; };
  APP.penilai = function () { return PEN.indexOf(APP.role()) >= 0; };

  /* ---------- tema ---------- */
  APP.terapkanTema = function () {
    var t = U.baca('tema', '') || (APP.S.boot && APP.S.boot.tema) || 'tea-green', m = U.baca('mode', '') || (APP.S.boot && APP.S.boot.mode) || 'terang';
    if (m === 'sistem') m = w.matchMedia && w.matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang';
    document.documentElement.setAttribute('data-theme', t); document.documentElement.setAttribute('data-mode', m);
    var mt = document.querySelector('meta[name=theme-color]'); if (mt) mt.content = m === 'gelap' ? '#0B1210' : getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#166534';
  };
  APP.setTema = function (t, m) { if (t) U.simpan('tema', t); if (m) U.simpan('mode', m); APP.terapkanTema(); CH.gambarUlang(); var b = $('#modeBtn'); if (b) b.innerHTML = U.ik(document.documentElement.getAttribute('data-mode') === 'gelap' ? 'sun' : 'moon'); };

  /* ---------- periode ---------- */
  APP.hitungRentang = function (mode, a) {
    var d = U.parse(a), y = d.getFullYear(), mo = d.getMonth();
    if (mode === 'hari') return { from: a, to: a };
    if (mode === 'minggu') { var s = (d.getDay() + 6) % 7, f = U.addDays(a, -s); return { from: f, to: U.addDays(f, 6) }; }
    if (mode === 'bulan') return { from: y + '-' + U.pad(mo + 1) + '-01', to: U.iso(new Date(y, mo + 1, 0)) };
    if (mode === 'tahun') return { from: y + '-01-01', to: y + '-12-31' };
    if (mode === 'gaji') { var dd = d.getDate(); var f2 = dd >= 26 ? new Date(y, mo, 26) : new Date(y, mo - 1, 26), t2 = dd >= 26 ? new Date(y, mo + 1, 25) : new Date(y, mo, 25); return { from: U.iso(f2), to: U.iso(t2) }; }
    return null;
  };
  APP.geser = function (mode, a, arah) {
    var d = U.parse(a);
    if (mode === 'hari') return U.addDays(a, arah); if (mode === 'minggu') return U.addDays(a, 7 * arah);
    if (mode === 'bulan') { d.setDate(1); d.setMonth(d.getMonth() + arah); return U.iso(d); }
    if (mode === 'tahun') { d.setFullYear(d.getFullYear() + arah); return U.iso(d); }
    if (mode === 'gaji') { var x = d.getDate() >= 26 ? U.parse(U.iso(d)) : d; x.setDate(15); x.setMonth(x.getMonth() + arah); return U.iso(x); }
    return a;
  };
  APP.tglTerakhir = function () { var t = ''; ((APP.S.status && APP.S.status.registri) || []).forEach(function (r) { if ((r.dataset === 'REK' || r.dataset === 'ABS') && String(r.tglMaks) > t) t = String(r.tglMaks); }); var h = APP.S.status && APP.S.status.hari || U.today(); return t && t <= h ? t : (t || h); };
  APP.periode = function () {
    if (!APP.S.per) { var simp = U.bacaJson('per', null), a = APP.tglTerakhir(); APP.S.per = simp && simp.mode ? { mode: simp.mode, anchor: simp.mode === 'rentang' ? a : a, from: simp.from, to: simp.to } : { mode: 'bulan', anchor: a }; }
    var p = APP.S.per; if (p.mode !== 'rentang') { var r = APP.hitungRentang(p.mode, p.anchor); p.from = r.from; p.to = r.to; } return p;
  };
  APP.labelPeriode = function (p) { p = p || APP.periode(); return p.from === p.to ? U.tglID(p.from) : U.tglID(p.from, true) + ' – ' + U.tglID(p.to, true); };
  APP.invalidasi = function () { APP.S.rep = null; APP.S.repKey = ''; };
  APP.laporan = function (paksa) {
    var p = APP.periode(), key = [p.from, p.to, JSON.stringify(APP.S.filter)].join('|');
    if (!paksa && APP.S.rep && APP.S.repKey === key) return Promise.resolve(APP.S.rep);
    return API.d('laporan.get', { from: p.from, to: p.to, filter: APP.S.filter, orangLimit: 3000 }, { timeout: 180000 }).then(function (r) { APP.S.rep = r; APP.S.repKey = key; return r; });
  };
  APP.muatStatus = function () { return API.d('data.status').then(function (s) { APP.S.status = s; return s; }); };

  /* bilah periode + filter. opsi: {filter:true, onChange} */
  APP.barPeriode = function (host, opsi) {
    opsi = opsi || {}; var p = APP.periode(), MODE = [['hari', 'Hari'], ['minggu', 'Minggu'], ['bulan', 'Bulan'], ['tahun', 'Tahun'], ['gaji', 'Periode Gaji 26–25'], ['rentang', 'Rentang']];
    var el = document.createElement('div'); el.className = 'bar'; host.appendChild(el);
    function gambar() {
      p = APP.periode(); var daf = (APP.S.rep && APP.S.rep.daftarFilter) || { divisi: [], asisten: [], mandor: [] };
      el.innerHTML = '<div class="pills" role="tablist" aria-label="Jenis periode">' + MODE.map(function (m) { return '<button type="button" data-m="' + m[0] + '" class="' + (p.mode === m[0] ? 'on' : '') + '">' + m[1] + '</button>'; }).join('') + '</div>' +
        (p.mode === 'rentang' ? '<input type="date" data-f="from" value="' + p.from + '" aria-label="Dari tanggal"><span class="muted">s.d.</span><input type="date" data-f="to" value="' + p.to + '" aria-label="Sampai tanggal">' :
          '<button class="btn ghost icon" data-g="-1" aria-label="Sebelumnya">‹</button><input type="date" data-f="anchor" value="' + p.anchor + '" aria-label="Tanggal acuan"><button class="btn ghost icon" data-g="1" aria-label="Berikutnya">›</button>') +
        '<span class="badge info nowrap" title="Rentang yang dilaporkan">' + U.esc(APP.labelPeriode(p)) + '</span>' +
        (opsi.filter ? '<select data-s="divisi" aria-label="Filter divisi"><option value="">Semua divisi</option>' + daf.divisi.map(function (x) { return '<option' + (APP.S.filter.divisi === x ? ' selected' : '') + '>' + U.esc(x) + '</option>'; }).join('') + '</select><select data-s="asisten" aria-label="Filter asisten"><option value="">Semua asisten</option>' + daf.asisten.map(function (x) { return '<option' + (APP.S.filter.asisten === x ? ' selected' : '') + '>' + U.esc(x) + '</option>'; }).join('') + '</select><select data-s="mandor" aria-label="Filter mandor"><option value="">Semua mandor</option>' + daf.mandor.map(function (x) { return '<option' + (APP.S.filter.mandor === x ? ' selected' : '') + '>' + U.esc(x) + '</option>'; }).join('') + '</select>' : '') +
        '<button class="btn ghost" data-r="1" title="Muat ulang dari server">' + U.ik('refresh', 16) + ' Segarkan</button>';
    }
    function ubah(paksa) { U.simpan('per', { mode: p.mode, from: p.from, to: p.to }); APP.invalidasi(); if (opsi.onChange) opsi.onChange(paksa); }
    el.addEventListener('click', function (e) {
      var m = e.target.closest('[data-m]'), g = e.target.closest('[data-g]'), r = e.target.closest('[data-r]');
      if (m) { var baru = m.dataset.m; if (baru === 'rentang') { APP.S.per = { mode: 'rentang', anchor: p.anchor, from: p.from, to: p.to }; } else APP.S.per = { mode: baru, anchor: p.anchor }; gambar(); ubah(); }
      else if (g) { APP.S.per.anchor = APP.geser(p.mode, p.anchor, +g.dataset.g); gambar(); ubah(); }
      else if (r) { APP.invalidasi(); if (opsi.onChange) opsi.onChange(true); }
    });
    el.addEventListener('change', function (e) {
      var f = e.target.dataset.f, s = e.target.dataset.s;
      if (f) { var v = e.target.value; if (!v) return; if (f === 'anchor') APP.S.per.anchor = v; else { APP.S.per[f] = v; if (APP.S.per.from > APP.S.per.to) { U.toast('Tanggal awal tidak boleh setelah tanggal akhir.', 'warn'); APP.S.per[f === 'from' ? 'to' : 'from'] = v; } if (U.parse(APP.S.per.to) - U.parse(APP.S.per.from) > 400 * 864e5) { U.toast('Rentang maksimum 400 hari.', 'warn'); APP.S.per.to = U.addDays(APP.S.per.from, 399); } } gambar(); ubah(); }
      if (s) { APP.S.filter[s] = e.target.value; if (!e.target.value) delete APP.S.filter[s]; ubah(); }
    });
    gambar(); el.perbarui = gambar; return el;
  };

  /* ---------- tampilan: halaman awal & masuk ---------- */
  var LOGO = 'assets/logo.png'; APP.LOGO = LOGO;
  function landingKlasik(el) {
    el.innerHTML = '<div class="land"><div class="nav"><img src="' + LOGO + '" alt="Agri Wangi Sentosa"><span class="grow"></span><a class="btn" href="#/masuk">Masuk</a></div>' +
      '<div class="hero"><div><h1>Laporan harian kebun teh, rapi dalam satu tempat.</h1><p class="lead">AWS Daily Report mengumpulkan absensi dan produksi PT. Agri Wangi Sentosa dari Excel harian, lalu menyajikannya per orang, mandor, asisten, dan divisi — lengkap dengan penilaian otomatis serta isu dan rekomendasi yang bisa disunting.</p><div class="cta"><a class="btn" href="#/masuk">Masuk ke aplikasi</a><a class="btn sec" href="#fitur" id="keFitur">Lihat fitur</a></div></div>' +
      '<div class="mock" aria-hidden="true"><div class="m1"><div><small>Produksi</small>▮▮▮▮▯</div><div><small>Kehadiran</small>▮▮▮▮▮</div><div><small>Isu</small>▮▮▯▯▯</div></div><div class="bars">' + [40, 62, 55, 78, 70, 90, 66, 84, 72, 95, 80, 88].map(function (h) { return '<i style="height:' + h + '%"></i>'; }).join('') + '</div></div></div>' +
      '<div class="feats" id="fitur">' + [['dash', 'Dashboard menyeluruh', 'Produksi, grade, kehadiran, dan mangkir dalam satu layar — per hari, minggu, bulan, tahun, atau periode gaji 26–25.'], ['users', 'Absensi akurat', 'Dihitung dari data Excel dengan rumus yang sama; per orang, kemandoran, asisten, dan divisi.'], ['leaf', 'Produksi & grade', 'Budget, realisasi, selisih, dan komposisi Grade I–III untuk setiap mandor, asisten, dan divisi.'], ['alert', 'Isu & rekomendasi', 'Aturan penilaian otomatis dengan ambang yang dapat diubah, serta rekomendasi yang dapat disunting.'], ['upload', 'Satu Excel per hari', 'Unggah berkas hari ini, data lama ditimpa dengan aman. Tampilan tabel sama persis dengan Excel.'], ['download', 'Ekspor & email', 'Unduh PDF, PowerPoint, Excel, atau CSV, dan kirim laporan harian otomatis ke email.']].map(function (f) { return '<div class="feat"><div class="ic">' + U.ik(f[0], 24) + '</div><b>' + f[1] + '</b><span>' + f[2] + '</span></div>'; }).join('') + '</div>' +
      '<footer>© ' + new Date().getFullYear() + ' PT. Agri Wangi Sentosa · AWS Daily Report v' + w.APP_CONFIG.VERSI + '</footer></div>';
    var k = el.querySelector('#keFitur'); if (k) k.addEventListener('click', function (e) { e.preventDefault(); el.querySelector('#fitur').scrollIntoView({ behavior: 'smooth' }); });
  }
  /* halaman awal: 11 model dari landing.js + Klasik bawaan; dipilih superadmin di Pengaturan (boot.landing) */
  function landing() {
    if (w.AWSL && w.AWSL.mount) w.AWSL.mount($('#land'), { logo: LOGO, versi: w.APP_CONFIG.VERSI, klasik: landingKlasik, boot: APP.S.boot && APP.S.boot.landing });
    else landingKlasik($('#land'));
  }
  function masuk() {
    var siap = !!API.siapUrl();
    $('#login').innerHTML = '<div class="login"><form class="box" id="fLogin" autocomplete="on" novalidate><img class="logo" src="' + LOGO + '" alt="Agri Wangi Sentosa"><h2 class="center" style="margin-bottom:4px">Masuk</h2><p class="center muted" style="margin:0 0 18px">Gunakan akun yang dibuat oleh Superadmin.</p>' +
      (siap ? '' : '<div class="badge bad" style="display:block;border-radius:10px;padding:10px 12px;margin-bottom:14px;white-space:normal">Konfigurasi belum lengkap: alamat Web App (GAS_URL) di <b>js/config.js</b> belum diisi.</div>') +
      '<div class="field"><label for="lgU">Nama pengguna</label><input id="lgU" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>' +
      '<div class="field"><label for="lgP">Kata sandi</label><div style="position:relative"><input id="lgP" name="password" type="password" autocomplete="current-password" required style="padding-right:64px"><button type="button" class="btn sm ghost" id="lgLihat" style="position:absolute;right:4px;top:4px;height:30px">Lihat</button></div></div>' +
      '<div class="err" id="lgErr" role="alert" style="color:var(--bad);min-height:20px;margin-bottom:6px"></div><button class="btn block" id="lgBtn" type="submit"' + (siap ? '' : ' disabled') + '>Masuk</button>' +
      '<p class="center muted" style="margin:14px 0 0;font-size:12px">Lupa kata sandi? Hubungi Superadmin. · <a href="#/">Kembali</a></p></form></div>';
    $('#lgLihat').addEventListener('click', function () { var i = $('#lgP'); i.type = i.type === 'password' ? 'text' : 'password'; this.textContent = i.type === 'password' ? 'Lihat' : 'Sembunyi'; });
    $('#fLogin').addEventListener('submit', function (e) {
      e.preventDefault(); var u = $('#lgU').value.trim(), p = $('#lgP').value, err = $('#lgErr'), b = $('#lgBtn'); err.textContent = '';
      if (!u || !p) { err.textContent = 'Nama pengguna dan kata sandi wajib diisi.'; return; }
      b.disabled = true; b.textContent = 'Memeriksa…';
      API.call('auth.login', { username: u, password: p }).then(function (j) { API.simpanSesi(j.data.token); APP.S.me = j.data.me; APP.S.boot = j.data.boot; w.location.hash = APP.awal(); mulaiApp(); })
        .catch(function (x) { err.textContent = x.message; b.disabled = false; b.textContent = 'Masuk'; $('#lgP').value = ''; $('#lgP').focus(); });
    });
    setTimeout(function () { $('#lgU').focus(); }, 50);
  }

  /* ---------- kerangka aplikasi ---------- */
  function kerangka() {
    var me = APP.S.me, nav = MENU.filter(function (m) { return m.r.indexOf(me.role) >= 0; });
    var ini = (me.nama || me.username || '?').trim().split(/\s+/).slice(0, 2).map(function (x) { return x[0]; }).join('').toUpperCase();
    $('#app').innerHTML = '<aside class="side" id="side" aria-label="Menu utama"><div class="brand"><div class="plate"><img src="' + LOGO + '" alt="Agri Wangi Sentosa"></div></div><nav>' + nav.map(function (m) { return '<a class="nav" href="#/' + m.id + '" data-id="' + m.id + '">' + U.ik(m.ik) + '<span>' + m.l + '</span></a>'; }).join('') + '</nav><div class="foot">v' + w.APP_CONFIG.VERSI + ' · ' + U.esc(APP.S.boot && APP.S.boot.namaPerusahaan || '') + '</div></aside>' +
      '<div class="main"><header class="top"><button class="btn ghost icon menu-btn" id="menuBtn" aria-label="Buka menu">' + U.ik('menu') + '</button><div class="title" id="judul"></div><span class="sp"></span><button class="btn ghost icon" id="modeBtn" aria-label="Ganti mode terang/gelap">' + U.ik(document.documentElement.getAttribute('data-mode') === 'gelap' ? 'sun' : 'moon') + '</button>' +
      '<div class="menu"><button class="avatar" id="userBtn" aria-label="Menu akun" aria-haspopup="true">' + U.esc(ini) + '</button><div class="pop hide" id="userPop"><div style="padding:8px 10px"><b>' + U.esc(me.nama) + '</b><div class="muted" style="font-size:12px">' + U.esc(APP.ROLE_NAMA[me.role] || me.role) + (me.scope ? ' · ' + U.esc(me.scope) : '') + '</div></div><hr style="border:0;border-top:1px solid var(--border);margin:4px 0"><button data-a="sandi">' + U.ik('key', 16) + ' Ubah kata sandi</button><button data-a="semua">' + U.ik('out', 16) + ' Keluar dari semua perangkat</button><button data-a="keluar">' + U.ik('out', 16) + ' Keluar</button></div></div></header><main class="page" id="isi" tabindex="-1"></main></div>' +
      '<nav class="bottom" aria-label="Menu cepat">' + ['dashboard', 'absensi', 'produksi', 'isu'].filter(APP.boleh).map(function (id) { var m = MENU.filter(function (x) { return x.id === id; })[0]; return '<a href="#/' + id + '" data-id="' + id + '">' + U.ik(m.ik, 22) + '<span>' + m.l.split(' ')[0] + '</span></a>'; }).join('') + '<a href="#" id="bbMenu">' + U.ik('menu', 22) + '<span>Menu</span></a></nav>';
    var side = $('#side'), tutup = function () { side.classList.remove('open'); };
    $('#menuBtn').addEventListener('click', function () { side.classList.add('open'); });
    $('#bbMenu').addEventListener('click', function (e) { e.preventDefault(); side.classList.add('open'); });
    document.addEventListener('click', function (e) { if (side.classList.contains('open') && !e.target.closest('#side') && !e.target.closest('#menuBtn') && !e.target.closest('#bbMenu')) tutup(); var pop = $('#userPop'); if (pop && !e.target.closest('.menu')) pop.classList.add('hide'); });
    side.addEventListener('click', function (e) { if (e.target.closest('a.nav')) tutup(); });
    $('#modeBtn').addEventListener('click', function () { var g = document.documentElement.getAttribute('data-mode') === 'gelap'; APP.setTema(null, g ? 'terang' : 'gelap'); });
    $('#userBtn').addEventListener('click', function () { $('#userPop').classList.toggle('hide'); });
    $('#userPop').addEventListener('click', function (e) { var b = e.target.closest('button[data-a]'); if (!b) return; $('#userPop').classList.add('hide'); var a = b.dataset.a; if (a === 'sandi') APP.ubahSandi(false); else if (a === 'keluar') APP.keluar(); else if (a === 'semua') U.konfirmasi('Keluar dari semua perangkat?', 'Semua sesi Anda di perangkat lain akan berakhir.', 'Keluar semua').then(function (ok) { if (ok) API.d('auth.keluarSemua').then(function () { APP.keluar(true); }).catch(function (x) { U.toast(x.message, 'err'); }); }); });
  }
  APP.keluar = function (diam) { API.call('auth.keluar', {}, { diam: true }).catch(function () {}); API.simpanSesi(''); APP.S = { me: null, boot: APP.S.boot, status: null, rep: null, repKey: '', per: null, filter: {} }; CH.bersih(); $('#app').classList.add('hide'); $('#app').innerHTML = ''; w.location.hash = '#/masuk'; rute(true); if (!diam) U.toast('Anda telah keluar.'); };
  APP.ubahSandi = function (paksa) {
    if (document.querySelector('#fSandi')) return;   /* jangan buka dua jendela sekaligus */
    var m = U.modal('<h2>' + (paksa ? 'Ganti kata sandi sementara' : 'Ubah kata sandi') + '</h2>' + (paksa ? '<p class="muted">Demi keamanan, ganti kata sandi sementara dari Superadmin sebelum melanjutkan.</p>' : '') + '<form id="fSandi"><div class="field"><label>Kata sandi saat ini</label><input type="password" id="sLama" autocomplete="current-password" required></div><div class="field"><label>Kata sandi baru</label><input type="password" id="sBaru" autocomplete="new-password" required><div class="hint">Minimal 8 karakter, mengandung huruf dan angka.</div></div><div class="field"><label>Ulangi kata sandi baru</label><input type="password" id="sUlang" autocomplete="new-password" required></div><div class="err" id="sErr" style="color:var(--bad);min-height:18px"></div><div class="acts">' + (paksa ? '' : '<button type="button" class="btn ghost" data-tutup>Batal</button>') + '<button class="btn" type="submit">Simpan</button></div></form>', { kunci: !!paksa });
    $('#fSandi', m.el).addEventListener('submit', function (e) {
      e.preventDefault(); var lama = $('#sLama').value, baru = $('#sBaru').value, ul = $('#sUlang').value, er = $('#sErr');
      if (baru !== ul) { er.textContent = 'Pengulangan kata sandi tidak sama.'; return; } if (baru.length < 8 || !/[A-Za-z]/.test(baru) || !/\d/.test(baru)) { er.textContent = 'Minimal 8 karakter dengan huruf dan angka.'; return; }
      var bt = $('#fSandi button[type=submit]', m.el); if (bt.disabled) return; bt.disabled = true; bt.textContent = 'Menyimpan…'; er.style.color = 'var(--muted)'; er.textContent = 'Sedang memproses, mohon tunggu — bisa sampai 15 detik.';
      API.d('auth.ubahSandi', { lama: lama, baru: baru }).then(function (d) { API.simpanSesi(d.token); APP.S.me = d.me; m.tutup(); U.toast('Kata sandi diganti.', 'ok'); if (paksa) mulaiApp(); }).catch(function (x) { bt.disabled = false; bt.textContent = 'Simpan'; er.style.color = 'var(--bad)'; er.textContent = x.message; });
    });
  };

  /* ---------- rute ---------- */
  var terakhir = '';
  function rute(paksa) {
    var h = (w.location.hash || '#/').replace(/^#\/?/, ''), id = h.split('?')[0];
    var bt = document.getElementById('boot'); if (bt) bt.remove();
    var login = !!APP.S.me, kunci = id + '|' + (login ? 1 : 0);
    if (paksa !== true && kunci === terakhir) return; terakhir = kunci;
    if (w.AWSL && w.AWSL.stop) w.AWSL.stop();
    ['land', 'login', 'app'].forEach(function (x) { $('#' + x).classList.add('hide'); });
    if (!login) {
      if (id === 'masuk' || (id && id !== '' && id !== 'fitur')) { masuk(); $('#login').classList.remove('hide'); document.title = 'Masuk · AWS Daily Report'; }
      else { landing(); $('#land').classList.remove('hide'); document.title = 'AWS Daily Report · PT. Agri Wangi Sentosa'; }
      return;
    }
    if (!id || id === 'masuk' || id === 'fitur') { w.location.hash = APP.awal(); return; }
    var m = MENU.filter(function (x) { return x.id === id; })[0];
    if (!m || !APP.boleh(id)) { w.location.hash = APP.awal(); if (m) U.toast('Peran Anda tidak memiliki akses ke halaman itu.', 'warn'); return; }
    $('#app').classList.remove('hide');
    U.$$('a[data-id]').forEach(function (a) { a.classList.toggle('on', a.dataset.id === id); });
    $('#judul').textContent = m.l; document.title = m.l + ' · AWS Daily Report';
    var host = $('#isi'); CH.bersih(); host.innerHTML = ''; host.scrollTop = 0; w.scrollTo(0, 0);
    var f = APP.V[id]; if (!f) { host.innerHTML = UI.kosong('Halaman belum tersedia', id); return; }
    try { f(host); } catch (e) { UI.galat(host, e); }
  }
  APP.rute = rute;
  function mulaiApp() {
    kerangka(); APP.terapkanTema();
    APP.muatStatus().catch(function () {}).then(function () { rute(true); if (APP.S.me.paksaGanti) APP.ubahSandi(true); });
  }
  API.onAuthLost = function (e) { if (!APP.S.me) return; if (e && e.code === 'GANTI_SANDI') return; API.simpanSesi(''); APP.S.me = null; CH.bersih(); w.location.hash = '#/masuk'; rute(true); U.toast('Sesi berakhir. Silakan masuk kembali.', 'warn'); };
  var tunda = 0, tmrBar = null, bar = null;
  function barNyala(on) { if (on) { if (!bar) { bar = document.createElement('div'); bar.id = 'lodbar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar); } } else if (bar) { bar.remove(); bar = null; } }
  function barSelesai() { tunda = Math.max(0, tunda - 1); if (!tunda) { clearTimeout(tmrBar); tmrBar = null; barNyala(false); } }
  var asliCall = API.call; API.call = function (a, d, o) { tunda++; if (!tmrBar) tmrBar = setTimeout(function () { if (tunda) barNyala(true); }, 400); return asliCall(a, d, o).then(function (r) { barSelesai(); return r; }, function (e) { barSelesai(); throw e; }).catch(function (e) { if (e && e.code === 'GANTI_SANDI' && APP.S.me && !document.querySelector('#fSandi')) APP.ubahSandi(true); throw e; }); };

  function init() {
    API.muatSesi(); APP.terapkanTema();
    w.addEventListener('hashchange', function () { rute(); });
    w.addEventListener('resize', U.debounce(function () { U.$$('.chart').forEach(function (c) { var i = w.echarts && echarts.getInstanceByDom(c); if (i) i.resize(); }); }, 200));
    if (w.matchMedia) w.matchMedia('(prefers-color-scheme: dark)').addEventListener && w.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { if (U.baca('mode', '') === 'sistem') { APP.terapkanTema(); CH.gambarUlang(); } });
    if (!API.siapUrl()) { rute(true); return; }
    if (!API.token) rute(true);   /* tanpa sesi: tampilkan landing/login SEGERA, jangan menunggu server */
    API.d('app.boot', {}, { diam: true, timeout: 25000 }).then(function (b) { APP.S.boot = b; APP.terapkanTema(); if (w.AWSL && b && b.landing) { var lama = w.AWSL.choice(); w.AWSL.remember(b.landing); if (!APP.S.me && !$('#land').classList.contains('hide') && w.AWSL.choice(b.landing) !== lama) landing(); } }).catch(function () {});
    if (API.token) API.d('auth.me', {}, { diam: true, timeout: 30000 }).then(function (d) { APP.S.me = d.me; APP.S.boot = d.boot; mulaiApp(); }).catch(function () { API.simpanSesi(''); rute(true); });
  }
  w.APP = APP; document.addEventListener('DOMContentLoaded', init);
})(window);
