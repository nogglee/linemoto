import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import { fetchMemberInfo } from "../../api/members";
import { submitTransaction } from "../../api/transactions";
import PaymentPanel from "./PaymentPanel";
import { toast } from "react-toastify";
import { updateProductStock } from "../../api/products"; // 상품 재고 업데이트 API 임포트
import { useOutletContext } from "react-router-dom";

const POS = (user) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [categories, setCategories] = useState(["기타"]);
  const [selectedCategory, setSelectedCategory] = useState("기타");
  const { stock, setStock } = useOutletContext();

  // 상품 목록 불러오기 및 카테고리 세팅
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
      const uniqueCategories = ["기타", ...new Set(data.map((product) => product.category))];
      setCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  // 결제 패널에 상품 추가 및 재고 수량에 따른 토스트 노출
  const addToCart = (product) => {
    setSelectedProducts((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          // 이미 토스트가 표시되었는지 확인하거나, 
          // 단순히 return prev; (한 번만 호출되도록)
          toast.error("재고 수량을 초과하였습니다.", { toastId: `stock-${product.id}` });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        if (product.stock <= 0) {
          toast.error("품절된 상품입니다.", { toastId: `soldout-${product.id}` });
          return prev;
        }
        return [...prev, { ...product, quantity: 1 }];
      }
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

  const handlePayment = async (paymentMethod) => {
    console.log("📌 handlePayment 호출됨 - 결제 수단:", paymentMethod);
  console.log("📌 현재 선택된 상품:", selectedProducts);
  console.log("📌 현재 선택된 회원:", selectedMember);
  console.log("📌 관리자 정보:", user);


    if (!selectedProducts.length) {
      console.warn("⚠️ 장바구니가 비어 있습니다. 결제 취소.");
      return;
    }
  

    const totalAmount = selectedProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const finalAmount = Math.max(totalAmount - usedPoints, 0); // 할인 후 최소 0원 유지

    const transactionData = {
      member_id: selectedMember?.id || null,
      admin_id: 1, // 예제 값
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
  
    console.log("🚀 서버로 전송할 결제 데이터:", transactionData);

  const response = await submitTransaction(transactionData);
  if (response) {
    console.log("✅ 결제 성공! 상품 재고 차감 시작...");

    selectedProducts.forEach(async (item) => {
      try {
        console.log(`🔹 [재고 차감 요청] 상품 ID: ${item.id}, 차감 수량: ${-item.quantity}`);
        const updatedProduct = await updateProductStock(item.id, -item.quantity);
        console.log(`✅ [재고 차감 완료] 업데이트된 상품:`, updatedProduct);
      } catch (error) {
        console.error(`❌ [재고 차감 실패] 상품 ID: ${item.id}`, error);
      }
    });

    alert("결제 완료!");
    setSelectedProducts([]);
    setUsedPoints(0);
    setSelectedMember(null);
  } else {
    console.error("❌ 결제 실패: 서버 응답 없음");
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
          {/* {products
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
            ))} */}
            {products
  .filter((product) =>
    selectedCategory === "기타" ? product.category === "기타" : product.category === selectedCategory
  )
  .map((product) => (
    <button
      key={product.id}
      disabled={product.stock === 0}
      className={`border p-4 rounded-xl shadow flex flex-col justify-between items-start w-[140px] md:w-[160px] lg:w-[200px] aspect-square ${
        product.stock === 0 ? "bg-gray-500 text-white opacity-50 cursor-not-allowed" : "bg-white"
      }`}
      onClick={() => addToCart(product)}
    >
      <h3 className="text-lg font-semibold text-left">{product.name}</h3>
      {product.stock === 0 ? (
        <p className="font-bold">품절</p>
      ) : (
        <p className="text-lg">{product.price.toLocaleString()} 원</p>
      )}
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
        admin={user} 
      />
    </div>
  );
};

export default POS;