import jwt from "jsonwebtoken";

/**
 * MIDDLEWARE: Verify JWT Token
 * Protect routes yang butuh authentication
 * Token dikirim via Authorization header: Bearer <token>
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info ke request object
    // Bisa diakses di route handler sebagai req.user
    req.user = {
      nama: decoded.nama,
      role: decoded.role,
      kelompok: decoded.kelompok,
    };

    next(); // Lanjut ke route handler
  } catch (error) {
    // Token invalid atau expired
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token sudah kadaluarsa. Silakan login kembali.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token tidak valid. Silakan login kembali.",
    });
  }
};

/**
 * MIDDLEWARE: Check Admin Role
 * Hanya allow user dengan role 'admin'
 * Harus dipakai setelah verifyToken
 */
export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
  }

  next();
};

/**
 * MIDDLEWARE: Check Mahasiswa Role
 * Hanya allow user dengan role 'mahasiswa'
 * Harus dipakai setelah verifyToken
 */
export const isMahasiswa = (req, res, next) => {
  if (req.user.role !== "mahasiswa") {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya mahasiswa yang diizinkan.",
    });
  }

  next();
};
