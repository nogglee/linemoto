import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import './App.css';
import Login from "./components/Login";
import CustomerDashboard from "./components/CustomerDashboard";
import Layout from "./components/Layout";
import POS from "./components/POS";
import ProductManagement from "./components/ProductManagement";
import SalesManagement from "./components/SalesManagement";
import CustomerManagement from "./components/CustomerManagement";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Login setUser={setUser} />} />
        
        {/* ✅ Layout 안에서 Outlet 사용 → 자동으로 POS가 기본 화면으로 */}
        <Route path="/admin" element={<Layout user={user} setUser={setUser} />}>
          <Route index element={<Navigate to="/admin/pos" replace />} /> {/* ✅ 기본값 POS */}
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<ProductManagement />} />
          {/* <Route path="sales" element={<SalesManagement />} />
          <Route path="customers" element={<CustomerManagement />} /> */}
        </Route>

        <Route path="/customer" element={user?.role === "customer" ? <CustomerDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;