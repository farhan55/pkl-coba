import express from "express";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import DeviceBinding from "../models/DeviceBinding.js";
import { verifyToken, isMahasiswa } from "../middleware/auth.js";
import { checkWifiKampus } from "../middleware/wifiKampus.js";

const router = express.Router();

/**
 * POST /api/login
 * Login user (admin atau mahasiswa)
 *
 * LOGIC DEVICE BINDING:
 * 1. Cek cookie deviceId, jika ada reuse
 * 2. Jika tidak ada, generate UUID baru
 * 3. Check DeviceBinding: 1 device = 1 user
 * 4. Check max 2 devices per user
 * 5. Set persistent cookie (7 hari)
 */
router.post("/login", async (req, res) => {
  try {
    console.log("📨 Login request received");
    console.log("   Body:", req.body);
    console.log("   Content-Type:", req.headers["content-type"]);

    const { nama, password } = req.body;

    // Validasi input
    if (!nama || !password) {
      console.log("❌ Input tidak lengkap:", { nama, password });
      return res.status(400).json({
        success: false,
        message: "Nama dan password harus diisi",
      });
    }

    // Cari user by nama
    const user = await User.findOne({ nama });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Nama atau password salah",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Nama atau password salah",
      });
    }

    // === DEVICE BINDING LOGIC ===

    // 1. Cek existing cookie deviceId
    let deviceId = req.cookies.deviceId;

    // 2. Jika tidak ada, generate baru
    if (!deviceId) {
      deviceId = uuidv4();
      console.log("Generated new deviceId:", deviceId);
    } else {
      console.log("Reusing existing deviceId:", deviceId);
    }

    // 3. Check apakah device sudah di-bind ke user lain
    const deviceConflict = await DeviceBinding.checkConflict(deviceId, nama);

    if (deviceConflict) {
      return res.status(403).json({
        success: false,
        message: deviceConflict.message,
        conflict: true,
      });
    }

    // 4. Check apakah device sudah terdaftar di user ini
    const hasDevice = user.hasDevice(deviceId);

    if (!hasDevice) {
      // Device baru, check apakah sudah mencapai max
      if (user.devices.length >= user.maxDevices) {
        return res.status(403).json({
          success: false,
          message: `Maksimal ${user.maxDevices} device per user. Hapus device lama terlebih dahulu.`,
          devicesCount: user.devices.length,
          maxDevices: user.maxDevices,
        });
      }

      // Add device baru
      user.addDevice(deviceId);
      await user.save();

      // Bind device di DeviceBinding collection
      await DeviceBinding.bindDevice(deviceId, nama, user.kelompok || "N/A");

      console.log(`New device added for ${nama}:`, deviceId);
    } else {
      // Update usage count
      user.updateDeviceUsage(deviceId);
      await user.save();

      // Update lastUsed di DeviceBinding
      await DeviceBinding.bindDevice(deviceId, nama, user.kelompok || "N/A");

      console.log(`Device usage updated for ${nama}:`, deviceId);
    }

    // === GENERATE JWT TOKEN ===

    const login_time = new Date();

    const token = jwt.sign(
      {
        nama: user.nama,
        role: user.role,
        kelompok: user.kelompok,
        deviceId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }, // Token expire 15 menit
    );

    // Set persistent cookie (7 hari)
    res.cookie("deviceId", deviceId, {
      httpOnly: true,
      secure: false, // Allow HTTP di development
      sameSite: "lax", // Lax untuk localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Response ke client
    res.json({
      success: true,
      message: "Login berhasil",
      token,
      login_time,
      user: {
        nama: user.nama,
        role: user.role,
        kelompok: user.kelompok,
        devicesCount: user.devices.length,
        maxDevices: user.maxDevices,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat login",
      error: error.message,
    });
  }
});

/**
 * POST /api/absen
 * Absensi mahasiswa (pagi/sore auto-detect)
 *
 * REQUIREMENTS:
 * - Auth: Mahasiswa only
 * - WiFi: IP 103.209.9.*
 * - Sesi: Auto-detect pagi (06:00-11:59) / sore (12:00-18:00)
 * - No duplicate: 1 sesi per hari
 */
router.post(
  "/absen",
  verifyToken,
  isMahasiswa,
  checkWifiKampus,
  async (req, res) => {
    try {
      const { login_time } = req.body;
      const { nama, kelompok } = req.user;

      // Validasi login_time
      if (!login_time) {
        return res.status(400).json({
          success: false,
          message: "Login time harus ada",
        });
      }

      // Check jam absen
      const jamCheck = Attendance.cekJamAbsen();

      if (!jamCheck.valid) {
        return res.status(400).json({
          success: false,
          message: jamCheck.message,
        });
      }

      const sesi = jamCheck.sesi;
      const tanggal = Attendance.getTanggalSekarang();

      // Check apakah sudah absen di sesi ini
      const existingAbsen = await Attendance.findOne({
        nama,
        tanggal,
        sesi,
      });

      if (existingAbsen) {
        return res.status(400).json({
          success: false,
          message: `Anda sudah absen ${sesi} hari ini`,
          existing: existingAbsen,
        });
      }

      // Get deviceId from cookie
      const deviceId = req.cookies.deviceId;

      // Create absensi record
      const absensi = await Attendance.create({
        nama,
        tanggal,
        sesi,
        status: "hadir",
        wifi_ip: req.clientIP,
        deviceId,
        login_time: new Date(login_time),
        absen_time: new Date(),
        kelompok,
      });

      res.json({
        success: true,
        message: `Absen ${sesi} berhasil`,
        data: absensi,
      });
    } catch (error) {
      console.error("Absen error:", error);

      // Duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Anda sudah absen di sesi ini",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error saat absen",
        error: error.message,
      });
    }
  },
);

/**
 * POST /api/izin
 * Ajukan izin (tidak masuk)
 * Status: izin_pending (perlu approval admin)
 */
router.post("/izin", verifyToken, isMahasiswa, async (req, res) => {
  try {
    const { tanggal, sesi, keterangan, login_time } = req.body;
    const { nama, kelompok } = req.user;

    // Validasi input
    if (!tanggal || !sesi || !keterangan) {
      return res.status(400).json({
        success: false,
        message: "Tanggal, sesi, dan keterangan harus diisi",
      });
    }

    // Check duplikasi
    const existingIzin = await Attendance.findOne({
      nama,
      tanggal,
      sesi,
    });

    if (existingIzin) {
      return res.status(400).json({
        success: false,
        message: `Anda sudah ada record absensi untuk ${sesi} pada ${tanggal}`,
        existing: existingIzin,
      });
    }

    // Get deviceId
    const deviceId = req.cookies.deviceId;

    // Create izin record
    const izin = await Attendance.create({
      nama,
      tanggal,
      sesi,
      status: "izin_pending",
      keterangan,
      deviceId,
      login_time: new Date(login_time || Date.now()),
      kelompok,
    });

    res.json({
      success: true,
      message: "Izin berhasil diajukan. Menunggu approval admin.",
      data: izin,
    });
  } catch (error) {
    console.error("Izin error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah mengajukan izin untuk sesi ini",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error saat mengajukan izin",
      error: error.message,
    });
  }
});

/**
 * GET /api/absensi/saya
 * Get history absensi user yang login
 */
router.get("/absensi/saya", verifyToken, async (req, res) => {
  try {
    const { nama } = req.user;

    // Get semua absensi user, sort terbaru dulu
    const absensi = await Attendance.find({ nama })
      .sort({ tanggal: -1, sesi: -1 })
      .limit(50); // Limit 50 records terakhir

    res.json({
      success: true,
      data: absensi,
    });
  } catch (error) {
    console.error("Get absensi error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat mengambil data absensi",
      error: error.message,
    });
  }
});

export default router;
