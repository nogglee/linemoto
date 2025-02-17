import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";

const Login = ({ setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(phoneNumber, password);
      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData)); // ✅ 로컬 스토리지에 저장
      setUser(userData);

      // ✅ 🔹 로그인 성공 후 role에 따라 이동
      if (userData.role === "admin") {
        navigate("/admin");
      } else if (userData.role === "customer") {
        navigate("/customer");
      } else {
        navigate("/"); // 혹시 모를 예외처리
      }
    } catch (error) {
      alert("로그인 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="text" placeholder="휴대폰 번호" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
      <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">로그인</button>
    </form>
  );
};

export default Login;