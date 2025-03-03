import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ReactComponent as PosIcon } from '../../assets/icons/ico-pos.svg';
import { ReactComponent as ProductIcon } from '../../assets/icons/ico-product.svg';
import { ReactComponent as CustomerIcon } from '../../assets/icons/ico-customer.svg';
import { ReactComponent as ReportIcon } from '../../assets/icons/ico-report.svg';
import { ReactComponent as PosIconActive } from '../../assets/icons/ico-pos-active.svg';
import { ReactComponent as ProductIconActive } from '../../assets/icons/ico-product-active.svg';
import { ReactComponent as CustomerIconActive } from '../../assets/icons/ico-customer-active.svg';
import { ReactComponent as ReportIconActive } from '../../assets/icons/ico-report-active.svg';
import { ReactComponent as LogoutIcon } from '../../assets/icons/ico-logout.svg';


function Sidebar({ user, setUser }) {
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/", { replace: true });
  };

  const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;

  // 패스워드 입력 확인 후 페이지 이동
  const handlePasswordSubmit = () => {
    if (password === adminPassword) {
      setIsAuthModalOpen(false);
      navigate("/admin/sales");
    } else {
      alert("비밀번호가 틀렸습니다.");
      setPassword("");
    }
  };

  return (
    <div className="bg-gray-100 py-10 px-5 font-body flex flex-col gap-5 ">
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
        {/* <NavLink to="/admin/sales" className={({ isActive }) => isActive ? "active nav-item" : "nav-item"}>
          {({ isActive }) => (
            <>
              {isActive ? <ReportIconActive width="22" height="22" /> : <ReportIcon width="22" height="22" />}
              매출관리
            </>
          )}
        </NavLink> */}
         <button
          className="nav-item flex items-center gap-2"
          onClick={() => setIsAuthModalOpen(true)}
        >
          <ReportIcon width="22" height="22" />
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

      {/* 패스워드 입력 모달 */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">매출 관리 접근</h2>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setIsAuthModalOpen(false)}>
                취소
              </button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handlePasswordSubmit}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;