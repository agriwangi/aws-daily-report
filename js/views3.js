/* AWS Daily Report v1.0.0 — halaman: Ekspor & Pengesahan, Riwayat, Pengaturan, Pengguna */
(function (w) {
  'use strict';
  var V = APP.V, $ = U.$;

  /* ============ EKSPOR & PENGESAHAN LHP ============ */
  V.ekspor = function (host) {
    APP.laman(host, { judul: 'Ekspor & Pengesahan', desk: 'Unduh laporan, kirim lewat email, dan sahkan Laporan Harian Produksi.', filter: false, isi: function (body, rep) {
      var pEmail = APP.izin('email'), pLhp = APP.izin('lhp'), lhp = null, tgl = rep.to;
      body.insertAdjacentHTML('beforeend', '<div class="panel c2e"><div class="card"><h3>Unduh laporan</h3><p class="muted">Periode ' + U.esc(U.tglID(rep.from, true)) + (rep.from === rep.to ? '' : ' s.d. ' + U.esc(U.tglID(rep.to, true))) + '. Isi mengikuti filter yang sedang aktif.</p>' +
        '<div class="grid2"><button class="btn" data-x="pdf">' + U.ik('file', 18) + ' PDF</button><button class="btn" data-x="ppt">' + U.ik('chart', 18) + ' PowerPoint</button><button class="btn sec" data-x="xlsx">' + U.ik('table', 18) + ' Excel (semua tabel)</button><button class="btn sec" data-x="csv">' + U.ik('download', 18) + ' CSV</button></div>' +
        '<div class="field" style="margin-top:12px"><label>Bagian untuk CSV</label><select id="xBag">' + Object.keys(EX.tabel(rep)).map(function (k) { return '<option>' + U.esc(k) + '</option>'; }).join('') + '</select></div>' +
        '<p class="muted" style="font-size:12px">Untuk PDF, pilih "Simpan sebagai PDF" pada jendela cetak yang terbuka.</p></div>' +
        (pEmail ? '<div class="card"><h3>Kirim lewat email</h3><div class="field"><label>Penerima (pisahkan dengan koma)</label><input id="eTo" type="text" placeholder="nama@perusahaan.com, …"></div><div class="field"><label>Tanggal laporan</label><input id="eTgl" type="date" value="' + tgl + '"></div><button class="btn" id="eKirim">' + U.ik('mail', 18) + ' Kirim sekarang</button><p class="muted" style="font-size:12px">Kosongkan penerima untuk memakai daftar di Pengaturan.</p></div>' : '') + '</div>' +
        (pLhp ? '<div class="card" style="margin-top:16px"><h3>Pengesahan Laporan Harian Produksi</h3><div class="field" style="max-width:220px"><label>Tanggal</label><input type="date" id="lTgl" value="' + tgl + '"></div><div id="lBox">' + UI.skel() + '</div></div>' : ''));

      function ttdMeta() { var f = function (x) { return x ? x.oleh + ' · ' + U.tglID(String(x.pada).slice(0, 10), true) : ''; }; return lhp ? { disusun: f(lhp.disusun), diperiksa: f(lhp.diperiksa), disetujui: f(lhp.disetujui) } : null; }
      function sibuk(b, p) { b.disabled = true; var t = b.innerHTML; return p.then(function () { b.disabled = false; b.innerHTML = t; }, function (e) { b.disabled = false; b.innerHTML = t; U.toast(e.message || 'Gagal membuat berkas.', 'err'); }); }
      body.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-x]'); if (!b) return; var x = b.dataset.x;
        var meta = { perusahaan: (APP.S.boot && APP.S.boot.namaPerusahaan) || 'PT. Agri Wangi Sentosa', ttd: ttdMeta() };
        if (x === 'xlsx') sibuk(b, Promise.resolve().then(function () { EX.excel(rep); }));
        else if (x === 'csv') sibuk(b, Promise.resolve().then(function () { EX.csv(rep, $('#xBag', body).value); }));
        else if (x === 'ppt') sibuk(b, Promise.resolve(EX.ppt(rep, meta)));
        else if (x === 'pdf') sibuk(b, Promise.resolve(EX.pdf(rep, meta)));
      });
      if (pEmail) $('#eKirim', body).onclick = function () { var b = this; b.disabled = true; API.call('email.kirim', { tgl: $('#eTgl', body).value, to: $('#eTo', body).value.trim() }).then(function (j) { U.toast(j.msg, 'ok'); b.disabled = false; }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; }); };
      if (!pLhp) return;
      var role = APP.role();
      function gambarLhp() {
        var box = $('#lBox', body), l = lhp, st = function (x, sudah) { return sudah ? '<span class="badge ok">' + U.ik('check', 14) + ' ' + U.esc(x.oleh) + ' · ' + U.waktuID(x.pada) + '</span>' : '<span class="badge">Belum</span>'; };
        if (!l.ada) { box.innerHTML = UI.kosong('Belum ada data pada tanggal ini', 'Unggah data harian terlebih dahulu.', 'inbox'); return; }
        var bisa = function (peran) { return role === 'superadmin' || role === peran; };
        box.innerHTML = (l.perluUlang ? '<div class="badge warn" style="display:block;border-radius:10px;padding:8px 12px;margin-bottom:10px;white-space:normal">Data berubah sejak laporan disusun. Admin perlu menyusun ulang agar pengesahan berlaku.</div>' : '') +
          '<div class="lhp"><div class="lhp-s"><b>1. Disusun</b><span class="muted">Admin</span>' + st(l.disusun, l.disusun) + (bisa('admin') ? '<button class="btn sm" data-t="susun">' + (l.disusun ? 'Susun ulang' : 'Tandai disusun') + '</button>' : '') + '</div>' +
          '<div class="lhp-s"><b>2. Diperiksa</b><span class="muted">SPV</span>' + st(l.diperiksa, l.diperiksa) + (bisa('spv') && l.disusun && !l.perluUlang ? '<button class="btn sm" data-t="periksa">Tandai diperiksa</button>' : '') + '</div>' +
          '<div class="lhp-s"><b>3. Disetujui</b><span class="muted">Manager</span>' + st(l.disetujui, l.disetujui) + (bisa('manager') && l.diperiksa && !l.perluUlang ? '<button class="btn sm" data-t="setuju">Setujui</button>' : '') + '</div></div>';
      }
      function muatLhp() { var t = $('#lTgl', body).value; if (!t) return; $('#lBox', body).innerHTML = UI.skel(); API.d('lhp.get', { tgl: t }).then(function (d) { lhp = d; gambarLhp(); }).catch(function (x) { UI.galat($('#lBox', body), x, muatLhp); }); }
      $('#lTgl', body).onchange = muatLhp;
      $('#lBox', body).addEventListener('click', function (e) { var b = e.target.closest('button[data-t]'); if (!b) return; b.disabled = true; API.d('lhp.sah', { tgl: $('#lTgl', body).value, tahap: b.dataset.t }).then(function (d) { lhp = d; gambarLhp(); U.toast('Pengesahan tercatat.', 'ok'); }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; }); });
      muatLhp();
    } });
  };

  /* ============ RIWAYAT PERUBAHAN ============ */
  V.riwayat = function (host) {
    host.innerHTML = '<div class="head"><div><h1>Riwayat Perubahan</h1><p>Catatan semua unggahan, koreksi, dan perubahan pengaturan. Tidak dapat diubah.</p></div><div class="row"><button class="btn sec" id="rVer">' + U.ik('shield', 18) + ' Periksa keutuhan</button></div></div><div id="rHasil"></div><div class="card"><div id="rT">' + UI.skel() + '</div></div>';
    $('#rVer').onclick = function () { var b = this; b.disabled = true; API.d('riwayat.verifikasi').then(function (d) { b.disabled = false; $('#rHasil').innerHTML = '<div class="card" style="margin-bottom:14px;border-left:4px solid var(' + (d.utuh ? '--ok' : '--bad') + ')"><b>' + (d.utuh ? 'Riwayat utuh' : 'Riwayat tidak utuh mulai nomor ' + d.pertamaRusak) + '</b><div class="muted">' + U.nf(d.jumlah) + ' catatan diperiksa.</div></div>'; }).catch(function (x) { b.disabled = false; U.toast(x.message, 'err'); }); };
    function muat() { API.d('riwayat.daftar', { limit: 500 }).then(function (a) { UI.tabel($('#rT'), [{ k: 'no', l: 'No', num: 1 }, { k: 'waktu', l: 'Waktu', f: function (v) { return U.waktuID(v); } }, { k: 'pengguna', l: 'Pengguna' }, { k: 'peran', l: 'Peran' }, { k: 'aksi', l: 'Aksi', f: function (v) { return '<span class="badge info">' + U.esc(v) + '</span>'; } }, { k: 'entitas', l: 'Objek' }, { k: 'detail', l: 'Rincian' }], a, { ukuran: 15 }); }).catch(function (e) { UI.galat($('#rT'), e, muat); }); }
    muat();
  };

  /* ============ PENGATURAN ============ */
  V.pengaturan = function (host) {
    var sa = APP.role() === 'superadmin';
    host.innerHTML = '<div id="pgSet"><div class="head"><div><h1>Pengaturan</h1><p>Tampilan, akun' + (sa ? ', email otomatis, dan ambang penilaian' : '') + '.</p></div></div><div class="panel c2e"><div class="card"><h3>Tampilan</h3><div id="pTema"></div><div class="field" style="margin-top:14px"><label>Mode</label><div class="pills" id="pMode"></div></div></div><div class="card"><h3>Akun saya</h3><p class="muted">Masuk sebagai <b>' + U.esc(APP.S.me.nama) + '</b> (' + U.esc(APP.ROLE_NAMA[APP.role()] || APP.role()) + ').</p><div class="row"><button class="btn sec" id="pSandi">' + U.ik('key', 18) + ' Ubah kata sandi</button><button class="btn ghost" id="pSemua">' + U.ik('out', 18) + ' Keluar dari semua perangkat</button></div></div></div>' + (sa ? '<div id="pAdm" style="margin-top:16px">' + UI.skel() + '</div>' : '') + '</div>';
    var pg = $('#pgSet');
    function gambarTema() {
      var t = U.baca('tema', 'tea-green'), m = U.baca('mode', 'terang');
      $('#pTema').innerHTML = '<div class="theme-sw">' + APP.TEMA.map(function (x) { return '<button type="button" data-t="' + x[0] + '" class="' + (x[0] === t ? 'on' : '') + '" aria-pressed="' + (x[0] === t) + '" title="' + U.esc(x[1]) + '"><i style="background:' + x[2] + '"></i><span>' + U.esc(x[1]) + '</span></button>'; }).join('') + '</div>';
      $('#pMode').innerHTML = [['terang', 'Terang'], ['gelap', 'Gelap'], ['sistem', 'Ikuti perangkat']].map(function (x) { return '<button type="button" data-m="' + x[0] + '" class="' + (x[0] === m ? 'on' : '') + '">' + x[1] + '</button>'; }).join('');
    }
    gambarTema();
    pg.addEventListener('click', function (e) { var b = e.target.closest('#pTema [data-t],#pMode [data-m]'); if (!b) return; if (b.dataset.t) APP.setTema(b.dataset.t, null); else APP.setTema(null, b.dataset.m); gambarTema(); });
    $('#pSandi').onclick = function () { APP.ubahSandi(false); };
    $('#pSemua').onclick = function () { U.konfirmasi('Keluar dari semua perangkat?', 'Semua sesi Anda akan berakhir, termasuk di perangkat ini.', 'Keluar semua').then(function (ok) { if (ok) API.d('auth.keluarSemua').then(function () { APP.keluar(true); }).catch(function (x) { U.toast(x.message, 'err'); }); }); };
    if (!sa) return;
    API.d('pengaturan.get').then(function (d) {
      var p = d.pengaturan, ar = d.aturan, urut = Object.keys(ar).sort(function (a, b) { return +a.slice(1) - +b.slice(1); });
      $('#pAdm').innerHTML = '<div class="panel c2e"><div class="card"><h3>Perusahaan & email otomatis</h3><div class="field"><label>Nama perusahaan</label><input id="sNama" value="' + U.esc(p.NAMA_PERUSAHAAN) + '"></div><div class="field"><label>Penerima email (pisahkan dengan koma)</label><input id="sTo" value="' + U.esc(p.EMAIL_PENERIMA) + '"></div><div class="grid2"><div class="field"><label>Email otomatis harian</label><select id="sAktif"><option value="tidak"' + (p.EMAIL_AKTIF !== 'ya' ? ' selected' : '') + '>Nonaktif</option><option value="ya"' + (p.EMAIL_AKTIF === 'ya' ? ' selected' : '') + '>Aktif</option></select></div><div class="field"><label>Jam kirim (0–23)</label><input id="sJam" type="number" min="0" max="23" value="' + U.esc(p.EMAIL_JAM) + '"></div></div><div class="field"><label>Kunci data lama setelah (jam)</label><input id="sKunci" type="number" min="1" max="720" value="' + U.esc(p.KUNCI_JAM) + '"><div class="muted" style="font-size:12px">Setelah batas ini, Admin harus mengajukan persetujuan untuk mengubah data.</div></div></div>' +
        '<div class="card"><h3>Ambang penilaian</h3><p class="muted" style="margin-top:0">Isu berwarna kuning bila melewati ambang kuning, dan merah bila melewati ambang merah.</p><div class="tw" style="max-height:420px;overflow:auto"><table class="t"><thead><tr><th>Aturan</th><th>Arah</th><th class="num">Kuning</th><th class="num">Merah</th><th>Aktif</th></tr></thead><tbody>' + urut.map(function (k) { var a = ar[k]; return '<tr data-k="' + k + '"><td><b>' + k + '</b> ' + U.esc(a.nama) + '</td><td>' + U.esc(a.op === '<' || a.op === '<=' ? 'di bawah' : 'di atas') + '</td><td><input type="number" step="any" data-f="kuning" value="' + a.kuning + '" style="width:90px"></td><td><input type="number" step="any" data-f="merah" value="' + a.merah + '" style="width:90px"></td><td><input type="checkbox" data-f="aktif"' + (a.aktif !== false ? ' checked' : '') + ' aria-label="Aktif"></td></tr>'; }).join('') + '</tbody></table></div></div></div><div class="acts" style="margin-top:14px"><button class="btn" id="sSimpan">Simpan pengaturan</button></div>';
      var LA = (w.AWSL && w.AWSL.list) ? w.AWSL.list() : [], laNow = (LA.some(function (x) { return x.k === p.LANDING; }) ? p.LANDING : 'klasik');
      if (LA.length) {
        function gambarLa() {
          $('#laList').innerHTML = LA.map(function (m) { var on = m.k === laNow; return '<button type="button" class="lp-o' + (on ? ' on' : '') + '" data-k="' + U.esc(m.k) + '" aria-pressed="' + on + '"><span class="lp-sw">' + m.c.map(function (c) { return '<i style="background:' + U.esc(c) + '"></i>'; }).join('') + '</span><span class="lp-t"><b>' + U.esc(m.n) + '</b><small>' + U.esc(m.d) + '</small></span>' + (on ? '<span class="lp-ck" aria-hidden="true">✓</span>' : '') + '</button>'; }).join('');
          $('#laPrev').disabled = laNow === 'klasik';
        }
        $('#pAdm').insertAdjacentHTML('beforeend', '<div class="card" style="margin-top:16px" id="laCard"><h3>Tampilan halaman awal</h3><p class="muted" style="margin-top:0">Halaman yang dilihat pengunjung sebelum masuk. Pilihan berlaku untuk semua pengunjung.</p><div class="lp-ps" id="laList"></div><div class="row"><button class="btn sec" id="laPrev" type="button">Pratinjau</button><button class="btn" id="laSimpan" type="button">Simpan tampilan</button></div></div>');
        gambarLa();
        $('#laList').addEventListener('click', function (e) { var b = e.target.closest('.lp-o'); if (!b) return; laNow = b.dataset.k; gambarLa(); });
        $('#laPrev').onclick = function () { w.AWSL.preview(laNow, { logo: APP.LOGO, versi: w.APP_CONFIG.VERSI }); };
        $('#laSimpan').onclick = function () {
          var b = this; b.disabled = true;
          API.call('pengaturan.simpan', { pengaturan: { LANDING: laNow } }).then(function (j) { U.toast(j.msg, 'ok'); b.disabled = false; if (APP.S.boot) APP.S.boot.landing = laNow; w.AWSL.remember(laNow); }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; });
        };
      }
      API.d('hak.get').then(function (hk) {
        var peta = JSON.parse(JSON.stringify(hk.peta)), peran = hk.peran, grup = ['Halaman', 'Tindakan'];
        $('#pAdm').insertAdjacentHTML('beforeend', '<div class="card" style="margin-top:16px" id="hkCard"><h3>Hak akses peran</h3><p class="muted" style="margin-top:0">Centang halaman dan tindakan yang boleh dipakai tiap peran. Superadmin selalu penuh dan tidak bisa diubah. Pengaturan (tema, kata sandi) terbuka untuk semua, Kelola Pengguna khusus Superadmin.</p><div id="hkT"></div><div class="row" style="margin-top:12px"><button class="btn" id="hkSimpan" type="button">Simpan hak akses</button><button class="btn ghost" id="hkReset" type="button">Kembalikan ke bawaan</button></div></div>');
        function gambarHk() {
          $('#hkT').innerHTML = '<div class="tw"><table class="t hk"><thead><tr><th>Hak</th>' + peran.map(function (r) { return '<th class="num" style="text-align:center">' + U.esc(APP.ROLE_NAMA[r] || r) + '</th>'; }).join('') + '</tr></thead><tbody>' +
            grup.map(function (g) { return '<tr><td colspan="' + (peran.length + 1) + '" style="background:var(--surface,#f3f7f4);font-weight:700;font-size:12.5px">' + g + '</td></tr>' + hk.izin.filter(function (z) { return z.g === g; }).map(function (z) { return '<tr><td>' + U.esc(z.l) + '</td>' + peran.map(function (r) { var on = peta[z.k].indexOf(r) >= 0; return '<td style="text-align:center"><input type="checkbox" data-k="' + z.k + '" data-r="' + r + '"' + (on ? ' checked' : '') + ' aria-label="' + U.esc(z.l + ' untuk ' + (APP.ROLE_NAMA[r] || r)) + '"></td>'; }).join('') + '</tr>'; }).join(''); }).join('') + '</tbody></table></div>';
        }
        gambarHk();
        $('#hkT').addEventListener('change', function (e) {
          var c = e.target.closest('input[data-k]'); if (!c) return; var l = peta[c.dataset.k], i = l.indexOf(c.dataset.r);
          if (c.checked && i < 0) l.push(c.dataset.r); else if (!c.checked && i >= 0) l.splice(i, 1);
        });
        function simpanHk(reset) {
          var b = reset ? $('#hkReset') : $('#hkSimpan'); b.disabled = true;
          API.call('hak.simpan', reset ? { reset: true } : { peta: peta }).then(function (j) { U.toast(j.msg, 'ok'); b.disabled = false; peta = j.data.peta; if (APP.S.boot) APP.S.boot.hak = JSON.parse(JSON.stringify(peta)); gambarHk(); }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; });
        }
        $('#hkSimpan').onclick = function () { simpanHk(false); };
        $('#hkReset').onclick = function () { U.konfirmasi('Kembalikan hak akses ke bawaan?', 'Semua centang kembali seperti pengaturan awal aplikasi.', 'Kembalikan').then(function (ok) { if (ok) simpanHk(true); }); };
      }).catch(function (e) { U.toast(e.message, 'err'); });
      $('#sSimpan').onclick = function () {
        var b = this, aturan = {}; U.$$('#pAdm tr[data-k]').forEach(function (tr) { aturan[tr.dataset.k] = { kuning: tr.querySelector('[data-f=kuning]').value, merah: tr.querySelector('[data-f=merah]').value, aktif: tr.querySelector('[data-f=aktif]').checked }; });
        b.disabled = true;
        API.call('pengaturan.simpan', { pengaturan: { NAMA_PERUSAHAAN: $('#sNama').value.trim(), EMAIL_PENERIMA: $('#sTo').value.trim(), EMAIL_AKTIF: $('#sAktif').value, EMAIL_JAM: $('#sJam').value, KUNCI_JAM: $('#sKunci').value, TEMA: U.baca('tema', 'tea-green'), MODE: U.baca('mode', 'terang') }, aturan: aturan })
          .then(function (j) { U.toast(j.msg, 'ok'); b.disabled = false; if (APP.S.boot) APP.S.boot.namaPerusahaan = $('#sNama').value.trim(); APP.invalidasi(); }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; });
      };
    }).catch(function (e) { UI.galat($('#pAdm'), e); });
  };

  /* ============ PENGGUNA & PERSETUJUAN ============ */
  function tampilSandi(judul, d) {
    var m = U.modal('<h2>' + U.esc(judul) + '</h2><p>Kata sandi sementara untuk <b>' + U.esc(d.username) + '</b>. Catat sekarang; kata sandi ini <b>hanya tampil sekali</b> dan harus diganti saat pertama masuk.</p><div class="field"><input id="sTmp" readonly value="' + U.esc(d.sandiSementara) + '" style="font-family:var(--mono);font-size:18px;text-align:center"></div><div class="acts"><button class="btn sec" id="sSalin">Salin</button><button class="btn" data-tutup>Selesai</button></div>', { kunci: true });
    $('#sSalin', m.el).onclick = function () { var i = $('#sTmp', m.el); i.select(); try { (navigator.clipboard ? navigator.clipboard.writeText(i.value) : Promise.reject()).then(function () { U.toast('Disalin.', 'ok'); }, function () { document.execCommand('copy'); U.toast('Disalin.', 'ok'); }); } catch (e) { document.execCommand('copy'); } };
  }
  V.pengguna = function (host) {
    host.innerHTML = '<div class="head"><div><h1>Pengguna</h1><p>Kelola akun, peran, dan persetujuan pembukaan kunci data.</p></div></div>';
    var isi = document.createElement('div'); host.appendChild(isi);
    APP.tab(isi, [['usr', 'Daftar pengguna', tabUsr], ['aju', 'Persetujuan data', function (h) { h.innerHTML = '<div class="card"><div id="jT">' + UI.skel() + '</div></div>'; var muat = function () { APP.pengajuanTabel($('#jT', h), muat); }; muat(); }]]);
  };
  function tabUsr(h) {
    h.innerHTML = '<div class="card"><div id="uT">' + UI.skel() + '</div></div>';
    function form(u) {
      var baru = !u; u = u || { role: 'asisten', aktif: 'ya' };
      var m = U.modal('<h2>' + (baru ? 'Tambah pengguna' : 'Ubah pengguna') + '</h2><form id="uF" autocomplete="off"><div class="field"><label>Nama pengguna *</label><input name="username" value="' + U.esc(u.username || '') + '"' + (baru ? '' : ' readonly') + ' placeholder="huruf kecil, angka, titik, minus"></div><div class="field"><label>Nama lengkap *</label><input name="nama" value="' + U.esc(u.nama || '') + '"></div><div class="grid2"><div class="field"><label>Peran *</label><select name="role">' + Object.keys(APP.ROLE_NAMA).map(function (r) { return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + APP.ROLE_NAMA[r] + '</option>'; }).join('') + '</select></div><div class="field"><label>Status</label><select name="aktif"><option value="ya"' + (u.aktif !== 'tidak' ? ' selected' : '') + '>Aktif</option><option value="tidak"' + (u.aktif === 'tidak' ? ' selected' : '') + '>Nonaktif</option></select></div></div><div class="field" id="uScope"><label>Cakupan (nama persis seperti di Excel)</label><input name="scope" value="' + U.esc(u.scope || '') + '" placeholder="Askep / Asisten yang dimaksud"><div class="muted" style="font-size:12px">Wajib untuk Askep dan Asisten; mereka hanya melihat data cakupannya.</div></div><div class="field"><label>Email</label><input name="email" type="email" value="' + U.esc(u.email || '') + '"></div><div class="acts"><button type="button" class="btn ghost" data-tutup>Batal</button><button class="btn" type="submit">Simpan</button></div></form>', { lebar: false });
      var f = $('#uF', m.el), peran = f.elements.role, sc = $('#uScope', m.el), tampil = function () { sc.style.display = (peran.value === 'asisten' || peran.value === 'askep') ? '' : 'none'; };
      peran.onchange = tampil; tampil();
      f.onsubmit = function (e) { e.preventDefault(); var d = {}; ['username', 'nama', 'role', 'aktif', 'scope', 'email'].forEach(function (k) { d[k] = f.elements[k].value.trim(); }); if (peran.value !== 'asisten' && peran.value !== 'askep') d.scope = '';
        API.call('pengguna.simpan', d).then(function (j) { m.tutup(); U.toast(j.msg, 'ok'); muat(); if (j.data && j.data.sandiSementara) tampilSandi('Pengguna dibuat', j.data); }).catch(function (x) { U.toast(x.message, 'err'); }); };
    }
    function muat() {
      API.d('pengguna.daftar').then(function (a) {
        UI.tabel($('#uT', h), [{ k: 'username', l: 'Pengguna' }, { k: 'nama', l: 'Nama' }, { k: 'role', l: 'Peran', f: function (v) { return '<span class="badge info">' + U.esc(APP.ROLE_NAMA[v] || v) + '</span>'; } }, { k: 'scope', l: 'Cakupan' }, { k: 'email', l: 'Email' }, { k: 'aktif', l: 'Status', f: function (v) { return '<span class="badge ' + (v === 'tidak' ? '' : 'ok') + '">' + (v === 'tidak' ? 'Nonaktif' : 'Aktif') + '</span>'; } }, { k: 'loginTerakhir', l: 'Masuk terakhir', f: function (v) { return v ? U.waktuID(v) : '–'; } }, { k: 'username', l: '', f: function (v) { return '<button class="btn sm ghost" data-e="' + U.esc(v) + '">Ubah</button> <button class="btn sm ghost" data-r="' + U.esc(v) + '">Reset sandi</button>'; } }], a,
          { ukuran: 15, aksi: '<button class="btn sm" id="uBaru" style="margin-left:auto">' + U.ik('plus', 16) + ' Tambah pengguna</button>', setelah: function (x) {
            var tb = $('#uBaru', x); if (tb) tb.onclick = function () { form(null); };
            U.$$('[data-e]', x).forEach(function (b) { b.onclick = function () { form(a.filter(function (u) { return u.username === b.dataset.e; })[0]); }; });
            U.$$('[data-r]', x).forEach(function (b) { b.onclick = function () { U.konfirmasi('Reset kata sandi?', 'Kata sandi ' + b.dataset.r + ' diganti dengan yang sementara, dan semua sesinya berakhir.', 'Reset', true).then(function (ok) { if (ok) API.call('pengguna.reset', { username: b.dataset.r }).then(function (j) { tampilSandi('Kata sandi direset', j.data); }).catch(function (e) { U.toast(e.message, 'err'); }); }); }; });
          } });
      }).catch(function (e) { UI.galat($('#uT', h), e, muat); });
    }
    muat();
  }
})(window);
