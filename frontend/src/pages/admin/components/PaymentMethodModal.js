import React from "react";

const PaymentMethodModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  const paymentMethods = ["카드", "현금", "계좌이체", "미수금"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">결제 수단 선택</h2>
        <div className="grid grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method}
              className="bg-gray-100 p-3 rounded-lg text-center hover:bg-gray-200"
              onClick={() => onSelect(method)}
            >
              {method}
            </button>
          ))}
        </div>
        <button className="mt-4 w-full bg-red-500 text-white py-2 rounded" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

export default PaymentMethodModal;