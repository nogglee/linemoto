import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {ReactComponent as Logo } from "../../assets/icons/logo.svg"

const Header = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null; // null 가능성 허용
  const isLoggedIn = !!user;
  const isAdmin = user?.user?.role === "admin"; // 안전한 접근
  const userName = user?.user?.name || "";
  
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("selected_store_id"); 
    setUser(null);
    navigate("/", { replace: true }); // 로그아웃 후 메인페이지 이동
  };

  return (
    <header className="w-full left-0 top-0 px-4 md:px-[160px] lg:px-[200px] md:py-6">
      <div className="w-full bg-white flex justify-between items-center ">
        <Link to="/" className="text-xl font-bold"><Logo className="ml-1 w-[90px] md:w-[120px]"/></Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            isAdmin ? (
              <Link to="/admin" className="px-4 py-2 bg-blue-500 text-white rounded">관리자</Link>
            ) : (
              <Link to="/mypage" className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 text-white flex items-center justify-center rounded-full text-sm">
                  {userName.slice(-2)}
                </div>
              </Link>
            )
          ) : location.pathname === "/login" ? (
            <Link to="/signup" className="px-4 py-2 border border-gray-900 text-gray-900 rounded-2xl hover:bg-gray-900 hover:text-white">
              회원가입
            </Link>
          ) : location.pathname === "/signup" ? (
            <Link to="/login" className="px-4 py-2 bg-gray-900 text-white rounded-2xl">
              로그인
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gray-900 text-white rounded-2xl">
              로그인
            </Link>
          )}
          {isLoggedIn && (
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
              로그아웃
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;