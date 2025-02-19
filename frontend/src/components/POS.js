import React, { useEffect, useState } from "react";
import { getProducts, submitTransaction, getMemberInfo, updateMemberPoints } from "../api/api";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);

  // 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // 상품 클릭 시 장바구니에 추가
  const addToCart = (product) => {
    const existingItem = selectedProducts.find((item) => item.id === product.id);
    if (existingItem) {
      setSelectedProducts((prev) =>
        prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      );
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  // 회원 선택
  const handleSelectMember = async (memberId) => {
    const memberInfo = await getMemberInfo(memberId);
    setSelectedMember(memberInfo);
  };

  // 포인트 사용 입력
  const handlePointChange = (e) => {
    const value = Number(e.target.value);
    if (value <= (selectedMember?.points || 0)) {
      setUsedPoints(value);
    }
  };

  // 결제 요청
  const handlePayment = async (paymentMethod) => {
    const totalAmount = selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const finalAmount = totalAmount - usedPoints;

    const transactionData = {
      member_id: selectedMember?.id,
      admin_id: 1, // 어드민 ID (임시)
      total_amount: totalAmount,
      discount: usedPoints,
      final_amount: finalAmount,
      payment_method: paymentMethod,
      items: selectedProducts.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    const response = await submitTransaction(transactionData);
    if (response) {
      alert("결제 완료!");
      setSelectedProducts([]);
      setUsedPoints(0);
    }
  };

  return (
    <div>
      <h1>POS 시스템</h1>
      <div>
        {products.map((product) => (
          <button key={product.id} onClick={() => addToCart(product)}>
            {product.name} - {product.price}원
          </button>
        ))}
      </div>
      <h2>선택한 상품</h2>
      {selectedProducts.map((item) => (
        <div key={item.id}>
          {item.name} - {item.quantity}개
        </div>
      ))}
      <h2>포인트 사용</h2>
      <input type="number" value={usedPoints} onChange={handlePointChange} />
      <h2>결제</h2>
      <button onClick={() => handlePayment("card")}>카드 결제</button>
      <button onClick={() => handlePayment("cash")}>현금 결제</button>
    </div>
  );
};

export default POS;