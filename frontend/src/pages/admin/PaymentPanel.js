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
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const maxUsablePoints = Math.min(selectedMember?.points || 0, totalAmount); // 최대 사용 가능 포인트 (보유 포인트와 상품 총액 중 작은 값)


  // ✅ 회원 선택 시 포인트 사용 초기화
  useEffect(() => {
    setUsedPoints(0); // 회원이 변경되면 포인트 사용 초기화
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
      {/* ✅ 회원 선택 */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">회원</label>
        <div className="relative flex items-center border rounded-lg p-2">
          {selectedMember ? (
            <>
              <span className="text-gray-900 font-semibold flex-1">{selectedMember.name}</span>
              <button
                className="text-gray-500 hover:text-red-500 ml-2"
                onClick={() => setSelectedMember(null)}
              >
                ✕
              </button>
            </>
          ) : (
            <button
              className="bg-gray-900 text-white px-3 py-1 rounded-lg"
              onClick={() => setIsMemberModalOpen(true)}
            >
              선택
            </button>
          )}
        </div>
      </div>

      {/* ✅ 보유 포인트 */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">보유포인트</label>
        <div className="text-gray-900 font-bold text-lg">
          {selectedMember ? `${selectedMember.points.toLocaleString()}p` : "0p"}
        </div>
      </div>

      {/* ✅ 포인트 사용 (보유 포인트 5만 이상일 때만 활성화) */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">포인트 사용</label>
        <input
          type="number"
          className="border rounded-lg p-2 w-full text-right"
          value={usedPoints}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value < 0) return;
            if (value > maxUsablePoints) {
              setUsedPoints(maxUsablePoints); // 초과 입력 방지
            } else {
              setUsedPoints(value);
            }
          }}
          disabled={!selectedMember || selectedMember.points < 50000} // 5만 미만이면 비활성화
        />
      </div>

      {/* ✅ 장바구니 리스트 */}
      <div className="mb-4 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">장바구니</h3>
        {cartItems.length === 0 ? (
          <p className="text-gray-500">상품이 없습니다.</p>
        ) : (
          <ul>
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between items-center mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-bold">{(item.price * item.quantity).toLocaleString()}원</span>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => removeFromCart(item)}>-</button>
                  <button className="px-2 py-1 bg-gray-900 text-white rounded" onClick={() => addToCart(item)}>+</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ 결제 버튼 */}
      <button
        className="w-full bg-black text-white py-3 rounded-lg font-semibold flex justify-between items-center"
        onClick={() => handlePayment("카드")}
        disabled={cartItems.length === 0} // 장바구니에 상품이 없으면 비활성화
      >
        {`${(totalAmount - usedPoints).toLocaleString()}원 결제`}
        <span className="bg-white text-black px-2 py-1 rounded-full text-sm">
          {totalQuantity}
        </span>
      </button>

      {/* ✅ 회원 선택 모달 */}
      {isMemberModalOpen && (
        <SelectMemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onSelect={(member) => {
            handleSelectMember(member.id);
            setIsMemberModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default PaymentPanel;