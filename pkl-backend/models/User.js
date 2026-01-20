import mongoose from "mongoose";
import bcrypt from "bcryptjs";

/**
 * USER SCHEMA
 * Model untuk data user (admin & mahasiswa)
 * - Device binding: max 2 devices per user
 * - Password di-hash dengan bcrypt
 */
const userSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama harus diisi"],
      unique: true, // Nama harus unik
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      minlength: [6, "Password minimal 6 karakter"],
    },
    role: {
      type: String,
      enum: ["admin", "mahasiswa"], // Hanya 2 role
      default: "mahasiswa",
      required: true,
    },
    kelompok: {
      type: String,
      required: function () {
        return this.role === "mahasiswa"; // Wajib untuk mahasiswa
      },
    },
    // Array untuk menyimpan device yang pernah login
    devices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        firstUsed: {
          type: Date,
          default: Date.now,
        },
        usageCount: {
          type: Number,
          default: 1,
        },
      },
    ],
    maxDevices: {
      type: Number,
      default: 2, // Maksimal 2 device per user
    },
  },
  {
    timestamps: true, // Auto createdAt & updatedAt
  },
);

/**
 * MIDDLEWARE: Hash password sebelum save
 * Hanya hash jika password baru/diubah
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * METHOD: Compare password saat login
 * @param {string} candidatePassword - Password input user
 * @returns {boolean} - True jika match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * METHOD: Check apakah device sudah terdaftar
 * @param {string} deviceId - UUID device
 * @returns {boolean} - True jika device sudah ada
 */
userSchema.methods.hasDevice = function (deviceId) {
  return this.devices.some((d) => d.deviceId === deviceId);
};

/**
 * METHOD: Add device baru ke user
 * @param {string} deviceId - UUID device
 * @throws {Error} - Jika sudah mencapai max devices
 */
userSchema.methods.addDevice = function (deviceId) {
  if (this.devices.length >= this.maxDevices) {
    throw new Error(`Maksimal ${this.maxDevices} device per user`);
  }

  this.devices.push({
    deviceId,
    firstUsed: new Date(),
    usageCount: 1,
  });
};

/**
 * METHOD: Update usage count device
 * @param {string} deviceId - UUID device
 */
userSchema.methods.updateDeviceUsage = function (deviceId) {
  const device = this.devices.find((d) => d.deviceId === deviceId);
  if (device) {
    device.usageCount += 1;
  }
};

const User = mongoose.model("User", userSchema);

export default User;
