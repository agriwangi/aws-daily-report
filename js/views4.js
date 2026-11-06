/* AWS Daily Report v1.0.15 — halaman: Presentasi (slide otomatis dari data, analisis & rekomendasi real-time) */
(function (w) {
  'use strict';
  var V = APP.V, $ = U.$, esc = U.esc;
  var POS = { idx: 0, otomatis: false };
  var KLS = { Tinggi: 'bad', Sedang: 'warn', Rendah: 'ok' };

  function ul(a, kosong) { return a && a.length ? '<ul>' + a.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(kosong || 'Tidak ada.') + '</p>'; }
  function badgeStatus(st) { return st ? '<span class="badge ' + st[1] + '">' + esc(st[0]) + '</span>' : ''; }

  /* ---------- HTML satu slide ---------- */
  function htmlSlide(s, n, i) {
    if (s.tipe === 'cover') {
      return '<div class="pr-cover"><div class="pr-plate"><img src="' + esc(APP.LOGO) + '" alt="Agri Wangi Sentosa"></div><h1>' + esc(s.judul) + '</h1><p class="pr-sub">' + esc(s.sub) + '</p><div class="pr-per">' + esc(s.catatan) + '</div><div class="pr-note">' + esc(s.catatan2) + '</div></div>';
    }
    var h = '<div class="pr-hd"><div><span class="pr-tag">' + esc(s.bidang || '') + '</span><h2>' + esc(s.judul) + '</h2>' + (s.sub ? '<p class="muted">' + esc(s.sub) + '</p>' : '') + '</div>' + (s.status1 ? '<div class="pr-st1">Penilaian bidang: ' + badgeStatus(s.status1) + '</div>' : '') + '<span class="pr-no">' + (i + 1) + ' / ' + n + '</span></div>';
    h += '<div class="pr-bd">';
    if (s.peringatan) h += '<div class="pr-warn">⚠ ' + esc(s.peringatan) + '</div>';
    if (s.status) h += '<div class="pr-stat">' + s.status.map(function (b) { return '<div class="pr-sc ' + b.kls + '"><div class="pr-sn">' + esc(b.n) + '</div><div class="pr-sv">' + esc(b.v) + '</div><div class="pr-ss">' + esc(b.s) + '</div><span class="badge ' + b.kls + '">' + esc(b.label) + '</span></div>'; }).join('') + '</div>';
    if (s.kpi) h += UI.kpi(s.kpi);
    if (s.charts) h += '<div class="pr-charts">' + s.charts.map(function (c, j) { return '<div class="card pr-cc"><h4>' + esc(c.judul) + '</h4><div class="pr-ch" data-c="' + j + '"></div></div>'; }).join('') + '</div>';
    if (s.tabel) h += '<div class="card pr-tb">' + (s.tabel.judul ? '<h4>' + esc(s.tabel.judul) + '</h4>' : '') + '<div class="tw"><table class="t"><thead><tr>' + s.tabel.kepala.map(function (k, j) { return '<th' + (j > 0 && /^[\d.,%\-−+ ]+(kg)?$/.test(String((s.tabel.baris[0] || [])[j] || '')) ? ' class="num"' : '') + '>' + esc(k) + '</th>'; }).join('') + '</tr></thead><tbody>' + s.tabel.baris.map(function (r) { return '<tr>' + r.map(function (c, j) { return '<td' + (j > 0 && /^[\d.,%\-−+ ]+(kg)?$/.test(String(c)) ? ' class="num"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></div>';
    if (s.narasi && s.narasi.length) h += '<div class="card pr-nar"><h4>' + esc(s.judulNarasi || 'Penjelasan') + '</h4>' + (s.judulNarasi ? ul(s.narasi) : s.narasi.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('')) + '</div>';
    if (s.kol3) {
      var k3 = s.kol3, kol = [];
      if (k3.kel && k3.kel.length) kol.push('<div class="pr-k ok"><h4>✔ Kelebihan</h4>' + ul(k3.kel) + '</div>');
      if (k3.kur && k3.kur.length) kol.push('<div class="pr-k bad"><h4>✖ Kekurangan</h4>' + ul(k3.kur) + '</div>');
      if (k3.rek && k3.rek.length) kol.push('<div class="pr-k info"><h4>➜ Rekomendasi</h4><ul>' + k3.rek.map(function (r) { return '<li><span class="badge ' + KLS[r.p] + '">' + esc(r.p) + '</span> ' + esc(r.t) + '</li>'; }).join('') + '</ul></div>');
      if (!kol.length) kol.push('<div class="pr-k ok"><h4>Hasil</h4><p class="muted">Tidak ada temuan pada bidang ini.</p></div>');
      h += '<div class="pr-k3 n' + kol.length + '">' + kol.join('') + '</div>';
    }
    if (s.kartu) h += '<div class="pr-gag">' + s.kartu.map(function (c) {
      return '<div class="card pr-g"><div class="pr-gh"><span class="badge info">' + esc(c.aturan) + '</span><b>' + esc(c.nama) + '</b><span class="muted">' + c.merah + ' merah · ' + c.kuning + ' kuning</span></div>' +
        '<h5>Bukti data</h5>' + ul(c.bukti) + (c.penyebab.length ? '<h5>Indikasi penyebab</h5>' + ul(c.penyebab) : '') + '<h5>Gagasan / tindakan</h5>' + ul(c.tindakan) + '<div class="pr-tg"><b>Target:</b> ' + esc(c.target) + '</div></div>';
    }).join('') + '</div>';
    if (s.lintas) h += s.lintas.length ? '<div class="pr-ln">' + s.lintas.map(function (l) { return '<div class="card pr-l"><b>' + esc(l.j) + '</b><p class="pr-bk"><span class="muted">Bukti:</span> ' + esc(l.bukti) + '</p><p><span class="pr-gl">Gagasan:</span> ' + esc(l.g) + '</p></div>'; }).join('') + '</div>' : '<div class="card"><p class="muted">Tidak ada pola lintas data yang menonjol pada periode ini.</p></div>';
    return h + '</div>';
  }

  /* ---------- halaman ---------- */
  V.presentasi = function (host) {
    APP.laman(host, { judul: 'Presentasi', desk: 'Slide otomatis dari seluruh data: absensi, produksi, budget vs pencapaian, isu dan gagasan — dianalisis ulang setiap kali halaman dibuka atau disegarkan.', isi: function (body, rep) { bangun(body, rep); } });
  };

  function bangun(body, rep) {
    var deck = AN.susun(rep, { hari: (APP.S.status && APP.S.status.hari) || U.today() }), S = deck.slides, n = S.length, waktu = new Date();
    POS.idx = Math.min(POS.idx, n - 1);
    body.innerHTML = '<div class="pr-bar"><div class="pr-nav"><button class="btn sec" id="prPrev" aria-label="Slide sebelumnya">‹ Sebelumnya</button><span id="prHal" class="pr-hal" aria-live="polite"></span><button class="btn sec" id="prNext" aria-label="Slide berikutnya">Berikutnya ›</button></div>' +
      '<select id="prPilih" aria-label="Loncat ke slide">' + S.map(function (s, i) { return '<option value="' + i + '">' + (i + 1) + '. ' + esc(s.judul) + '</option>'; }).join('') + '</select>' +
      '<span class="sp"></span><span class="muted pr-wkt" id="prWkt"></span>' +
      '<label class="pr-oto"><input type="checkbox" id="prOto"> Segarkan otomatis (2 menit)</label>' +
      '<button class="btn sec" id="prSegar">' + U.ik('refresh', 16) + ' Segarkan data</button><button class="btn sec" id="prFull">⛶ Layar penuh</button><button class="btn" id="prPpt">' + U.ik('download', 16) + ' Unduh PPTX</button></div>' +
      '<div class="pr-stage" id="prStage" tabindex="0" role="region" aria-label="Slide presentasi"></div><div class="pr-dots" id="prDots">' + S.map(function (s, i) { return '<button data-i="' + i + '" aria-label="Slide ' + (i + 1) + '"></button>'; }).join('') + '</div>';
    var stage = $('#prStage', body);
    $('#prWkt', body).textContent = 'Data dimuat ' + waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    function bersihGrafik() { U.$$('.pr-ch', stage).forEach(function (el) { var c = w.echarts && echarts.getInstanceByDom(el); if (c) { try { if (c._ro) c._ro.disconnect(); c.dispose(); } catch (e) {} } }); }
    function tampil(i) {
      i = Math.max(0, Math.min(n - 1, i)); POS.idx = i; bersihGrafik();
      stage.innerHTML = '<div class="pr-slide' + (S[i].tipe === 'cover' ? ' cover' : '') + '">' + htmlSlide(S[i], n, i) + '</div>';
      (S[i].charts || []).forEach(function (c, j) { var el = $('.pr-ch[data-c="' + j + '"]', stage); if (el) { try { CH.render(el, c.jenis, c.spec()); } catch (e) { el.innerHTML = '<p class="muted">Grafik tidak dapat ditampilkan.</p>'; } } });
      $('#prHal', body).textContent = (i + 1) + ' / ' + n; $('#prPrev', body).disabled = i === 0; $('#prNext', body).disabled = i === n - 1; $('#prPilih', body).value = String(i);
      U.$$('#prDots button', body).forEach(function (b, j) { b.classList.toggle('on', j === i); }); stage.scrollTop = 0;
    }
    $('#prPrev', body).addEventListener('click', function () { tampil(POS.idx - 1); });
    $('#prNext', body).addEventListener('click', function () { tampil(POS.idx + 1); });
    $('#prPilih', body).addEventListener('change', function () { tampil(+this.value); });
    $('#prDots', body).addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) tampil(+b.dataset.i); });
    $('#prFull', body).addEventListener('click', function () { var d = document; if (d.fullscreenElement) d.exitFullscreen(); else if (stage.requestFullscreen) stage.requestFullscreen().catch(function () { U.toast('Layar penuh tidak didukung peramban ini.', 'warn'); }); else U.toast('Layar penuh tidak didukung peramban ini.', 'warn'); });
    document.addEventListener('fullscreenchange', function ke() { if (!document.body.contains(stage)) { document.removeEventListener('fullscreenchange', ke); return; } CH.gambarUlang && CH.gambarUlang(); try { U.$$('.pr-ch', stage).forEach(function (el) { var c = echarts.getInstanceByDom(el); if (c) c.resize(); }); } catch (e) {} });
    function tombol(e) {
      if (!document.body.contains(stage)) { document.removeEventListener('keydown', tombol); return; }
      var t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { tampil(POS.idx + 1); e.preventDefault(); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { tampil(POS.idx - 1); e.preventDefault(); }
      else if (e.key === 'Home') { tampil(0); e.preventDefault(); } else if (e.key === 'End') { tampil(n - 1); e.preventDefault(); } else if (e.key === 'f' || e.key === 'F') $('#prFull', body).click();
    }
    document.addEventListener('keydown', tombol);
    var tSwipe = null; stage.addEventListener('touchstart', function (e) { tSwipe = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) { if (tSwipe === null) return; var d = e.changedTouches[0].clientX - tSwipe; tSwipe = null; if (Math.abs(d) > 70) tampil(POS.idx + (d < 0 ? 1 : -1)); }, { passive: true });
    $('#prPpt', body).addEventListener('click', function () {
      var b = this; if (b.disabled) return; b.disabled = true; var asli = b.innerHTML; b.textContent = 'Menyusun PPTX…';
      EX.pptDeck(deck, rep).then(function () { U.toast('Presentasi diunduh.', 'ok'); }).catch(function (e) { U.toast('Gagal menyusun PPTX: ' + (e && e.message || e), 'bad'); }).then(function () { b.disabled = false; b.innerHTML = asli; });
    });
    function segar(diam) {
      var b = $('#prSegar', body); if (b) b.disabled = true;
      return APP.laporan(true).then(function (r) { if (!document.body.contains(stage)) return; bangun(body, r); if (!diam) U.toast('Data disegarkan.', 'ok'); }).catch(function (e) { if (b) b.disabled = false; if (!diam) U.toast('Gagal menyegarkan: ' + (e && e.message || e), 'bad'); });
    }
    $('#prSegar', body).addEventListener('click', function () { segar(false); });
    var oto = $('#prOto', body); oto.checked = POS.otomatis;
    var tm = null; function atur() { clearInterval(tm); if (oto.checked) tm = setInterval(function () { if (!document.body.contains(stage)) { clearInterval(tm); return; } if (!document.hidden) { clearInterval(tm); segar(true); } }, 120000); }
    oto.addEventListener('change', function () { POS.otomatis = oto.checked; atur(); }); atur();
    tampil(POS.idx);
  }
})(window);
