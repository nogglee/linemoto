import React, { useState } from "react";

const StockUpdateModal = ({ product, onUpdateStock, onClose }) => {
  const [amount, setAmount] = useState("");

  const handleStockChange = (change) => {
    if (!amount || isNaN(amount)) {
      alert("변경할 수량을 입력하세요.");
      return;
    }
    onUpdateStock(product.id, change * parseInt(amount, 10));
    setAmount("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">재고 수정 - {product.name}</h2>
        <input
          type="number"
          placeholder="수량 입력"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded w-full mb-4"
        />
        <div className="flex space-x-4">
          <button onClick={() => handleStockChange(1)} className="bg-green-500 text-white px-4 py-2 rounded">
            추가
          </button>
          <button onClick={() => handleStockChange(-1)} className="bg-red-500 text-white px-4 py-2 rounded">
            차감
          </button>
        </div>
        <button onClick={onClose} className="mt-4 block text-center w-full text-gray-500">닫기</button>
      </div>
    </div>
  );
};

export default StockUpdateModal;
