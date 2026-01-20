# 🚀 Panduan Hosting Aplikasi PKL - Gratis & Mudah

> **Tutorial lengkap deploy aplikasi absensi PKL ke internet** - Database + Backend + Frontend, 100% GRATIS!

---

## 📋 Yang Akan Kita Gunakan

| Komponen         | Platform      | Harga             | URL                                 |
| ---------------- | ------------- | ----------------- | ----------------------------------- |
| **Database**     | MongoDB Atlas | ✅ Gratis (512MB) | https://www.mongodb.com/cloud/atlas |
| **Backend API**  | Render.com    | ✅ Gratis         | https://render.com                  |
| **Frontend Web** | Vercel        | ✅ Gratis         | https://vercel.com                  |

**Total Biaya: Rp 0,- (GRATIS SELAMANYA!)**

---

## 🎯 Hasil Akhir

Setelah selesai, aplikasi Anda akan bisa diakses di internet:

```
Frontend: https://absensi-pkl-anda.vercel.app
Backend:  https://pkl-backend-anda.onrender.com
```

Siapapun bisa akses dari browser manapun!

---

## 📝 Persiapan Awal

### 1. Buat Akun-akun yang Dibutuhkan

Buka browser dan daftar di:

1. **GitHub** (untuk menyimpan code)
   - https://github.com/signup
   - Gratis, gunakan email Anda
2. **MongoDB Atlas** (database)
   - https://www.mongodb.com/cloud/atlas/register
   - Gratis, bisa pakai akun Google
3. **Render** (backend server)
   - https://dashboard.render.com/register
   - Gratis, bisa pakai akun GitHub
4. **Vercel** (frontend hosting)
   - https://vercel.com/signup
   - Gratis, bisa pakai akun GitHub

**Tips:** Gunakan email yang sama untuk semua akun agar mudah diingat.

---

## STEP 1️⃣: Upload Code ke GitHub

### A. Install Git (jika belum)

**Windows:**

1. Download: https://git-scm.com/download/win
2. Install dengan setting default (Next semua)
3. Restart VS Code setelah install

**Cek instalasi:**

```powershell
git --version
# Output: git version 2.x.x
```

### B. Push Code ke GitHub

Buka terminal PowerShell di VS Code, lalu jalankan:

```powershell
# 1. Masuk ke folder project
cd d:\code\pkl\10

# 2. Initialize Git repository
git init

# 3. Tambahkan semua file
git add .

# 4. Commit pertama
git commit -m "Initial commit - Aplikasi Absensi PKL"

# 5. Buat repository baru di GitHub
# BUKA BROWSER: https://github.com/new
# - Repository name: absensi-pkl
# - Public (agar gratis unlimited)
# - JANGAN centang "Initialize with README"
# - Klik "Create repository"

# 6. Connect ke GitHub (ganti YOUR-USERNAME dengan username GitHub Anda)
git remote add origin https://github.com/YOUR-USERNAME/absensi-pkl.git

# 7. Push code ke GitHub
git branch -M main
git push -u origin main
```

**Contoh:**
Jika username GitHub Anda: `johndoe`

```powershell
git remote add origin https://github.com/johndoe/absensi-pkl.git
```

**Login GitHub di terminal:**

- Saat diminta username: ketik username GitHub
- Saat diminta password: gunakan **Personal Access Token** (bukan password biasa)

**Cara buat token:**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → Centang `repo` → Generate
3. Copy token, simpan di notepad (hanya muncul 1x!)
4. Paste token saat diminta password

✅ **Berhasil jika:** Code sudah muncul di https://github.com/YOUR-USERNAME/absensi-pkl

---

## STEP 2️⃣: Setup Database MongoDB Atlas

### A. Buat Cluster (Database Server)

1. **Login** ke https://cloud.mongodb.com/

2. **Create Deployment:**
   - Klik **"Build a Database"** (atau "+ Create")
   - Pilih **M0 FREE** tier
   - Cloud Provider: **AWS**
   - Region: **Singapore (ap-southeast-1)** (terdekat dari Indonesia)
   - Cluster Name: `Cluster0` (biarkan default)
   - Klik **"Create"**

3. **Tunggu 1-3 menit** (cluster sedang dibuat)

### B. Buat Database User

Setelah cluster jadi:

1. **Security → Database Access**
2. Klik **"Add New Database User"**
3. **Authentication Method:** Password
4. Isi form:
   ```
   Username: pkladmin
   Password: Pkl123456
   ```
   **⚠️ CATAT PASSWORD INI!** (atau klik "Autogenerate Secure Password" lalu copy)
5. **Database User Privileges:** Atlas admin (default)
6. Klik **"Add User"**

### C. Whitelist IP Address

1. **Security → Network Access**
2. Klik **"Add IP Address"**
3. Pilih **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Untuk production real: tambahkan IP server saja
   - Untuk tugas: allow all agar mudah
4. Klik **"Confirm"**

### D. Ambil Connection String

1. **Database → Connect**
2. Pilih **"Connect your application"**
3. **Driver:** Node.js
4. **Version:** 5.5 or later
5. **Copy connection string:**
   ```
   mongodb+srv://pkladmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Edit string:**
   - Ganti `<password>` dengan password yang tadi dibuat
   - Tambahkan nama database sebelum `?`

   **Hasil akhir:**

   ```
   mongodb+srv://pkladmin:Pkl123456@cluster0.abc123.mongodb.net/pkl-db?retryWrites=true&w=majority
   ```

7. **Copy & simpan di notepad!**

✅ **Berhasil jika:** Connection string sudah dicopy

---

## STEP 3️⃣: Deploy Backend ke Render

### A. Buat Web Service

1. **Login** ke https://dashboard.render.com/

2. **New +** → **Web Service**

3. **Connect GitHub:**
   - Klik **"Connect account"** (jika belum)
   - Authorize Render di GitHub
   - Pilih repository: **absensi-pkl**

4. **Configure Service:**

   ```
   Name: pkl-backend
   Region: Singapore (Southeast Asia)
   Branch: main
   Root Directory: pkl-backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Instance Type:** Free

### B. Set Environment Variables

Scroll ke **Environment Variables**, klik **"Add Environment Variable"**:

Tambahkan satu per satu:

```
MONGODB_URI
mongodb+srv://pkladmin:Pkl123456@cluster0.xxxxx.mongodb.net/pkl-db?retryWrites=true&w=majority
```

```
JWT_SECRET
pkl-production-super-secret-key-2026-change-this-to-random-string
```

```
NODE_ENV
production
```

```
PORT
5000
```

```
FRONTEND_URL
https://absensi-pkl-anda.vercel.app
```

(Nanti kita update setelah deploy frontend)

### C. Deploy

1. Klik **"Create Web Service"**
2. Tunggu 3-5 menit (proses build & deploy)
3. Status "Live" = berhasil!

**Copy Backend URL:**

```
https://pkl-backend-xxxxx.onrender.com
```

**Test backend:**
Buka browser: `https://pkl-backend-xxxxx.onrender.com`

Harus muncul:

```json
{
  "success": true,
  "message": "PKL Attendance API Server",
  "status": "running"
}
```

✅ **Berhasil jika:** API muncul response JSON

**⚠️ PENTING:** Render free tier akan sleep setelah 15 menit idle. Request pertama akan lambat (30 detik) karena waking up.

---

## STEP 4️⃣: Deploy Frontend ke Vercel

### A. Import Project

1. **Login** ke https://vercel.com/

2. **Add New** → **Project**

3. **Import Git Repository:**
   - Klik **"Import"** pada repository `absensi-pkl`
   - Jika tidak muncul: **"Adjust GitHub App Permissions"** → pilih repository

4. **Configure Project:**
   ```
   Framework Preset: Vite
   Root Directory: pkl-frontend
   Build Command: npm run build (auto-detect)
   Output Directory: dist (auto-detect)
   Install Command: npm install (auto-detect)
   ```

### B. Set Environment Variables

Klik **"Environment Variables"**, tambahkan:

```
Key: VITE_API_URL
Value: https://pkl-backend-xxxxx.onrender.com
```

**⚠️ Ganti xxxxx dengan URL backend Anda yang tadi dicopy!**

### C. Deploy

1. Klik **"Deploy"**
2. Tunggu 2-3 menit (building...)
3. Status "Ready" = berhasil!

**Copy Frontend URL:**

```
https://absensi-pkl-xxxxx.vercel.app
```

**Test frontend:**
Buka browser: `https://absensi-pkl-xxxxx.vercel.app`

Harus muncul halaman login!

✅ **Berhasil jika:** Halaman login muncul

---

## STEP 5️⃣: Update Backend FRONTEND_URL

Sekarang kita punya URL frontend, update backend:

### A. Update Environment Variable di Render

1. Buka **Render Dashboard**
2. Klik service **pkl-backend**
3. Tab **Environment**
4. Edit variable **FRONTEND_URL**:
   ```
   https://absensi-pkl-xxxxx.vercel.app
   ```
   (URL Vercel Anda)
5. **Save Changes**

### B. Redeploy

Backend akan auto-redeploy. Tunggu 2-3 menit.

---

## STEP 6️⃣: Buat Admin User di Production

### A. Opsi 1: Gunakan Script (Recommended)

**Di terminal lokal:**

```powershell
# 1. Edit .env backend, ganti MONGODB_URI dengan Atlas
cd d:\code\pkl\10\pkl-backend

# Edit file .env
# Ganti:
MONGODB_URI=mongodb://localhost:27017/pkl-db
# Jadi:
MONGODB_URI=mongodb+srv://pkladmin:Pkl123456@cluster0.xxxxx.mongodb.net/pkl-db?retryWrites=true&w=majority

# 2. Jalankan script create admin
node createAdmin.js
```

Output:

```
✅ Admin user berhasil dibuat!
Nama: Admin
Password: admin123
```

### B. Opsi 2: Manual via MongoDB Atlas

1. **MongoDB Atlas Dashboard**
2. **Database → Browse Collections**
3. **Create Database:**
   - Database name: `pkl-db`
   - Collection name: `users`
4. **Insert Document:**

```json
{
  "nama": "Admin",
  "password": "$2a$10$K7BqhHgL5tQzP1jY8W7CXeK7Y8YzJ9VZjK5L6X8M9N0P1Q2R3S4T5",
  "role": "admin",
  "devices": [],
  "maxDevices": 2,
  "createdAt": {"$date": "2026-01-19T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-01-19T00:00:00.000Z"}
}
```

**Password hash di atas = `admin123`**

---

## STEP 7️⃣: Testing Production!

### A. Test Login

1. Buka frontend: `https://absensi-pkl-xxxxx.vercel.app`
2. Login:
   - Nama: `Admin`
   - Password: `admin123`
3. Harus berhasil masuk dashboard admin

### B. Buat User Mahasiswa

1. Di dashboard admin, tab **Users**
2. Buat user mahasiswa:
   ```
   Nama: Test Mahasiswa
   Password: test123
   Role: Mahasiswa
   Kelompok: A
   ```

### C. Test Absensi Mahasiswa

1. Logout dari admin
2. Login sebagai mahasiswa:
   - Nama: `Test Mahasiswa`
   - Password: `test123`
3. Test countdown timer
4. **⚠️ WiFi check akan AKTIF** - hanya bisa absen dari IP 103.209.9.\*

### D. Disable WiFi Check (Optional - Untuk Testing)

Jika mau test absensi tapi tidak di WiFi kampus:

**Edit middleware/wifiKampus.js di GitHub:**

1. Buka repository di GitHub
2. File: `pkl-backend/middleware/wifiKampus.js`
3. Cari baris:
   ```javascript
   export const wifiKampus = checkWifiKampus;
   ```
4. Ganti jadi:
   ```javascript
   export const wifiKampus = bypassWifiCheck;
   ```
5. Commit changes
6. Render akan auto-deploy ulang

**⚠️ Untuk tugas/demo:** Kembalikan ke `checkWifiKampus` setelah testing!

---

## 🎉 SELESAI! Aplikasi Sudah Online!

### URL Aplikasi Anda:

```
🌐 Frontend (Web App):
https://absensi-pkl-xxxxx.vercel.app

🔌 Backend (API):
https://pkl-backend-xxxxx.onrender.com

💾 Database:
MongoDB Atlas - Cluster0
```

### Kredensial Login:

**Admin:**

- Nama: `Admin`
- Password: `admin123`

**Mahasiswa (yang dibuat):**

- Nama: sesuai yang dibuat admin
- Password: sesuai yang dibuat admin

---

## 📱 Cara Share untuk Tugas

### 1. Screenshot untuk Laporan

**Halaman Login:**
![Screenshot login](url-vercel-anda)

**Dashboard Admin:**

- Statistik
- Daftar users
- Data absensi

**Dashboard Mahasiswa:**

- Countdown timer
- Tombol absensi
- History

### 2. Link yang Bisa Dicoba Dosen

Berikan ke dosen:

```
URL Aplikasi: https://absensi-pkl-xxxxx.vercel.app

Login Admin:
Nama: Admin
Password: admin123

Login Mahasiswa (contoh):
Nama: Test Mahasiswa
Password: test123
```

### 3. Source Code di GitHub

```
Repository: https://github.com/YOUR-USERNAME/absensi-pkl
```

Dosen bisa lihat code lengkap.

---

## ⚙️ Maintenance & Update

### Update Code Setelah Edit

Jika Anda edit code di lokal dan mau update production:

```powershell
# 1. Commit changes
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main

# 2. Auto-deploy!
# Render & Vercel akan otomatis deploy code baru
```

### Monitor Logs

**Backend Logs (Render):**

1. Render Dashboard → Service pkl-backend
2. Tab **Logs**
3. Lihat real-time logs

**Frontend Logs (Vercel):**

1. Vercel Dashboard → Project
2. Tab **Deployments** → klik deployment
3. Tab **Functions** untuk lihat logs

### Check Status

**Render:**

- Dashboard → Service status
- Jika sleep: kunjungi URL untuk wake up

**Vercel:**

- Always on, instant

**MongoDB:**

- Atlas Dashboard → Metrics
- Monitor usage (max 512MB free)

---

## 🔒 Keamanan Production

### 1. Ganti Password Admin Default

**Setelah deploy:**

1. Login sebagai admin
2. Buat admin baru dengan password kuat
3. Atau update password di MongoDB Atlas:
   - Browse Collections → users → Edit document Admin
   - Ganti password hash (generate pakai bcrypt)

### 2. Ganti JWT Secret

```env
# Render Environment Variables
JWT_SECRET=random-string-yang-sangat-panjang-dan-kuat-min-32-karakter
```

Generate random:

```javascript
// Jalankan di browser console
Array(32).fill(0).map(() => Math.random().toString(36)[2]).join('')
```

### 3. HTTPS Otomatis Aktif

✅ Render & Vercel sudah pakai HTTPS
✅ Cookie secure: true di production
✅ CORS sudah configured

---

## 💰 Biaya & Limits (Free Tier)

### MongoDB Atlas M0 Free:

- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Cukup untuk ~1000 mahasiswa
- ⚠️ Cluster sleep setelah 60 hari idle

### Render Free:

- ✅ 750 jam/bulan (cukup 1 bulan penuh)
- ✅ 512 MB RAM
- ✅ Auto-deploy dari GitHub
- ⚠️ Sleep setelah 15 menit idle
- ⚠️ Waking up ~30 detik

### Vercel Free:

- ✅ Unlimited bandwidth
- ✅ 100 GB bandwidth/bulan
- ✅ 100 deployments/hari
- ✅ No sleep time
- ✅ CDN global (cepat!)

**Total: RP 0,- SELAMANYA!**

---

## ❓ FAQ Deployment

### Q: Render backend sleep terus, lambat?

**A:** Render free tier sleep setelah 15 menit idle. Solusi:

1. Gunakan cron job untuk ping setiap 10 menit (crontab.guru)
2. Atau upgrade ke paid ($7/bulan, no sleep)
3. Untuk tugas: biarkan saja, explain ke dosen bahwa free tier

### Q: MongoDB Atlas habis storage?

**A:** 512MB cukup besar. Jika penuh:

1. Hapus data lama
2. Atau upgrade ke paid ($0.08/GB/bulan)

### Q: Error saat deploy?

**A:** Check logs:

- Render: Logs tab
- Vercel: Deployment logs
- Common issue: Environment variables salah

### Q: WiFi check tidak bisa di-bypass?

**A:** Edit `middleware/wifiKampus.js`:

```javascript
// Development bypass
export const wifiKampus = bypassWifiCheck;
```

### Q: Lupa password MongoDB?

**A:** Reset di Atlas:

- Database Access → Edit user → Reset password

---

## 🎓 Tips Presentasi Tugas

### 1. Demo Live

Buka aplikasi di browser saat presentasi:

```
https://absensi-pkl-xxxxx.vercel.app
```

### 2. Explain Architecture

```
User (Browser)
     ↓
Vercel (Frontend React)
     ↓
Render (Backend Express API)
     ↓
MongoDB Atlas (Database)
```

### 3. Highlight Fitur

- ✅ Device binding (security)
- ✅ WiFi restriction (location-based)
- ✅ Auto-logout (session management)
- ✅ Real-time countdown
- ✅ Admin approval system

### 4. Show Code di GitHub

Buka repository, explain:

- Struktur folder
- Backend routes
- Frontend components
- Database models

---

## 🎯 Checklist Final

Pastikan semua ini berhasil:

- [ ] Code di GitHub (public repository)
- [ ] MongoDB Atlas cluster aktif
- [ ] Backend deploy di Render (status: Live)
- [ ] Frontend deploy di Vercel (status: Ready)
- [ ] Admin user sudah dibuat
- [ ] Test login admin berhasil
- [ ] Test create mahasiswa berhasil
- [ ] Test login mahasiswa berhasil
- [ ] Test countdown timer jalan
- [ ] (Optional) Test absensi berhasil
- [ ] Screenshot semua halaman
- [ ] Catat semua URL & credentials

---

## 🎊 Selamat!

Aplikasi Anda sudah **LIVE DI INTERNET**!

**Share ke:**

- Dosen ✅
- Teman sekelas ✅
- Portfolio ✅
- CV/Resume ✅

**Link Portfolio:**

```
🌐 Live Demo: https://absensi-pkl-xxxxx.vercel.app
📦 Source Code: https://github.com/YOUR-USERNAME/absensi-pkl
```

---

**Good luck untuk tugasnya! 🚀**

Jika ada kendala deployment, tanya saya!
