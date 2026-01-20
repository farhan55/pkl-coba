import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import MahasiswaDashboard from "./pages/MahasiswaDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

/**
 * MAIN APP COMPONENT
 * React Router setup dengan protected routes
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Route - Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Route - Mahasiswa Dashboard */}
        <Route
          path="/mahasiswa"
          element={
            <ProtectedRoute allowedRoles={["mahasiswa"]}>
              <MahasiswaDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect ke login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 - Redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
