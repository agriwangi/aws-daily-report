// ============================================================
// AWS DAILY REPORT — MANDIRI
// js/api.js — Lapisan komunikasi REST ke Kode.gs
// Menerapkan gas-instant-ux-pro Prinsip 1-8: SPA cache, SWR,
// idempotensi (reqId), retry+timeout, warm-up ping.
// ============================================================

// ---------- State Aplikasi Global ----------
const AppState = {
  token: null,
  user: null,          // {email, username, nama, role, scopeDivisi, scopeAfdeling}
  thresholds: null,
  roles: null,
  divisiAfdeling: null,
  online: navigator.onLine,
  tables: {}
};

// ---------- Perf tracker (Prinsip 0) ----------
const Perf = {
  rows: [],
  add(action, total, server) {
    this.rows.push({ action, total, server: server ?? null, net: server != null ? total - server : null, at: Date.now() });
    if (this.rows.length > 200) this.rows.shift();
  },
  table() { console.table(this.rows.slice(-30)); }
};
window.Perf = Perf;

// ---------- Store (localStorage namespaced per user + versi skema) ----------
const LS_PREFIX = 'aws_rest:' + CACHE_SCHEMA_VERSION + ':';
const Store = {
  get(k, d) {
    try { const v = localStorage.getItem(LS_PREFIX + k); return v ? JSON.parse(v) : d; }
    catch (e) { return d; }
  },
  set(k, v) {
    const s = JSON.stringify(v);
    try { localStorage.setItem(LS_PREFIX + k, s); }
    catch (e) {
      try {
        Object.keys(localStorage)
          .filter(x => x.indexOf(LS_PREFIX + 'u:') === 0 && x.indexOf(userKey('')) !== 0)
          .forEach(x => localStorage.removeItem(x));
        localStorage.setItem(LS_PREFIX + k, s);
      } catch (e2) { /* tetap jalan tanpa cache */ }
    }
  },
  del(k) { try { localStorage.removeItem(LS_PREFIX + k); } catch (e) {} }
};
function userKey(k) { return 'u:' + (AppState.user ? AppState.user.username : 'anon') + ':' + k; }
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; }

// ---------- reqId (idempotensi tulis — Prinsip 6) ----------
function genReqId() {
  return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

// ---------- Deteksi aksi baca vs tulis (untuk strategi retry) ----------
const READ_ACTIONS = /^(login|bootstrap|batch|dashboardData|absensiReport|produksiReport|getIssues|getIssueDetail|getThresholds|getUsers)$/;

// ---------- fetch dengan timeout ----------
function fetchWithTimeout(url, opts, timeoutMs) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, Object.assign({}, opts, { signal: ctrl.signal, redirect: 'follow' }))
    .finally(() => clearTimeout(id));
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

async function waitOnline(maxMs) {
  if (navigator.onLine) return true;
  const start = Date.now();
  while (!navigator.onLine && Date.now() - start < maxMs) await sleep(500);
  return navigator.onLine;
}

/**
 * Panggilan inti ke REST API — satu kali eksekusi (tanpa retry).
 */
async function apiOnce(action, data, timeoutMs, reqId) {
  const t0 = Date.now();
  const body = { action, token: AppState.token, data: data || {} };
  if (reqId) body.reqId = reqId;

  const res = await fetchWithTimeout(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari CORS preflight
    body: JSON.stringify(body)
  }, timeoutMs);

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch (e) { throw new Error('Respons server tidak valid (bukan JSON) — kemungkinan error Apps Script.'); }

  const total = Date.now() - t0;
  Perf.add(action, total, json && typeof json.ms === 'number' ? json.ms : null);
  return json;
}

// ---------- Dedupe baca in-flight + epoch tulis (gas-scale-turbo 4.2) ----------
// Mencegah permintaan BACA identik yang sedang berjalan ditembak ulang (klik cepat,
// SWR + prefetch bertabrakan). Epoch dinaikkan setiap aksi TULIS agar baca yang
// menumpang permintaan LAMA tidak pernah dianggap valid setelah data berubah.
const _inflight = {};
let _writeEpoch = 0;

/**
 * Panggilan API publik dengan retry + timeout + tunggu online.
 * - Aksi baca: retry hingga 3x (percobaan pertama lebih pendek); identik → menumpang in-flight.
 * - Aksi tulis: retry hanya jika membawa reqId (idempoten); menaikkan write epoch.
 */
function api(action, data, opt) {
  opt = opt || {};
  const isRead = READ_ACTIONS.test(action);
  if (!isRead) { _writeEpoch++; return apiRun_(action, data, opt); }

  const epochAtCall = _writeEpoch;
  const key = epochAtCall + '|' + action + '|' + AppState.token + '|' + JSON.stringify(data || {});
  if (_inflight[key]) return _inflight[key];
  const p = apiRun_(action, data, opt);
  _inflight[key] = p;
  p.finally(() => { delete _inflight[key]; });
  return p;
}

async function apiRun_(action, data, opt) {
  const isRead = READ_ACTIONS.test(action);
  const reqId = !isRead ? (opt.reqId || genReqId()) : null;
  const maxAttempts = isRead ? 3 : (reqId ? 3 : 1);

  await waitOnline(8000);

  let lastErr = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const timeout = attempt === 0 ? FETCH_TIMEOUT_READ_FIRST : (isRead ? FETCH_TIMEOUT_READ_RETRY : FETCH_TIMEOUT_WRITE);
    try {
      const json = await apiOnce(action, data, timeout, reqId);
      if (json && json.success === false && json.code === 'AUTH') {
        handleSessionExpired();
      }
      return json;
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts - 1) await sleep(500 * Math.pow(2, attempt)); // backoff bertahap
    }
  }
  return { success: false, message: 'Gagal terhubung ke server: ' + (lastErr ? lastErr.message : 'tidak diketahui'), offline: true };
}

/** Satu kali panggilan tanpa retry sama sekali (untuk warm-up ping) */
function warmUp() {
  fetchWithTimeout(GAS_URL + '?ping=1', { method: 'GET' }, 10000).catch(() => {});
}

function handleSessionExpired() {
  AppState.token = null;
  AppState.user = null;
  Store.del('session');
  showToast('Sesi berakhir', 'Silakan masuk kembali.', 'warn');
  showAuthScreen();
}

// ---------- SWR (stale-while-revalidate) — Prinsip 2 ----------
async function swr(key, action, payload, render, opt) {
  opt = opt || {};
  const fresh = opt.fresh != null ? opt.fresh : SWR_FRESH_MS;
  const c = Store.get(userKey(key), null);
  if (c) render(c.data, true);
  if (c && !opt.force && Date.now() - c.t < fresh) return { success: true, data: c.data, cached: true };

  const res = await api(action, payload);
  if (res.success) {
    const h = hashStr(JSON.stringify(res.data));
    Store.set(userKey(key), { t: Date.now(), h, data: res.data });
    if (!c || c.h !== h) render(res.data, false);
  } else if (!c && opt.onError) {
    opt.onError(res);
  } else if (!res.offline) {
    showToast('Gagal memuat', res.message || 'Terjadi kesalahan.', 'err');
  }
  return res;
}

// ---------- Toast ----------
function showToast(title, message, type) {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'err' ? ' err' : type === 'warn' ? ' warn' : '');
  el.innerHTML = '<b>' + escapeHtml(title) + '</b>' + escapeHtml(message || '');
  host.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3800);
}

function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ---------- Online/offline indicator ----------
window.addEventListener('online', () => { AppState.online = true; updateSyncPill(); });
window.addEventListener('offline', () => { AppState.online = false; updateSyncPill(); });
function updateSyncPill() {
  const dot = document.getElementById('syncDot');
  const lbl = document.getElementById('syncLabel');
  if (!dot || !lbl) return;
  if (AppState.online) { dot.classList.remove('offline'); lbl.textContent = 'Tersinkron'; }
  else { dot.classList.add('offline'); lbl.textContent = 'Offline'; }
}

// ---------- Warm-up saat tab kembali aktif setelah > 2 menit ----------
let lastHiddenAt = Date.now();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { lastHiddenAt = Date.now(); }
  else if (Date.now() - lastHiddenAt > 120000) { warmUp(); }
});
