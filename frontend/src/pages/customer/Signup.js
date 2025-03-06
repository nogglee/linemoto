import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../common/components/Toast";
import { signupUser } from "../../api/auth";
import { ReactComponent as ArrowIcon } from "../../assets/icons/ico-arrow-down.svg";

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
      showToast("이름이 비어있어요!", "fail");
      setIsSubmitting(false);
      return;
    }
    if (!phone) {
      showToast("휴대폰번호는 필수입니다!", "fail");
      setIsSubmitting(false);
      return;
    }
    if (!year || !month || !day) {
      showToast("생년월일은 임시비밀번호로 쓰여요!", "fail");
      setIsSubmitting(false);
      return;
    }
    if (!isChecked) {
      showToast("개인정보 제공에 동의해 주세요.", "fail");
      setIsSubmitting(false);
      return;
    }
  
    const userData = { name, phone, birth: getBirthValue() };
  console.log("📌 회원가입 요청 데이터:", userData);

  try {
    await signupUser(userData);
    showToast("회원가입이 완료되었습니다!", "success");
    setTimeout(() => navigate("/login"), 2000);
  } catch (error) {
    console.error("❌ 회원가입 오류:", error.response?.data?.message || error.message);
    
    // 중복된 번호일 경우 회원가입 중단 (return 추가)
    if (error.response?.status === 400 && (error.response.data.message === "이미 등록된 전화번호입니다." || error.response.data.error === "이미 등록된 전화번호입니다.")) {
      showToast("이미 가입된 번호예요. 가입한적이 있으신가요?", "fail");
      setIsSubmitting(false);
      return; // 🚀 여기서 종료해야 회원가입이 진행되지 않음!
    }
    // 일반적인 회원가입 실패 처리
    showToast("회원가입에 실패했어요. 다시 시도해 주세요 🙏", "fail");
    setIsSubmitting(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex w-full mt-4 px-4 md:px-[160px] lg:px-[200px] min-h-screen justify-center">
      <div className="mt-20 w-full max-w-md">
        <h2 className="text-3xl font-700 text-gray-900 text-center mb-5">회원가입</h2>
        <div className="flex flex-col gap-1 w-full mb-4">
          <label className="block font-500 text-sm text-gray-900">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력하세요"
            className="w-full px-6 py-3 text-base text-gray-900 font-400 border border-gray-900 rounded-2xl placeholder:text-base placeholder:text-gray-400"
          />
        </div>

        {/* 휴대폰번호 */}
        <div className="flex flex-col gap-1 w-full mb-4">
          <label className="block font-500 text-sm text-gray-900">휴대폰번호</label>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="숫자만 입력하세요"
            pattern="\d*"
            className="w-full px-6 py-3 text-base text-gray-900 font-400 border border-gray-900 rounded-2xl placeholder:text-base placeholder:text-gray-400"
            maxLength="11"
          />
        </div>

        {/* 생년월일 */}
        <div className="flex flex-col gap-1 w-full mb-4">
          <label className="block font-500 text-sm text-gray-900">생년월일</label>
          <div className="flex space-x-2">
            <select value={year} onChange={(e) => setYear(e.target.value)} className="p-3 border border-gray-900 rounded-2xl w-1/3">
              <option value="">년</option>
              {Array.from({ length: 75 }, (_, i) => 2010 - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="p-3 border border-gray-900 rounded-2xl w-1/3">
              <option value="">월</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m.toString().padStart(2, "0")}>{m}</option>
              ))}
            </select>
            <select value={day} onChange={(e) => setDay(e.target.value)} className="p-3 border border-gray-900 rounded-2xl w-1/3">
              <option value="">일</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d.toString().padStart(2, "0")}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm text-gray-700">개인정보 수집 및 이용에 동의합니다.</span>
        </label>

        {/* 회원가입 버튼 */}
        <button
    className={`w-full mt-2 px-6 py-4 rounded-2xl text-base ${
      isChecked && !isSubmitting ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 cursor-not-allowed"
    }`}
    disabled={!isChecked || isSubmitting} // ✅ isSubmitting이 true면 비활성화
  >
    {isSubmitting ? "처리 중..." : "회원가입"}
  </button>
  </div>
    </form>
  );
};

export default SignupForm;