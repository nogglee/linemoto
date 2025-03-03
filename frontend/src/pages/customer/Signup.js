import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signupUser } from "../../api/auth";

const SignupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ 중복 클릭 방지 상태 추가

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/\D/g, "");
    setPhone(onlyNums);
  };

  const getBirthValue = () => {
    if (year && month && day) {
      return `${year.slice(-2)}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isSubmitting) return; // ✅ 이미 제출 중이면 중복 클릭 방지
    setIsSubmitting(true); // ✅ 버튼 클릭 즉시 비활성화
  
    if (!name) {
      toast.error("이름을 입력해 주세요!");
      setIsSubmitting(false);
      return;
    }
    if (!phone) {
      toast.error("휴대폰번호를 입력해 주세요!");
      setIsSubmitting(false);
      return;
    }
    if (!year || !month || !day) {
      toast.error("생년월일을 입력해 주세요!");
      setIsSubmitting(false);
      return;
    }
    if (!isChecked) {
      toast.error("개인정보 동의에 체크해 주세요!");
      setIsSubmitting(false);
      return;
    }
  
    const userData = { name, phone, birth: getBirthValue() };
  console.log("📌 회원가입 요청 데이터:", userData);

  try {
    await signupUser(userData);
    toast.success("회원가입이 완료되었습니다!", { position: "top-center", autoClose: 2000 });
    setTimeout(() => navigate("/login"), 2000);
  } catch (error) {
    console.error("❌ 회원가입 오류:", error.response?.data?.message || error.message);
    
    // ✅ 중복된 번호일 경우 회원가입 중단 (return 추가)
    if (error.response?.status === 400 && (error.response.data.message === "이미 등록된 전화번호입니다." || error.response.data.error === "이미 등록된 전화번호입니다.")) {
      toast.error("이미 가입된 휴대폰 번호입니다. 다른 번호를 사용해 주세요.");
      setIsSubmitting(false);
      return; // 🚀 여기서 종료해야 회원가입이 진행되지 않음!
    }
    // 일반적인 회원가입 실패 처리
    toast.error("회원가입에 실패했습니다. 다시 시도해 주세요.");
    setIsSubmitting(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4 bg-white shadow-lg rounded-xl">
      <h2 className="text-xl font-bold text-center">회원가입</h2>

      {/* 이름 */}
      <div>
        <label className="block font-bold text-gray-700">이름</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="실명을 입력해 주세요"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* 휴대폰번호 */}
      <div>
        <label className="block font-bold text-gray-700">휴대폰번호</label>
        <input
          type="tel"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="숫자만 입력해 주세요"
          pattern="\d*"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
          maxLength="11"
        />
      </div>

      {/* 생년월일 */}
      <div>
        <label className="block font-bold text-gray-700">생년월일</label>
        <div className="flex space-x-2">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="p-2 border rounded w-1/3">
            <option value="">년</option>
            {Array.from({ length: 75 }, (_, i) => 2010 - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-2 border rounded w-1/3">
            <option value="">월</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m.toString().padStart(2, "0")}>{m}</option>
            ))}
          </select>
          <select value={day} onChange={(e) => setDay(e.target.value)} className="p-2 border rounded w-1/3">
            <option value="">일</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d.toString().padStart(2, "0")}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="w-5 h-5 accent-blue-500"
        />
        <span className="text-sm text-gray-700">개인정보 수집 및 이용에 동의합니다.</span>
      </label>

      {/* 회원가입 버튼 */}
      <button
  className={`px-4 py-2 rounded-md text-white ${
    isChecked && !isSubmitting ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
  }`}
  disabled={!isChecked || isSubmitting} // ✅ isSubmitting이 true면 비활성화
>
  {isSubmitting ? "처리 중..." : "회원가입"}
</button>
    </form>
  );
};

export default SignupForm;