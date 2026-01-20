import express from "express";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import DeviceBinding from "../models/DeviceBinding.js";
import { verifyToken, isAdmin } from "../middleware/auth.js";

const router = express.Router();

/**
 * Semua routes di sini require admin authentication
 */
router.use(verifyToken, isAdmin);

/**
 * POST /api/admin/users
 * Buat user baru (mahasiswa atau admin)
 * Admin only
 */
router.post("/users", async (req, res) => {
  try {
    const { nama, password, role, kelompok } = req.body;

    // Validasi input
    if (!nama || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Nama, password, dan role harus diisi",
      });
    }

    // Validasi kelompok untuk mahasiswa
    if (role === "mahasiswa" && !kelompok) {
      return res.status(400).json({
        success: false,
        message: "Kelompok harus diisi untuk mahasiswa",
      });
    }

    // Validasi role
    if (!["admin", "mahasiswa"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role harus admin atau mahasiswa",
      });
    }

    // Check apakah nama sudah ada
    const existingUser = await User.findOne({ nama });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `User dengan nama ${nama} sudah ada`,
      });
    }

    // Create user baru
    const user = await User.create({
      nama,
      password, // Auto hash by pre-save middleware
      role,
      kelompok: role === "mahasiswa" ? kelompok : undefined,
    });

    // Remove password dari response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
      data: userResponse,
    });
  } catch (error) {
    console.error("Create user error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Nama user sudah digunakan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error saat membuat user",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/users
 * Get semua user
 * Admin only
 */
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat mengambil data user",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/users/:nama
 * Hapus user
 * Admin only
 */
router.delete("/users/:nama", async (req, res) => {
  try {
    const { nama } = req.params;

    const user = await User.findOneAndDelete({ nama });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Hapus juga device bindings user ini
    await DeviceBinding.deleteMany({ nama });

    res.json({
      success: true,
      message: `User ${nama} berhasil dihapus`,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat menghapus user",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/devices
 * Get semua device bindings
 * Admin only
 */
router.get("/devices", async (req, res) => {
  try {
    const devices = await DeviceBinding.find().sort({ lastUsed: -1 });

    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error("Get devices error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat mengambil data device",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/admin/devices/:deviceId
 * Hapus device binding
 * Admin only
 */
router.delete("/devices/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Hapus dari DeviceBinding
    const binding = await DeviceBinding.findOneAndDelete({ deviceId });

    if (!binding) {
      return res.status(404).json({
        success: false,
        message: "Device tidak ditemukan",
      });
    }

    // Hapus device dari User.devices array
    await User.updateOne(
      { nama: binding.nama },
      { $pull: { devices: { deviceId } } },
    );

    res.json({
      success: true,
      message: "Device berhasil dihapus",
      deletedDevice: binding,
    });
  } catch (error) {
    console.error("Delete device error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat menghapus device",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/attendance
 * Get data absensi dengan filter
 * Query params:
 *  - tanggal: YYYY-MM-DD (optional)
 *  - kelompok: string (optional)
 *  - sesi: pagi/sore (optional)
 *  - status: hadir/izin_pending/izin_approved/alpa (optional)
 *
 * Admin only
 */
router.get("/attendance", async (req, res) => {
  try {
    const { tanggal, kelompok, sesi, status } = req.query;

    // Build filter object
    const filter = {};

    if (tanggal) filter.tanggal = tanggal;
    if (kelompok) filter.kelompok = kelompok;
    if (sesi) filter.sesi = sesi;
    if (status) filter.status = status;

    // Get attendance records
    const attendance = await Attendance.find(filter)
      .sort({ tanggal: -1, sesi: -1, absen_time: -1 })
      .limit(500); // Limit untuk performa

    res.json({
      success: true,
      count: attendance.length,
      filter,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat mengambil data absensi",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin/attendance/:id/approve
 * Approve izin mahasiswa
 * Admin only
 */
router.patch("/attendance/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan",
      });
    }

    // Hanya bisa approve jika status izin_pending
    if (attendance.status !== "izin_pending") {
      return res.status(400).json({
        success: false,
        message: `Tidak bisa approve. Status saat ini: ${attendance.status}`,
      });
    }

    // Update status ke izin_approved
    attendance.status = "izin_approved";
    await attendance.save();

    res.json({
      success: true,
      message: "Izin berhasil di-approve",
      data: attendance,
    });
  } catch (error) {
    console.error("Approve izin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat approve izin",
      error: error.message,
    });
  }
});

/**
 * PATCH /api/admin/attendance/:id/reject
 * Reject izin mahasiswa (set ke alpa)
 * Admin only
 */
router.patch("/attendance/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findById(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Data absensi tidak ditemukan",
      });
    }

    // Hanya bisa reject jika status izin_pending
    if (attendance.status !== "izin_pending") {
      return res.status(400).json({
        success: false,
        message: `Tidak bisa reject. Status saat ini: ${attendance.status}`,
      });
    }

    // Update status ke alpa
    attendance.status = "alpa";
    await attendance.save();

    res.json({
      success: true,
      message: "Izin ditolak, status diubah menjadi alpa",
      data: attendance,
    });
  } catch (error) {
    console.error("Reject izin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat reject izin",
      error: error.message,
    });
  }
});

/**
 * GET /api/admin/stats
 * Get statistik absensi
 * Admin only
 */
router.get("/stats", async (req, res) => {
  try {
    const today = Attendance.getTanggalSekarang();

    // Total users
    const totalUsers = await User.countDocuments({ role: "mahasiswa" });

    // Absensi hari ini
    const todayAttendance = await Attendance.countDocuments({ tanggal: today });

    // Pending izin
    const pendingIzin = await Attendance.countDocuments({
      status: "izin_pending",
    });

    // Total devices
    const totalDevices = await DeviceBinding.countDocuments();

    res.json({
      success: true,
      data: {
        totalMahasiswa: totalUsers,
        absensiHariIni: todayAttendance,
        izinPending: pendingIzin,
        totalDevices,
        tanggal: today,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Server error saat mengambil statistik",
      error: error.message,
    });
  }
});

export default router;
