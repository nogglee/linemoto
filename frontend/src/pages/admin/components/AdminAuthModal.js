import React, { useEffect } from "react";

function AdminAuthModal({ isOpen, onClose, onSubmit, inputRef }) {
  useEffect(() => {
    if (isOpen && inputRef?.current) {
      inputRef.current.focus(); // 🔹 모달이 열릴 때 자동 포커싱
    }
  }, [isOpen, inputRef]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // 🔹 기본 동작 방지 (ex. 폼 자동 제출 방지)
      onSubmit(inputRef.current.value);
    }
  };

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
            onKeyDown={handleKeyDown}
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