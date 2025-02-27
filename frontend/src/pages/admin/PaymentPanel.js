import React, { useState, useEffect } from "react";
import { fetchMemberPoints, updateMemberPoints, updateStock } from "../../api/transactions"; // API 호출
// import MemberSelectModal from "./MemberSelectModal"; // 회원 선택 팝업

const PaymentPanel = ({ cartItems = [], setCartItems }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberPoints, setMemberPoints] = useState(0);
  const [usedPoints, setUsedPoints] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [items, setItems] = useState([]); // ✅ 빈 배열로 초기화
  
  // 🛠 총 결제 금액 계산
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.count, 0);
  // 🛠 상품 삭제 핸들러
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // 🛠 전체 삭제 핸들러
  const clearCart = () => {
    setCartItems([]);
  };

  // 🛠 수량 변경 핸들러 (+ / - 버튼)
  const updateCount = (itemId, delta) => {
    setCartItems(cartItems.map((item) => 
      item.id === itemId ? { ...item, count: Math.max(1, item.count + delta) } : item
    ));
  };

  // 🛠 회원 선택 핸들러
  const handleMemberSelect = async (member) => {
    setSelectedMember(member);
    setIsMemberModalOpen(false);
    
    // 회원 포인트 조회
    const points = await fetchMemberPoints(member.id);
    setMemberPoints(points);
  };

  // 🛠 회원 선택 해제
  const clearMember = () => {
    setSelectedMember(null);
    setMemberPoints(0);
    setUsedPoints(0);
  };

  // 🛠 포인트 사용 핸들러
  const handleUsedPointsChange = (e) => {
    let value = parseInt(e.target.value, 10) || 0;
    if (value > memberPoints) value = memberPoints; // 보유 포인트 초과 방지
    setUsedPoints(value);
  };

  // 🛠 결제 처리
  const handlePayment = async () => {
    if (cartItems.length === 0) return alert("선택된 상품이 없습니다.");

    // 🔹 재고 차감
    await Promise.all(cartItems.map((item) => updateStock(item.id, item.count)));

    // 🔹 회원 포인트 적립 (1만원 이상 결제 시 10%)
    if (selectedMember) {
      const earnedPoints = totalAmount >= 10000 ? Math.floor(totalAmount * 0.1) : 0;
      const newPoints = memberPoints - usedPoints + earnedPoints;
      await updateMemberPoints(selectedMember.id, newPoints);
      alert(`결제 완료! ${earnedPoints}p 적립되었습니다.`);
    } else {
      alert("결제 완료!");
    }

    // 🔹 장바구니 비우기
    setCartItems([]);
    setSelectedMember(null);
    setMemberPoints(0);
    setUsedPoints(0);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      {/* 🛒 전체 삭제 & 상품 개수 */}
      <div className="flex justify-between mb-2">
        <button onClick={clearCart} className="text-red-500">전체삭제</button>
        <span className="text-gray-600">{cartItems.length}건</span>
      </div>

      {/* 🛒 상품 리스트 */}
      {cartItems.map((item) => (
        <div key={item.id} className="flex justify-between items-center py-2 border-b">
          <button onClick={() => removeItem(item.id)} className="text-red-500">삭제</button>
          <span>{item.name}</span>
          <div className="flex items-center">
            <button onClick={() => updateCount(item.id, -1)} className="px-2">-</button>
            <span className="mx-2">{item.count}</span>
            <button onClick={() => updateCount(item.id, 1)} className="px-2">+</button>
          </div>
          <span>{(item.price * item.count).toLocaleString()} 원</span>
        </div>
      ))}

      {/* 👤 회원 선택 */}
      <div className="mt-4 p-3 bg-gray-100 rounded">
        <div className="flex items-center">
          <span className="mr-2">회원</span>
          {selectedMember ? (
            <div className="flex items-center">
              <span className="mr-2">{selectedMember.name}</span>
              <button onClick={clearMember} className="text-red-500">✕</button>
            </div>
          ) : (
            <button onClick={() => setIsMemberModalOpen(true)} className="text-blue-500">선택</button>
          )}
        </div>
        {/* 보유 포인트 */}
        {selectedMember && (
          <>
            <div className="mt-2">보유포인트: {memberPoints.toLocaleString()}p</div>
            {/* 포인트 사용 (5만 이상) */}
            {memberPoints >= 50000 && (
              <div className="mt-2">
                <label>포인트 사용</label>
                <input
                  type="number"
                  value={usedPoints}
                  onChange={handleUsedPointsChange}
                  className="border rounded p-1 w-full"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* 💰 결제 버튼 */}
      <button
        onClick={handlePayment}
        className="w-full bg-black text-white p-3 mt-4 rounded-lg"
      >
        {totalAmount.toLocaleString()}원 결제 ({cartItems.length})
      </button>

      {/* 🔹 회원 선택 모달 */}
      {/* {isMemberModalOpen && (
        <MemberSelectModal 
          onClose={() => setIsMemberModalOpen(false)} 
          onSelect={handleMemberSelect} 
        />
      )} */}
    </div>
  );
};

export default PaymentPanel;