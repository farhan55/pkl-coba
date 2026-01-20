import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import { LogIn, Loader2 } from "lucide-react";

/**
 * LOGIN PAGE
 * Form login untuk admin & mahasiswa
 * Auto-redirect berdasarkan role setelah login
 */
const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error saat user typing
  };

  /**
   * Handle form submit - Login
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call login API
      const response = await api.post("/api/login", formData);

      const { token, login_time, user } = response.data;

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("login_time", login_time);

      console.log("Login berhasil:", user);

      // Redirect berdasarkan role
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/mahasiswa");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Display error message
      const message =
        err.response?.data?.message || "Terjadi kesalahan saat login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Absensi PKL</h1>
          <p className="text-gray-600">Login dengan akun Anda</p>
        </div>

        {/* Login Form */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Nama Field */}
            <div>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan nama Anda"
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Masukkan password"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistem Absensi PKL Mahasiswa</p>
          <p className="mt-1">
            Pastikan terhubung ke WiFi kampus untuk absensi
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
