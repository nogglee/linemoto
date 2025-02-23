import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")); // 사용자 정보 가져오기
  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const userName = user?.name || "";

  console.log("🛠 현재 로그인 유저:", user); // 🔥 role 확인 로그 추가

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/"); // 로그아웃 후 메인페이지 이동
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Linemoto</Link>
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
        ) : (
          <Link to="/login" className="px-4 py-2 bg-blue-500 text-white rounded">로그인</Link>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;