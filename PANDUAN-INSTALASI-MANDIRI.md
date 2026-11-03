# Panduan Instalasi — AWS Daily Report (Versi Mandiri / REST)

Panduan ini untuk memasang **dua bagian** AWS Daily Report versi "Metode Ketiga":
1. **Backend** (`Kode.gs`) → Google Apps Script, sebagai REST API.
2. **Frontend** (folder ini: `index.html`, `css/`, `js/`) → GitHub Pages.

---

## BAGIAN 1 — Pasang Backend (Google Apps Script)

1. Buka [script.google.com](https://script.google.com) → **New project**.
2. Hapus semua isi file `Code.gs` bawaan, lalu salin-tempel **seluruh isi**
   file `Kode.gs` yang dikirim terpisah di chat (bukan di dalam ZIP ini).
3. Simpan (Ctrl+S / ikon disket). Beri nama project, misal "AWS Daily Report REST".
4. Di dropdown fungsi (atas, sebelah tombol Run), pilih `setupAppEnvironment`,
   lalu klik **Run**. Berikan izin akses yang diminta (akun Google Anda).
   - Ini membuat folder Drive **"AWS_Daily_Report_REST_DB"** + Spreadsheet
     database + seluruh sheet + user Superadmin default (`admin`).
   - **Buka tab "Execution log"** (atau menu "Jalankan → Lihat log eksekusi")
     segera setelah selesai — password awal Superadmin dibangkitkan **acak**
     dan **hanya tampil sekali** di log ini. Catat sekarang (lihat BAGIAN 1A).
   - Fungsi ini **aman dijalankan ulang**: kalau environment sudah ada, ia
     tidak akan membuat spreadsheet/folder baru atau mengubah rahasia yang
     sudah tersimpan (idempoten).
5. Klik **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy**, salin **URL Web App** yang muncul (diakhiri `/exec`).
   Ini adalah `GAS_URL` Anda.

> **Update berikutnya:** kalau Anda mengubah `Kode.gs` di kemudian hari,
> gunakan **Deploy → Manage deployments → Edit (ikon pensil) → New version**
> — JANGAN buat deployment baru, supaya URL `/exec` tetap sama dan frontend
> tidak perlu dikonfigurasi ulang.

---

## BAGIAN 1A — Rahasia Aplikasi (Script Properties)

Mengikuti pola **gas-rahasia-script-properties**, semua nilai sensitif disimpan
di **Script Properties** (Apps Script → ⚙️ *Project Settings* → *Script Properties*),
**tidak pernah** di kode, Sheets, atau frontend:

| Properti | Dibuat otomatis? | Keterangan |
|---|---|---|
| `SPREADSHEET_ID`, `ROOT_FOLDER_ID` | ✅ saat `setupAppEnvironment()` | ID database & folder Drive — bukan rahasia, tapi tidak di-hardcode |
| `TOKEN_SECRET` | ✅ saat pertama kali dibutuhkan | Kunci HMAC untuk tanda tangan sesi login. **Jangan pernah dihapus** — menghapusnya memaksa SEMUA orang logout |
| `REV_<username>` | ✅ otomatis saat "keluar dari semua perangkat" / nonaktifkan user | Penanda pencabutan sesi per akun |

- **Password pengguna tidak pernah disimpan** — hanya hash (HMAC-SHA256 berulang 300x) + salt unik per akun, di kolom `PasswordHash`/`Salt` sheet `Users`.
- Password awal Superadmin dan setiap akun baru yang dibuat lewat menu **Pengaturan → Pengguna** atau **Migrasi Data** dibangkitkan **acak** dan hanya ditampilkan **satu kali** (di log eksekusi, atau di layar hasil saat itu juga) — tidak pernah dicatat ulang di tempat lain. **Segera catat dan sampaikan ke pengguna, lalu minta mereka ganti password setelah login pertama.**
- Siapa pun yang punya akses **edit** ke proyek Apps Script ini bisa melihat Script Properties — jangan menambahkan editor proyek sembarangan.

---

## BAGIAN 2 — Isi Konfigurasi Frontend

1. Buka file `js/config.js` di folder ini.
2. Cari baris:
   ```js
   const GAS_URL = 'https://script.google.com/macros/s/GANTI_DENGAN_DEPLOYMENT_ID_ANDA/exec';
   ```
3. Ganti dengan URL `/exec` dari Bagian 1 langkah 6. Simpan file.

---

## BAGIAN 3 — Deploy Frontend ke GitHub Pages

Ikuti panduan `github-pages-deploy-guide` secara lengkap (ringkasannya):

1. **Folder kerja = folder ini** (tempat `index.html` berada di root).
   Jangan `git init` di folder induk.
2. Pastikan `index.html`, `css/`, `js/` ada tepat di root folder ini (jalankan
   `dir` atau `ls` untuk memastikan).
3. Dari folder ini, jalankan satu per satu:
   ```bash
   git init
   git add .
   git commit -m "Upload pertama — AWS Daily Report Mandiri"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
4. Di GitHub: **Settings → Pages** → Source: **Deploy from a branch**,
   Branch: **main / (root)**, centang **Enforce HTTPS** → **Save**.
5. Tunggu 1-2 menit, buka `https://USERNAME.github.io/NAMA-REPO/`.

---

## BAGIAN 4 — Login Pertama Kali

1. Buka situs Anda → klik **Masuk**.
2. Username: `admin`, Password: **sesuai yang tercatat dari log eksekusi** (BAGIAN 1A) — bukan password tetap.
3. **Segera ganti password** lewat menu Pengaturan (atau fungsi `changePassword`
   di sisi backend) setelah login pertama.
4. Tambahkan pengguna lain (Manager, SPV, Admin, Askep, Asisten) lewat menu
   **Pengaturan → Pengguna**. Password awal setiap akun baru juga dibangkitkan
   acak dan ditampilkan sekali di layar — catat sebelum menutup notifikasinya.

---

## BAGIAN 5 — Migrasi Data dari AWS Daily Report v1 (GAS Webapp)

Bila Anda sebelumnya memakai versi v1.0.0 (GAS Webapp, arsitektur HtmlService) dan
ingin data lama (absensi, produksi, isu, threshold, master divisi/afdeling) ikut
pindah ke versi v2 REST ini, gunakan modul migrasi — mengikuti pola **gas-migrasi-database**:

1. Login sebagai **Superadmin** → menu **Pengaturan → tab "Migrasi Data (v1)"**.
2. Tempel **URL atau ID spreadsheet database v1** (spreadsheet lama, bukan v2 ini)
   pada kolom yang tersedia. Spreadsheet v1 **hanya dibaca**, tidak akan diubah sama sekali.
3. Klik **🔍 Pindai (Dry-run)** — ini **belum menulis apa pun**, hanya menghitung
   berapa data yang akan ditambah/diperbarui/dilewati. Periksa hasilnya dan peringatannya.
4. Kalau sudah sesuai, klik **▶️ Jalankan Migrasi** untuk benar-benar menulis data.
5. **Akun pengguna dari v1 dibuatkan password BARU** (algoritma hash v1 dan v2 berbeda,
   sehingga password lama tidak bisa dibawa apa adanya) — password baru ini tampil
   **satu kali** di tabel hasil setelah migrasi. Catat dan sampaikan ke setiap pengguna.
6. Migrasi ini **aman diulang** (idempoten) — menjalankannya lagi tidak akan membuat
   data dobel. Disarankan menjalankannya **sekali lagi tepat sebelum cutover** (saat
   benar-benar berhenti memakai v1) untuk menangkap data yang masuk selama masa transisi.
7. **Yang TIDAK ikut migrasi** (disebutkan eksplisit, bukan dilewati diam-diam):
   - Sheet `MasterMandor` milik v1 — v2 tidak punya sheet master Mandor terpisah;
     nama Mandor di v2 disimpan langsung sebagai teks pada setiap baris Absensi/Produksi.
   - Akun `admin` bawaan v1 — v2 sudah punya akun Superadmin sendiri.
   - Sesi login v1 — semua pengguna login ulang di v2 (wajar, aplikasi berbeda).
8. Setelah migrasi dan Anda yakin semua data sudah benar, deployment v1 boleh
   diarsipkan/dimatikan — database v1 itu sendiri tidak pernah tersentuh oleh proses ini.

---

## Troubleshooting Singkat

| Gejala | Kemungkinan Sebab | Solusi |
|---|---|---|
| Login gagal terus / "Gagal terhubung ke server" | `GAS_URL` di `js/config.js` belum diisi/salah | Cek ulang URL `/exec`, pastikan diakhiri `/exec` |
| Halaman tampil tapi tanpa gaya (CSS kosong) | Struktur folder `css/`/`js/` tidak ikut ter-push | Lihat "Prosedur Perbaikan: File Rata di Root" di panduan github-pages-deploy-guide |
| Error "Tidak diizinkan" setelah beberapa saat terbuka | Token sesi 8 jam telah habis | Keluar dan masuk kembali |
| Data tidak berubah setelah input baru | Cache SWR masih dalam TTL 60 detik | Klik tombol "Muat Ulang" di Dashboard, atau tunggu 1 menit |

Dibuat otomatis sebagai bagian dari upgrade "Metode Ketiga" AWS Daily Report.
