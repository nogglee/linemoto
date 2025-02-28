import React, { useState, useEffect } from "react";
import { fetchMemberInfo, fetchMembers, updateMemberPoints } from "../../api/members";
import { submitTransaction } from "../../api/transactions";
import SelectMemberModal from "./components/SelectMemeberModal";

const PaymentPanel = ({
  cartItems = [],
  setCartItems,
  addToCart,
  removeFromCart,
  selectedMember,
  setSelectedMember,
  usedPoints,
  setUsedPoints,
  handleSelectMember,
  handlePointChange,
  handlePayment,
}) => {
  const [memberPoints, setMemberPoints] = useState(0);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [members, setMembers] = useState([]);

  // ✅ 회원 포인트 조회
  useEffect(() => {
    if (selectedMember) {
      const fetchPoints = async () => {
        try {
          const member = await fetchMemberInfo(selectedMember.id);
          setMemberPoints(member.points);
        } catch (error) {
          console.error("Failed to fetch member points:", error);
          setMemberPoints(0);
        }
      };
      fetchPoints();
    }
  }, [selectedMember]);

  // ✅ 회원 목록 불러오기
  useEffect(() => {
    const loadMembers = async () => {
      try {
        const memberList = await fetchMembers();
        setMembers(memberList);
      } catch (error) {
        console.error("Failed to load members:", error);
        setMembers([]);
      }
    };
    loadMembers();
  }, []);

  // 🛠 총 결제 금액 계산
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // 🛠 전체 상품 선택 개수 계산 (quantity 합산)
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // 🛠 상품 삭제 핸들러
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // 🛠 전체 삭제 핸들러
  const clearCart = () => {
    setCartItems([]);
  };

  // 🛠 회원 선택 핸들러
  const onSelectMember = async (member) => {
    setSelectedMember(member);
    setIsMemberModalOpen(false);
  };

  return (
    <div className="w-[320px] bg-white p-6 border-l border-gray-200">
      {/* 🔹 전체 삭제 & 상품 개수 */}
      <div className="flex justify-between mb-4">
        <button className="text-red-500" onClick={clearCart}>
          전체삭제
        </button>
        <span className="text-gray-600">{totalQuantity}건</span>
      </div>

      {/* 🔹 상품 리스트 */}
      {cartItems.length === 0 ? (
        <p className="text-gray-400">선택된 상품 없음</p>
      ) : (
        cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center mb-2">
            <button className="text-red-500" onClick={() => removeItem(item.id)}>
              삭제
            </button>
            <span className="flex-1">{item.name}</span>
            <div className="flex items-center space-x-2">
              <button className="border px-2" onClick={() => removeFromCart(item)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button className="border px-2" onClick={() => addToCart(item)}>
                +
              </button>
            </div>
            <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))
      )}

      {/* 🔹 회원 선택 */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">회원</span>
        </div>
        <div className="flex items-center mt-2">
          <input
            type="text"
            placeholder="회원 검색"
            className="border p-2 w-full rounded mr-2"
            value={selectedMember ? selectedMember.name : ""}
            readOnly
          />
          <button
            className="bg-gray-200 text-black px-3 py-2 rounded"
            onClick={() => setIsMemberModalOpen(true)}
          >
            선택
          </button>
        </div>
      </div>

      {/* 🔹 포인트 사용 */}
      {selectedMember && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-gray-600">보유포인트</span>
          <span className="text-gray-600">{memberPoints.toLocaleString()}p</span>
        </div>
      )}
      {selectedMember && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-gray-600">포인트 사용</span>
          <span className="text-gray-600">{usedPoints.toLocaleString()}p</span>
        </div>
      )}

      {/* 🔹 결제 버튼 */}
      <div className="mt-4">
        <button
          className="w-full bg-black text-white py-3 rounded-lg"
          onClick={() => handlePayment("카드")}
        >
          {totalAmount.toLocaleString()}원 결제 {totalQuantity} {/* cartItems.length → totalQuantity */}
        </button>
      </div>

      {/* 🔹 회원 선택 모달 */}
      <SelectMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSelect={onSelectMember}
      />
    </div>
  );
};

export default PaymentPanel;