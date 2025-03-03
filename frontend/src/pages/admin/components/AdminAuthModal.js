import React, { useEffect } from "react";
import { showToast } from "../../common/components/Toast";

function AdminAuthModal({ isOpen, onClose, onSubmit, inputRef }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // 기본 동작 방지 (폼 자동 제출 방지)
        const password = inputRef.current.value;

        // 비밀번호가 일치하는지 확인하고, 일치하면 onSubmit 호출
        if (password === `${process.env.REACT_APP_ADMIN_PASSWORD}`) {
          onSubmit(password); // 비밀번호가 맞으면 처리
        } else {
          showToast("비밀번호가 일치하지 않아요 👮🏻‍♂️", "error"); // 비밀번호 틀린 경우
        }
      }

      if (event.key === "Escape") {
        onClose(); // ESC 키 입력 시 모달 닫기
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onSubmit, inputRef]); // 의존성 배열에 필요한 값 추가

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-bold mb-4">관리자 인증</h2>
          <input
            type="password"
            ref={inputRef}
            placeholder="비밀번호 입력"
            className="border p-2 rounded w-full"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>취소</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => onSubmit(inputRef.current.value)}>확인</button>
          </div>
        </div>
      </div>
    )
  );
}

export default AdminAuthModal;