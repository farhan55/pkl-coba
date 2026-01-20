# 📚 Panduan Lengkap - Sistem Absensi PKL Mahasiswa

> **Dokumentasi lengkap untuk pemula** - Panduan step-by-step menggunakan aplikasi absensi PKL dari instalasi hingga deployment.

---

## 📑 Daftar Isi

1. [Pengenalan Aplikasi](#1--pengenalan-aplikasi)
2. [Persiapan & Instalasi](#2--persiapan--instalasi)
3. [Menjalankan Aplikasi](#3--menjalankan-aplikasi)
4. [Panduan Pengguna Admin](#4--panduan-pengguna-admin)
5. [Panduan Pengguna Mahasiswa](#5--panduan-pengguna-mahasiswa)
6. [Memahami Fitur](#6--memahami-fitur)
7. [Troubleshooting](#7--troubleshooting)
8. [Deployment Production](#8--deployment-production)

---

## 1. 🎯 Pengenalan Aplikasi

### Apa itu Sistem Absensi PKL?

Aplikasi web untuk mengelola kehadiran mahasiswa PKL dengan fitur:

- ✅ Absensi 2x sehari (pagi & sore)
- ✅ Device binding untuk keamanan
- ✅ Hanya bisa absen dari WiFi kampus
- ✅ Auto-logout setelah 10 menit
- ✅ Sistem izin dengan approval admin

### Siapa yang Menggunakan?

**👨‍💼 Admin:**

- Dosen pembimbing PKL
- Staff administrasi
- Dapat mengelola user, device, dan melihat laporan

**👨‍🎓 Mahasiswa:**

- Peserta PKL
- Melakukan absensi harian
- Mengajukan izin jika tidak hadir

### Struktur Folder

```
pkl/10/
├── pkl-backend/           # Server API (Express + MongoDB)
│   ├── models/           # Schema database
│   ├── routes/           # Endpoint API
│   ├── middleware/       # Autentikasi & WiFi check
│   └── server.js         # File utama server
│
├── pkl-frontend/         # Tampilan Web (React)
│   ├── src/
│   │   ├── pages/       # Halaman (Login, Admin, Mahasiswa)
│   │   ├── components/  # Komponen reusable
│   │   └── utils/       # Helper functions
│   └── public/          # Assets statis
│
└── README.md            # Dokumentasi
```

---

## 2. 🛠️ Persiapan & Instalasi

### Kebutuhan Sistem

#### Software yang Harus Diinstall:

1. **Node.js** (v18 atau lebih baru)
   - Download: https://nodejs.org/
   - Pilih versi LTS (Long Term Support)
   - Cek instalasi: `node --version`

2. **MongoDB** (Pilih salah satu)
   - **Opsi A:** MongoDB Compass (Lokal) - https://www.mongodb.com/try/download/compass
   - **Opsi B:** MongoDB Atlas (Cloud/Gratis) - https://www.mongodb.com/cloud/atlas

3. **Git** (Optional, untuk version control)
   - Download: https://git-scm.com/

4. **VS Code** (Recommended)
   - Download: https://code.visualstudio.com/

### Instalasi Aplikasi

#### Langkah 1: Download/Clone Project

```bash
# Jika pakai Git
git clone <repository-url>
cd pkl/10

# Atau extract file ZIP ke folder pkl/10
```

#### Langkah 2: Install Dependencies Backend

```bash
# Masuk ke folder backend
cd pkl-backend

# Install semua package yang dibutuhkan
npm install
```

**Package yang diinstall:**

- express - Framework web server
- mongoose - MongoDB ODM
- bcryptjs - Hash password
- jsonwebtoken - Autentikasi JWT
- cookie-parser - Parse cookies
- cors - Handle CORS
- dotenv - Environment variables

#### Langkah 3: Install Dependencies Frontend

```bash
# Masuk ke folder frontend (dari root project)
cd ../pkl-frontend

# Install semua package yang dibutuhkan
npm install
```

**Package yang diinstall:**

- react - Library UI
- react-router-dom - Routing
- axios - HTTP client
- tailwindcss - CSS framework
- lucide-react - Icon library
- vite - Build tool

#### Langkah 4: Setup Database MongoDB

##### **Opsi A: MongoDB Lokal (Compass)**

1. Install MongoDB Compass
2. Buka aplikasi
3. Connect ke `mongodb://localhost:27017`
4. Database otomatis dibuat saat pertama kali running

##### **Opsi B: MongoDB Atlas (Cloud - Recommended)**

1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Create Free Cluster (M0 - Gratis)
3. Database Access → Add User:
   - Username: `pkluser`
   - Password: `pkl123` (atau password lain, catat!)
4. Network Access → Add IP:
   - Klik "Allow Access from Anywhere" → `0.0.0.0/0`
5. Clusters → Connect → Connect Your Application:
   - Copy connection string
   - Format: `mongodb+srv://pkluser:pkl123@cluster0.xxxxx.mongodb.net/pkl-db`

#### Langkah 5: Konfigurasi Environment Variables

##### **Backend (.env)**

Buat file `.env` di folder `pkl-backend/`:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pkl-db
# Atau pakai Atlas: mongodb+srv://pkluser:pkl123@cluster.mongodb.net/pkl-db

# JWT Secret (ganti dengan random string)
JWT_SECRET=pkl-super-secret-key-2024-change-this

# Server Port
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

##### **Frontend (.env)**

Buat file `.env` di folder `pkl-frontend/`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

⚠️ **PENTING**: File `.env` jangan di-commit ke Git (sudah ada di .gitignore)

---

## 3. 🚀 Menjalankan Aplikasi

### Cara 1: Manual (2 Terminal)

#### Terminal 1 - Backend Server

```bash
# Dari folder pkl-backend
cd pkl-backend
npm run dev
```

**Output yang benar:**

```
🚀 Server running on port 5000
📍 Local: http://localhost:5000
🌍 Environment: development
✅ MongoDB Connected Successfully
📦 Database: pkl-db
```

#### Terminal 2 - Frontend Dev Server

```bash
# Dari folder pkl-frontend (terminal baru)
cd pkl-frontend
npm run dev
```

**Output yang benar:**

```
VITE v5.x.x ready in xxx ms

➜ Local:   http://localhost:5173/
➜ Network: use --host to expose
```

### Membuat User Admin Pertama

Sebelum login, buat user admin dulu:

```bash
# Di folder pkl-backend (terminal baru atau stop server dulu)
cd pkl-backend
node createAdmin.js
```

**Output:**

```
✅ Admin user berhasil dibuat!

📝 Credentials:
  Nama: Admin
  Password: admin123

🚀 Buka http://localhost:5173 dan login
```

### Akses Aplikasi

Buka browser dan akses:

```
http://localhost:5173
```

**Login pertama kali:**

- Nama: `Admin`
- Password: `admin123`

---

## 4. 👨‍💼 Panduan Pengguna Admin

### A. Login Admin

1. Buka http://localhost:5173
2. Masukkan kredensial:
   - Nama: `Admin`
   - Password: `admin123`
3. Klik **Login**
4. Otomatis redirect ke Dashboard Admin

### B. Dashboard Admin - Tab Statistik

Setelah login, Anda akan melihat:

```
┌─────────────────────┐  ┌─────────────────────┐
│ Total Mahasiswa     │  │ Absensi Hari Ini    │
│       25            │  │        18           │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ Izin Pending        │  │ Total Devices       │
│        3            │  │        42           │
└─────────────────────┘  └─────────────────────┘
```

**Informasi:**

- **Total Mahasiswa**: Jumlah user dengan role mahasiswa
- **Absensi Hari Ini**: Total record absensi hari ini
- **Izin Pending**: Izin yang menunggu approval
- **Total Devices**: Total perangkat terdaftar

### C. Tab Users - Manajemen Pengguna

#### Membuat User Baru

1. Klik tab **Users**
2. Isi form "Buat User Baru":
   - **Nama**: Nama lengkap mahasiswa (harus unik)
   - **Password**: Password login (min 6 karakter)
   - **Role**: Pilih `mahasiswa` atau `admin`
   - **Kelompok**: Wajib diisi untuk mahasiswa (contoh: A, B, TI-A)
3. Klik **Buat User**

**Contoh:**

```
Nama: John Doe
Password: john123
Role: Mahasiswa
Kelompok: TI-A
```

#### Melihat Daftar Users

Tabel menampilkan:

- Nama user
- Role (admin/mahasiswa)
- Kelompok
- Jumlah devices terdaftar / max devices (contoh: 1 / 2)

### D. Tab Devices - Manajemen Perangkat

#### Melihat Device Bindings

Tabel menampilkan:

- **Device ID**: ID unik perangkat (UUID)
- **User**: Nama pemilik device
- **Kelompok**: Kelompok mahasiswa
- **Last Used**: Terakhir kali device digunakan
- **Aksi**: Tombol hapus (🗑️)

#### Menghapus Device

1. Klik icon **Hapus** (🗑️) di kolom Aksi
2. Konfirmasi hapus
3. Device dihapus dari user (slot device berkurang)

**Kapan perlu hapus device?**

- Mahasiswa ganti HP/laptop
- Device hilang/rusak
- User sudah mencapai limit 2 devices

### E. Tab Absensi - Laporan Kehadiran

#### Filter Absensi

Gunakan filter untuk cari data spesifik:

1. **Tanggal**: Pilih tanggal (YYYY-MM-DD)
2. **Kelompok**: Ketik nama kelompok (contoh: TI-A)
3. **Sesi**: Pilih Pagi, Sore, atau Semua
4. **Status**: Pilih Hadir, Izin Pending, Izin Approved, Alpa
5. Klik **Filter**

**Contoh filter:**

```
Tanggal: 2026-01-19
Kelompok: TI-A
Sesi: Pagi
Status: Hadir
```

Hasil: Semua mahasiswa kelompok TI-A yang hadir pagi ini.

#### Status Absensi

| Status            | Badge     | Arti                        |
| ----------------- | --------- | --------------------------- |
| **Hadir**         | 🟢 Hijau  | Mahasiswa absen tepat waktu |
| **Izin Pending**  | 🟡 Kuning | Menunggu approval admin     |
| **Izin Approved** | 🔵 Biru   | Izin sudah di-approve       |
| **Alpa**          | 🔴 Merah  | Tidak hadir tanpa izin      |

#### Approve/Reject Izin

Untuk status **Izin Pending**:

1. Lihat kolom **Keterangan** untuk alasan izin
2. Klik **✓ (Approve)** untuk terima izin
3. Atau klik **✗ (Reject)** untuk tolak (status jadi Alpa)

**Tips:**

- Baca keterangan sebelum approve
- Izin yang sudah di-approve tidak bisa diubah
- Reject hanya jika alasan tidak valid

---

## 5. 👨‍🎓 Panduan Pengguna Mahasiswa

### A. Login Mahasiswa

1. Buka http://localhost:5173
2. **Logout** jika masih login sebagai admin
3. Login dengan kredensial mahasiswa:
   - Nama: (dibuat oleh admin)
   - Password: (dibuat oleh admin)
4. Otomatis redirect ke Dashboard Mahasiswa

### B. Dashboard Mahasiswa - Countdown Timer

Setelah login, Anda melihat:

```
╔════════════════════════════════╗
║   Waktu Sesi Tersisa           ║
║                                ║
║        09:45                   ║
║   Auto logout dalam 09:45      ║
║                                ║
║   ████████████░░░░  97%        ║
╚════════════════════════════════╝
```

**Informasi:**

- Timer mulai dari **10:00** (10 menit)
- Hitung mundur otomatis
- Progress bar menunjukkan sisa waktu
- **Auto logout** jika waktu habis

**⏰ Waktu habis?**
Anda akan logout otomatis dan harus login ulang.

### C. Informasi Sesi Absensi

```
📡 WiFi Status: Connected to Campus WiFi
⏰ Sesi saat ini: Pagi (06:00 - 11:59)
```

**Jadwal Absensi:**

- **Pagi**: 06:00 - 11:59
- **Sore**: 12:00 - 18:00

**Di luar jam absen?**
Akan muncul peringatan:

```
⚠️ Di luar jam absen
Absensi hanya bisa dilakukan:
• Pagi: 06:00 - 11:59
• Sore: 12:00 - 18:00
```

### D. Melakukan Absensi

#### Syarat Absensi:

1. ✅ Login sebagai mahasiswa
2. ✅ Terhubung WiFi kampus (IP: 103.209.9.\*)
3. ✅ Waktu di jam absen (pagi/sore)
4. ✅ Belum absen di sesi ini

#### Langkah Absen:

1. Pastikan semua syarat terpenuhi
2. Klik tombol **Absen Pagi** atau **Absen Sore** (otomatis detect)
3. Konfirmasi: "Konfirmasi absen pagi?"
4. Klik **OK**

**Berhasil:**

```
✅ Absen pagi berhasil
```

**Gagal:**

```
❌ Anda sudah absen pagi hari ini
// atau
❌ Absensi hanya bisa dilakukan dari WiFi kampus
IP Anda: 192.168.1.100
```

### E. Mengajukan Izin

#### Kapan Ajukan Izin?

- Sakit
- Ada keperluan keluarga
- Kepentingan kuliah lain
- Tidak bisa hadir ke lokasi PKL

#### Langkah Ajukan Izin:

1. Klik tombol **Ajukan Izin**
2. Isi form:
   - **Tanggal**: Pilih tanggal izin
   - **Sesi**: Pagi atau Sore
   - **Keterangan**: Alasan izin (wajib)
3. Klik **Kirim Izin**

**Contoh:**

```
Tanggal: 2026-01-20
Sesi: Pagi
Keterangan: Sakit demam, ada surat dokter
```

**Status Izin:**

- **Pending** (🟡): Menunggu admin approve
- **Approved** (🔵): Izin diterima
- **Rejected** (🔴): Izin ditolak → status jadi Alpa

### F. Melihat History Absensi

Scroll ke bawah untuk melihat riwayat:

```
┌────────────────────────────────────┐
│ 📅 2026-01-19 | Sesi Pagi         │
│ Status: ✅ Hadir                   │
│ Absen: 19 Jan 2026, 07:23:15      │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ 📅 2026-01-18 | Sesi Sore         │
│ Status: 🔵 Izin Approved           │
│ "Sakit demam, istirahat di rumah" │
│ Absen: 18 Jan 2026, 12:05:43      │
└────────────────────────────────────┘
```

**Informasi:**

- Tanggal & sesi
- Status kehadiran
- Keterangan (jika ada izin)
- Waktu absen tercatat

---

## 6. 💡 Memahami Fitur

### Device Binding

#### Apa itu Device Binding?

Sistem mengikat perangkat (HP/laptop) ke akun mahasiswa untuk mencegah:

- ❌ Sharing akun dengan teman
- ❌ Absen dari banyak perangkat berbeda
- ❌ Manipulasi absensi

#### Bagaimana Cara Kerja?

1. **Login Pertama**: Browser menyimpan cookie `deviceId` (UUID unik)
2. **Login Selanjutnya**: Cookie yang sama dipakai (device recognized)
3. **Device Baru**: Jika login dari HP/laptop lain, dianggap device baru
4. **Limit**: Maksimal 2 devices per mahasiswa

**Contoh:**

```
Mahasiswa A login dari:
1. Laptop pribadi (Device 1) ✅
2. HP Android (Device 2) ✅
3. Laptop kampus (Device 3) ❌ DITOLAK - sudah 2 devices
```

#### Menghapus Device Lama

Jika perlu login dari device ke-3:

1. Minta admin hapus salah satu device lama
2. Atau clear cookies browser (device reset)

### WiFi Restriction

#### Kenapa Harus WiFi Kampus?

Untuk memastikan mahasiswa **benar-benar di lokasi PKL** saat absen.

#### IP yang Diizinkan

```
103.209.9.*
```

Semua IP yang dimulai dengan `103.209.9.` (contoh: 103.209.9.2, 103.209.9.100)

#### Testing di Localhost

Saat development (localhost), sistem otomatis bypass WiFi check.

**Production:**

```
✅ IP: 103.209.9.45 → Diterima
❌ IP: 192.168.1.100 → Ditolak
```

### Auto Logout Timer

#### Kenapa 10 Menit?

- Mencegah session terbuka terlalu lama
- Keamanan jika lupa logout
- Memastikan absen dilakukan segera setelah login

#### Cara Kerja

```
Login → Timer mulai: 10:00
          ↓
      09:59 ... 09:58 ... 09:57
          ↓
      Countdown terus berjalan
          ↓
      00:03 ... 00:02 ... 00:01
          ↓
      00:00 → AUTO LOGOUT!
```

**Tips:**

- Langsung absen setelah login
- Jangan tinggalkan browser terbuka
- Jika timer habis, login ulang

### JWT Authentication

#### Apa itu JWT?

JSON Web Token - sistem autentikasi modern yang aman.

**Token disimpan di:**

- `localStorage.token` - Browser
- Expire: **15 menit**

**Header request:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Token Expired?

Jika token kadaluarsa:

1. Sistem auto-logout
2. Redirect ke halaman login
3. Login ulang untuk dapat token baru

---

## 7. 🔧 Troubleshooting

### Problem 1: Backend Tidak Connect ke MongoDB

**Error:**

```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Solusi:**

1. **MongoDB tidak running:**

   ```bash
   # Windows - Start MongoDB service
   net start MongoDB

   # Atau gunakan MongoDB Atlas (cloud)
   ```

2. **Connection string salah:**

   ```env
   # Check .env file
   MONGODB_URI=mongodb://localhost:27017/pkl-db
   # Atau
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pkl-db
   ```

3. **MongoDB Atlas - IP not whitelisted:**
   - Login MongoDB Atlas
   - Network Access → Add IP → `0.0.0.0/0`

### Problem 2: Frontend Tidak Bisa Call API

**Error di Console:**

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solusi:**

1. **Check VITE_API_URL:**

   ```env
   # File: pkl-frontend/.env
   VITE_API_URL=http://localhost:5000
   ```

2. **Restart Vite setelah edit .env:**

   ```bash
   # Stop (Ctrl+C) lalu
   npm run dev
   ```

3. **Check CORS di backend:**
   ```javascript
   // server.js - pastikan ada
   app.use(cors({
     origin: "http://localhost:5173",
     credentials: true
   }));
   ```

### Problem 3: Login Error 401 - Nama/Password Salah

**Solusi:**

1. **Pastikan admin user sudah dibuat:**

   ```bash
   cd pkl-backend
   node createAdmin.js
   ```

2. **Typo di nama/password:**
   - Nama: `Admin` (capital A)
   - Password: `admin123`

3. **Check database:**
   - Buka MongoDB Compass
   - Database `pkl-db` → Collection `users`
   - Cari user dengan nama `Admin`

### Problem 4: WiFi Check Error (IP Ditolak)

**Error:**

```
❌ Absensi hanya bisa dilakukan dari WiFi kampus
IP Anda: 192.168.1.100
```

**Solusi:**

1. **Development mode (localhost):**
   - Sistem otomatis bypass IP 127.0.0.1/::1

2. **Testing dengan IP real:**
   - Edit `middleware/wifiKampus.js`
   - Tambahkan IP Anda ke whitelist

3. **Production:**
   - Pastikan terhubung WiFi kampus (103.209.9.\*)

### Problem 5: Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solusi:**

1. **Kill process di port 5000:**

   ```powershell
   # Windows PowerShell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   ```

2. **Atau ganti port:**
   ```env
   # .env
   PORT=5001
   ```

### Problem 6: Device Limit Reached

**Error:**

```
❌ Maksimal 2 device per user
```

**Solusi:**

**Opsi A - Hapus device lama (via Admin):**

1. Login sebagai admin
2. Tab Devices
3. Cari device user tersebut
4. Hapus salah satu device

**Opsi B - Clear cookies:**

1. Buka DevTools (F12)
2. Application → Cookies → Clear
3. Login ulang (device baru terdaftar)

---

## 8. 🌐 Deployment Production

### A. Deploy Database (MongoDB Atlas)

1. **Create Free Cluster:**
   - https://www.mongodb.com/cloud/atlas
   - Pilih M0 Free Tier
   - Region: Singapore (terdekat)

2. **Create Database User:**
   - Username: `pklprod`
   - Password: (strong password)

3. **Whitelist IP:**
   - Network Access → `0.0.0.0/0`

4. **Get Connection String:**
   ```
   mongodb+srv://pklprod:PASSWORD@cluster.mongodb.net/pkl-db
   ```

### B. Deploy Backend (Render.com)

1. **Push code ke GitHub:**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Web Service di Render:**
   - https://render.com → New Web Service
   - Connect GitHub repository
   - Root Directory: `pkl-backend`

3. **Settings:**

   ```
   Name: pkl-backend
   Branch: main
   Root Directory: pkl-backend
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables:**

   ```
   MONGODB_URI=mongodb+srv://pklprod:PASSWORD@cluster.mongodb.net/pkl-db
   JWT_SECRET=production-super-secret-key-min-32-chars
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   PORT=5000
   ```

5. **Deploy** → Tunggu hingga selesai

6. **Copy URL:** `https://pkl-backend-xyz.onrender.com`

### C. Deploy Frontend (Vercel)

1. **Create Project di Vercel:**
   - https://vercel.com → New Project
   - Import GitHub repository
   - Root Directory: `pkl-frontend`

2. **Settings:**

   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Environment Variables:**

   ```
   VITE_API_URL=https://pkl-backend-xyz.onrender.com
   ```

4. **Deploy** → Tunggu hingga selesai

5. **Copy URL:** `https://your-app.vercel.app`

### D. Update Backend dengan Frontend URL

1. Kembali ke Render Dashboard
2. Environment → Edit `FRONTEND_URL`
3. Isi: `https://your-app.vercel.app`
4. Save → Manual Deploy

### E. Test Production

1. Buka URL Vercel: `https://your-app.vercel.app`
2. Login dengan Admin
3. Test semua fitur

**⚠️ PENTING:**

- Ganti password admin default!
- WiFi restriction aktif di production
- Backup database secara berkala

---

## 🎓 Tips & Best Practices

### Untuk Admin:

1. **Backup data berkala:**
   - Export collection dari MongoDB Atlas
   - Download CSV laporan absensi

2. **Monitor izin pending:**
   - Cek tab Absensi setiap hari
   - Approve/reject izin tepat waktu

3. **Kelola device:**
   - Hapus device yang tidak aktif
   - Monitor device count per user

### Untuk Mahasiswa:

1. **Jangan share akun:**
   - Device binding akan detect

2. **Absen tepat waktu:**
   - Segera setelah sampai lokasi
   - Jangan tunggu timer hampir habis

3. **Izin jauh-jauh hari:**
   - Submit izin sebelum tanggal yang dimaksud
   - Beri keterangan jelas

### Development:

1. **Environment variables:**
   - Jangan commit `.env` ke Git
   - Gunakan `.env.example` sebagai template

2. **Testing:**
   - Test di berbagai browser
   - Test device binding dengan clear cookies
   - Test WiFi check dengan IP berbeda

3. **Database:**
   - Backup sebelum update schema
   - Use transactions untuk operasi critical

---

## 📞 Support & Kontak

**Issues?**

- Buka GitHub Issues
- Email: support@example.com

**Documentation:**

- README.md - Quick start
- PANDUAN_LENGKAP.md - Dokumentasi ini
- QUICK_START.md - Deployment guide

---

## 📄 License

MIT License - Free to use & modify

---

**Selamat Menggunakan Sistem Absensi PKL! 🎉**

Jika ada pertanyaan atau masalah, jangan ragu untuk bertanya.
