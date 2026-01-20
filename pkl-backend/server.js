import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy - untuk mendapatkan IP client yang benar
app.set("trust proxy", true);

// Port configuration
const PORT = process.env.PORT || 5000;

/**
 * MIDDLEWARE CONFIGURATION
 */

// CORS - Allow frontend origin (Vercel/localhost)
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
      // Allow requests dengan origin yang match atau undefined (untuk Postman, curl, dll)
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(null, true); // Temporary: Allow all origins untuk debug
      }
    },
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse JSON body
app.use(express.json());

// Parse URL-encoded body
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

/**
 * MONGODB CONNECTION
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      // Options sudah default di Mongoose 6+
      // Tidak perlu useNewUrlParser & useUnifiedTopology
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log("📦 Database:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit dengan error code
  }
};

// Connect to database
connectDB();

/**
 * ROUTES
 */

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "PKL Attendance API Server",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (login, absen, izin)
app.use("/api", authRoutes);

// Admin routes (create user, manage devices, view attendance)
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
    path: req.path,
  });
});

/**
 * GLOBAL ERROR HANDLER
 */
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

/**
 * GRACEFUL SHUTDOWN
 * Handle process termination
 */
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, closing server gracefully...");

  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n👋 SIGINT received, closing server gracefully...");

  mongoose.connection.close(() => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});

export default app;
