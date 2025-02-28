import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import { fetchMemberInfo } from "../../api/members";
import { submitTransaction } from "../../api/transactions";
import PaymentPanel from "./PaymentPanel";

const POS = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [categories, setCategories] = useState(["기타"]);
  const [selectedCategory, setSelectedCategory] = useState("기타");

  // ✅ 상품 목록 불러오기 및 카테고리 세팅
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      const uniqueCategories = ["기타", ...new Set(data.map((product) => product.category))];
      setCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  // ✅ 장바구니에 상품 추가
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
        .filter((item) => item.quantity > 0)
    );
  };

  // ✅ 회원 선택
  const handleSelectMember = async (memberId) => {
    const memberInfo = await fetchMemberInfo(memberId); // getMemberInfo → fetchMemberInfo
    setSelectedMember(memberInfo);
  };

  // ✅ 포인트 사용 입력
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
      member_id: selectedMember?.id || null,
      admin_id: 1, // 임시
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
      setSelectedMember(null);
    }
  };

  return (
    <div className="flex h-full w-full rounded-3xl bg-gray-50 border-gray-200 border-[1px] overflow-hidden font-body">
      {/* 🔹 상품 목록 */}
      <div className="w-full p-8">
        {/* 🔹 카테고리 필터 */}
        <div className="flex border-b border-gray-300 mb-4 text-2xl">
          {categories.map((category) => (
            <button
              key={category}
              className={`py-3 px-6 text-gray-500 hover:text-gray-950 font-medium whitespace-nowrap ${
                selectedCategory === category ? "border-b-2 border-black text-gray-950 font-bold" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 🔹 상품 목록 */}
        <div
          className="grid gap-4 w-full"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}
        >
          {products
            .filter((product) =>
              selectedCategory === "기타" ? product.category === "기타" : product.category === selectedCategory
            )
            .map((product) => (
              <button
                key={product.id}
                className="border p-4 rounded-xl shadow flex flex-col justify-between items-start w-[140px] md:w-[160px] lg-[200px] aspect-square bg-white"
                onClick={() => addToCart(product)}
              >
                <h3 className="text-gray-950 text-lg font-semibold text-left">{product.name}</h3>
                <p className="text-gray-900 font-regular text-lg">{product.price.toLocaleString()} 원</p>
              </button>
            ))}
        </div>
      </div>

      {/* 🔹 결제 패널 */}
      <PaymentPanel
        cartItems={selectedProducts}
        setCartItems={setSelectedProducts}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        usedPoints={usedPoints}
        setUsedPoints={setUsedPoints}
        handleSelectMember={handleSelectMember}
        handlePointChange={handlePointChange}
        handlePayment={handlePayment}
      />
    </div>
  );
};

export default POS;