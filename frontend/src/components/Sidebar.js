import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="sidebar">
      <h2>센터이름</h2>
      <nav>
        <NavLink to="/admin/pos" className={({ isActive }) => isActive ? "active" : ""}>POS</NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => isActive ? "active" : ""}>상품관리</NavLink>
        <NavLink to="/admin/sales" className={({ isActive }) => isActive ? "active" : ""}>매출관리</NavLink>
        <NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active" : ""}>고객관리</NavLink>
      </nav>

      {/* 로그아웃 버튼을 사이드바 하단에 배치 */}
      <button className="logout-btn" onClick={handleLogout}>로그아웃</button>
    </div>
  );
}

export default Sidebar;