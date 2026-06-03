import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminSettings from "./pages/AdminSettings";
import AdminLayout from "./components/AdminLayout";

// Synchronous migrations to handle active dev/preview sessions with old localStorage values
try {
  const savedStore = window.localStorage.getItem("dc_store");
  if (savedStore) {
    const parsed = JSON.parse(savedStore);
    let updated = false;
    if (parsed.address === "Jl. Raya Otomotif No. 123, Jakarta Selatan" || !parsed.address) {
      parsed.address = "Patikraja, Banyumas, Jawa Tengah";
      updated = true;
    }
    if (parsed.whatsapp === "6281234567890" || !parsed.whatsapp) {
      parsed.whatsapp = "6285727324791";
      updated = true;
    }
    if (updated) {
      window.localStorage.setItem("dc_store", JSON.stringify(parsed));
    }
  }
} catch (e) {
  console.warn("Failed to migrate store in localStorage", e);
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = sessionStorage.getItem("dc_admin_auth") === "true";
  return isLoggedIn ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Catalog />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
