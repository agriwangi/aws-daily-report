// ============================================================
// AWS DAILY REPORT — MANDIRI
// js/app.js — SPA Router (hash) + Logika Halaman
// Action yang dipanggil harus PERSIS sama dengan ROUTES di Kode.gs:
// login, bootstrap, batch, dashboardData, absensiReport, produksiReport,
// saveAbsensi, saveProduksi, importExcel,
// getIssues, getIssueDetail, updateIssue, addIssueComment, createManualIssue, runIssueScan,
// generateDailyReportPDF, sendDailySummaryEmail,
// getThresholds, saveThresholds, getUsers, addUser, updateUserStatus, changePassword
// ============================================================

const Pages = {};
let charts = {};

function registerPage(name, def) { Pages[name] = Object.assign({ roles: null }, def); }

function go(name, param) {
  const h = '#/' + name + (param ? '/' + encodeURIComponent(param) : '');
  if (location.hash === h) route(); else location.hash = h;
}

function currentPageName() {
  return (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'dashboard';
}

function route() {
  if (!AppState.token) { showAuthScreen(); return; }
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const name = parts[0] || 'dashboard';
  const param = parts[1] ? decodeURIComponent(parts[1]) : null;
  const def = Pages[name] || Pages['dashboard'];
  const realName = Pages[name] ? name : 'dashboard';

  if (def.roles && AppState.user && def.roles.indexOf(AppState.user.role) === -1) {
    showToast('Akses ditolak', 'Anda tidak memiliki izin ke halaman ini.', 'err');
    go('dashboard');
    return;
  }

  let el = document.querySelector('.page[data-page="' + realName + '"]');
  const main = document.getElementById('mainContent');
  if (!el) {
    el = document.createElement('section');
    el.className = 'page';
    el.dataset.page = realName;
    el.innerHTML = def.template();
    main.appendChild(el);
    def.init && def.init(el);
  }
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p === el));
  setActiveNav(realName);
  def.show && def.show(el, param);
}

function setActiveNav(name) {
  document.querySelectorAll('.sidebar-nav .nav-item, .bottom-nav .bn-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === name);
  });
  const crumb = document.getElementById('breadcrumbTitle');
  const titles = {
    dashboard: 'Dashboard', input: 'Input Data', upload: 'Unggah Excel',
    absensi: 'Laporan Absensi', produksi: 'Laporan Produksi',
    isu: 'Isu & Rekomendasi', laporan: 'Laporan & Ekspor', pengaturan: 'Pengaturan'
  };
  if (crumb) crumb.textContent = titles[name] || name;
}

window.addEventListener('hashchange', route);

// ============================================================
// AUTH
// ============================================================

function showAuthScreen() {
  document.getElementById('authScreen').style.display = 'flex';
  document.getElementById('appShell').classList.remove('active');
}

function showAppShell() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('appShell').classList.add('active');
  renderSidebarUser();
  applyRoleVisibility();
  route();
  prefetchIdle();
}

function renderSidebarUser() {
  const u = AppState.user;
  if (!u) return;
  document.getElementById('sbUserName').textContent = u.nama || u.username;
  document.getElementById('sbUserRole').textContent = u.role;
  document.getElementById('sbUserAvatar').textContent = (u.nama || u.username || '?').charAt(0).toUpperCase();
}

const MENU_ROLE_MAP = {
  dashboard: null,
  input: ['Superadmin', 'Manager', 'SPV', 'Admin', 'Askep', 'Asisten'],
  upload: ['Superadmin', 'Manager', 'Admin'],
  absensi: null,
  produksi: null,
  isu: null,
  laporan: ['Superadmin', 'Manager', 'SPV', 'Admin'],
  pengaturan: ['Superadmin', 'Manager']
};

function applyRoleVisibility() {
  const role = AppState.user ? AppState.user.role : null;
  document.querySelectorAll('[data-nav-page]').forEach(el => {
    const page = el.dataset.navPage;
    const allowed = MENU_ROLE_MAP[page];
    el.style.display = (!allowed || allowed.indexOf(role) > -1) ? '' : 'none';
  });
}

async function doLogin(username, password) {
  const btn = document.getElementById('btnLogin');
  const errEl = document.getElementById('loginErr');
  errEl.textContent = '';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner spinner-sm"></span> Memeriksa...';
  try {
    const res = await api('login', { username, password });
    if (res.success) {
      AppState.token = res.data.token;
      AppState.user = res.data.user;
      applyBootstrap(res.data.boot);
      Store.set('session', { token: AppState.token, user: AppState.user, t: Date.now() });
      showAppShell();
    } else {
      errEl.textContent = res.message || 'Username atau password salah.';
    }
  } catch (e) {
    errEl.textContent = 'Gagal terhubung ke server. Coba lagi.';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Masuk';
  }
}

function applyBootstrap(boot) {
  if (!boot) return;
  AppState.thresholds = boot.thresholds;
  AppState.roles = boot.roles;
  AppState.divisiAfdeling = boot.divisiAfdeling;
  if (boot.dashboard) {
    Store.set(userKey('dashboardData:{}'), { t: Date.now(), h: hashStr(JSON.stringify(boot.dashboard)), data: boot.dashboard });
  }
}

function doLogout() {
  AppState.token = null;
  AppState.user = null;
  Store.del('session');
  location.hash = '';
  showAuthScreen();
}

function prefetchIdle() {
  const run = () => {
    const calls = ['getThresholds'];
    if (AppState.user && (AppState.user.role === 'Superadmin' || AppState.user.role === 'Manager')) calls.push('getUsers');
    api('batch', { calls: calls.map(a => ({ action: a })) }).then(res => {
      if (res.success) {
        Object.keys(res.data).forEach(a => {
          const r = res.data[a];
          if (r.success) Store.set(userKey('a:' + a), { t: Date.now(), h: hashStr(JSON.stringify(r.data)), data: r.data });
        });
      }
    });
  };
  (window.requestIdleCallback || setTimeout)(run, 1200);
}

// ============================================================
// RESTORE SESSION SAAT APP DIBUKA
// ============================================================

async function tryRestoreSession() {
  const sess = Store.get('session', null);
  if (!sess || !sess.token) { return; } // biarkan landing/auth screen seperti disiapkan index.html
  AppState.token = sess.token;
  AppState.user = sess.user;
  showAppShell();
  // Validasi token di latar belakang — kalau sudah tidak valid, apiOnce akan memicu handleSessionExpired
  const res = await api('bootstrap', {});
  if (res.success) applyBootstrap(res.data);
}

// ============================================================
// HALAMAN: DASHBOARD
// ============================================================
registerPage('dashboard', {
  template: () => `
    <div class="page-head">
      <div><h1>Dashboard Operasional</h1><p>Ringkasan kondisi kebun hari ini — absensi, produksi, dan isu aktif.</p></div>
      <div class="actions">
        <select id="dashFilterRange" class="field" style="height:36px;width:160px;">
          <option value="7">7 hari terakhir</option>
          <option value="30" selected>30 hari terakhir</option>
          <option value="90">90 hari terakhir</option>
        </select>
        <button class="btn btn-outline btn-sm" id="btnRefreshDash"><span class="material-symbols-outlined" style="font-size:16px;">refresh</span> Muat Ulang</button>
      </div>
    </div>
    <div class="grid grid-4" id="dashKpiRow">
      <div class="card kpi-card"><div class="lbl">Kehadiran</div><div class="val">—</div></div>
      <div class="card kpi-card"><div class="lbl">Mangkir</div><div class="val">—</div></div>
      <div class="card kpi-card"><div class="lbl">Capaian Produksi</div><div class="val">—</div></div>
      <div class="card kpi-card"><div class="lbl">Grade 3</div><div class="val">—</div></div>
    </div>
    <div class="grid grid-2" style="margin-top:14px;">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="font-size:15px;">Tren Produksi vs Budget</h3>
          <div class="chart-switch" data-chart="trend"><button data-type="bar" class="active">Bar</button><button data-type="line">Line</button></div>
        </div>
        <canvas id="chartTrend" height="220"></canvas>
      </div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <h3 style="font-size:15px;">Komposisi Grade</h3>
          <div class="chart-switch" data-chart="grade"><button data-type="doughnut" class="active">Doughnut</button><button data-type="pie">Pie</button></div>
        </div>
        <canvas id="chartGrade" height="220"></canvas>
      </div>
    </div>
    <div class="card" style="margin-top:14px;">
      <h3 style="font-size:15px;margin-bottom:10px;">Insight Otomatis</h3>
      <ul id="dashInsights" style="padding-left:18px; display:flex; flex-direction:column; gap:6px; font-size:13px; color:var(--on-surface-variant);"></ul>
    </div>
  `,
  init(el) {
    el.querySelector('#btnRefreshDash').addEventListener('click', () => loadDashboard(true));
    el.querySelector('#dashFilterRange').addEventListener('change', () => loadDashboard(true));
    el.querySelectorAll('.chart-switch').forEach(sw => {
      sw.addEventListener('click', e => {
        const btn = e.target.closest('button'); if (!btn) return;
        sw.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderDashboardCharts(AppState._lastDashboard, sw.dataset.chart, btn.dataset.type);
      });
    });
  },
  show() { loadDashboard(false); }
});

async function loadDashboard(force) {
  const range = document.getElementById('dashFilterRange').value;
  await swr('dashboardData:' + range, 'dashboardData', { rangeDays: Number(range) }, (data) => {
    AppState._lastDashboard = data;
    renderDashboardKpi(data);
    renderDashboardCharts(data, 'trend', 'bar');
    renderDashboardCharts(data, 'grade', 'doughnut');
    renderDashboardInsights(data);
  }, { force });
}

function renderDashboardKpi(d) {
  if (!d || !d.kpi) return;
  const row = document.getElementById('dashKpiRow');
  const items = [
    { lbl: 'Kehadiran', val: fmtPct(d.kpi.pctHadir), delta: d.kpi.pctMangkir > (AppState.thresholds ? AppState.thresholds.maxMangkirPct : 10) ? 'down' : 'up' },
    { lbl: 'Mangkir', val: fmtPct(d.kpi.pctMangkir), delta: d.kpi.pctMangkir > (AppState.thresholds ? AppState.thresholds.maxMangkirPct : 10) ? 'down' : 'up' },
    { lbl: 'Capaian Produksi', val: fmtPct(d.kpi.pctCapaian), delta: d.kpi.pctCapaian < (AppState.thresholds ? AppState.thresholds.minProduksiBudgetPct : 90) ? 'down' : 'up' },
    { lbl: 'Grade 3', val: fmtPct(d.kpi.pctG3), delta: d.kpi.pctG3 > (AppState.thresholds ? AppState.thresholds.maxG3Pct : 10) ? 'down' : 'up' }
  ];
  row.innerHTML = items.map(it => `
    <div class="card kpi-card">
      <div class="lbl">${escapeHtml(it.lbl)}</div>
      <div class="val">${it.val}</div>
      <div class="delta ${it.delta}">${it.delta === 'up' ? '▲ Sesuai target' : '▼ Perlu perhatian'}</div>
    </div>
  `).join('');
}

function renderDashboardCharts(d, which, type) {
  if (!d) return;
  if (which === 'trend' && d.trend) {
    const ctx = document.getElementById('chartTrend');
    if (!ctx) return;
    if (charts.trend) charts.trend.destroy();
    charts.trend = new Chart(ctx, {
      type: type,
      data: {
        labels: d.trend.labels,
        datasets: [
          { label: 'Realisasi', data: d.trend.realisasi, backgroundColor: '#006c48', borderColor: '#006c48' },
          { label: 'Budget', data: d.trend.budget, backgroundColor: '#92f7c3', borderColor: '#1b4332' }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
  if (which === 'grade' && d.gradeComposition) {
    const ctx = document.getElementById('chartGrade');
    if (!ctx) return;
    if (charts.grade) charts.grade.destroy();
    charts.grade = new Chart(ctx, {
      type: type,
      data: {
        labels: d.gradeComposition.labels,
        datasets: [{ data: d.gradeComposition.values, backgroundColor: ['#107C41', '#995D00', '#ba1a1a', '#717973'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
}

function renderDashboardInsights(d) {
  const ul = document.getElementById('dashInsights');
  if (!ul) return;
  const list = (d && d.insights) || [];
  ul.innerHTML = list.length ? list.map(t => `<li>${escapeHtml(t)}</li>`).join('') : '<li>Belum ada insight untuk periode ini.</li>';
}

function fmtPct(v) { return (v == null ? '—' : Number(v).toFixed(1) + '%'); }

// ============================================================
// HALAMAN: INPUT DATA (Absensi & Produksi manual)
// ============================================================
registerPage('input', {
  roles: ['Superadmin', 'Manager', 'SPV', 'Admin', 'Askep', 'Asisten'],
  template: () => `
    <div class="page-head"><div><h1>Input Data Harian</h1><p>Input manual data absensi dan produksi per divisi/afdeling.</p></div></div>
    <div class="tabs" id="inputTabs">
      <button class="tab-btn active" data-tab="absensi">Absensi</button>
      <button class="tab-btn" data-tab="produksi">Produksi</button>
    </div>
    <div class="card" id="inputAbsensiForm">
      <div class="form-row">
        <div class="field"><label>Tanggal</label><input type="date" id="absTanggal"></div>
        <div class="field"><label>Divisi</label><input type="text" id="absDivisi" placeholder="Divisi I"></div>
        <div class="field"><label>Afdeling</label><input type="text" id="absAfdeling" placeholder="Afdeling A"></div>
        <div class="field"><label>Jumlah Karyawan</label><input type="number" id="absJumlah" min="0"></div>
        <div class="field"><label>Hadir</label><input type="number" id="absHadir" min="0"></div>
        <div class="field"><label>Mangkir</label><input type="number" id="absMangkir" min="0"></div>
        <div class="field"><label>Izin</label><input type="number" id="absIzin" min="0"></div>
        <div class="field"><label>Sakit</label><input type="number" id="absSakit" min="0"></div>
        <div class="field"><label>Catatan</label><input type="text" id="absCatatan"></div>
      </div>
      <button class="btn btn-primary" id="btnSaveAbsensi">Simpan Absensi</button>
    </div>
    <div class="card" id="inputProduksiForm" style="display:none;">
      <div class="form-row">
        <div class="field"><label>Tanggal</label><input type="date" id="prdTanggal"></div>
        <div class="field"><label>Divisi</label><input type="text" id="prdDivisi"></div>
        <div class="field"><label>Afdeling</label><input type="text" id="prdAfdeling"></div>
        <div class="field"><label>Budget (kg)</label><input type="number" id="prdBudget" min="0"></div>
        <div class="field"><label>Realisasi (kg)</label><input type="number" id="prdRealisasi" min="0"></div>
        <div class="field"><label>Grade 1 (kg)</label><input type="number" id="prdG1" min="0"></div>
        <div class="field"><label>Grade 2 (kg)</label><input type="number" id="prdG2" min="0"></div>
        <div class="field"><label>Grade 3 (kg)</label><input type="number" id="prdG3" min="0"></div>
        <div class="field"><label>Jumlah Pemanen</label><input type="number" id="prdPemanen" min="0"></div>
      </div>
      <button class="btn btn-primary" id="btnSaveProduksi">Simpan Produksi</button>
    </div>
  `,
  init(el) {
    el.querySelector('#inputTabs').addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn'); if (!btn) return;
      el.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector('#inputAbsensiForm').style.display = btn.dataset.tab === 'absensi' ? '' : 'none';
      el.querySelector('#inputProduksiForm').style.display = btn.dataset.tab === 'produksi' ? '' : 'none';
    });
    const today = new Date().toISOString().slice(0, 10);
    el.querySelector('#absTanggal').value = today;
    el.querySelector('#prdTanggal').value = today;

    el.querySelector('#btnSaveAbsensi').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Menyimpan...';
      const payload = {
        tanggal: el.querySelector('#absTanggal').value,
        divisi: el.querySelector('#absDivisi').value,
        afdeling: el.querySelector('#absAfdeling').value,
        jumlahKaryawan: Number(el.querySelector('#absJumlah').value || 0),
        hadir: Number(el.querySelector('#absHadir').value || 0),
        mangkir: Number(el.querySelector('#absMangkir').value || 0),
        izin: Number(el.querySelector('#absIzin').value || 0),
        sakit: Number(el.querySelector('#absSakit').value || 0),
        catatan: el.querySelector('#absCatatan').value
      };
      const res = await api('saveAbsensi', payload);
      if (res.success) { showToast('Berhasil', 'Data absensi tersimpan.', 'ok'); el.querySelector('#absCatatan').value = ''; }
      else showToast('Gagal', res.message || 'Terjadi kesalahan.', 'err');
      btn.disabled = false; btn.textContent = 'Simpan Absensi';
    });

    el.querySelector('#btnSaveProduksi').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Menyimpan...';
      const payload = {
        tanggal: el.querySelector('#prdTanggal').value,
        divisi: el.querySelector('#prdDivisi').value,
        afdeling: el.querySelector('#prdAfdeling').value,
        budget: Number(el.querySelector('#prdBudget').value || 0),
        realisasi: Number(el.querySelector('#prdRealisasi').value || 0),
        grade1: Number(el.querySelector('#prdG1').value || 0),
        grade2: Number(el.querySelector('#prdG2').value || 0),
        grade3: Number(el.querySelector('#prdG3').value || 0),
        jumlahPemanen: Number(el.querySelector('#prdPemanen').value || 0)
      };
      const res = await api('saveProduksi', payload);
      if (res.success) showToast('Berhasil', 'Data produksi tersimpan.', 'ok');
      else showToast('Gagal', res.message || 'Terjadi kesalahan.', 'err');
      btn.disabled = false; btn.textContent = 'Simpan Produksi';
    });
  }
});

// ============================================================
// HALAMAN: UNGGAH EXCEL (SheetJS, Adaptive Schema Engine)
// ============================================================
registerPage('upload', {
  roles: ['Superadmin', 'Manager', 'Admin'],
  template: () => `
    <div class="page-head"><div><h1>Unggah Data Excel</h1><p>Impor data Absensi/Produksi massal dari file Excel. Kolom baru otomatis terdeteksi dan ditambahkan tanpa menghapus data lama.</p></div></div>
    <div class="card">
      <div class="field"><label>Target Sheet</label>
        <select id="uploadTarget"><option value="ABSENSI">Absensi</option><option value="PRODUKSI">Produksi</option></select>
      </div>
      <div class="dropzone" id="dropzone" style="margin-top:10px;">
        <span class="material-symbols-outlined">upload_file</span>
        <p style="margin:8px 0 0;font-weight:600;">Seret file Excel ke sini, atau klik untuk pilih</p>
        <p style="font-size:12px;color:var(--outline);">.xlsx atau .xls</p>
        <input type="file" id="fileInput" accept=".xlsx,.xls" style="display:none;">
      </div>
      <div id="uploadPreviewWrap" style="margin-top:14px;display:none;">
        <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:8px;">Pratinjau (<span id="previewCount">0</span> baris terdeteksi):</p>
        <div class="table-wrap"><table class="data-table" id="previewTable"><thead></thead><tbody></tbody></table></div>
        <button class="btn btn-primary" id="btnImport" style="margin-top:12px;">Import ke Database</button>
      </div>
    </div>
  `,
  init(el) {
    let parsedHeaders = [], parsedRows = [];
    const dz = el.querySelector('#dropzone');
    const fileInput = el.querySelector('#fileInput');
    dz.addEventListener('click', () => fileInput.click());
    ['dragover', 'dragleave', 'drop'].forEach(evt => dz.addEventListener(evt, e => e.preventDefault()));
    dz.addEventListener('dragover', () => dz.classList.add('drag'));
    dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
    dz.addEventListener('drop', e => { dz.classList.remove('drag'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) handleFile(e.target.files[0]); });

    function handleFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (!rows.length) { showToast('Kosong', 'File tidak memiliki data.', 'err'); return; }
        parsedHeaders = rows[0].map(String);
        parsedRows = rows.slice(1).filter(r => r.join('') !== '');
        renderPreview();
      };
      reader.readAsArrayBuffer(file);
    }

    function renderPreview() {
      el.querySelector('#uploadPreviewWrap').style.display = '';
      el.querySelector('#previewCount').textContent = parsedRows.length;
      const thead = el.querySelector('#previewTable thead');
      const tbody = el.querySelector('#previewTable tbody');
      thead.innerHTML = '<tr>' + parsedHeaders.map(h => '<th>' + escapeHtml(h) + '</th>').join('') + '</tr>';
      tbody.innerHTML = parsedRows.slice(0, 10).map(r => '<tr>' + r.map(c => '<td>' + escapeHtml(c) + '</td>').join('') + '</tr>').join('');
    }

    el.querySelector('#btnImport').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Mengimpor...';
      const res = await api('importExcel', {
        targetSheet: el.querySelector('#uploadTarget').value,
        headers: parsedHeaders,
        dataRows: parsedRows
      });
      if (res.success) showToast('Berhasil', (res.data && res.data.imported || parsedRows.length) + ' baris berhasil diimpor.', 'ok');
      else showToast('Gagal', res.message || 'Terjadi kesalahan.', 'err');
      btn.disabled = false; btn.textContent = 'Import ke Database';
    });
  }
});

// ============================================================
// HALAMAN: LAPORAN ABSENSI / PRODUKSI (tabel + filter)
// ============================================================
function buildReportPage(key, action, columns) {
  return {
    template: () => `
      <div class="page-head"><div><h1>${key === 'absensi' ? 'Laporan Absensi' : 'Laporan Produksi'}</h1><p>Data historis dengan filter tanggal, divisi, dan afdeling.</p></div></div>
      <div class="card" style="margin-bottom:14px;">
        <div class="form-row">
          <div class="field"><label>Dari Tanggal</label><input type="date" id="${key}FilterStart"></div>
          <div class="field"><label>Sampai Tanggal</label><input type="date" id="${key}FilterEnd"></div>
          <div class="field"><label>Divisi</label><input type="text" id="${key}FilterDivisi" placeholder="Semua"></div>
        </div>
        <button class="btn btn-outline btn-sm" id="${key}BtnFilter">Terapkan Filter</button>
      </div>
      <div class="table-wrap"><table class="data-table" id="${key}Table"><thead><tr>${columns.map(c => '<th>' + c.label + '</th>').join('')}</tr></thead><tbody><tr><td colspan="${columns.length}" class="empty-state">Memuat data...</td></tr></tbody></table></div>
    `,
    init(el) {
      el.querySelector('#' + key + 'BtnFilter').addEventListener('click', () => loadReport(key, action, columns, true));
    },
    show() { loadReport(key, action, columns, false); }
  };
}

async function loadReport(key, action, columns, force) {
  const start = document.getElementById(key + 'FilterStart').value;
  const end = document.getElementById(key + 'FilterEnd').value;
  const divisi = document.getElementById(key + 'FilterDivisi').value;
  const filter = { tanggalMulai: start, tanggalAkhir: end, divisi };
  await swr(key + 'Report:' + JSON.stringify(filter), action, filter, (rows) => {
    renderReportTable(key, rows, columns);
  }, { force });
}

function renderReportTable(key, rows, columns) {
  const tbody = document.querySelector('#' + key + 'Table tbody');
  if (!rows || !rows.length) { tbody.innerHTML = '<tr><td colspan="' + columns.length + '" class="empty-state">Tidak ada data untuk filter ini.</td></tr>'; return; }
  tbody.innerHTML = rows.map(r => '<tr>' + columns.map(c => '<td>' + escapeHtml(r[c.key] != null ? r[c.key] : '-') + '</td>').join('') + '</tr>').join('');
}

registerPage('absensi', buildReportPage('absensi', 'absensiReport', [
  { key: 'Tanggal', label: 'Tanggal' }, { key: 'Divisi', label: 'Divisi' }, { key: 'Afdeling', label: 'Afdeling' },
  { key: 'JumlahKaryawan', label: 'Jumlah' }, { key: 'Hadir', label: 'Hadir' }, { key: 'Mangkir', label: 'Mangkir' },
  { key: 'Izin', label: 'Izin' }, { key: 'Sakit', label: 'Sakit' }
]));

registerPage('produksi', buildReportPage('produksi', 'produksiReport', [
  { key: 'Tanggal', label: 'Tanggal' }, { key: 'Divisi', label: 'Divisi' }, { key: 'Afdeling', label: 'Afdeling' },
  { key: 'Budget', label: 'Budget (kg)' }, { key: 'Realisasi', label: 'Realisasi (kg)' },
  { key: 'Grade1', label: 'G1' }, { key: 'Grade2', label: 'G2' }, { key: 'Grade3', label: 'G3' }
]));

// ============================================================
// HALAMAN: ISU & REKOMENDASI (Kanban)
// ============================================================
registerPage('isu', {
  template: () => `
    <div class="page-head">
      <div><h1>Isu & Rekomendasi</h1><p>Tiket otomatis dari Issue Detection Engine berdasarkan ambang batas threshold.</p></div>
      <div class="actions"><button class="btn btn-outline btn-sm" id="btnScanIsu">Jalankan Deteksi Ulang</button></div>
    </div>
    <div class="kanban">
      <div class="kanban-col"><div class="kanban-col-head c-baru"><span>Baru</span><span id="countBaru" class="pill pill-error">0</span></div><div class="kanban-body" id="colBaru"></div></div>
      <div class="kanban-col"><div class="kanban-col-head c-proses"><span>Diproses</span><span id="countProses" class="pill pill-warning">0</span></div><div class="kanban-body" id="colProses"></div></div>
      <div class="kanban-col"><div class="kanban-col-head c-selesai"><span>Selesai</span><span id="countSelesai" class="pill pill-success">0</span></div><div class="kanban-body" id="colSelesai"></div></div>
    </div>
    <div class="modal-overlay" id="issueModal">
      <div class="modal-box">
        <div class="modal-head"><div><h3 id="issueModalTitle">Detail Isu</h3><p style="font-size:12px;color:var(--outline);" id="issueModalMeta"></p></div><button class="icon-btn" onclick="closeIssueModal()"><span class="material-symbols-outlined">close</span></button></div>
        <div class="modal-body" id="issueModalBody"></div>
        <div class="modal-foot">
          <select id="issueStatusSelect" class="field" style="height:36px;width:150px;"><option value="Baru">Baru</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option></select>
          <button class="btn btn-primary" id="btnUpdateIssue">Simpan Status</button>
        </div>
      </div>
    </div>
  `,
  init(el) {
    el.querySelector('#btnScanIsu').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Menjalankan...';
      const res = await api('runIssueScan', {});
      if (res.success) { showToast('Selesai', 'Deteksi isu selesai dijalankan.', 'ok'); loadIssues(true); }
      else showToast('Gagal', res.message || '', 'err');
      btn.disabled = false; btn.textContent = 'Jalankan Deteksi Ulang';
    });
  },
  show() { loadIssues(false); }
});

async function loadIssues(force) {
  await swr('issues:all', 'getIssues', {}, (rows) => renderKanban(rows), { force });
}

function renderKanban(rows) {
  rows = rows || [];
  const cols = { Baru: [], Diproses: [], Selesai: [] };
  rows.forEach(r => { (cols[r.Status] || cols.Baru).push(r); });
  document.getElementById('countBaru').textContent = cols.Baru.length;
  document.getElementById('countProses').textContent = cols.Diproses.length;
  document.getElementById('countSelesai').textContent = cols.Selesai.length;
  ['Baru', 'Diproses', 'Selesai'].forEach(st => {
    const target = document.getElementById('col' + st);
    target.innerHTML = cols[st].map(issueCardHtml).join('') || '<p style="font-size:12px;color:var(--outline);text-align:center;padding:16px;">Tidak ada isu.</p>';
  });
  target_bindClicks();
}
function target_bindClicks() {
  document.querySelectorAll('.issue-card').forEach(c => c.addEventListener('click', () => openIssueModal(c.dataset.id)));
}
function issueCardHtml(r) {
  const sevPill = r.Severity === 'Tinggi' ? 'pill-error' : r.Severity === 'Sedang' ? 'pill-warning' : 'pill-neutral';
  return `<div class="issue-card" data-id="${escapeHtml(r.IdIsu)}">
    <span class="pill ${sevPill}">${escapeHtml(r.Severity || '-')}</span>
    <h4>${escapeHtml(r.Judul || r.Kategori || 'Isu')}</h4>
    <p>${escapeHtml(r.Deskripsi || '')}</p>
    <div class="issue-meta"><span>${escapeHtml(r.Divisi || '')} ${escapeHtml(r.Afdeling || '')}</span><span>${escapeHtml(r.Tanggal || '')}</span></div>
  </div>`;
}

let currentIssueId = null;
async function openIssueModal(id) {
  currentIssueId = id;
  document.getElementById('issueModal').classList.add('show');
  document.getElementById('issueModalBody').innerHTML = '<p>Memuat...</p>';
  const res = await api('getIssueDetail', { id });
  if (!res.success) { showToast('Gagal', res.message || '', 'err'); closeIssueModal(); return; }
  const d = res.data;
  document.getElementById('issueModalTitle').textContent = d.Judul || d.Kategori || 'Detail Isu';
  document.getElementById('issueModalMeta').textContent = (d.Divisi || '') + ' / ' + (d.Afdeling || '') + ' — ' + (d.Tanggal || '');
  document.getElementById('issueStatusSelect').value = d.Status || 'Baru';
  document.getElementById('issueModalBody').innerHTML = `
    <div><h4 style="font-size:13px;margin-bottom:6px;">Deskripsi</h4><p style="font-size:13px;color:var(--on-surface-variant);">${escapeHtml(d.Deskripsi || '-')}</p>
    <h4 style="font-size:13px;margin:12px 0 6px;">Rekomendasi SPV</h4>
    <textarea class="field" id="issueRekomendasi" rows="4" style="width:100%;">${escapeHtml(d.RekomendasiSPV || '')}</textarea></div>
    <div><h4 style="font-size:13px;margin-bottom:6px;">Komentar</h4><div id="issueComments" style="display:flex;flex-direction:column;gap:8px;max-height:220px;overflow-y:auto;">${(d.komentar || []).map(c => `<div style="font-size:12.5px;background:var(--surface-low);padding:8px;border-radius:8px;"><b>${escapeHtml(c.Oleh)}</b>: ${escapeHtml(c.Isi)}</div>`).join('') || '<p style="font-size:12px;color:var(--outline);">Belum ada komentar.</p>'}</div>
    <div style="display:flex;gap:6px;margin-top:8px;"><input type="text" id="newComment" class="field" style="flex:1;" placeholder="Tambah komentar..."><button class="btn btn-outline btn-sm" id="btnAddComment">Kirim</button></div></div>
  `;
  document.getElementById('btnAddComment').addEventListener('click', async () => {
    const val = document.getElementById('newComment').value.trim();
    if (!val) return;
    const res2 = await api('addIssueComment', { id: currentIssueId, komentar: val });
    if (res2.success) openIssueModal(currentIssueId);
    else showToast('Gagal', res2.message || '', 'err');
  });
}
function closeIssueModal() { document.getElementById('issueModal').classList.remove('show'); currentIssueId = null; }

document.addEventListener('DOMContentLoaded', () => {
  const btnUpdate = document.getElementById('btnUpdateIssue');
  if (btnUpdate) btnUpdate.addEventListener('click', async () => {
    if (!currentIssueId) return;
    btnUpdate.disabled = true;
    const res = await api('updateIssue', {
      id: currentIssueId,
      status: document.getElementById('issueStatusSelect').value,
      rekomendasiSPV: document.getElementById('issueRekomendasi') ? document.getElementById('issueRekomendasi').value : ''
    });
    btnUpdate.disabled = false;
    if (res.success) { showToast('Berhasil', 'Status isu diperbarui.', 'ok'); closeIssueModal(); loadIssues(true); }
    else showToast('Gagal', res.message || '', 'err');
  });
});

// ============================================================
// HALAMAN: LAPORAN & EKSPOR
// ============================================================
registerPage('laporan', {
  roles: ['Superadmin', 'Manager', 'SPV', 'Admin'],
  template: () => `
    <div class="page-head"><div><h1>Laporan & Ekspor</h1><p>Unduh laporan harian PDF atau kirim ringkasan via email.</p></div></div>
    <div class="grid grid-2">
      <div class="card">
        <h3 style="font-size:15px;margin-bottom:10px;">Unduh Laporan PDF</h3>
        <div class="field"><label>Tanggal Laporan</label><input type="date" id="pdfTanggal"></div>
        <button class="btn btn-primary btn-block" id="btnDownloadPdf" style="margin-top:8px;">Download PDF</button>
      </div>
      <div class="card">
        <h3 style="font-size:15px;margin-bottom:10px;">Kirim Ringkasan Email</h3>
        <div class="field"><label>Alamat Email Tujuan</label><input type="email" id="emailTujuan" placeholder="manager@contoh.com"></div>
        <button class="btn btn-outline btn-block" id="btnSendEmail" style="margin-top:8px;">Kirim Email</button>
      </div>
    </div>
  `,
  init(el) {
    const today = new Date().toISOString().slice(0, 10);
    el.querySelector('#pdfTanggal').value = today;
    el.querySelector('#btnDownloadPdf').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Menyiapkan...';
      const tgl = el.querySelector('#pdfTanggal').value;
      const url = GAS_URL + '?action=downloadPdf&token=' + encodeURIComponent(AppState.token) + '&tanggalMulai=' + encodeURIComponent(tgl);
      window.open(url, '_blank');
      btn.disabled = false; btn.textContent = 'Download PDF';
    });
    el.querySelector('#btnSendEmail').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Mengirim...';
      const email = el.querySelector('#emailTujuan').value;
      const res = await api('sendDailySummaryEmail', { email, tanggal: el.querySelector('#pdfTanggal') ? el.querySelector('#pdfTanggal').value : new Date().toISOString().slice(0, 10) });
      if (res.success) showToast('Berhasil', 'Email telah dikirim (atau dijadwalkan terkirim).', 'ok');
      else showToast('Gagal', res.message || '', 'err');
      btn.disabled = false; btn.textContent = 'Kirim Email';
    });
  }
});

// ============================================================
// HALAMAN: PENGATURAN (Threshold + RBAC/Users)
// ============================================================
registerPage('pengaturan', {
  roles: ['Superadmin', 'Manager'],
  template: () => `
    <div class="page-head"><div><h1>Pengaturan</h1><p>Ambang batas deteksi isu, dan manajemen pengguna.</p></div></div>
    <div class="tabs" id="setTabs"><button class="tab-btn active" data-tab="threshold">Threshold</button><button class="tab-btn" data-tab="users">Pengguna</button><button class="tab-btn" data-tab="migrasi">Migrasi Data (v1)</button></div>
    <div class="card" id="setThresholdWrap">
      <div class="form-row">
        <div class="field"><label>Maks Mangkir (%)</label><input type="number" id="thMangkir"></div>
        <div class="field"><label>Maks Grade 3 (%)</label><input type="number" id="thG3"></div>
        <div class="field"><label>Min Capaian Produksi (%)</label><input type="number" id="thBudget"></div>
        <div class="field"><label>Maks Hari Pusingan</label><input type="number" id="thPusingan"></div>
      </div>
      <button class="btn btn-primary" id="btnSaveThreshold">Simpan Threshold</button>
    </div>
    <div class="card" id="setUsersWrap" style="display:none;">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
        <h3 style="font-size:15px;">Daftar Pengguna</h3>
        <button class="btn btn-outline btn-sm" id="btnAddUser">+ Tambah Pengguna</button>
      </div>
      <div class="table-wrap"><table class="data-table" id="usersTable"><thead><tr><th>Username</th><th>Nama</th><th>Role</th><th>Status</th><th></th></tr></thead><tbody><tr><td colspan="5" class="empty-state">Memuat...</td></tr></tbody></table></div>
    </div>
    <div class="card" id="setMigrasiWrap" style="display:none;">
      <p style="font-size:13px;color:var(--on-surface-variant);margin-bottom:10px;">
        Pindahkan data dari aplikasi <b>AWS Daily Report v1 (GAS Webapp)</b> ke database v2 (REST) ini.
        Spreadsheet v1 <b>hanya dibaca</b>, tidak pernah ditulis. Jalankan <b>Pindai (Dry-run)</b> dulu
        sebelum <b>Jalankan Migrasi</b> — aman diulang berkali-kali (idempoten).
      </p>
      <div class="field"><label>URL atau ID Spreadsheet v1 (sumber)</label><input type="text" id="migSourceUrl" placeholder="https://docs.google.com/spreadsheets/d/XXXXXXXX/edit"></div>
      <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
        <button class="btn btn-outline" id="btnMigDryRun">🔍 Pindai (Dry-run)</button>
        <button class="btn btn-primary" id="btnMigRun" disabled>▶️ Jalankan Migrasi</button>
      </div>
      <div id="migResultWrap" style="margin-top:16px;display:none;">
        <div class="table-wrap"><table class="data-table" id="migReportTable">
          <thead><tr><th>Data</th><th>Di Sumber (v1)</th><th>Ditambah</th><th>Diperbarui</th><th>Dilewati</th></tr></thead>
          <tbody></tbody>
        </table></div>
        <div id="migWarnings" style="margin-top:10px;font-size:12.5px;color:var(--warning);"></div>
        <div id="migAkunBaru" style="margin-top:10px;"></div>
      </div>
    </div>
  `,
  init(el) {
    el.querySelector('#setTabs').addEventListener('click', e => {
      const btn = e.target.closest('.tab-btn'); if (!btn) return;
      el.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      el.querySelector('#setThresholdWrap').style.display = btn.dataset.tab === 'threshold' ? '' : 'none';
      el.querySelector('#setUsersWrap').style.display = btn.dataset.tab === 'users' ? '' : 'none';
      el.querySelector('#setMigrasiWrap').style.display = btn.dataset.tab === 'migrasi' ? '' : 'none';
      if (btn.dataset.tab === 'users') loadUsers(false);
    });
    el.querySelector('#btnMigDryRun').addEventListener('click', () => runMigrationV1(el, true));
    el.querySelector('#btnMigRun').addEventListener('click', () => {
      if (!confirm('Migrasi akan MENULIS data baru ke database v2 ini (akun baru, data historis absensi/produksi/isu yang belum ada). Tindakan ini aman diulang, tapi tidak dapat "dibatalkan" secara otomatis. Lanjutkan?')) return;
      runMigrationV1(el, false);
    });
    el.querySelector('#btnSaveThreshold').addEventListener('click', async (e) => {
      const btn = e.target; btn.disabled = true; btn.textContent = 'Menyimpan...';
      const payload = {
        maxMangkirPct: Number(el.querySelector('#thMangkir').value || 0),
        maxG3Pct: Number(el.querySelector('#thG3').value || 0),
        minProduksiBudgetPct: Number(el.querySelector('#thBudget').value || 0),
        maxPusinganHari: Number(el.querySelector('#thPusingan').value || 0)
      };
      const res = await api('saveThresholds', payload);
      if (res.success) { showToast('Berhasil', 'Threshold tersimpan.', 'ok'); AppState.thresholds = payload; }
      else showToast('Gagal', res.message || '', 'err');
      btn.disabled = false; btn.textContent = 'Simpan Threshold';
    });
    el.querySelector('#btnAddUser').addEventListener('click', () => {
      const username = prompt('Username baru:'); if (!username) return;
      const nama = prompt('Nama lengkap:') || username;
      const role = prompt('Role (Superadmin/Manager/SPV/Admin/Askep/Asisten):') || 'Admin';
      const password = prompt('Password awal:') || 'password123';
      api('addUser', { username, nama, role, password }).then(res => {
        if (res.success) { showToast('Berhasil', 'Pengguna ditambahkan.', 'ok'); loadUsers(true); }
        else showToast('Gagal', res.message || '', 'err');
      });
    });
    loadThresholdForm();
  },
  show() { loadThresholdForm(); }
});

async function loadThresholdForm() {
  const res = await api('getThresholds', {});
  if (res.success) {
    AppState.thresholds = res.data;
    const t = res.data;
    const map = { thMangkir: 'maxMangkirPct', thG3: 'maxG3Pct', thBudget: 'minProduksiBudgetPct', thPusingan: 'maxPusinganHari' };
    Object.keys(map).forEach(id => { const el = document.getElementById(id); if (el) el.value = t[map[id]] != null ? t[map[id]] : ''; });
  }
}

async function runMigrationV1(el, dryRun) {
  const sourceId = el.querySelector('#migSourceUrl').value.trim();
  if (!sourceId) { showToast('Kosong', 'Isi URL/ID spreadsheet v1 dulu.', 'err'); return; }
  const btnDry = el.querySelector('#btnMigDryRun'), btnRun = el.querySelector('#btnMigRun');
  btnDry.disabled = true; btnRun.disabled = true;
  const activeBtn = dryRun ? btnDry : btnRun;
  const originalText = activeBtn.textContent;
  activeBtn.innerHTML = '<span class="spinner spinner-sm"></span> ' + (dryRun ? 'Memindai...' : 'Menjalankan migrasi...');

  const res = await api('migrateFromV1', { sourceId, dryRun });

  btnDry.disabled = false; activeBtn.textContent = originalText;
  if (!res.success) { showToast('Gagal', res.message || 'Terjadi kesalahan.', 'err'); return; }

  const d = res.data;
  el.querySelector('#migResultWrap').style.display = '';
  const tbody = el.querySelector('#migReportTable tbody');
  const labelMap = { USERS: 'Pengguna', ABSENSI: 'Absensi', PRODUKSI: 'Produksi', ISU: 'Isu & Rekomendasi', KOMENTAR: 'Komentar Isu', THRESHOLD: 'Threshold', DIVISI: 'Master Divisi/Afdeling' };
  tbody.innerHTML = Object.keys(d.laporan || {}).map(k => {
    const r = d.laporan[k];
    return `<tr><td>${labelMap[k] || k}</td><td>${r.sumber}</td><td>${r.ditambah}</td><td>${r.diperbarui}</td><td>${r.dilewati}</td></tr>`;
  }).join('') || '<tr><td colspan="5" class="empty-state">Tidak ada data.</td></tr>';

  const warnEl = el.querySelector('#migWarnings');
  warnEl.innerHTML = (d.peringatan && d.peringatan.length) ? '<b>⚠️ Peringatan:</b><ul style="margin:6px 0 0 18px;">' + d.peringatan.map(w => '<li>' + escapeHtml(w) + '</li>').join('') + '</ul>' : '';

  const akunEl = el.querySelector('#migAkunBaru');
  if (d.akunBaru && d.akunBaru.length) {
    akunEl.innerHTML = '<b style="color:var(--success);">✅ Akun baru dibuat (password hanya tampil SEKALI di sini — catat &amp; sampaikan ke pengguna):</b>' +
      '<div class="table-wrap" style="margin-top:6px;"><table class="data-table"><thead><tr><th>Username</th><th>Nama</th><th>Password Awal</th></tr></thead><tbody>' +
      d.akunBaru.map(u => `<tr><td>${escapeHtml(u.username)}</td><td>${escapeHtml(u.nama)}</td><td class="mono">${escapeHtml(u.passwordAwal)}</td></tr>`).join('') +
      '</tbody></table></div>';
  } else {
    akunEl.innerHTML = '';
  }

  if (dryRun) {
    btnRun.disabled = false;
    showToast('Pemindaian selesai', 'Periksa hasilnya, lalu klik "Jalankan Migrasi" bila sudah sesuai.', 'ok');
  } else {
    btnRun.disabled = true;
    showToast('Migrasi selesai', 'Data dari v1 berhasil dipindahkan.', 'ok');
  }
}

async function loadUsers(force) {
  await swr('users:all', 'getUsers', {}, (rows) => {
    const tbody = document.querySelector('#usersTable tbody');
    if (!rows || !rows.length) { tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Tidak ada pengguna.</td></tr>'; return; }
    tbody.innerHTML = rows.map(u => `
      <tr>
        <td>${escapeHtml(u.Username)}</td><td>${escapeHtml(u.Nama)}</td><td><span class="role-chip">${escapeHtml(u.Role)}</span></td>
        <td>${u.Status === 'Nonaktif' ? '<span class="pill pill-error">Nonaktif</span>' : '<span class="pill pill-success">Aktif</span>'}</td>
        <td><button class="btn btn-outline btn-sm" data-u="${escapeHtml(u.Username)}" data-s="${u.Status === 'Nonaktif' ? 'Aktif' : 'Nonaktif'}">${u.Status === 'Nonaktif' ? 'Aktifkan' : 'Nonaktifkan'}</button></td>
      </tr>`).join('');
    tbody.querySelectorAll('button[data-u]').forEach(b => b.addEventListener('click', async () => {
      const res = await api('updateUserStatus', { username: b.dataset.u, status: b.dataset.s });
      if (res.success) { showToast('Berhasil', 'Status pengguna diperbarui.', 'ok'); loadUsers(true); }
      else showToast('Gagal', res.message || '', 'err');
    }));
  }, { force });
}

// ============================================================
// INIT APLIKASI
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loadingOverlay').style.display = 'none';
  warmUp();

  document.getElementById('btnLogin').addEventListener('click', () => {
    doLogin(document.getElementById('loginUsername').value.trim(), document.getElementById('loginPassword').value);
  });
  document.getElementById('loginPassword').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('btnLogin').click(); });

  document.getElementById('btnLogout').addEventListener('click', doLogout);
  document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('show'));

  document.querySelectorAll('[data-nav-page]').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); go(el.dataset.navPage); document.getElementById('sidebar').classList.remove('show'); }));

  updateSyncPill();
  tryRestoreSession();
});
