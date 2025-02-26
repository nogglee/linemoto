import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from "./pages/customer/Login";
import AdminLayout from "./pages/admin/Layout";
import CustomerLayout from "./pages/customer/Layout";
import ProductList from "./pages/customer/ProductList";
import CategoryList from "./pages/customer/CategoryList";
import Header from "./pages/common/Header";
import POS from "./pages/admin/POS";
import ProductManagement from "./pages/admin/ProductManagement";
import Signup from "./pages/customer/Signup"; 

function App() {
  const [user, setUser] = useState(null);

  // ✅ localStorage에서 사용자 정보 불러오기 (새로고침해도 유지)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      {/* ✅ 관리자(admin)는 Header 숨김, 고객/비회원은 Header 표시 */}
      {user?.role !== "admin" && <Header user={user} setUser={setUser} />}

      <Routes>
        {/* ✅ 기본 진입 페이지 (로그인 전: CategoryList, 로그인 후: role에 맞게 이동) */}
        {/* <Route path="/" element={!user ? <CategoryList /> : <Navigate to={`/${user.role}`} />} /> */}
        <Route path="/" element={<CategoryList />} />

        {/* ✅ 상품 목록 페이지 (카테고리 선택 후 이동) */}
        <Route path="/products" element={<ProductList />} />

        {/* ✅ 로그인 페이지 */}
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* 🔹 회원가입 페이지 라우팅 */}
        
        <Route path="/signup" element={<Signup />} /> 
        

        {/* ✅ 관리자 레이아웃 */}
        <Route path="/admin/*" element={user?.role === "admin" ? <AdminLayout user={user} setUser={setUser} /> : <Navigate to="/" />}>
          <Route index element={<Navigate to="/admin/pos" replace />} />  {/* ✅ 기본값: POS */}
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<ProductManagement />} />
        </Route>

        {/* ✅ 고객 레이아웃 */}
        <Route path="/customer/*" element={user?.role === "customer" ? <CustomerLayout user={user} setUser={setUser} /> : <Navigate to="/" />}>
          <Route index element={<ProductList />} />  {/* ✅ 기본값: ProductList */}
        </Route>
      </Routes>

      <ToastContainer />
    </Router>
  );
}

export default App;