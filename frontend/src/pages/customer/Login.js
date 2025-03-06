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
    if (e.key === "Enter" && phoneNumber && password) {
      handleLogin(); // Enter키 눌렀을 때 로그인 함수 호출
    }
  };

  return (
    <div className="flex w-full mt-4 px-4 md:px-[160px] lg:px-[200px] min-h-screen justify-center">
      <div className="mt-20 w-full max-w-md">
        <h1 className="text-3xl font-700 text-gray-900 text-center mb-5">로그인</h1>
        <div className="flex flex-col gap-1 mb-4">
          <label className="block font-500 text-sm text-gray-900">아이디</label>
          <input
            type="text"
            placeholder="전화번호를 입력하세요"
            className="w-full px-6 py-3 text-base text-gray-900 font-400 border border-gray-900 rounded-2xl placeholder:text-base placeholder:text-gray-400"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <label className="block font-500 text-sm text-gray-900">비밀번호</label>
          <input
            type="password"
            placeholder="생년월일 6자리를 입력하세요"
            className="w-full px-6 py-3 text-base text-gray-900 font-400 border border-gray-900 rounded-2xl placeholder:text-base placeholder:text-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button 
          onClick={handleLogin} 
          disabled={!phoneNumber || !password}
          className={`w-full mt-2 px-6 py-4 rounded-2xl text-base ${
            phoneNumber && password
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 cursor-not-allowed"
            }`}
        >
          로그인
        </button>
      </div>
    </div>
  );
};

export default Login;