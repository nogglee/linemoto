import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import { getMemberInfo } from "../../api/members";
import { submitTransaction } from "../../api/transactions";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [categories, setCategories] = useState(["전체"]);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // ✅ 상품 목록 불러오기 및 카테고리 세팅
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      
      // ✅ 카테고리 목록 추출 후 중복 제거
      const uniqueCategories = ["전체", ...new Set(data.map((product) => product.category))];
      setCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  // ✅ 상품 클릭 시 장바구니 추가
  const addToCart = (product) => {
    setSelectedProducts((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      return existingItem
        ? prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };

  // ✅ 장바구니에서 상품 수량 감소
  const removeFromCart = (product) => {
    setSelectedProducts((prev) =>
      prev
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // ✅ 수량이 0 이하로 내려가면 삭제
    );
  };

  // ✅ 회원 선택
  const handleSelectMember = async (memberId) => {
    const memberInfo = await getMemberInfo(memberId);
    setSelectedMember(memberInfo);
  };

  // ✅ 포인트 사용 입력 (사용 가능 한도 내에서 조정)
  const handlePointChange = (e) => {
    const value = Number(e.target.value);
    if (value <= (selectedMember?.points || 0)) {
      setUsedPoints(value);
    }
  };

  // ✅ 결제 요청
  const handlePayment = async (paymentMethod) => {
    const totalAmount = selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const finalAmount = totalAmount - usedPoints;

    const transactionData = {
      member_id: selectedMember?.id || null, // ✅ 비회원도 결제 가능
      admin_id: 1, // 임시 (추후 admin_id 받아오기)
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
    <div className="flex max-h-screen w-full rounded-3xl bg-gray-50 border-gray-200 border-[1px] overflow-hidden font-body">
      {/* 🔹 상품 목록 */}
      <div className="w-full p-8">
        {/* 🔹 카테고리 필터 */}
        <div className="flex border-b border-gray-300 mb-4 text-2xl">
          {categories.map((category) => (
            <button
              key={category}
              className={`py-3 px-6 text-gray-500 hover:text-gray-950 font-medium ${
                selectedCategory === category ? "border-b-2 border-black text-gray-950 font-bold" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 🔹 상품 목록 (반응형 `grid-auto-fit` 적용) */}
        <div className="grid gap-4 w-full" style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" 
        }}>
          {products
            .filter((product) => selectedCategory === "전체" || product.category === selectedCategory)
            .map((product) => (
              <button
                key={product.id}
                className="border p-4 rounded-xl shadow flex flex-col justify-between items-start w-[140px] md:w-[160px] lg-[200px]  aspect-square bg-white"
                onClick={() => addToCart(product)}
              >
                <h3 className="text-gray-950 text-lg font-semibold text-left">{product.name}</h3>
                <p className="text-gray-900 font-regular text-lg">{product.price.toLocaleString()} 원</p>
              </button>
            ))}
        </div>
      </div>

      {/* 🔹 결제 패널 */}
      <div className="w-[320px] bg-white p-6 border-l border-gray-200">
        <div className="flex justify-between mb-4">
          <h2 className="font-semibold">결제서제</h2>
          <button className="text-red-500" onClick={() => setSelectedProducts([])}>전체삭제</button>
        </div>

        {selectedProducts.length === 0 ? (
          <p className="text-gray-400">선택된 상품 없음</p>
        ) : (
          selectedProducts.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <button className="text-red-500" onClick={() => setSelectedProducts(selectedProducts.filter((p) => p.id !== item.id))}>
                삭제
              </button>
              <p className="flex-1 font-semibold">{item.name}</p>
              <div className="flex items-center space-x-2">
                <button className="border px-2" onClick={() => removeFromCart(item)}>-</button>
                <span>{item.quantity}</span>
                <button className="border px-2" onClick={() => addToCart(item)}>+</button>
              </div>
              <p className="font-bold">{(item.price * item.quantity).toLocaleString()} 원</p>
            </div>
          ))
        )}

        {/* 🔹 회원 선택 */}
        <div className="mt-4">
          <p className="text-lg font-semibold">회원</p>
          <input
            type="text"
            placeholder="회원 검색"
            className="border p-2 w-full rounded"
            onBlur={(e) => handleSelectMember(e.target.value)}
          />
        </div>

        {/* 🔹 포인트 사용 */}
        {selectedMember && (
          <div className="mt-2">
            <p className="text-gray-600">보유포인트: {selectedMember.points.toLocaleString()}p</p>
            <input
              type="number"
              placeholder="포인트 사용"
              className="border p-2 w-full rounded"
              value={usedPoints}
              onChange={handlePointChange}
            />
          </div>
        )}

        {/* 🔹 결제 버튼 */}
        <div className="mt-4">
          <p className="text-lg font-semibold">총 {selectedProducts.length}건</p>
          <p className="text-xl font-bold">
            {selectedProducts.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()} 원 결제
          </p>
          <button className="w-full bg-black text-white py-2 mt-2 rounded" onClick={() => handlePayment("카드")}>
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default POS;