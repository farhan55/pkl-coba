import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import {
  LogOut,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Loader2,
  Wifi,
  AlertCircle,
} from "lucide-react";

/**
 * MAHASISWA DASHBOARD
 * Fitur:
 * - Countdown timer 10 menit (auto logout)
 * - Absen pagi/sore (auto detect sesi)
 * - Ajukan izin
 * - History absensi
 */
const MahasiswaDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loginTime, setLoginTime] = useState(null);

  // Countdown timer (10 menit = 600 detik)
  const [timeRemaining, setTimeRemaining] = useState(600);

  // States untuk absensi
  const [currentSession, setCurrentSession] = useState("");
  const [canAttend, setCanAttend] = useState(false);
  const [loading, setLoading] = useState(false);

  // States untuk history & izin
  const [history, setHistory] = useState([]);
  const [showIzinForm, setShowIzinForm] = useState(false);
  const [izinForm, setIzinForm] = useState({
    tanggal: "",
    sesi: "pagi",
    keterangan: "",
  });

  /**
   * Initialize: Load user & login time
   */
  useEffect(() => {
    const userData = localStorage.getItem("user");
    const loginTimeData = localStorage.getItem("login_time");

    if (userData) setUser(JSON.parse(userData));
    if (loginTimeData) setLoginTime(new Date(loginTimeData));

    // Fetch history
    fetchHistory();

    // Check session
    checkSession();
  }, []);

  /**
   * Countdown Timer Effect
   * 10 menit dari login_time
   * Auto logout jika habis
   */
  useEffect(() => {
    if (!loginTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - loginTime) / 1000); // detik
      const remaining = 600 - elapsed; // 600 detik = 10 menit

      if (remaining <= 0) {
        // Time's up - auto logout
        alert("Waktu sesi habis (10 menit). Anda akan logout otomatis.");
        handleLogout();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loginTime]);

  /**
   * Check current session (pagi/sore)
   */
  const checkSession = () => {
    const hour = new Date().getHours();

    // Pagi: 06:00-11:59
    if (hour >= 6 && hour < 12) {
      setCurrentSession("pagi");
      setCanAttend(true);
    }
    // Sore: 12:00-18:00
    else if (hour >= 12 && hour <= 18) {
      setCurrentSession("sore");
      setCanAttend(true);
    }
    // Di luar jam absen
    else {
      setCurrentSession("");
      setCanAttend(false);
    }
  };

  /**
   * Fetch history absensi
   */
  const fetchHistory = async () => {
    try {
      const response = await api.get("/api/absensi/saya");
      setHistory(response.data.data);
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  /**
   * Handle Absen
   */
  const handleAbsen = async () => {
    if (!canAttend) {
      alert(
        "Absensi hanya bisa dilakukan pagi (06:00-11:59) atau sore (12:00-18:00)",
      );
      return;
    }

    if (!confirm(`Konfirmasi absen ${currentSession}?`)) return;

    setLoading(true);

    try {
      const response = await api.post("/api/absen", {
        login_time: loginTime,
      });

      alert(response.data.message);

      // Refresh history
      fetchHistory();
    } catch (err) {
      const message = err.response?.data?.message || "Gagal absen";
      alert(message);

      // Jika error WiFi, tampilkan IP
      if (err.response?.data?.yourIP) {
        alert(
          `IP Anda: ${err.response.data.yourIP}\nPastikan terhubung ke WiFi kampus (103.209.9.*)`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Izin
   */
  const handleIzin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/api/izin", {
        ...izinForm,
        login_time: loginTime,
      });

      alert(response.data.message);

      // Reset form & close
      setIzinForm({ tanggal: "", sesi: "pagi", keterangan: "" });
      setShowIzinForm(false);

      // Refresh history
      fetchHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengajukan izin");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Logout
   */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /**
   * Format countdown timer (MM:SS)
   */
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status) => {
    const styles = {
      hadir: "badge-green",
      izin_pending: "badge-yellow",
      izin_approved: "badge-blue",
      alpa: "badge-red",
    };

    const labels = {
      hadir: "Hadir",
      izin_pending: "Izin Pending",
      izin_approved: "Izin Approved",
      alpa: "Alpa",
    };

    return <span className={styles[status]}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Mahasiswa
              </h1>
              <p className="text-sm text-gray-600">
                {user?.nama} - {user?.kelompok}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Countdown Timer Card */}
        <div className="card bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Waktu Sesi Tersisa</p>
              <p className="text-4xl font-bold mt-1">
                {formatTime(timeRemaining)}
              </p>
              <p className="text-xs opacity-75 mt-2">
                Auto logout dalam {formatTime(timeRemaining)}
              </p>
            </div>
            <Clock className="w-16 h-16 opacity-50" />
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-1000"
              style={{ width: `${(timeRemaining / 600) * 100}%` }}
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <Wifi className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Informasi Sesi</h2>
              <p className="text-sm text-gray-600">
                Sesi saat ini:{" "}
                <span className="font-semibold capitalize">
                  {currentSession || "Di luar jam absen"}
                </span>
              </p>
            </div>
          </div>

          {!canAttend && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Di luar jam absen</p>
                <p>Absensi hanya bisa dilakukan:</p>
                <ul className="list-disc ml-5 mt-1">
                  <li>Pagi: 06:00 - 11:59</li>
                  <li>Sore: 12:00 - 18:00</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Absen Button */}
          <button
            onClick={handleAbsen}
            disabled={!canAttend || loading}
            className="btn-success flex items-center justify-center space-x-2 py-4 text-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                <span>Absen {currentSession}</span>
              </>
            )}
          </button>

          {/* Izin Button */}
          <button
            onClick={() => setShowIzinForm(!showIzinForm)}
            className="btn-secondary flex items-center justify-center space-x-2 py-4 text-lg"
          >
            <FileText className="w-6 h-6" />
            <span>Ajukan Izin</span>
          </button>
        </div>

        {/* Izin Form (Conditional) */}
        {showIzinForm && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Form Izin</h2>
            <form onSubmit={handleIzin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={izinForm.tanggal}
                  onChange={(e) =>
                    setIzinForm({ ...izinForm, tanggal: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sesi
                </label>
                <select
                  value={izinForm.sesi}
                  onChange={(e) =>
                    setIzinForm({ ...izinForm, sesi: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="pagi">Pagi</option>
                  <option value="sore">Sore</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keterangan
                </label>
                <textarea
                  value={izinForm.keterangan}
                  onChange={(e) =>
                    setIzinForm({ ...izinForm, keterangan: e.target.value })
                  }
                  className="input-field"
                  rows="3"
                  placeholder="Alasan izin..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Kirim Izin"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowIzinForm(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History Absensi */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>Riwayat Absensi</span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Belum ada riwayat absensi
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.tanggal}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        Sesi {item.sesi}
                      </p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {item.keterangan && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      "{item.keterangan}"
                    </p>
                  )}

                  <div className="mt-2 text-xs text-gray-500">
                    Absen: {new Date(item.absen_time).toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MahasiswaDashboard;
