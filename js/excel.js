/* AWS Daily Report v1.0.0 — baca Excel di browser, dry-run, dan unggah bertahap ke backend */
(function (w) {
  'use strict';
  var XL = {};
  XL.bacaBerkas = function (file) {
    return new Promise(function (res, rej) {
      if (!w.XLSX) return rej(new Error('Pustaka Excel belum termuat. Segarkan halaman.'));
      if (!/\.(xlsx|xlsm|xls)$/i.test(file.name)) return rej(new Error('Berkas harus berformat Excel (.xlsx / .xlsm / .xls).'));
      var fr = new FileReader();
      fr.onerror = function () { rej(new Error('Berkas tidak bisa dibaca.')); };
      fr.onload = function () {
        setTimeout(function () { // beri napas agar tampilan sempat menampilkan "membaca…"
          try {
            var wb = XLSX.read(fr.result, { type: 'array', cellDates: false });
            var meta = (wb.Workbook && wb.Workbook.Sheets) || [];
            var sheets = wb.SheetNames.map(function (n, i) {
              return { name: n, hidden: !!(meta[i] && meta[i].Hidden), grid: XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: null }) };
            });
            var plan = AWSX.planWorkbook(sheets, new Date().getFullYear());
            res({ nama: file.name, plan: plan });
          } catch (e) { rej(new Error('Gagal membaca isi Excel: ' + e.message)); }
        }, 30);
      };
      fr.readAsArrayBuffer(file);
    });
  };
  /* gabungkan beberapa berkas: item diberi asal berkas */
  XL.gabung = function (hasil) {
    var items = [], lewat = [];
    hasil.forEach(function (h) { h.plan.items.forEach(function (it) { it.berkas = h.nama; items.push(it); }); (h.plan.dilewati || []).forEach(function (d) { lewat.push({ berkas: h.nama, sheet: d.name || d.sheet || d, alasan: d.alasan || d.reason || '' }); }); });
    return { items: items, dilewati: lewat };
  };
  XL.dryrun = function (items) {
    return API.d('unggah.dryrun', { items: items.map(function (i) { return { dataset: i.dataset, periode: i.periode, label: i.label, sidik: i.sidik, hashHarian: i.hashHarian, labels: i.labels }; }) }).then(function (d) { return d.items; });
  };
  /* kirim: boleh = indeks item yang diunggah. onProg(persen, teks) */
  XL.kirim = function (items, boleh, berkas, onProg) {
    var total = boleh.reduce(function (a, i) { return a + (items[i].fakta ? items[i].fakta.baris.length * items[i].fakta.kolom.length : 0) + items[i].cermin.length * items[i].jmlKolom; }, 0) || 1, selesai = 0;
    var cells = boleh.reduce(function (a, i) { return a + items[i].jmlBarisCermin * items[i].jmlKolom; }, 0);
    var langkah = function (n, teks) { selesai += n; if (onProg) onProg(Math.min(99, Math.round(selesai / total * 100)), teks); };
    return API.d('unggah.mulai', { berkas: berkas, perluSel: cells }).then(function (m) {
      var batch = m.batch, seri = Promise.resolve();
      boleh.forEach(function (idx) {
        var it = items[idx], label = it.dataset + ' ' + it.periode;
        if (it.fakta) {
          var k = Math.max(1, Math.floor(20000 / it.fakta.kolom.length)), pot = U.potong(it.fakta.baris, k);
          pot.forEach(function (b, part) { seri = seri.then(function () { return API.d('unggah.put', { batch: batch, idx: idx, jenis: 'fakta', kolom: part === 0 ? it.fakta.kolom : undefined, baris: b }).then(function () { langkah(b.length * it.fakta.kolom.length, 'Mengirim data ' + label + '…'); }); }); });
        }
        var kc = Math.max(1, Math.floor(30000 / it.jmlKolom)), potC = U.potong(it.cermin, kc);
        potC.forEach(function (b) { seri = seri.then(function () { return API.d('unggah.put', { batch: batch, idx: idx, jenis: 'cermin', baris: b }).then(function () { langkah(b.length * it.jmlKolom, 'Menyalin tampilan Excel ' + label + '…'); }); }); });
      });
      return seri.then(function () {
        if (onProg) onProg(99, 'Menyelesaikan…');
        return API.call('unggah.selesai', { batch: batch, items: boleh.map(function (idx) { var it = items[idx]; return { idx: idx, dataset: it.dataset, periode: it.periode, sidik: it.sidik, jmlFakta: it.jmlFakta, jmlKolom: it.jmlKolom, tglMin: it.tglMin, tglMaks: it.tglMaks, hashHarian: it.hashHarian, labels: it.labels, headBaris: it.headBaris, hariKerja: it.hariKerja, kodeBaru: it.kodeBaru }; }) });
      });
    });
  };
  XL.NAMA_DS = { ABS: 'Absensi karyawan', REK: 'Rekap analisa gabungan', UPK: 'Produksi upkeep', GRD: 'Data grade TK', RESIGN: 'Resign & recruit', PCT_ABS: '% Absensi', PCT_MGK: '% Mangkir', RPETIK: 'Rekap petik', GULMA: 'Gulma', UPK_SUM: 'Ringkasan upkeep', GRD_SUM: 'Ringkasan grade' };
  w.XL = XL;
})(window);
