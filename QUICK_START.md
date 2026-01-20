# QUICK START GUIDE

## 🚀 Langkah Cepat Deploy ke Production

### 1. Setup MongoDB Atlas (5 menit)

1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis (M0)
3. Database Access → Add Database User (username + password)
4. Network Access → Add IP: `0.0.0.0/0` (allow all)
5. Connect → Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/pkl-db`

### 2. Deploy Backend ke Render (5 menit)

1. Push code ke GitHub
2. Buka https://render.com → New Web Service
3. Connect repository `pkl/10/pkl-backend`
4. Settings:
   - Name: `pkl-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Environment Variables → Add:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pkl-db
   JWT_SECRET=your-super-secret-key-min-32-chars
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Create Web Service
7. Copy URL: `https://pkl-backend-xyz.onrender.com`

### 3. Deploy Frontend ke Vercel (3 menit)

1. Push code ke GitHub
2. Buka https://vercel.com → New Project
3. Import repository
4. Settings:
   - Root Directory: `pkl-frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Environment Variables → Add:
   ```
   VITE_API_URL=https://pkl-backend-xyz.onrender.com
   ```
6. Deploy
7. Copy URL: `https://your-app.vercel.app`

### 4. Update Backend FRONTEND_URL

1. Kembali ke Render dashboard
2. Environment → Edit `FRONTEND_URL` dengan URL Vercel
3. Save & redeploy

### 5. Buat Admin User Pertama

**Option A: MongoDB Atlas Web Interface**

1. Atlas → Browse Collections → Database: pkl-db
2. Create Collection: `users`
3. Insert Document:

```json
{
  "nama": "Admin",
  "password": "$2a$10$K7BqhHgL5tQzP1jY8W7CXeK7Y8YzJ9VZjK5L6X8M9N0P1Q2R3S4T5",
  "role": "admin",
  "devices": [],
  "maxDevices": 2,
  "createdAt": {"$date": "2024-01-01T00:00:00.000Z"},
  "updatedAt": {"$date": "2024-01-01T00:00:00.000Z"}
}
```

Password hash di atas = `admin123`

**Option B: Node.js Script (Lokal)**

1. Di folder `pkl-backend`, buat file `createAdmin.js`:

```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const password = await bcrypt.hash('admin123', 10);

  const User = mongoose.model('User', new mongoose.Schema({
    nama: String,
    password: String,
    role: String,
    devices: Array,
    maxDevices: Number
  }));

  await User.create({
    nama: 'Admin',
    password,
    role: 'admin',
    devices: [],
    maxDevices: 2
  });

  console.log('Admin created!');
  process.exit(0);
};

createAdmin();
```

2. Run:

```bash
node createAdmin.js
```

### 6. Test App

1. Buka URL Vercel
2. Login: `Admin` / `admin123`
3. Buat user mahasiswa dari admin dashboard
4. Logout & login sebagai mahasiswa
5. Test absensi (perlu WiFi kampus atau bypass di middleware)

---

## 🔧 Local Development

```bash
# Terminal 1 - Backend
cd pkl-backend
npm install
cp .env.example .env
# Edit .env dengan MongoDB Atlas URI
npm run dev

# Terminal 2 - Frontend
cd pkl-frontend
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:5000
npm run dev
```

Buka http://localhost:5173

---

## 📝 Credentials Default

**Admin:**

- Username: `Admin`
- Password: `admin123`

**Mahasiswa (buat dari admin dashboard):**

- Contoh: `John Doe` / `password123` / Kelompok A

---

## ⚠️ Production Checklist

- [ ] MongoDB URI aman (tidak di-commit ke Git)
- [ ] JWT_SECRET kuat (min 32 random chars)
- [ ] FRONTEND_URL match dengan Vercel URL
- [ ] NODE_ENV=production di Render
- [ ] WiFi check enabled (atau sesuaikan middleware)
- [ ] Ganti password admin default
- [ ] Test semua fitur: login, absen, izin, approve

---

## 🆘 Troubleshooting Cepat

**Backend error di Render:**

- Check Logs di Render dashboard
- Pastikan MongoDB URI valid & IP whitelisted
- Test connection string dengan MongoDB Compass

**Frontend tidak connect ke backend:**

- Check VITE_API_URL di Vercel env vars
- Check CORS: FRONTEND_URL di backend harus exact match
- Open browser console untuk lihat error

**Device binding tidak work:**

- Pastikan frontend & backend di-deploy (bukan localhost)
- Check cookies di browser DevTools
- Jika beda domain, set sameSite='none' & secure=true

**WiFi check selalu reject:**

- Set NODE_ENV=development di Render (temporary)
- Atau edit middleware: `export const wifiKampus = bypassWifiCheck;`

---

**Good luck! 🚀**
