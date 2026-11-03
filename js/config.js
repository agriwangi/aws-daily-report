// ============================================================
// AWS DAILY REPORT — MANDIRI (standalone)
// Konfigurasi koneksi ke backend REST (Google Apps Script)
// ============================================================

// GANTI dengan URL Web App hasil deploy Apps Script (Kode.gs)
// Format: https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXX/exec
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyTuS-pRf4PcRhT2W9BNkfC84OLQDlX7PVnjsMNM-j0aohE43YxzoMk4yEZX7l6NnIp/exec';

const APP_INFO = {
  name: 'AWS Daily Report',
  shortName: 'AWS',
  version: '2.0.0-rest',
  company: 'PT. Agri Wangi Sentosa'
};

// Versi skema cache lokal — naikkan (v1 -> v2) kalau bentuk data bootstrap berubah,
// supaya localStorage lama milik user tidak dipakai lagi secara otomatis.
const CACHE_SCHEMA_VERSION = 'v1';

// Freshness TTL default untuk SWR (ms) — lihat js/api.js
const SWR_FRESH_MS = 60000; // 60 detik

// Timeout fetch (ms)
const FETCH_TIMEOUT_READ_FIRST = 25000;  // percobaan pertama (lebih pendek, cepat pulih dari cold start)
const FETCH_TIMEOUT_READ_RETRY = 40000;  // percobaan retry
const FETCH_TIMEOUT_WRITE = 40000;
