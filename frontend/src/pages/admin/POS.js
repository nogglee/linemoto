import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import { fetchMemberInfo } from "../../api/members";
import PaymentPanel from "./PaymentPanel";
import { showToast } from "../common/components/Toast";
import { motion, AnimatePresence } from "framer-motion";

const POS = (user) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [categories, setCategories] = useState([""]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  // 상품 목록 불러오기 및 카테고리 세팅
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    
      const uniqueCategories = [...new Set(data.map((product) => product.category))];
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0) {
        setTimeout(() => setSelectedCategory(uniqueCategories[0]), 0);
      }
    };

    fetchProducts();
  }, []);

  // 결제 패널에 상품 추가 및 재고 수량에 따른 토스트 노출
  const addToCart = (product) => {
    setSelectedProducts((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);

      // 재고 초과 시 토스트 노출 후 함수 종료
      if (existingItem && existingItem.quantity >= product.stock) {
        setToastMessage("재고 수량을 초과하였습니다."); // ✅ 상태 업데이트만 수행
        return prev;
      }
  
      if (!existingItem && product.stock <= 0) {
        setToastMessage("품절된 상품입니다."); // ✅ 상태 업데이트만 수행
        return prev;
      }
  
      return existingItem
        ? prev.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...prev, { ...product, quantity: 1 }];
    });
  };
  
  // ✅ 상태가 변경될 때만 토스트 메시지를 띄움
  useEffect(() => {
    if (toastMessage) {
      showToast(toastMessage, "fail");
      setToastMessage(null); // ✅ 토스트 메시지를 초기화
    }
  }, [toastMessage]);

  // 장바구니에서 상품 수량 감소 시 아이템 삭제
  const removeFromCart = (product) => {
    setSelectedProducts((prev) =>
      prev
        .map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 회원 선택
  const handleSelectMember = async (memberId) => {
    const memberInfo = await fetchMemberInfo(memberId);
    setSelectedMember(memberInfo);
  };

  // 포인트 사용 입력
  const handlePointChange = (e) => {
    const value = Number(e.target.value);
    if (value <= (selectedMember?.points || 0)) {
      setUsedPoints(value);
    }
  };

  return (
    <div className="flex h-full rounded-3xl bg-gray-50 border-gray-200 border-[1px] font-body overflow-auto">
      <div className="flex flex-col w-full p-8">
        <div className="flex border-b border-gray-300 mb-4 overflow-scroll scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              className={`relative sm:py-1 md:py-2 lg:py-3 sm:px-4 md:px-5 lg:px-6 font-medium sm:text-base md:text-xl lg:text-2xl whitespace-nowrap
                ${selectedCategory === category ? "text-gray-950 font-bold" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}

              {/* ✅ 선택된 카테고리에 애니메이션 효과 추가 */}
              {selectedCategory === category && (
                <motion.div
                  layoutId="category-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gray-950 rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-row flex-wrap sm:gap-3 md:gap-4 lg:gap-4">
          {products
            .filter((product) =>
              selectedCategory === "ETC" ? product.category === "ETC" : product.category === selectedCategory
            )
            .map((product) => (
              <button
                key={product.id}
                disabled={product.stock === 0}
                className={`border p-4 rounded-xl shadow flex flex-col justify-between items-start sm:w-[140px] md:w-[160px] lg:w-[180px] aspect-square 
                  transition-transform duration-200 ease-in-out transform hover:scale-105 
                  ${product.stock === 0 ? "bg-gray-300 text-white cursor-not-allowed" : "bg-white"}`}
                onClick={() => addToCart(product)}
              >
                <h3 className="sm:text-sm md:text-base lg:text-lg font-semibold text-left">{product.name}</h3>
                {product.stock === 0 ? (
                  <p className="font-bold">품절</p>
                ) : (
                  <p className="sm:text-sm md:text-lg lg:text-xl">{product.price.toLocaleString()}원</p>
                )}
              </button>
            ))}
        </div>
      </div>

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
        admin={user} 
      />
    </div>
  );
};

export default POS;