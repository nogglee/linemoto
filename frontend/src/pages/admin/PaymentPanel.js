import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMembers } from "../../api/members";
import { submitTransaction } from "../../api/transactions";
import SelectMemberModal from "./components/SelectMemeberModal";
import { toast } from "react-toastify";

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
}) => {
  const { user: admin } = useOutletContext();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("카드"); 
  const [adjustmentOpen, setAdjustmentOpen] = useState(false); 
  const [adjustmentType, setAdjustmentType] = useState("discount");
  const [adjustmentAmount, setAdjustmentAmount] = useState(0); 
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [appliedAdjustment, setAppliedAdjustment] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const maxDiscount = totalAmount; // 할인 최대 한도 = 상품 총 가격
  
  const adjustedAmount = adjustmentType === "discount"
    ? -Math.min(Math.abs(adjustmentAmount), maxDiscount) // 할인은 상품 가격을 넘을 수 없음
    : Math.abs(adjustmentAmount); // 추가 금액은 제한 없음

  const finalAmountBeforePoints = totalAmount + appliedAdjustment; // 조정 금액 반영 후 금액
  const finalAmount = Math.max(finalAmountBeforePoints - usedPoints, 0); // 포인트 사용 후 최소 0원

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const maxUsablePoints = Math.min(selectedMember?.points || 0, finalAmountBeforePoints); // 최대 사용 가능 
  const earnedPoints = selectedMember && finalAmount >= 10000 ? Math.floor(finalAmount * 0.05) : 0;

  // 회원 선택 시 포인트 사용 초기화
  useEffect(() => {
    setUsedPoints(0);
  }, [selectedMember]);

  // 회원 목록 불러오기
  useEffect(() => {
    const loadMembers = async () => {
      try {
        await fetchMembers();
      } catch (error) {
        console.error("Failed to load members:", error);
      }
    };
    loadMembers();
  }, []);

  // 상품 삭제 핸들러
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter((item) => item.id !== itemId));
  };

  // 전체 삭제 핸들러
  const clearCart = () => {
    setCartItems([]);
  };

  // 조정금액 적용 핸들러
  const applyAdjustment = () => {
    if (!adjustmentReason.trim()) {
      alert("금액 변경에 대한 사유를 입력해주세요.");
      return;
    }
    setAppliedAdjustment(adjustedAmount);
    setAdjustmentOpen(false);
  };

  // 조정금액 삭제 핸들러
  const removeAdjustment = () => {
    setAppliedAdjustment(0);
    setAdjustmentAmount(0);
    setAdjustmentReason("");
  };

  // 결제 핸들러
  const handlePayment = async (paymentMethod) => {
    if (isProcessing) return; 
    setIsProcessing(true); 
    try {
      const transactionData = {
        admin_id: admin.id, 
        admin_name: admin.name,
        customer_id: selectedMember ? selectedMember.account_id : null,
        total_amount: totalAmount,
        discount: usedPoints,
        adjustment: adjustmentAmount ? adjustedAmount : 0,
        adjustment_reason: adjustmentReason.trim(),
        final_amount: finalAmount,
        earned_points: selectedMember ? earnedPoints : 0,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await submitTransaction(transactionData);

      toast.success("✅ 결제가 완료되었습니다!", { position: "top-right", autoClose: 3000 });
      setCartItems([]);
      setUsedPoints(0);
      setSelectedMember(null);
      setPaymentMethod("카드");
      setAdjustmentAmount(0);
      setAdjustmentReason("");
      setAdjustmentOpen(false);
      setAppliedAdjustment(0);
    }
    catch (error) {
      console.error("❌ 결제 실패:", error);
      toast.error("❌ 결제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsProcessing(false); // ✅ 결제 완료 후 버튼 활성화
    }
  };

  // 숫자를 0,000 형식으로 변환하는 함수
  const formatNumber = (value) => {
    if (!value) return ""; // 값이 없으면 빈 문자열 반환
    const num = parseInt(value.replace(/,/g, ""), 10); // 쉼표 제거 후 숫자로 변환
    return isNaN(num) ? "" : num.toLocaleString(); // 숫자가 아니면 빈 문자열 반환
  };

  // 포인트 사용 입력 핸들러
  const handlePointInputChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // 쉼표 제거
    value = value ? Math.min(parseInt(value, 10), maxUsablePoints) : 0; // 최대 사용 가능 포인트 초과 방지
    setUsedPoints(formatNumber(value.toString())); // 포맷 적용
  };

  // 조정 금액 입력 핸들러
  const handleAdjustmentInputChange = (e) => {
    let value = e.target.value.replace(/,/g, ""); // ✅ 쉼표 제거
    value = value ? Math.abs(parseInt(value, 10)) : ""; // ✅ 음수 방지 (빈 값 허용)
    setAdjustmentAmount(value); // ✅ 상태는 숫자로 저장
  };

  return (
    <div className="w-[320px] bg-white p-6 border-l border-gray-200 overflow-auto">
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

      {/* 🔹 최종 결제 금액 */}
      <div className="mb-4 text-right text-gray-700 flex justify-between items-center">
        금액
        <span className="font-bold">{finalAmount.toLocaleString()}원</span>
        <button
          className="ml-2 px-2 py-1 border rounded text-gray-700 hover:bg-gray-200"
          onClick={() => setAdjustmentOpen(!adjustmentOpen)}
        >
          {adjustmentOpen ? "✕" : "+"}
        </button>
      </div>

      {/* 🔹 결제금액 조정 UI */}
      {adjustmentOpen && (
        <div className="mb-4 border p-3 rounded-lg bg-gray-100">
          <div className="mb-2">
            <label className="block text-gray-700">조정 타입</label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="adjustmentType"
                  checked={adjustmentType === "discount"}
                  value="discount"
                  onChange={() => setAdjustmentType("discount")}
                  min="0"
                  max={adjustmentType === "discount" ? maxDiscount : undefined}
                />
                <span>할인</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="addition"
                  checked={adjustmentType === "addition"}
                  onChange={() => setAdjustmentType("addition")}
                />
                <span>추가</span>
              </label>
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-gray-700">조정 금액</label>
            <input
              type="number"
              className="border rounded-lg p-2 w-full text-right"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700">조정 사유</label>
            <input
              type="text"
              className="border rounded-lg p-2 w-full"
              value={adjustmentReason}
              onChange={(e) => setAdjustmentReason(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-lg mt-2"
            onClick={applyAdjustment}
          >
            조정금액 적용
          </button>
        </div>
      )}

      {/* 🔹 조정 금액 표시 */}
      {appliedAdjustment !== 0 && (
        <div className="mb-2 text-right text-gray-700 flex justify-between items-center">
          <span>
            {appliedAdjustment < 0
              ? `- ${Math.abs(appliedAdjustment).toLocaleString()}원`
              : `+ ${Math.abs(appliedAdjustment).toLocaleString()}원`}
          </span>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={removeAdjustment}
          >
            ❌
          </button>
        </div>
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

      

      {/* 🔹 결제수단 선택 (라디오 버튼) */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">결제 수단</label>
        <div className="grid grid-cols-2 gap-2">
          {["카드", "현금", "계좌이체", "미수금"].map((method) => (
            <label
              key={method}
              className={`border rounded-lg p-3 text-center cursor-pointer ${
                paymentMethod === method ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                }}
                className="hidden"
              />
              {method}
            </label>
          ))}
        </div>
      </div>

      

      

      

      {/* ✅ 보유 포인트 */}
      {/* ✅ 회원이 선택된 경우에만 보유 포인트 표시 */}
      {selectedMember && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">보유포인트</label>
          <div className="text-gray-900 font-bold text-lg">
            {selectedMember.points.toLocaleString()}p
          </div>
        </div>
      )}

      {/* ✅ 포인트 사용 (보유 포인트 5만 이상일 때만 활성화) */}
      {selectedMember && (
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
      )}

      {/* ✅ 적립 예정 포인트 */}
      {/* ✅ 회원이 선택된 경우에만 예상 포인트 표시 */}
      {selectedMember && (
        <div className="mb-4 text-right text-gray-700">
          적립 예정 포인트: <span className="font-bold">{earnedPoints.toLocaleString()}p</span>
        </div>
      )}

      {/* ✅ 결제 버튼 */}
      <button
        className="w-full bg-black text-white py-3 rounded-lg font-semibold flex justify-between items-center"
        onClick={() => {
          console.log("🛠 결제 버튼 클릭됨!");
          console.log("🛠 handlePayment props 값:", handlePayment);
          console.log("🔍 현재 관리자 정보(admin):", admin);          
          handlePayment(paymentMethod)
        }}
        disabled={cartItems.length === 0} // 장바구니에 상품이 없으면 비활성화
      >
        {`${finalAmount.toLocaleString()}원 결제`}
        <span className="bg-white text-black px-2 py-1 rounded-full text-sm">
          {cartItems.length}
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