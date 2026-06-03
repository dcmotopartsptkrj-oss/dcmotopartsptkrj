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

  const savedProducts = window.localStorage.getItem("dc_products");
  if (savedProducts) {
    const products = JSON.parse(savedProducts);
    let updated = false;
    if (Array.isArray(products)) {
      products.forEach((p: any) => {
        if (p.id === "p-001") {
          p.slug = "oli-yamalube-matic";
          p.name = "Oli Yamalube Matic 20W-40";
          p.sku = "YM-2024-08X";
          p.image = "/products/oli_yamalube_matic_1780484749609.png";
          p.categorySlug = "oil";
          p.category = "Oli & Cairan";
          updated = true;
        }
        if (p.id === "p-002") {
          p.slug = "v-belt-roller-kit-honda";
          p.name = "V-Belt & Roller Kit Honda";
          p.sku = "VB-HB-2024";
          p.image = "/products/v_belt_honda_beat_1780484763972.png";
          p.categorySlug = "tire";
          p.category = "Ban & Rantai";
          updated = true;
        }
        if (p.id === "p-003") {
          p.slug = "busi-ngk-standar";
          p.name = "Busi NGK Standar C7HSA";
          p.sku = "SP-NGK-C7HSA";
          p.image = "/products/busi_ngk_spark_1780484779013.png";
          p.categorySlug = "electric";
          p.category = "Kelistrikan";
          updated = true;
        }
        if (p.id === "p-004") {
          p.slug = "ban-dalam-irc-premium";
          p.name = "Ban Dalam IRC Premium";
          p.sku = "TR-IRC-14";
          p.image = "/products/ban_dalam_irc_1780484791842.png";
          p.categorySlug = "tire";
          p.category = "Ban & Rantai";
          updated = true;
        }
        if (p.id === "p-007") {
          p.slug = "aki-motor-gs-astra";
          p.name = "Aki Motor GS Astra";
          p.sku = "BT-GS-12V";
          p.image = "";
          p.categorySlug = "electric";
          p.category = "Kelistrikan";
          updated = true;
        }
      });
      if (updated) {
        window.localStorage.setItem("dc_products", JSON.stringify(products));
      }
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
