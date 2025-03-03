import React, { useState, useEffect } from "react";
import { getProducts } from "../../api/products";
import { fetchMemberInfo } from "../../api/members";
import PaymentPanel from "./PaymentPanel";
import { toast } from "react-toastify";

const POS = (user) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [usedPoints, setUsedPoints] = useState(0);
  const [categories, setCategories] = useState([""]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // 상품 목록 불러오기 및 카테고리 세팅
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    
      const uniqueCategories = [...new Set(data.map((product) => product.category))];
    
      setCategories(uniqueCategories);

      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }
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
    <div className="flex h-full rounded-3xl bg-gray-50 border-gray-200 border-[1px] font-body overflow-hidden">
      <div className="flex flex-col w-full p-8">
        <div className="flex border-b border-gray-300 mb-4 overflow-scroll">
          {categories.map((category) => (
            <button
              key={category}
              className={`sm:py-1 md:py-2 lg:py-3 sm:px-4 md:px-5 lg:px-6 text-gray-500 hover:text-gray-950 font-medium sm:text-base md:text-xl lg:text-2xl whitespace-nowrap ${
                selectedCategory === category ? "border-b-2 border-black text-gray-950 font-bold" : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
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
                className={`border p-4 rounded-xl shadow flex flex-col justify-between items-start sm:w-[140px] md:w-[160px] lg:w-[180px] aspect-square ${
                  product.stock === 0 ? "bg-gray-300 text-white cursor-not-allowed" : "bg-white"
                }`}
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