import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMembers } from "../../api/members";
import { submitTransaction } from "../../api/transactions";
import SelectMemberModal from "./components/SelectMemeberModal";
import { toast } from "react-toastify";
import { ReactComponent as MinusIcon } from "../../assets/icons/ico-minus.svg";
import { ReactComponent as PlusIcon } from "../../assets/icons/ico-plus.svg";
import { ReactComponent as DeleteIcon } from "../../assets/icons/ico-delete-circle.svg";

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
  const adjustmentInputRef = useRef(null); 
  
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

  useEffect(() => {
    if (adjustmentOpen && adjustmentInputRef.current) {
      adjustmentInputRef.current.focus(); // ✅ 조정 UI 열릴 때 input에 포커스
    }
  }, [adjustmentOpen]); // ✅ adjustmentOpen 상태가 변경될 때 실행

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

  return (
    <div className="w-[400px] bg-white border-l border-gray-200 overflow-auto">
      <div className="flex flex-col justify-between h-full">
      <div className="flex justify-between items-center border-b border-gray-100 p-5 font-500">
        <button className="bg-gray-100 px-2.5 py-1 rounded-md text-red-500 text-sm" onClick={clearCart}>
          전체삭제
        </button>
        <span className="text-blue-500">{totalQuantity}건</span>
      </div>
      <div className="flex flex-col h-full">
        {/* 🔹 상품 리스트 */}
        {cartItems.length === 0 ? (
          <p className="flex flex-col gap-4 p-5 text-gray-400">상품을 선택해 주세요</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 border-b border-gray-100 p-5">
              <div className="flex justify-between">
                <button className="bg-gray-100 px-2.5 py-1 h-fit rounded-md text-red-500 font-500  text-sm" onClick={() => removeItem(item.id)}>
                  삭제
                </button>
              <div className="flex items-center border border-gray-200 rounded-lg h-8 px-2.5">
                  <button className="rounded-md hover:bg-gray-200 transition disabled:opacity-50" onClick={() => removeFromCart(item)}>
                    <MinusIcon />
                  </button>
                  <span className="text-gray-900 font-500 text-lg mx-4">{item.quantity}</span>
                  <button className="rounded-md hover:bg-gray-200 transition" onClick={() => addToCart(item)}>
                    <PlusIcon />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-700 text-gray-950 text-lg">{item.name}</span>
                <span className="font-300 text-lg">{(item.price * item.quantity).toLocaleString()}원</span>
              </div>
            </div>
          ))
        )}

        {/* 🔹 최종 결제 금액 */}
        {cartItems.length > 0 && (
          <div className="flex flex-col p-5 gap-2">
            <div className={`flex items-center ${ appliedAdjustment ? "justify-end" : "justify-between" }`}>
              {appliedAdjustment === 0 && (
                <button
                  className={`px-2.5 py-1 rounded-md text-sm text-blue-500 bg-blue-50`}
                  onClick={() => setAdjustmentOpen(!adjustmentOpen)}
                >
                  {adjustmentOpen ? "닫기" : "금액 조정"}
                </button>
              )}
              <span className="font-bold text-gray-950 text-xl">총 {finalAmount.toLocaleString()}원</span>
              </div>

            {/* 🔹 결제금액 조정 UI */}
            {adjustmentOpen && (
              <div className="">
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex bg-gray-100 rounded-lg py-1 px-1 text-sm w-full h-fit">
                    <button
                      className={`flex-1 py-1 text-center rounded-lg transition ${
                        adjustmentType === "discount" ? "bg-white shadow text-gray-800 font-600" : "text-gray-500 font-400"
                      }`}
                      onClick={() => setAdjustmentType("discount")}
                    >
                      할인
                    </button>
                    <button
                      className={`flex-1 py-1 text-center rounded-lg transition ${
                        adjustmentType === "addition" ? "bg-white shadow text-gray- font-600" : "text-gray-500 font-400"
                      }`}
                      onClick={() => setAdjustmentType("addition")}
                    >
                      추가
                    </button>
                  </div>
                  <input
                    ref={adjustmentInputRef}
                    type="text"
                    className="border-b border-gray-200 p-2 w-full"
                    placeholder="조정 사유를 입력하세요"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                  <div className="flex my-2 gap-2 justify-end">
                    <input
                      type="number"
                      className={`border-b border-gray-200 p-2 w-full ${
                        adjustmentAmount ? "text-right" : "text-left"
                      }`}
                      placeholder={`${adjustmentType === "discount" ? "할인" : "할증"} 금액을 입력하세요`}
                      value={adjustmentAmount == 0 ? "" : adjustmentAmount}
                      onFocus={() => setAdjustmentAmount("")}
                      onBlur={(e) => { if (e.target.value === 0) setAdjustmentAmount(0) }}
                      onChange={(e) => { const value = e.target.value.replace(/,/g, ""); setAdjustmentAmount(value ? parseInt(value, 10) : ""); }}
                    />
                    <button
                      className={`w-24 py-2 rounded-lg mt-2 text-white ${
                        adjustmentAmount && adjustmentReason.trim()
                          ? "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                      onClick={applyAdjustment}
                    >
                      완료
                    </button>
                  </div>
                </div>
                
          


              </div>
            )}

            {/* 🔹 조정 금액 표시 */}
            {appliedAdjustment !== 0 && (
              <div className="text-gray-400 flex justify-between items-center">
                <button
                  className="text-gray-500 border border-gray-500 hover:bg-gray-500 hover:text-white px-2.5 py-1 rounded-md text-sm"
                  onClick={removeAdjustment}
                >
                  {appliedAdjustment < 0 ? "할인 취소" : "할증 취소"}
                </button>
                <span>
                  {appliedAdjustment < 0
                    ? `- ${Math.abs(appliedAdjustment).toLocaleString()}원`
                    : `+ ${Math.abs(appliedAdjustment).toLocaleString()}원`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mb-10 px-5">
        {/* 🔹 회원 선택 */}
        {/* ✅ 회원 선택 */}
        <div className="flex justify-between items-center border border-gray-900 rounded-xl px-3 py-2.5">
            {selectedMember ? (
              <>
                <span className="text-gray-900 font-semibold flex-1">{selectedMember.name}</span>
                <DeleteIcon 
                  onClick={() => setSelectedMember(null)} 
                  className="cursor-pointer"
                />
              </>
            ) : (
              <>
                <span className="text-base font-500 text-gray-600">비회원</span>
                <button
                  className="bg-gray-900 text-white text-sm font-500 px-2.5 py-1 rounded-md"
                  onClick={() => setIsMemberModalOpen(true)}
                >
                  선택
                </button>
              </>
            )}
        </div>

        

        {/* 🔹 결제수단 선택 (라디오 버튼) */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">결제 수단</label>
          <div className="grid grid-cols-2 gap-2" >
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
      </div>
    </div>
  );
};

export default PaymentPanel;