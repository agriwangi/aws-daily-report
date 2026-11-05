/* AWS Daily Report v1.0.0 — halaman: Isu & Rekomendasi, Unggah Excel, Input Manual */
(function (w) {
  'use strict';
  var V = APP.V, $ = U.$;
  var STATUS = [['baru', 'Baru'], ['proses', 'Dalam proses'], ['selesai', 'Selesai'], ['diabaikan', 'Diabaikan']];
  function perOpsi(ds) { return ((APP.S.status && APP.S.status.registri) || []).filter(function (r) { return r.dataset === ds; }).map(function (r) { return r.periode; }).sort().reverse(); }

  /* ============ ISU & REKOMENDASI ============ */
  V.isu = function (host) {
    APP.laman(host, { judul: 'Isu & Rekomendasi', desk: 'Temuan otomatis dari aturan penilaian. Rekomendasi dan status dapat disunting.', isi: function (body, rep) {
      var penilai = APP.penilai(), ar = rep.aturan || (APP.S.boot && APP.S.boot.aturan) || {}, st = { level: '', aturan: '', status: '', q: '', maks: 30 }, isu = rep.isu;
      var hitung = function (s) { return isu.filter(function (i) { return i.status === s; }).length; };
      body.insertAdjacentHTML('beforeend', UI.kpi([{ l: 'Isu merah', v: rep.ringkasIsu.merah, kls: 'dn' }, { l: 'Isu kuning', v: rep.ringkasIsu.kuning }, { l: 'Dalam proses', v: hitung('proses') }, { l: 'Selesai', v: hitung('selesai') }]));
      var bar = document.createElement('div'); bar.className = 'bar';
      var aturanAda = {}; isu.forEach(function (i) { aturanAda[i.aturan] = 1; });
      bar.innerHTML = '<select data-f="level" aria-label="Tingkat"><option value="">Semua tingkat</option><option value="merah">Merah</option><option value="kuning">Kuning</option></select><select data-f="aturan" aria-label="Aturan"><option value="">Semua aturan</option>' + Object.keys(aturanAda).sort(function (a, b) { return +a.slice(1) - +b.slice(1); }).map(function (a) { return '<option value="' + a + '">' + U.esc(a + ' — ' + ((ar[a] && ar[a].nama) || '')) + '</option>'; }).join('') + '</select><select data-f="status" aria-label="Status"><option value="">Semua status</option>' + STATUS.map(function (s) { return '<option value="' + s[0] + '">' + s[1] + '</option>'; }).join('') + '</select><input type="search" data-f="q" placeholder="Cari entitas / uraian…" style="max-width:280px" aria-label="Cari isu">';
      body.appendChild(bar); var daftar = document.createElement('div'); body.appendChild(daftar);
      function tampil() {
        var a = isu.filter(function (i) { return (!st.level || i.level === st.level) && (!st.aturan || i.aturan === st.aturan) && (!st.status || i.status === st.status) && (!st.q || (i.entitas + ' ' + i.teks + ' ' + i.rekomendasi).toLowerCase().indexOf(st.q.toLowerCase()) >= 0); });
        a.sort(function (x, y) { return (x.level === 'merah' ? 0 : 1) - (y.level === 'merah' ? 0 : 1) || (+x.aturan.slice(1)) - (+y.aturan.slice(1)); });
        if (!a.length) { daftar.innerHTML = '<div class="card">' + UI.kosong(isu.length ? 'Tidak ada isu yang cocok' : 'Tidak ada isu pada periode ini', isu.length ? 'Ubah filter di atas.' : 'Semua indikator berada dalam batas aman.', 'check') + '</div>'; return; }
        daftar.innerHTML = a.slice(0, st.maks).map(function (i) { var idx = isu.indexOf(i);
          return '<div class="isu ' + i.level + '" data-i="' + idx + '"><div class="row" style="gap:8px">' + UI.lvBadge(i.level) + '<b>' + U.esc(i.aturan) + '</b><span>' + U.esc((ar[i.aturan] && ar[i.aturan].nama) || '') + '</span><span class="grow"></span><span class="badge info">' + U.esc(i.scope) + ': ' + U.esc(i.entitas) + '</span></div>' +
            '<div>' + U.esc(i.teks) + '</div><div class="muted" style="font-size:12px">Nilai ' + U.nf(i.nilai, 2) + ' · ambang ' + U.esc(i.ambang) + (i.tgl ? ' · ' + U.tglID(i.tgl, true) : '') + '</div>' +
            '<div class="grid2"><div class="field" style="margin:0"><label>Rekomendasi</label>' + (penilai ? '<textarea data-k="rekomendasi" rows="2">' + U.esc(i.rekomendasi) + '</textarea>' : '<div class="rk">' + U.esc(i.rekomendasi) + '</div>') + '</div><div class="field" style="margin:0"><label>Catatan</label><textarea data-k="catatan" rows="2" placeholder="Tambahkan catatan tindak lanjut…">' + U.esc(i.catatan || '') + '</textarea></div></div>' +
            '<div class="row">' + (penilai ? '<select data-k="status" style="width:auto" aria-label="Status">' + STATUS.map(function (s) { return '<option value="' + s[0] + '"' + (i.status === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select><input data-k="pic" placeholder="Penanggung jawab" value="' + U.esc(i.pic || '') + '" style="max-width:220px">' : '<span class="badge">' + U.esc((STATUS.filter(function (s) { return s[0] === i.status; })[0] || [0, i.status])[1]) + '</span>') + '<span class="grow muted" style="font-size:12px">' + (i.diubahOleh ? 'Diubah oleh ' + U.esc(i.diubahOleh) : '') + '</span>' + (penilai && i.rekomendasi !== i.rekomendasiBawaan ? '<button class="btn sm ghost" data-a="reset" title="Kembalikan rekomendasi bawaan">' + U.ik('undo', 14) + ' Bawaan</button>' : '') + '<button class="btn sm" data-a="simpan">Simpan</button></div></div>'; }).join('') +
          (a.length > st.maks ? '<div class="center"><button class="btn sec" id="isuLagi">Tampilkan lebih banyak (' + (a.length - st.maks) + ' lagi)</button></div>' : '');
        var lg = $('#isuLagi', daftar); if (lg) lg.onclick = function () { st.maks += 30; tampil(); };
      }
      bar.addEventListener('input', U.debounce(function (e) { var f = e.target.dataset.f; if (!f) return; st[f] = e.target.value; st.maks = 30; tampil(); }, 200));
      daftar.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-a]'); if (!b) return; var kar = b.closest('.isu'), i = isu[+kar.dataset.i];
        if (b.dataset.a === 'reset') { kar.querySelector('[data-k=rekomendasi]').value = i.rekomendasiBawaan; return; }
        var d = { id: i.id }; U.$$('[data-k]', kar).forEach(function (el) { d[el.dataset.k] = el.value; });
        b.disabled = true; API.d('isu.simpan', d).then(function () { Object.keys(d).forEach(function (k) { if (k !== 'id') i[k] = d[k]; }); i.diubahOleh = APP.S.me.username; U.toast('Isu disimpan.', 'ok'); b.disabled = false; }).catch(function (x) { U.toast(x.message, 'err'); b.disabled = false; });
      });
      tampil();
    } });
  };

  /* ============ UNGGAH EXCEL ============ */
  V.unggah = function (host) {
    host.innerHTML = '<div class="head"><div><h1>Unggah Excel</h1><p>Satu berkas per hari. Data pada periode yang sama ditimpa dengan aman, dan bisa dikembalikan.</p></div></div><div class="steps" id="uSteps"></div><div id="uStep"></div><div class="panel c2e" style="margin-top:16px"><div class="card"><h3>Status data tersimpan</h3><div id="uStatus"></div></div><div class="card"><h3>Riwayat unggahan</h3><div id="uBatch"></div></div></div>';
    var st = { items: [], dry: [], langkah: 1 };
    function langkah(n) { st.langkah = n; $('#uSteps').innerHTML = ['Pilih berkas', 'Periksa', 'Unggah', 'Selesai'].map(function (t, i) { return '<div class="s ' + (i + 1 === n ? 'on' : i + 1 < n ? 'done' : '') + '">' + (i + 1 < n ? '✓ ' : (i + 1) + '. ') + t + '</div>'; }).join(''); }
    function muatSamping() {
      APP.muatStatus().then(function (s) { var reg = s.registri.slice().sort(function (a, b) { return (b.periode + b.dataset) < (a.periode + a.dataset) ? -1 : 1; }); if (!document.body.contains($('#uStatus'))) return; UI.tabel($('#uStatus'), [{ k: 'dataset', l: 'Jenis' }, { k: 'periode', l: 'Periode' }, { k: 'baris', l: 'Baris', num: 1 }, { k: 'tglMaks', l: 'Terakhir', f: function (v) { return v ? U.tglID(v, true) : '–'; } }, { k: 'diperbarui', l: 'Diperbarui', f: function (v) { return U.waktuID(v); } }], reg, { ukuran: 8 }); }).catch(function (e) { UI.galat($('#uStatus'), e); });
      API.d('batch.daftar').then(function (b) { if (!document.body.contains($('#uBatch'))) return; UI.tabel($('#uBatch'), [{ k: 'waktu', l: 'Waktu', f: function (v) { return U.waktuID(v); } }, { k: 'oleh', l: 'Oleh' }, { k: 'ringkas', l: 'Isi', f: function (v) { return '<span title="' + U.esc(v) + '">' + U.esc(String(v).slice(0, 48)) + (String(v).length > 48 ? '…' : '') + '</span>'; } }, { k: 'status', l: 'Status', f: function (v) { return '<span class="badge ' + (v === 'selesai' ? 'ok' : v === 'dikembalikan' ? 'warn' : 'info') + '">' + U.esc(v) + '</span>'; } }, { k: 'bisaKembali', l: '', f: function (v, r) { return v && APP.role() === 'superadmin' ? '<button class="btn sm ghost" data-kb="' + U.esc(r.batch) + '">' + U.ik('undo', 14) + ' Kembalikan</button>' : ''; } }], b, { ukuran: 8, cari: false, setelah: function (h) { U.$$('[data-kb]', h).forEach(function (x) { x.onclick = function () { kembalikan(x.dataset.kb); }; }); } }); }).catch(function (e) { UI.galat($('#uBatch'), e); });
    }
    function kembalikan(batch) {
      U.prompt('Kembalikan batch ' + batch, 'Masukkan kata sandi Anda untuk konfirmasi', { type: 'password', ok: 'Kembalikan' }).then(function (sandi) { if (!sandi) return;
        API.call('batch.kembalikan', { batch: batch, sandi: sandi }).then(function (j) { U.toast(j.msg, 'ok'); APP.invalidasi(); muatSamping(); }).catch(function (e) { U.toast(e.message, 'err'); }); });
    }
    function pilih() {
      langkah(1);
      $('#uStep').innerHTML = '<div class="card"><label class="drop" id="uDrop" for="uFile" tabindex="0"><div>' + U.ik('upload', 44) + '</div><h3 style="margin:8px 0 4px">Tarik berkas Excel ke sini atau klik untuk memilih</h3><p class="muted" style="margin:0">Mendukung .xlsx / .xlsm / .xls · boleh beberapa berkas sekaligus (Absensi, Rekap Analisa, Upkeep, Data Grade)</p><input id="uFile" type="file" class="sr" multiple accept=".xlsx,.xlsm,.xls"></label><div id="uMsg" class="muted" style="margin-top:12px"></div></div>';
      var drop = $('#uDrop'), inp = $('#uFile');
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
      drop.addEventListener('drop', function (e) { proses(Array.prototype.slice.call(e.dataTransfer.files)); }); inp.addEventListener('change', function () { proses(Array.prototype.slice.call(inp.files)); });
      drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
    }
    function proses(files) {
      if (!files.length) return; var msg = $('#uMsg'), hasil = [], seri = Promise.resolve();
      files.forEach(function (f) { seri = seri.then(function () { msg.textContent = 'Membaca ' + f.name + '…'; return XL.bacaBerkas(f).then(function (h) { hasil.push(h); }); }); });
      seri.then(function () { var g = XL.gabung(hasil); if (!g.items.length) throw new Error('Tidak ada sheet yang dikenali. Pastikan berkas adalah Absensi / Rekap Analisa / Upkeep / Data Grade.'); st.items = g.items; st.lewat = g.dilewati; msg.textContent = 'Memeriksa perbedaan dengan data tersimpan…'; return XL.dryrun(g.items); })
        .then(function (dry) { st.dry = dry; periksa(); }).catch(function (e) { msg.innerHTML = '<span style="color:var(--bad)">' + U.esc(e.message) + '</span>'; });
    }
    function periksa() {
      langkah(2); var rows = st.items.map(function (it, i) { var d = st.dry[i] || {}; return { idx: i, dataset: it.dataset, periode: it.periode, label: it.label, berkas: it.berkas, fakta: it.jmlFakta, kolom: it.jmlKolom, status: d.status, nBeda: (d.tglBerubah || []).length, nKunci: (d.tglTerkunci || []).length, kolomBaru: d.kolomBaru || [], boleh: d.bolehLanjut, alasan: d.alasan, pengajuan: d.perluPengajuan, pilih: d.bolehLanjut && d.status !== 'sama' }; });
      var h = $('#uStep'); h.innerHTML = '<div class="card"><h3>Periksa sebelum diunggah</h3>' + (st.lewat && st.lewat.length ? '<div class="badge warn" style="display:block;border-radius:10px;padding:8px 12px;margin-bottom:10px;white-space:normal">Dilewati: ' + st.lewat.map(function (l) { return U.esc(l.berkas + ' › ' + l.sheet + ' (' + l.alasan + ')'); }).join('; ') + '</div>' : '') + '<div class="tw card flush"><table class="t"><thead><tr><th></th><th>Jenis</th><th>Periode</th><th>Sheet / berkas</th><th class="num">Baris</th><th class="num">Kolom</th><th>Status</th><th>Perubahan</th><th>Keterangan</th></tr></thead><tbody>' + rows.map(function (r) {
        return '<tr><td><input type="checkbox" data-c="' + r.idx + '" ' + (r.pilih ? 'checked' : '') + (r.boleh && r.status !== 'sama' ? '' : ' disabled') + ' aria-label="Sertakan"></td><td><b>' + U.esc(r.dataset) + '</b></td><td>' + U.esc(r.periode) + '</td><td>' + U.esc(r.label) + '<div class="muted" style="font-size:11px">' + U.esc(r.berkas || '') + '</div></td><td class="num">' + U.nf(r.fakta) + '</td><td class="num">' + U.nf(r.kolom) + '</td><td><span class="badge ' + (r.status === 'baru' ? 'ok' : r.status === 'sama' ? '' : 'warn') + '">' + (r.status === 'baru' ? 'Baru' : r.status === 'sama' ? 'Sama (dilewati)' : 'Timpa') + '</span></td><td>' + (r.nBeda ? U.nf(r.nBeda) + ' tanggal berubah' : '–') + (r.nKunci ? '<br><span style="color:var(--bad)">' + r.nKunci + ' tanggal terkunci</span>' : '') + '</td><td>' + (r.kolomBaru.length ? '<span class="badge info">Kolom baru: ' + U.esc(r.kolomBaru.slice(0, 3).join(', ')) + (r.kolomBaru.length > 3 ? '…' : '') + '</span> ' : '') + (r.alasan ? '<span style="color:var(--bad)">' + U.esc(r.alasan) + '</span> ' : '') + (r.pengajuan ? '<button class="btn sm sec" data-aju="' + r.idx + '">Ajukan persetujuan</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div><div class="acts" style="margin-top:14px"><button class="btn ghost" id="uBatal">Batal</button><button class="btn" id="uMulai">Mulai unggah</button></div></div>';
      function hitungPilih() { var n = U.$$('[data-c]:checked', h).length; $('#uMulai').disabled = !n; $('#uMulai').textContent = 'Mulai unggah (' + n + ' sheet)'; }
      h.onchange = hitungPilih; hitungPilih();
      $('#uBatal').onclick = pilih;
      U.$$('[data-aju]', h).forEach(function (b) { b.onclick = function () { var r = rows[+b.dataset.aju]; U.prompt('Ajukan persetujuan Superadmin', 'Alasan perubahan data lama (' + r.dataset + ' ' + r.periode + ')', { area: true, ok: 'Kirim pengajuan' }).then(function (al) { if (!al) return; API.call('pengajuan.buat', { dataset: r.dataset, periode: r.periode, alasan: al }).then(function (j) { U.toast(j.msg, 'ok'); }).catch(function (e) { U.toast(e.message, 'err'); }); }); }; });
      $('#uMulai').onclick = function () { var boleh = U.$$('[data-c]:checked', h).map(function (c) { return +c.dataset.c; }); kirim(boleh); };
    }
    function kirim(boleh) {
      langkah(3); $('#uStep').innerHTML = '<div class="card"><h3>Mengunggah…</h3><div class="prog"><i id="uBar" style="width:2%"></i></div><p class="muted" id="uTeks">Menyiapkan…</p><p class="muted" style="font-size:12px">Jangan tutup halaman ini sampai selesai.</p></div>';
      var berkas = Object.keys(st.items.reduce(function (a, i) { a[i.berkas] = 1; return a; }, {})).join(', ');
      XL.kirim(st.items, boleh, berkas, function (p, t) { $('#uBar').style.width = p + '%'; $('#uTeks').textContent = t + ' (' + p + '%)'; }).then(function (j) {
        langkah(4); APP.invalidasi(); APP.S.per = null; $('#uStep').innerHTML = '<div class="card center">' + U.ik('check', 56) + '<h2 style="color:var(--ok)">Unggah selesai</h2><p>' + U.esc(j.msg) + '</p><div class="row" style="justify-content:center"><button class="btn" id="uLagi">Unggah berkas lain</button><a class="btn sec" href="#/dashboard">Buka dashboard</a></div></div>'; $('#uLagi').onclick = pilih; muatSamping();
      }).catch(function (e) { langkah(2); $('#uStep').innerHTML = '<div class="card">' + UI.kosong('Unggah gagal', e.message + ' Data lama tidak berubah; Anda dapat mengulang.', 'alert') + '<div class="center"><button class="btn" id="uUlang">Kembali</button></div></div>'; $('#uUlang').onclick = pilih; });
    }
    pilih(); muatSamping();
  };

  /* ============ INPUT MANUAL ============ */
  var KODE_PILIH = ['K', 'KL', 'M', 'C', 'S1', 'H1', 'H2', 'P1', 'P3', 'P4', 'HB', 'MG', 'OUT'];
  function aksiAjukan(err, dataset, periode) {
    if (err && err.data && err.data.perluPengajuan) { U.konfirmasi('Tanggal terkunci', err.message + ' Ajukan sekarang?', 'Ajukan').then(function (ok) { if (!ok) return; U.prompt('Alasan pengajuan', 'Jelaskan mengapa data ' + dataset + ' ' + periode + ' perlu diubah', { area: true, ok: 'Kirim' }).then(function (al) { if (!al) return; API.call('pengajuan.buat', { dataset: dataset, periode: periode, alasan: al }).then(function (j) { U.toast(j.msg, 'ok'); }).catch(function (e) { U.toast(e.message, 'err'); }); }); }); }
    else U.toast(err.message, 'err');
  }
  function pencari(host, dataset, getPeriode, onPilih) {
    host.innerHTML = '<div class="field"><label>Cari ' + (dataset === 'ABS' ? 'karyawan' : 'mandor') + '</label><input type="search" id="mCari" placeholder="Ketik minimal 2 huruf…" autocomplete="off"></div><div id="mHasil" class="row" style="gap:6px;margin-bottom:8px"></div>';
    var inp = $('#mCari', host), hasil = $('#mHasil', host);
    inp.addEventListener('input', U.debounce(function () { var q = inp.value.trim(); if (q.length < 2) { hasil.innerHTML = ''; return; } API.d('manual.orang', { dataset: dataset, periode: getPeriode(), q: q }).then(function (a) { hasil.innerHTML = a.length ? a.map(function (o, i) { return '<button type="button" class="btn sm ghost" data-i="' + i + '">' + U.esc(o.label) + ' <small class="muted">' + U.esc(o.info || '') + '</small></button>'; }).join('') : '<span class="muted">Tidak ditemukan.</span>'; hasil._a = a; }).catch(function (e) { hasil.innerHTML = '<span style="color:var(--bad)">' + U.esc(e.message) + '</span>'; }); }, 300));
    hasil.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) { onPilih(hasil._a[+b.dataset.i]); hasil.innerHTML = '<span class="badge ok">Dipilih: ' + U.esc(hasil._a[+b.dataset.i].label) + '</span>'; } });
  }
  V.manual = function (host) {
    host.innerHTML = '<div class="head"><div><h1>Input Manual</h1><p>Koreksi data, timbangan pabrik, dan katalog blok. Setiap perubahan tercatat di Riwayat.</p></div></div>';
    var isi = document.createElement('div'); host.appendChild(isi);
    APP.muatStatus().catch(function () {}).then(function () { APP.tab(isi, [
      ['abs', 'Koreksi Absensi', tabAbs], ['prod', 'Koreksi Produksi', tabProd], ['timb', 'Timbangan (D9)', tabTimb], ['blok', 'Katalog Blok (D10)', tabBlok], ['riw', 'Riwayat Koreksi', tabRiw], ['aju', 'Pengajuan', tabAju]]); });
  };
  function tabAbs(h) {
    var per = perOpsi('ABS'); if (!per.length) { h.innerHTML = '<div class="card">' + UI.kosong('Belum ada data absensi', 'Unggah Excel absensi terlebih dahulu.', 'upload') + '</div>'; return; }
    h.innerHTML = '<div class="card"><div class="grid2"><div><div class="field"><label>Periode (bulan)</label><select id="mPer">' + per.map(function (p) { return '<option>' + p + '</option>'; }).join('') + '</select></div><div id="mPencari"></div><div id="mKartu"></div></div><div><div class="field"><label>Tanggal</label><select id="mTgl" disabled></select></div><div class="field"><label>Kode baru</label><select id="mKode">' + KODE_PILIH.map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select></div><div class="field"><label>Alasan koreksi *</label><textarea id="mAlasan" rows="3" placeholder="Contoh: salah input absen, surat dokter menyusul"></textarea></div><button class="btn" id="mSimpan" disabled>Simpan koreksi</button></div></div></div>';
    var pilih = null, perEl = $('#mPer', h);
    function kartu() { var k = $('#mKartu', h); if (!pilih) { k.innerHTML = ''; return; } var hari = pilih.hari || []; k.innerHTML = '<div class="muted" style="font-size:12px;margin-bottom:6px">Klik tanggal untuk memilih. Kode saat ini:</div><div class="row" style="gap:4px">' + hari.map(function (c, i) { return '<button type="button" class="btn sm ghost" data-d="' + (i + 1) + '" style="height:auto;padding:2px 6px;flex-direction:column;gap:0"><small>' + (i + 1) + '</small>' + (c ? U.kodeBadge(c) : '–') + '</button>'; }).join('') + '</div>'; }
    function isiTgl() { var s = $('#mTgl', h), n = new Date(+perEl.value.slice(0, 4), +perEl.value.slice(5, 7), 0).getDate(), o = ''; for (var d = 1; d <= n; d++) o += '<option value="' + d + '">' + d + ' ' + U.BLN[+perEl.value.slice(5, 7) - 1] + '</option>'; s.innerHTML = o; s.disabled = !pilih; $('#mSimpan', h).disabled = !pilih; }
    pencari($('#mPencari', h), 'ABS', function () { return perEl.value; }, function (o) { pilih = o; kartu(); isiTgl(); });
    perEl.onchange = function () { pilih = null; kartu(); isiTgl(); $('#mPencari input', h).value = ''; $('#mHasil', h).innerHTML = ''; }; isiTgl();
    $('#mKartu', h).addEventListener('click', function (e) { var b = e.target.closest('[data-d]'); if (b) { $('#mTgl', h).value = b.dataset.d; $('#mKode', h).value = (pilih.hari[+b.dataset.d - 1] || 'K'); } });
    $('#mSimpan', h).onclick = function () { var b = this, d = +$('#mTgl', h).value, tgl = perEl.value + '-' + U.pad(d), alasan = $('#mAlasan', h).value.trim(); if (!alasan) { U.toast('Alasan koreksi wajib diisi.', 'warn'); return; } b.disabled = true;
      API.call('manual.simpan', { dataset: 'ABS', periode: perEl.value, tgl: tgl, kunci: pilih.kunci, nilai: $('#mKode', h).value, alasan: alasan }).then(function (j) { U.toast(j.msg, 'ok'); pilih.hari[d - 1] = $('#mKode', h).value; kartu(); APP.invalidasi(); $('#mAlasan', h).value = ''; b.disabled = false; }).catch(function (e) { b.disabled = false; aksiAjukan(e, 'ABS', perEl.value); }); };
  }
  function tabProd(h) {
    h.innerHTML = '<div class="card"><div class="grid2"><div><div class="grid2"><div class="field"><label>Jenis data</label><select id="pDs"><option value="REK">Rekap analisa (REK)</option><option value="GRD">Data grade TK (GRD)</option></select></div><div class="field"><label>Periode</label><select id="pPer"></select></div></div><div id="pPencari"></div></div><div><div class="grid2"><div class="field"><label>Tanggal</label><input type="date" id="pTgl"></div><div class="field"><label>Kolom</label><select id="pMedan"></select></div></div><div class="field"><label>Nilai baru (kg / angka)</label><input type="number" id="pNilai" min="0" step="any"></div><div class="field"><label>Alasan koreksi *</label><textarea id="pAlasan" rows="2"></textarea></div><button class="btn" id="pSimpan" disabled>Simpan koreksi</button></div></div></div>';
    var pilih = null, ds = $('#pDs', h), per = $('#pPer', h), tgl = $('#pTgl', h), medan = $('#pMedan', h);
    function isiPer() { var p = perOpsi(ds.value); per.innerHTML = p.length ? p.map(function (x) { return '<option>' + x + '</option>'; }).join('') : '<option value="">(belum ada data)</option>'; medan.innerHTML = (ds.value === 'REK' ? [['g1', 'Grade I'], ['g2', 'Grade II'], ['g3', 'Grade III']] : [['g1', 'Grade I'], ['g2', 'Grade II'], ['g3', 'Grade III'], ['tkHarvest', 'TK Harvest'], ['absensi', 'Absensi']]).map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join(''); atur(); }
    function atur() { if (per.value) { tgl.min = per.value + '-01'; tgl.max = U.bulanAkhir(per.value); if (!tgl.value || tgl.value.slice(0, 7) !== per.value) tgl.value = tgl.max; } pilih = null; $('#pSimpan', h).disabled = true; $('#pPencari input', h) && ($('#pPencari input', h).value = ''); $('#pHasil', h) && ($('#pHasil', h).innerHTML = ''); }
    pencari($('#pPencari', h), 'REK', function () { return per.value; }, function (o) { pilih = o; $('#pSimpan', h).disabled = false; });
    ds.onchange = isiPer; per.onchange = atur; isiPer();
    $('#pSimpan', h).onclick = function () { var b = this, alasan = $('#pAlasan', h).value.trim(), nilai = $('#pNilai', h).value; if (!tgl.value || nilai === '' || !alasan) { U.toast('Tanggal, nilai, dan alasan wajib diisi.', 'warn'); return; } b.disabled = true;
      API.call('manual.simpan', { dataset: ds.value, periode: per.value, tgl: tgl.value, kunci: pilih.kunci, medan: medan.value, nilai: nilai, alasan: alasan }).then(function (j) { U.toast(j.msg, 'ok'); APP.invalidasi(); $('#pAlasan', h).value = ''; $('#pNilai', h).value = ''; b.disabled = false; }).catch(function (e) { b.disabled = false; aksiAjukan(e, ds.value, per.value); }); };
  }
  function crudTab(h, o) { // o: {judul, daftar, simpan, hapus, kolom[], field[]}
    h.innerHTML = '<div class="panel c2"><div class="card"><h3>' + o.judul + '</h3><div id="cT"></div></div><div class="card"><h3 id="cJ">Tambah data</h3><form id="cF" autocomplete="off">' + o.field.map(function (f) { return '<div class="field"><label>' + f.l + (f.wajib ? ' *' : '') + '</label><input name="' + f.k + '" type="' + (f.t || 'text') + '"' + (f.step ? ' step="' + f.step + '"' : '') + (f.t === 'number' ? ' min="0"' : '') + '></div>'; }).join('') + '<div class="row"><button class="btn" type="submit">Simpan</button><button class="btn ghost" type="button" id="cBatal">Baru</button></div></form></div></div>';
    var tbl, edit = null, form = $('#cF', h);
    function muat() { API.d(o.daftar).then(function (a) { var t = UI.tabel($('#cT', h), o.kolom.concat([{ k: 'id', l: '', f: function (v) { return '<button class="btn sm ghost" data-e="' + U.esc(v) + '">Ubah</button> <button class="btn sm ghost" data-h="' + U.esc(v) + '" style="color:var(--bad)">Hapus</button>'; } }]), a, { ukuran: 10, setelah: function (x) { U.$$('[data-e]', x).forEach(function (b) { b.onclick = function () { edit = a.filter(function (r) { return r.id === b.dataset.e; })[0]; o.field.forEach(function (f) { form.elements[f.k].value = edit[f.k] === undefined ? '' : edit[f.k]; }); $('#cJ', h).textContent = 'Ubah data'; }; }); U.$$('[data-h]', x).forEach(function (b) { b.onclick = function () { U.konfirmasi('Hapus data?', 'Data ini akan dihapus permanen (tercatat di riwayat).', 'Hapus', true).then(function (ok) { if (ok) API.call(o.hapus, { id: b.dataset.h }).then(function (j) { U.toast(j.msg, 'ok'); APP.invalidasi(); muat(); }).catch(function (e) { U.toast(e.message, 'err'); }); }); }; }); } }); }).catch(function (e) { UI.galat($('#cT', h), e, muat); }); }
    function reset() { edit = null; form.reset(); $('#cJ', h).textContent = 'Tambah data'; }
    $('#cBatal', h).onclick = reset;
    form.onsubmit = function (e) { e.preventDefault(); var d = edit ? { id: edit.id } : {}; o.field.forEach(function (f) { d[f.k] = form.elements[f.k].value; }); for (var i = 0; i < o.field.length; i++) if (o.field[i].wajib && !String(d[o.field[i].k]).trim()) { U.toast(o.field[i].l + ' wajib diisi.', 'warn'); return; }
      API.call(o.simpan, d).then(function (j) { U.toast(j.msg, 'ok'); APP.invalidasi(); reset(); muat(); }).catch(function (x) { U.toast(x.message, 'err'); }); };
    muat();
  }
  function tabTimb(h) {
    crudTab(h, { judul: 'Timbangan kebun vs pabrik', daftar: 'timbangan.daftar', simpan: 'timbangan.simpan', hapus: 'timbangan.hapus',
      kolom: [{ k: 'tgl', l: 'Tanggal', f: function (v) { return U.tglID(v, true); } }, { k: 'slip', l: 'Slip' }, { k: 'divisi', l: 'Divisi' }, { k: 'kgKebun', l: 'Kebun (kg)', num: 1 }, { k: 'kgPabrik', l: 'Pabrik (kg)', num: 1 }, { k: 'selisih', l: 'Selisih', f: function (v, r) { var s = r.kgKebun > 0 ? (r.kgKebun - r.kgPabrik) / r.kgKebun * 100 : 0; return '<span class="badge ' + (Math.abs(s) > 3 ? 'bad' : Math.abs(s) > 1 ? 'warn' : 'ok') + '">' + U.pct(s, 2) + '</span>'; } }, { k: 'tujuan', l: 'Tujuan' }],
      field: [{ k: 'tgl', l: 'Tanggal', t: 'date', wajib: 1 }, { k: 'slip', l: 'No. slip / surat jalan', wajib: 1 }, { k: 'divisi', l: 'Divisi' }, { k: 'kgKebun', l: 'Berat kebun (kg)', t: 'number', step: 'any', wajib: 1 }, { k: 'kgPabrik', l: 'Berat pabrik (kg)', t: 'number', step: 'any', wajib: 1 }, { k: 'tujuan', l: 'Tujuan / pabrik' }, { k: 'catatan', l: 'Catatan' }] });
  }
  function tabBlok(h) {
    crudTab(h, { judul: 'Katalog blok', daftar: 'blok.daftar', simpan: 'blok.simpan', hapus: 'blok.hapus',
      kolom: [{ k: 'divisi', l: 'Divisi' }, { k: 'sub', l: 'Sub' }, { k: 'blok', l: 'Blok' }, { k: 'luasHa', l: 'Luas (ha)', num: 1, d: 2 }, { k: 'tahunTanam', l: 'Tahun tanam' }, { k: 'mandor', l: 'Mandor' }],
      field: [{ k: 'divisi', l: 'Divisi', wajib: 1 }, { k: 'sub', l: 'Sub wilayah' }, { k: 'blok', l: 'Nama blok', wajib: 1 }, { k: 'luasHa', l: 'Luas (ha)', t: 'number', step: 'any' }, { k: 'tahunTanam', l: 'Tahun tanam', t: 'number' }, { k: 'mandor', l: 'Mandor' }, { k: 'catatan', l: 'Catatan' }] });
  }
  function tabRiw(h) {
    h.innerHTML = '<div class="card"><div id="rT"></div></div>';
    function muat() { API.d('manual.daftar', {}).then(function (a) { UI.tabel($('#rT', h), [{ k: 'waktu', l: 'Waktu', f: function (v) { return U.waktuID(v); } }, { k: 'dataset', l: 'Jenis' }, { k: 'periode', l: 'Periode' }, { k: 'tgl', l: 'Tanggal', f: function (v) { return U.tglID(v, true); } }, { k: 'kunci', l: 'Karyawan / mandor', f: function (v) { return U.esc(String(v).split('|')[0]); } }, { k: 'medan', l: 'Kolom' }, { k: 'nilai', l: 'Nilai' }, { k: 'alasan', l: 'Alasan' }, { k: 'oleh', l: 'Oleh' }, { k: 'aktif', l: 'Status', f: function (v, r) { return v === 'ya' ? '<button class="btn sm ghost" data-b="' + U.esc(r.id) + '" data-ds="' + r.dataset + '" data-pr="' + r.periode + '">Batalkan</button>' : '<span class="badge">dibatalkan</span>'; } }], a, { ukuran: 10, setelah: function (x) { U.$$('[data-b]', x).forEach(function (b) { b.onclick = function () { U.konfirmasi('Batalkan koreksi?', 'Nilai kembali mengikuti data Excel.', 'Batalkan koreksi').then(function (ok) { if (ok) API.call('manual.batal', { id: b.dataset.b }).then(function (j) { U.toast(j.msg, 'ok'); APP.invalidasi(); muat(); }).catch(function (e) { aksiAjukan(e, b.dataset.ds, b.dataset.pr); }); }); }; }); } }); }).catch(function (e) { UI.galat($('#rT', h), e, muat); }); }
    muat();
  }
  function tabAju(h) {
    var sa = APP.role() === 'superadmin';
    h.innerHTML = (sa ? '' : '<div class="card" style="margin-bottom:14px"><h3>Ajukan pembukaan kunci</h3><p class="muted">Data yang lebih lama dari batas kunci hanya bisa diubah setelah Superadmin menyetujui. Persetujuan berlaku ' + ((APP.S.boot && APP.S.boot.kunciJam) || 24) + ' jam.</p><div class="grid3"><div class="field"><label>Jenis data</label><select id="jDs">' + ['ABS', 'REK', 'UPK', 'GRD'].map(function (d) { return '<option>' + d + '</option>'; }).join('') + '</select></div><div class="field"><label>Periode</label><select id="jPer"></select></div><div class="field"><label>Alasan *</label><input id="jAl"></div></div><button class="btn" id="jKirim">Kirim pengajuan</button></div>') + '<div class="card"><h3>Daftar pengajuan</h3><div id="jT"></div></div>';
    if (!sa) { var ds = $('#jDs', h), pr = $('#jPer', h), isi = function () { pr.innerHTML = perOpsi(ds.value).map(function (p) { return '<option>' + p + '</option>'; }).join(''); }; ds.onchange = isi; isi(); $('#jKirim', h).onclick = function () { var al = $('#jAl', h).value.trim(); if (!pr.value || !al) { U.toast('Periode dan alasan wajib diisi.', 'warn'); return; } API.call('pengajuan.buat', { dataset: ds.value, periode: pr.value, alasan: al }).then(function (j) { U.toast(j.msg, 'ok'); $('#jAl', h).value = ''; muat(); }).catch(function (e) { U.toast(e.message, 'err'); }); }; }
    function muat() { APP.pengajuanTabel($('#jT', h), muat); }
    muat();
  }
  APP.pengajuanTabel = function (host, ulang) {
    var sa = APP.role() === 'superadmin';
    API.d('pengajuan.daftar').then(function (a) { UI.tabel(host, [{ k: 'diajukan', l: 'Diajukan', f: function (v) { return U.waktuID(v); } }, { k: 'pengaju', l: 'Pengaju' }, { k: 'dataset', l: 'Jenis' }, { k: 'periode', l: 'Periode' }, { k: 'alasan', l: 'Alasan' }, { k: 'status', l: 'Status', f: function (v, r) { return '<span class="badge ' + (v === 'disetujui' ? 'ok' : v === 'ditolak' ? 'bad' : 'warn') + '">' + U.esc(v) + '</span>' + (v === 'disetujui' && r.bukaSampai ? '<div class="muted" style="font-size:11px">buka s.d. ' + U.waktuID(r.bukaSampai) + '</div>' : ''); } }, { k: 'id', l: '', f: function (v, r) { return sa && r.status === 'menunggu' ? '<button class="btn sm" data-y="' + v + '">Setujui</button> <button class="btn sm ghost" data-n="' + v + '" style="color:var(--bad)">Tolak</button>' : ''; } }], a, { ukuran: 10, setelah: function (x) { var putus = function (id, setuju) { U.prompt(setuju ? 'Setujui pengajuan' : 'Tolak pengajuan', 'Catatan (opsional)', { ok: setuju ? 'Setujui' : 'Tolak' }).then(function (c) { if (c === null) return; API.call('pengajuan.putus', { id: id, setuju: setuju, catatan: c }).then(function (j) { U.toast(j.msg, 'ok'); ulang(); }).catch(function (e) { U.toast(e.message, 'err'); }); }); }; U.$$('[data-y]', x).forEach(function (b) { b.onclick = function () { putus(b.dataset.y, true); }; }); U.$$('[data-n]', x).forEach(function (b) { b.onclick = function () { putus(b.dataset.n, false); }; }); } }); }).catch(function (e) { UI.galat(host, e, ulang); });
  };
})(window);
