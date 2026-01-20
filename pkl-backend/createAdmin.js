import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

/**
 * SCRIPT: Create Admin User
 * Run: node createAdmin.js
 */

const userSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "mahasiswa"], default: "mahasiswa" },
    kelompok: String,
    devices: [{ deviceId: String, firstUsed: Date, usageCount: Number }],
    maxDevices: { type: Number, default: 2 },
  },
  { timestamps: true },
);

// Pre-save middleware untuk hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    // Connect ke MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Check apakah admin sudah ada
    const existingAdmin = await User.findOne({ nama: "Admin" });
    if (existingAdmin) {
      console.log("⚠️  Admin sudah ada di database");
      console.log("Silakan login dengan:");
      console.log("  Nama: Admin");
      console.log("  Password: admin123");
      process.exit(0);
    }

    // Create admin user baru
    const admin = new User({
      nama: "Admin",
      password: "admin123", // Auto-hash by pre-save middleware
      role: "admin",
      devices: [],
      maxDevices: 2,
    });

    await admin.save();

    console.log("✅ Admin user berhasil dibuat!");
    console.log("\n📝 Credentials:");
    console.log("  Nama: Admin");
    console.log("  Password: admin123");
    console.log("\n🚀 Buka http://localhost:5173 dan login");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

createAdmin();
