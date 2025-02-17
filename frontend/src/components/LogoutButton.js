import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // ✅ 로컬 스토리지에서 유저 정보 삭제
    setUser(null); // ✅ 상태 초기화
    navigate("/"); // ✅ 로그인 페이지로 이동
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;