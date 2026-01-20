import mongoose from "mongoose";

/**
 * DEVICE BINDING SCHEMA
 * Model untuk binding device ke user
 * - 1 device = 1 user (tidak bisa sharing device)
 * - Track first & last usage
 */
const deviceBindingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: [true, "Device ID harus ada"],
      unique: true, // 1 device hanya bisa 1 user
      index: true,
    },
    nama: {
      type: String,
      required: [true, "Nama user harus ada"],
      trim: true,
    },
    kelompok: {
      type: String,
      required: true,
    },
    firstUsed: {
      type: Date,
      default: Date.now,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * MIDDLEWARE: Update lastUsed setiap kali document di-save
 */
deviceBindingSchema.pre("save", function (next) {
  this.lastUsed = new Date();
  next();
});

/**
 * STATIC METHOD: Check apakah device sudah di-bind ke user lain
 * @param {string} deviceId - UUID device
 * @param {string} nama - Nama user yang cek
 * @returns {object|null} - Binding data jika ada conflict
 */
deviceBindingSchema.statics.checkConflict = async function (deviceId, nama) {
  const binding = await this.findOne({ deviceId });

  // Jika device belum di-bind, return null (no conflict)
  if (!binding) return null;

  // Jika device sudah di-bind ke user lain, return conflict
  if (binding.nama !== nama) {
    return {
      conflict: true,
      message: `Device ini sudah terikat dengan user: ${binding.nama}`,
      boundTo: binding.nama,
    };
  }

  // Device di-bind ke user yang sama, no conflict
  return null;
};

/**
 * STATIC METHOD: Bind atau update device binding
 * @param {string} deviceId - UUID device
 * @param {string} nama - Nama user
 * @param {string} kelompok - Kelompok user
 */
deviceBindingSchema.statics.bindDevice = async function (
  deviceId,
  nama,
  kelompok,
) {
  // Cari existing binding
  let binding = await this.findOne({ deviceId });

  if (binding) {
    // Update lastUsed jika sudah ada
    binding.lastUsed = new Date();
    await binding.save();
  } else {
    // Buat binding baru
    binding = await this.create({
      deviceId,
      nama,
      kelompok,
    });
  }

  return binding;
};

const DeviceBinding = mongoose.model("DeviceBinding", deviceBindingSchema);

export default DeviceBinding;
