import React, { useState, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as PosIcon } from '../../assets/icons/ico-pos.svg';
import { ReactComponent as ProductIcon } from '../../assets/icons/ico-product.svg';
import { ReactComponent as CustomerIcon } from '../../assets/icons/ico-customer.svg';
import { ReactComponent as ReportIcon } from '../../assets/icons/ico-report.svg';
import { ReactComponent as PosIconActive } from '../../assets/icons/ico-pos-active.svg';
import { ReactComponent as ProductIconActive } from '../../assets/icons/ico-product-active.svg';
import { ReactComponent as CustomerIconActive } from '../../assets/icons/ico-customer-active.svg';
import { ReactComponent as ReportIconActive } from '../../assets/icons/ico-report-active.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/ico-logout.svg';
import Lottie from "lottie-react";
import statusAnimation from "../../assets/icons/ico-status.json";
import AdminAuthModal from "../admin/components/AdminAuthModal";


function Sidebar({ user, setUser }) {
  
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const passwordInputRef = useRef(null);
  
  const location = useLocation();  
  const isSalesActive = location.pathname === "/admin/sales";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  const handlePasswordSubmit = (password) => {
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
    if (password === adminPassword) {
      setIsAuthModalOpen(false);
      navigate("/admin/sales");
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
  };

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus(); // 🔹 모달 열릴 때 비밀번호 input 자동 포커싱
      }
    }, 100);
  };


  return (
    <div className="bg-gray-100 py-10 px-5 font-body flex flex-col justify-between gap-5 min-h-screen">
      <div>
        <div className="py-3 px-2.5 flex justify-between">
          <p className="font-700 text-xl pt-[2px]">라인모토</p>
          <button className="logout-btn" onClick={handleLogout}><LogoutIcon /></button>
        </div>
        <nav className="sidebar-menu">
          <NavLink to="/admin/pos" end className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
            {({ isActive }) => (
              <>
                {isActive ? <PosIconActive width="22" height="22" /> : <PosIcon width="22" height="22" />}
                POS
              </>
            )}
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
            {({ isActive }) => (
              <>
                {isActive ? <ProductIconActive width="22" height="22" /> : <ProductIcon width="22" height="22" />}
                상품관리
              </>
            )}
          </NavLink>
          <button
            className={`nav-item flex items-center gap-2 ${
              isSalesActive ? "active nav-item" : "nav-item"
            }`}
            onClick={openAuthModal}
          >
            {isSalesActive ? <ReportIconActive width="22" height="22" /> : <ReportIcon width="22" height="22" />}
            매출관리
          </button>
          <NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
            {({ isActive }) => (
              <>
                {isActive ? <CustomerIconActive width="22" height="22" /> : <CustomerIcon width="22" height="22" />}
                고객관리
              </>
            )}
          </NavLink>
        </nav>
      </div>
      <button 
        className="flex justify-center items-center gap-2 text-base text-[#008F29] font-bold bg-[#E0F0E2] py-3 rounded-2xl cursor-pointer"
        onClick={() => window.open("https://stats.uptimerobot.com/fWMQc0d6UE", "_blank")}
      >  
        <Lottie animationData={statusAnimation} loop={true} style={{ width: 24, height: 24 }} /> 서버 상태 확인
      </button>

      {/* 패스워드 입력 모달 */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        inputRef={passwordInputRef}
      />
    </div>
  );
}

export default Sidebar;