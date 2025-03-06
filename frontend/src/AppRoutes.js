import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/customer/Login";
import AdminLayout from "./pages/admin/Layout";
import CustomerLayout from "./pages/customer/Layout";
import ProductList from "./pages/customer/ProductList";
import CategoryList from "./pages/customer/CategoryList";
import POS from "./pages/admin/POS";
import ProductManagement from "./pages/admin/ProductManagement";
import Signup from "./pages/customer/Signup";
import MyPage from "./pages/customer/MyPage";
import SalesManagement from "./pages/admin/SalesManagement";

const AppRoutes = ({ user, setUser }) => {

  return (
    <Routes>
      <Route
        path="/"
        element={
          user?.user?.role === "admin" ? ( // user.user.role로 수정
            <Navigate to="/admin/pos" replace />
          ) : (
            <CategoryList />
          )
        }
      />
      <Route path="/products" element={<ProductList />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/mypage" element={<MyPage user={user} />} />

      <Route
        path="/admin/*"
        element={
          user?.user?.role === "admin" ? ( // user.user.role로 수정
            <AdminLayout user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Navigate to="/admin/pos" replace />} />
        <Route path="pos" element={<POS />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="sales" element={<SalesManagement />} />
      </Route>

      <Route
        path="/customer/*"
        element={
          user?.user?.role === "customer" ? ( // user.user.role로 수정
            <CustomerLayout user={user} setUser={setUser} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<ProductList />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;