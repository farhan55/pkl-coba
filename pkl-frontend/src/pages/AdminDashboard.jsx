import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle,
  XCircle,
  LogOut,
  Smartphone,
  Calendar,
  BarChart3,
  Loader2,
} from "lucide-react";

/**
 * ADMIN DASHBOARD
 * Fitur:
 * - Buat user baru
 * - Lihat & hapus devices
 * - Lihat absensi (filter tanggal/kelompok)
 * - Approve/reject izin mahasiswa
 * - Statistik
 */
const AdminDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("stats"); // stats, users, devices, attendance

  // States untuk data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // States untuk form
  const [newUser, setNewUser] = useState({
    nama: "",
    password: "",
    role: "mahasiswa",
    kelompok: "",
  });

  const [filters, setFilters] = useState({
    tanggal: "",
    kelompok: "",
    sesi: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  /**
   * Load user dari localStorage
   */
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  /**
   * Fetch data based on active tab
   */
  useEffect(() => {
    if (activeTab === "stats") fetchStats();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "devices") fetchDevices();
    if (activeTab === "attendance") fetchAttendance();
  }, [activeTab]);

  /**
   * Fetch statistik
   */
  const fetchStats = async () => {
    try {
      const response = await api.get("/api/admin/stats");
      setStats(response.data.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  /**
   * Fetch users
   */
  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/admin/users");
      setUsers(response.data.data);
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  /**
   * Fetch devices
   */
  const fetchDevices = async () => {
    try {
      const response = await api.get("/api/admin/devices");
      setDevices(response.data.data);
    } catch (err) {
      console.error("Fetch devices error:", err);
    }
  };

  /**
   * Fetch attendance dengan filter
   */
  const fetchAttendance = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.tanggal) params.append("tanggal", filters.tanggal);
      if (filters.kelompok) params.append("kelompok", filters.kelompok);
      if (filters.sesi) params.append("sesi", filters.sesi);
      if (filters.status) params.append("status", filters.status);

      const response = await api.get(`/api/admin/attendance?${params}`);
      setAttendance(response.data.data);
    } catch (err) {
      console.error("Fetch attendance error:", err);
    }
  };

  /**
   * Handle create user
   */
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/admin/users", newUser);
      alert("User berhasil dibuat");

      // Reset form
      setNewUser({
        nama: "",
        password: "",
        role: "mahasiswa",
        kelompok: "",
      });

      // Refresh users list
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal membuat user");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle delete device
   */
  const handleDeleteDevice = async (deviceId) => {
    if (!confirm("Hapus device ini?")) return;

    try {
      await api.delete(`/api/admin/devices/${deviceId}`);
      alert("Device berhasil dihapus");
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus device");
    }
  };

  /**
   * Handle approve izin
   */
  const handleApproveIzin = async (id) => {
    try {
      await api.patch(`/api/admin/attendance/${id}/approve`);
      alert("Izin berhasil di-approve");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal approve izin");
    }
  };

  /**
   * Handle reject izin
   */
  const handleRejectIzin = async (id) => {
    if (!confirm("Tolak izin ini? Status akan diubah ke Alpa")) return;

    try {
      await api.patch(`/api/admin/attendance/${id}/reject`);
      alert("Izin ditolak");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal reject izin");
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /**
   * Get status badge style
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.nama} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { key: "stats", label: "Statistik", icon: BarChart3 },
              { key: "users", label: "Users", icon: Users },
              { key: "devices", label: "Devices", icon: Smartphone },
              { key: "attendance", label: "Absensi", icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                  ${
                    activeTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATS TAB */}
        {activeTab === "stats" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Mahasiswa</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalMahasiswa}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Absensi Hari Ini</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.absensiHariIni}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Izin Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.izinPending}
                  </p>
                </div>
                <Calendar className="w-12 h-12 text-yellow-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Devices</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalDevices}
                  </p>
                </div>
                <Smartphone className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* Form Create User */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <UserPlus className="w-6 h-6" />
                <span>Buat User Baru</span>
              </h2>
              <form
                onSubmit={handleCreateUser}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <input
                  type="text"
                  placeholder="Nama"
                  value={newUser.nama}
                  onChange={(e) =>
                    setNewUser({ ...newUser, nama: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="input-field"
                  required
                />
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="admin">Admin</option>
                </select>
                <input
                  type="text"
                  placeholder="Kelompok"
                  value={newUser.kelompok}
                  onChange={(e) =>
                    setNewUser({ ...newUser, kelompok: e.target.value })
                  }
                  className="input-field"
                  disabled={newUser.role === "admin"}
                  required={newUser.role === "mahasiswa"}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    "Buat User"
                  )}
                </button>
              </form>
            </div>

            {/* Users List */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Daftar Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Kelompok
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Devices
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {u.nama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={
                              u.role === "admin" ? "badge-blue" : "badge-green"
                            }
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.kelompok || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.devices?.length || 0} / {u.maxDevices}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEVICES TAB */}
        {activeTab === "devices" && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Daftar Devices</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Device ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kelompok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {devices.map((d) => (
                    <tr key={d._id}>
                      <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                        {d.deviceId.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {d.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {d.kelompok}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(d.lastUsed).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteDevice(d.deviceId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Filter Absensi</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="date"
                  value={filters.tanggal}
                  onChange={(e) =>
                    setFilters({ ...filters, tanggal: e.target.value })
                  }
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Kelompok"
                  value={filters.kelompok}
                  onChange={(e) =>
                    setFilters({ ...filters, kelompok: e.target.value })
                  }
                  className="input-field"
                />
                <select
                  value={filters.sesi}
                  onChange={(e) =>
                    setFilters({ ...filters, sesi: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Semua Sesi</option>
                  <option value="pagi">Pagi</option>
                  <option value="sore">Sore</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="input-field"
                >
                  <option value="">Semua Status</option>
                  <option value="hadir">Hadir</option>
                  <option value="izin_pending">Izin Pending</option>
                  <option value="izin_approved">Izin Approved</option>
                  <option value="alpa">Alpa</option>
                </select>
                <button onClick={fetchAttendance} className="btn-primary">
                  Filter
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">
                Data Absensi ({attendance.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nama
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Sesi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Keterangan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.map((a) => (
                      <tr key={a._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {a.nama}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {a.tanggal}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {a.sesi}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge(a.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {a.keterangan || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {a.status === "izin_pending" && (
                            <>
                              <button
                                onClick={() => handleApproveIzin(a._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectIzin(a._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
