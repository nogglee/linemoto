import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from "./pages/common/Header";
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

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("selected_store_id");
    }
  }, [user]);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
      <ToastContainer />
    </Router>
  );
}

function AppContent({ user, setUser }) {
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (user?.user?.role === "admin") {
  //     // console.log("🔥 Admin 감지, /admin/pos로 이동 시도");
  //     navigate("/admin/pos", { replace: true });
  //   } else if (user?.user?.role === "customer") {
  //     // console.log("🔥 Customer 감지, /로 이동 시도");
  //     navigate("/", { replace: true });
  //   } else {
  //   }
  // }, [user, navigate]);

  return (
    <>
      {/* user가 없어도 Header 렌더링 가능 */}
      {(user?.user?.role !== "admin") && <Header user={user} setUser={setUser} />}
      <Routes>
        <Route
          path="/"
          element={<CategoryList />} // 비로그인 시 기본 경로로 CategoryList
          setUser={setUser}
        />
        <Route path="/products" element={<ProductList />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<MyPage setUser={setUser} />} />

        <Route
          path="/admin/*"
          element={
            user?.user?.role === "admin" ? (
              <AdminLayout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<Navigate to="/admin/pos" replace />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<ProductManagement admin={user?.user} />} />
          <Route path="sales" element={<SalesManagement admin={user?.user} />} />
        </Route>

        <Route
          path="/customer/*"
          element={
            user?.user?.role === "customer" ? (
              <CustomerLayout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<ProductList />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;