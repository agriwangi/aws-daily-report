/* AWS Daily Report v1.0.0 — klien API (POST text/plain ke Google Apps Script) */
(function (w) {
  'use strict';
  var API = { token: '', me: null, boot: null, onAuthLost: null };
  API.siapUrl = function () { var u = (w.APP_CONFIG && w.APP_CONFIG.GAS_URL) || ''; return u && !/GANTI|XXXX/.test(u) && /^https:\/\/script\.google(usercontent)?\.com\//.test(u) ? u : ''; };
  API.muatSesi = function () { API.token = U.baca('token', '') || ''; };
  API.simpanSesi = function (t) { API.token = t || ''; if (t) U.simpan('token', t); else U.hapus('token'); };
  API.call = function (action, data, opsi) {
    opsi = opsi || {};
    var url = API.siapUrl();
    if (!url) return Promise.reject(new Error('Konfigurasi belum lengkap: alamat Web App (GAS_URL) di js/config.js belum diisi.'));
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, opsi.timeout || 120000);
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: action, token: API.token, data: data || {} }), signal: ctl.signal, redirect: 'follow' })
      .then(function (r) { clearTimeout(t); if (!r.ok) throw new Error('Server menjawab ' + r.status); return r.json(); })
      .catch(function (e) { clearTimeout(t); if (e.name === 'AbortError') throw new Error('Waktu tunggu habis. Coba lagi.'); if (e instanceof TypeError) throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet.'); throw e; })
      .then(function (j) {
        if (j && j.ok) return j;
        var err = new Error((j && j.msg) || 'Terjadi kesalahan.'); err.code = j && j.code; err.data = j;
        if (err.code === 'AUTH' && API.onAuthLost && !opsi.diam) API.onAuthLost(err);
        throw err;
      });
  };
  /* pintasan: kembalikan .data */
  API.d = function (action, data, opsi) { return API.call(action, data, opsi).then(function (j) { return j.data; }); };
  w.API = API;
})(window);
