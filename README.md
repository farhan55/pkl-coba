# PKL Attendance System

Sistem Absensi PKL Mahasiswa - Full Stack Web App dengan React + Express + MongoDB

## 🚀 Features

### Admin Dashboard

- ✅ Buat user baru (mahasiswa/admin)
- ✅ Lihat & hapus device bindings
- ✅ Lihat absensi per hari/kelompok dengan filter
- ✅ Approve/reject izin mahasiswa
- ✅ Statistik real-time

### Mahasiswa Dashboard

- ✅ Countdown timer 10 menit (auto logout)
- ✅ Absen pagi/sore dengan auto-detect sesi
- ✅ Ajukan izin
- ✅ Riwayat absensi
- ✅ Device binding persistent

### Security & Rules

- 🔐 JWT Authentication (15 menit expire)
- 🔐 Bcrypt password hashing
- 📱 Device binding max 2 per user
- 📱 1 device = 1 akun (tidak bisa sharing)
- 📡 WiFi kampus only (IP: 103.209.9.\*)
- ⏰ Absen pagi: 06:00-11:59, Sore: 12:00-18:00

---

## 📦 Tech Stack

**Frontend:**

- React 18 + Vite
- TailwindCSS (responsive mobile-first)
- React Router DOM
- Axios
- Lucide React (icons)

**Backend:**

- Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- Cookie Parser

**Deployment:**

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 🛠️ Installation & Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (free tier)
- Git

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd pkl/10
```

### 2. Backend Setup

```bash
cd pkl-backend

# Install dependencies
npm install

# Copy .env.example ke .env
cp .env.example .env

# Edit .env dengan kredensial Anda:
# - MONGODB_URI: Connection string dari MongoDB Atlas
# - JWT_SECRET: Random string yang kuat
# - FRONTEND_URL: URL frontend (http://localhost:5173 untuk dev)
```

**MongoDB Atlas Setup:**

1. Buat cluster gratis di [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Buat database user & password
3. Whitelist IP: 0.0.0.0/0 (allow from anywhere) atau IP spesifik
4. Copy connection string ke `MONGODB_URI` di .env

```bash
# Run development server
npm run dev

# Server akan jalan di http://localhost:5000
```

### 3. Frontend Setup

```bash
cd pkl-frontend

# Install dependencies
npm install

# Copy .env.example ke .env
cp .env.example .env

# Edit .env:
# VITE_API_URL=http://localhost:5000 (untuk dev)
```

```bash
# Run development server
npm run dev

# App akan jalan di http://localhost:5173
```

### 4. Buat Admin User (First Time)

Gunakan MongoDB Compass atau MongoDB Atlas web interface untuk insert admin pertama:

```javascript
// Collection: users
{
  "nama": "Admin",
  "password": "$2a$10$abc123...", // Hash dari "admin123" (gunakan bcrypt online)
  "role": "admin",
  "devices": [],
  "maxDevices": 2,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Cara mudah hash password:**

1. Jalankan Node.js REPL: `node`
2. Run:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hashSync('admin123', 10);
   ```
3. Copy hasil hash ke field password

**Atau gunakan endpoint (temporary):** Uncomment code di `routes/auth.js` untuk register endpoint.

---

## 🌐 Deployment

### Backend - Render

1. Push code ke GitHub
2. Buat Web Service baru di [Render](https://render.com)
3. Connect GitHub repository
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     MONGODB_URI=<your-atlas-connection-string>
     JWT_SECRET=<your-secret-key>
     FRONTEND_URL=<your-vercel-url>
     NODE_ENV=production
     ```
5. Deploy!

**Note:** Render free tier akan sleep setelah 15 menit idle. First request setelah sleep akan lambat (cold start).

### Frontend - Vercel

1. Push code ke GitHub
2. Import project di [Vercel](https://vercel.com)
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `pkl-frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:**
     ```
     VITE_API_URL=<your-render-backend-url>
     ```
4. Deploy!

### MongoDB Atlas

Sudah setup di langkah backend. Pastikan:

- ✅ Network Access: Allow 0.0.0.0/0 atau IP Render
- ✅ Database Access: User dengan read/write permission

---

## 📱 Usage Guide

### Login

1. Buka app di browser
2. Login dengan nama & password
3. Auto redirect ke dashboard sesuai role

### Admin

1. **Buat User:** Tab Users → Form buat user baru
2. **Lihat Absensi:** Tab Absensi → Filter tanggal/kelompok/sesi
3. **Approve Izin:** Tab Absensi → Klik tombol ✓ atau ✗
4. **Hapus Device:** Tab Devices → Klik tombol hapus

### Mahasiswa

1. **Absen:** Klik tombol "Absen pagi/sore" (sesuai jam)
2. **Izin:** Klik "Ajukan Izin" → Isi form → Kirim
3. **Lihat History:** Scroll ke bawah untuk lihat riwayat
4. **Countdown:** Timer 10 menit di atas, auto logout jika habis

---

## ⚙️ Configuration

### WiFi Check

**Development:** WiFi check di-bypass (default)

**Production:** Enforce IP 103.209.9.\*

Edit di `middleware/wifiKampus.js`:

```javascript
export const wifiKampus = process.env.NODE_ENV === 'production'
  ? checkWifiKampus  // Strict check
  : bypassWifiCheck; // Bypass untuk dev
```

### Session Duration

Default: 10 menit (600 detik)

Edit di `MahasiswaDashboard.jsx`:

```javascript
const [timeRemaining, setTimeRemaining] = useState(600); // Ganti 600 ke nilai lain (dalam detik)
```

### JWT Expiration

Default: 15 menit

Edit di `routes/auth.js`:

```javascript
const token = jwt.sign(payload, secret, { expiresIn: '15m' }); // Ganti '15m'
```

---

## 🐛 Troubleshooting

### Backend tidak connect ke MongoDB

- ✅ Check MONGODB_URI format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- ✅ Check Network Access di Atlas: whitelist IP atau 0.0.0.0/0
- ✅ Check Database User credentials

### Frontend tidak bisa call API

- ✅ Check VITE*API_URL di .env (harus ada `VITE*` prefix!)
- ✅ Check CORS: backend `FRONTEND_URL` harus match dengan frontend URL
- ✅ Check browser console untuk error CORS/Network

### Device binding tidak work

- ✅ Pastikan cookies enabled di browser
- ✅ Check `withCredentials: true` di axios config
- ✅ Check `sameSite` cookie setting (gunakan 'lax' jika frontend/backend beda domain)

### WiFi check selalu reject

- ✅ Set `NODE_ENV=development` di .env backend untuk bypass
- ✅ Atau edit middleware untuk bypass permanent (tidak recommended untuk production)

### Token expired terus

- ✅ JWT expire default 15 menit, ini normal
- ✅ User harus login ulang jika token expired
- ✅ Bisa extend `expiresIn` di auth.js (tapi less secure)

---

## 📄 API Endpoints

### Authentication

- `POST /api/login` - Login user
- `POST /api/absen` - Absensi (mahasiswa, wifi required)
- `POST /api/izin` - Ajukan izin (mahasiswa)
- `GET /api/absensi/saya` - Get history absensi user

### Admin

- `POST /api/admin/users` - Buat user baru
- `GET /api/admin/users` - Get semua users
- `DELETE /api/admin/users/:nama` - Hapus user
- `GET /api/admin/devices` - Get semua devices
- `DELETE /api/admin/devices/:deviceId` - Hapus device
- `GET /api/admin/attendance` - Get absensi (with filters)
- `PATCH /api/admin/attendance/:id/approve` - Approve izin
- `PATCH /api/admin/attendance/:id/reject` - Reject izin
- `GET /api/admin/stats` - Get statistik

---

## 🔒 Security Notes

1. **JWT Secret:** Gunakan string random yang KUAT di production (min 32 karakter)
2. **MongoDB:** Jangan expose connection string di public repository
3. **HTTPS:** Gunakan HTTPS di production (Vercel/Render auto support)
4. **Cookie Security:** `httpOnly: true`, `secure: true` di production
5. **Input Validation:** Sudah ada di model schema, tapi bisa ditambah validator library (joi/yup)

---

## 👨‍💻 Development

### File Structure

```
pkl-backend/
├── models/           # Mongoose schemas
├── routes/           # Express routes
├── middleware/       # Auth & WiFi check
├── server.js         # Entry point
├── package.json
└── .env

pkl-frontend/
├── src/
│   ├── pages/        # Login, Admin, Mahasiswa
│   ├── components/   # ProtectedRoute
│   ├── utils/        # Axios instance
│   ├── App.jsx       # Router
│   └── main.jsx      # Entry point
├── index.html
├── package.json
└── .env
```

### Adding New Features

1. **Backend:**
   - Tambah model di `models/`
   - Tambah route di `routes/`
   - Import & use di `server.js`

2. **Frontend:**
   - Tambah page di `src/pages/`
   - Tambah route di `App.jsx`
   - Call API via `api` instance dari `utils/axios.js`

---

## 📞 Support

Jika ada issue atau pertanyaan, silakan buka GitHub Issues atau contact maintainer.

---

## 📝 License

MIT License - Free to use & modify

---

**Happy Coding! 🎉**
#   p k l - c o b a  
 "# pkl-coba" 
