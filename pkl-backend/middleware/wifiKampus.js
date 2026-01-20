/**
 * MIDDLEWARE: WiFi Kampus Checker
 * Hanya allow request dari IP WiFi kampus (103.209.9.*)
 * Digunakan untuk route absensi
 */
export const checkWifiKampus = (req, res, next) => {
  // Get client IP address dengan berbagai cara
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip;

  console.log("🌐 Client IP Detection:", {
    "x-forwarded-for": req.headers["x-forwarded-for"],
    "x-real-ip": req.headers["x-real-ip"],
    remoteAddress: req.connection.remoteAddress,
    socketAddress: req.socket.remoteAddress,
    reqIP: req.ip,
    finalIP: ip,
  });

  // Handle IPv6 localhost (::1 atau ::ffff:127.0.0.1)
  if (ip === "::1" || ip === "::ffff:127.0.0.1" || ip === "127.0.0.1") {
    console.log("⚠️  Localhost detected - using development bypass");
    req.clientIP = "103.209.9.100"; // Dummy IP untuk localhost
    return next();
  }

  // Clean IPv6 prefix jika ada (::ffff:103.209.9.2 → 103.209.9.2)
  if (ip && ip.includes("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  console.log("✅ Final IP:", ip);

  // Regex untuk IP WiFi kampus: 103.209.9.*
  const kampusIPPattern = /^103\.209\.9\./;

  // Check apakah IP match pattern
  if (!kampusIPPattern.test(ip)) {
    console.log("❌ IP ditolak:", ip);
    return res.status(403).json({
      success: false,
      message: "Absensi hanya bisa dilakukan dari WiFi kampus (103.209.9.*)",
      yourIP: ip,
      note: "Pastikan Anda terhubung ke WiFi kampus",
    });
  }

  console.log("✅ IP diterima:", ip);

  // Simpan IP ke request untuk logging
  req.clientIP = ip;

  next(); // IP valid, lanjut ke route handler
};

/**
 * MIDDLEWARE: Development Mode - Bypass WiFi Check
 * Untuk testing local (non-production)
 * JANGAN dipakai di production!
 */
export const bypassWifiCheck = (req, res, next) => {
  // Set dummy kampus IP untuk development
  req.clientIP = "103.209.9.100";

  console.log("⚠️  WiFi check bypassed (Development Mode)");

  next();
};

/**
 * MIDDLEWARE: Conditional WiFi Check
 * ALWAYS USE checkWifiKampus (tidak bypass lagi)
 * Middleware sudah handle localhost secara otomatis
 */
export const wifiKampus = checkWifiKampus;
