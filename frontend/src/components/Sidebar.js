import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ReactComponent as PosIcon } from '../assets/icons/ico-pos.svg';
import { ReactComponent as ProductIcon } from '../assets/icons/ico-product.svg';
import { ReactComponent as CustomerIcon } from '../assets/icons/ico-customer.svg';
import { ReactComponent as ReportIcon } from '../assets/icons/ico-report.svg'
import { ReactComponent as PosIconActive } from '../assets/icons/ico-pos-active.svg';
import { ReactComponent as ProductIconActive } from '../assets/icons/ico-product-active.svg';
import { ReactComponent as CustomerIconActive } from '../assets/icons/ico-customer-active.svg';
import { ReactComponent as ReportIconActive } from '../assets/icons/ico-report-active.svg';
import { ReactComponent as LogoutIcon } from '../assets/icons/ico-logout.svg'


function Sidebar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="bg-gray-100 py-10 px-5 font-body flex flex-col gap-5">
      <div className="py-3 px-2.5 flex justify-between">
        <p className="font-700 text-xl pt-[2px]">라인모토</p>
        <button className="logout-btn" onClick={handleLogout}><LogoutIcon /></button>
      </div>
      <nav className="sidebar-menu">
        <NavLink to="/admin/pos" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
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
        <NavLink to="/admin/sales" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
          {({ isActive }) => (
            <>
              {isActive ? <ReportIconActive width="22" height="22" /> : <ReportIcon width="22" height="22" />}
              매출관리
            </>
          )}
        </NavLink>
        <NavLink to="/admin/customers" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
          {({ isActive }) => (
            <>
              {isActive ? <CustomerIconActive width="22" height="22" /> : <CustomerIcon width="22" height="22" />}
              고객관리
            </>
          )}
        </NavLink>
      </nav>

      {/* 로그아웃 버튼을 사이드바 하단에 배치 */}
      
    </div>
  );
}

export default Sidebar;