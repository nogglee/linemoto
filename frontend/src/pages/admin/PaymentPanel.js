import React, { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { fetchMembers } from "../../api/members";
import { submitTransaction, getAdminStoreId } from "../../api/transactions";
import SelectMemberModal from "./components/SelectMemeberModal";
import { showToast } from "../common/components/Toast";
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
  const pointInputRef = useRef(null);

  // localStorage에서 admin 정보 가져오기
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const accountId = storedUser?.user?.id; // accounts.account_id
  const [adminId, setAdminId] = useState(null); // admins.id로 변환
  const [storeId, setStoreId] = useState(null); // admins_stores.store_id
  
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

  useEffect(() => {
    const fetchAdminDetails = async () => {
      if (accountId) {
        try {
          const response = await getAdminStoreId(accountId); // 새 API 호출
          setAdminId(response.admin_id); // admins.id
          setStoreId(response.store_id); // shops.stores.id
        } catch (error) {
          console.error("❌ 관리자 및 스토어 정보 불러오기 실패:", error);
          showToast("관리자 정보 로드 실패. 다시 로그인해 주세요.", "fail");
        }
      }
    };
    fetchAdminDetails();
  }, [accountId]);
  
  // 회원 선택 시 포인트 사용 초기화
  useEffect(() => {
    setUsedPoints(0);
  }, [selectedMember]);

  useEffect(() => {
    if (adjustmentOpen && adjustmentInputRef.current) {
      adjustmentInputRef.current.focus();
    }
  }, [adjustmentOpen]); 

  useEffect(() => {
    if (selectedMember && pointInputRef.current) {
      pointInputRef.current.focus(); 
    }
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
      showToast("조정 사유를 입력해 주세요.", "fail");
      return;
    }

    if (!adjustedAmount) {
      showToast("조정 금액을 입력해 주세요.", "fail");
      return;
    }

    setAppliedAdjustment(adjustedAmount);
    showToast(`${adjustmentType === "discount" ? "할인" : "할증"}이 적용되었습니다.`, "success");
    setAdjustmentOpen(false);
  };

  // 조정금액 삭제 핸들러
  const removeAdjustment = () => {
    setAppliedAdjustment(0);
    setAdjustmentAmount(0);
    setAdjustmentReason("");
  };

   // 키다운 이벤트 처리
   const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      applyAdjustment(); // Enter 키 눌렀을 때 applyAdjustment 실행
    }
  };

  // 결제 핸들러
  const handlePayment = async (paymentMethod) => {
    if (isProcessing) return; 
    setIsProcessing(true); 

    const storeId = localStorage.getItem("selected_store_id");
    if (!storeId) {
      showToast("선택된 매장이 없습니다.", "fail");
      setIsProcessing(false);
      return;
    }

    try {
      const transactionData = {
        admin_id: adminId, // admins.id
        admin_name: storedUser?.user?.name || admin.name,
        customer_id: selectedMember ? selectedMember.account_id : null,
        total_amount: totalAmount,
        discount: usedPoints,
        adjustment: adjustmentAmount ? adjustedAmount : 0,
        adjustment_reason: adjustmentReason.trim(),
        final_amount: finalAmount,
        earned_points: selectedMember ? earnedPoints : 0,
        payment_method: paymentMethod,
        store_id: storeId, // shops.stores.id
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await submitTransaction(transactionData);

      showToast("결제가 완료되었습니다!", "success");
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
      showToast("결제에 실패했습니다. 다시 시도해 주세요.", "fail");
    } finally {
      setIsProcessing(false); // ✅ 결제 완료 후 버튼 활성화
    }
  };

  return (
    <div className="w-[400px] min-w-[260px] bg-white border-l border-gray-200 overflow-auto payment-panel">
      <div className="flex flex-col justify-between h-full">
      <div className={`flex items-center border-b border-gray-100 p-5 font-500 ${ cartItems.length > 1 ? "justify-between" : "justify-end" }`}>
        {cartItems.length > 1 && (
          <button
            className="bg-gray-100 px-2.5 py-1 rounded-md text-red-500 text-sm"
            onClick={clearCart}
          >
            전체삭제
          </button>
        )}
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
                    onKeyDown={handleKeyDown}
                    className="border-b border-gray-200 p-2 w-full"
                    placeholder="조정 사유를 입력하세요"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <input
                      type="number"
                      className="border-b border-gray-200 py-2 pl-2 w-full"
                      placeholder={`${adjustmentType === "discount" ? "할인" : "할증"} 금액을 입력하세요`}
                      onKeyDown={handleKeyDown}
                      value={adjustmentAmount == 0 ? "" : adjustmentAmount}
                      onFocus={() => setAdjustmentAmount("")}
                      onBlur={(e) => { if (e.target.value === 0) setAdjustmentAmount(0) }}
                      onChange={(e) => { 
                        
                        let value = e.target.value.replace(/,/g, "");
                        let numericValue = value ? parseInt(value, 10) : 0;
                        
                        if (adjustmentType === "discount" && numericValue > totalAmount) {
                          numericValue = totalAmount; 
                        }
                        setAdjustmentAmount(numericValue);
                      }}
                    />
                    <button
                      className={`w-24 py-2 rounded-lg mt-1 text-sm text-white ${
                        adjustmentAmount && adjustmentReason.trim()
                          ? "bg-gray-700 hover:bg-gray-950 cursor-pointer"
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
      <div className="mb-6 px-5">
        
        {/* 회원 선택 */}
        <div className="flex justify-between items-center border border-gray-900 rounded-xl px-3 py-2.5 mb-2.5">
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
        
        {/* 보유 포인트 */}
        {selectedMember && (
          <div className="flex justify-between items-center rounded-xl px-2 py-2.5 mb-2.5">
            <label className="text-base font-500 text-gray-600">보유포인트</label>
            <div className="text-gray-900 font-700 text-lg">
              {selectedMember.points.toLocaleString()}p
            </div>
          </div>
        )}

        {/* 포인트 사용 (보유 포인트 5만 이상일 때만 활성화) */}
        {selectedMember && (
        <div className={`flex justify-between rounded-xl px-3 py-2.5 mb-1.5 ${
          !selectedMember || selectedMember.points < 50000  
            ? "bg-gray-100 text-gray-200 cursor-not-allowed"
            : "border border-gray-900 text-gray-950"
          }`}
        >
          <span className="font-500 text-gray-600 white-space: nowrap;">포인트 사용</span>
          <div className="flex font-700">
          <input
            ref={pointInputRef}
            type="number"
            className="text-right bg-transparent w-28"
            placeholder={`최대 ${maxUsablePoints.toLocaleString()}p`} // ✅ 최대 사용 가능 포인트 표시
            value={usedPoints === 0 ? "" : usedPoints} // 0이면 입력창 비우기
            onFocus={() => {
              if (usedPoints === 0) setUsedPoints(""); // 포커스 시 0 삭제
            }}
            onBlur={() => {
              if (usedPoints === "") setUsedPoints(0); // 입력값 없으면 0으로 복구
            }}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자 이외 문자 제거
              if (value === "") {
                setUsedPoints(""); // 값이 없으면 빈 문자열 유지
                return;
              }
              
              let numericValue = parseInt(value, 10);
              if (isNaN(numericValue)) numericValue = 0;

              if (numericValue > maxUsablePoints) {
                setUsedPoints(maxUsablePoints); // ✅ 최대 사용 가능 포인트 초과 시 자동 조절
              } else {
                setUsedPoints(numericValue);
              }
            }}
          />
          {usedPoints > 0 && (
            <span className="w-fit">p</span>
          )}
          </div>
        </div>
        )}

        {/* 적립 예정 포인트 */}
        {selectedMember && (
          <div className="mb-5 text-right text-gray-600">
            <span className="font-400 text-sm">{earnedPoints.toLocaleString()}p 적립예정</span>
          </div>
        )}
        

        {/* 🔹 결제수단 선택 (라디오 버튼) */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2" >
            {["카드", "현금", "계좌이체", "미수금"].map((method) => (
              <label
                key={method}
                className={`rounded-xl p-3 text-center cursor-pointer ${
                  paymentMethod === method ? "bg-gray-950 text-white font-600" : "bg-gray-50 text-gray-500 hover:bg-gray-900 hover:text-white hover:font-600"
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

        {/* 결제 버튼 */}
        <button
          className="w-full bg-gray-950 text-white px-3 py-3 rounded-2xl font-semibold flex justify-center gap-2.5 items-center"
          onClick={() => { handlePayment(paymentMethod) }}
          disabled={cartItems.length === 0} // 장바구니에 상품이 없으면 비활성화
        >
          {`${finalAmount.toLocaleString()}원 결제`}
            {cartItems.length > 0 && (
              <span className="bg-white text-black w-6 aspect-square rounded-full text-sm">
                  <p className="pt-[1px]">{totalQuantity}</p>
              </span>
            )}
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