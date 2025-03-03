import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { showToast } from "../common/components/Toast";

const Login = ({ setUser }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userData = await login(phoneNumber, password);
      if (userData) {

        localStorage.setItem("user", JSON.stringify(userData.data)); // ✅ user.data만 저장

        setUser(userData.data); // ✅ 상태 업데이트 보장

        showToast(`또 오셨네요 ${userData.data.name || ""} 라이더님!`, "success");

        // ✅ 로그인 성공 후 즉시 이동
        if (userData.data.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/", { replace: true }); // 고객은 상품 리스트 유지
        }
      }
    } catch (error) {
      showToast("로그인에 실패했어요 😞", "error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(); // Enter키 눌렀을 때 로그인 함수 호출
    }
  };

  return (
    <div className="flex w-full mt-4 sm:px-4 md:px-[160px] lg:px-[200px] min-h-screen justify-center">
      <div className="mt-20 sm:px-4 md:px-[300px]">
        <h1 className="text-4xl font-semibold text-center mb-10">로그인</h1>
        <input
          type="text"
          placeholder="전화번호"
          className="w-full px-3 py-2 border rounded mb-4"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <input
          type="password"
          placeholder="생년월일 6자리"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} className="w-full px-4 py-3 bg-blue-500 text-white rounded">로그인</button>
      </div>
    </div>
  );
};

export default Login;