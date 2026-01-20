import mongoose from "mongoose";

/**
 * ATTENDANCE SCHEMA
 * Model untuk data absensi mahasiswa
 * - 2 sesi: pagi (06:00-11:59) & sore (12:00-18:00)
 * - Status: hadir, izin_pending, izin_approved, alpa
 */
const attendanceSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama mahasiswa harus diisi"],
      trim: true,
    },
    tanggal: {
      type: String, // Format: YYYY-MM-DD
      required: [true, "Tanggal harus diisi"],
      index: true, // Index untuk query cepat
    },
    sesi: {
      type: String,
      enum: ["pagi", "sore"],
      required: [true, "Sesi harus diisi"],
    },
    status: {
      type: String,
      enum: ["hadir", "izin_pending", "izin_approved", "alpa"],
      default: "hadir",
      required: true,
    },
    wifi_ip: {
      type: String,
      required: function () {
        // IP wajib jika status hadir
        return this.status === "hadir";
      },
    },
    deviceId: {
      type: String,
      required: true,
    },
    login_time: {
      type: Date,
      required: true, // Waktu login dari session
    },
    absen_time: {
      type: Date,
      default: Date.now, // Waktu tombol absen ditekan
    },
    keterangan: {
      type: String, // Keterangan izin (opsional)
      trim: true,
    },
    kelompok: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * INDEX: Compound index untuk query efisien
 * Cegah duplikasi absen di sesi yang sama
 */
attendanceSchema.index({ nama: 1, tanggal: 1, sesi: 1 }, { unique: true });

/**
 * STATIC METHOD: Get sesi berdasarkan waktu sekarang
 * @returns {string} - 'pagi' atau 'sore'
 */
attendanceSchema.statics.getSesiSekarang = function () {
  const hour = new Date().getHours();
  // Pagi: 06:00-11:59, Sore: 12:00-18:00
  return hour >= 6 && hour < 12 ? "pagi" : "sore";
};

/**
 * STATIC METHOD: Get tanggal hari ini (YYYY-MM-DD)
 * @returns {string} - Tanggal format YYYY-MM-DD
 */
attendanceSchema.statics.getTanggalSekarang = function () {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * METHOD: Check apakah dalam jam absen yang valid
 * @returns {object} - { valid: boolean, message: string }
 */
attendanceSchema.statics.cekJamAbsen = function () {
  const hour = new Date().getHours();

  // Pagi: 06:00-11:59
  if (hour >= 6 && hour < 12) {
    return { valid: true, sesi: "pagi" };
  }

  // Sore: 12:00-18:00
  if (hour >= 12 && hour <= 18) {
    return { valid: true, sesi: "sore" };
  }

  // Di luar jam absen
  return {
    valid: false,
    message:
      "Absen hanya bisa dilakukan pagi (06:00-11:59) atau sore (12:00-18:00)",
  };
};

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
