import React, { useEffect, useState } from "react";
import { getProducts } from "../api/api";

function POS() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("전체");

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  const filteredProducts = category === "전체"
    ? products
    : products.filter((product) => product.category === category);

  return (
    <div>
      <h1>POS 시스템</h1>

      {/* 카테고리 선택 버튼 */}
      <div>
        {["전체", "오일", "부품", "타이어", "기타"].map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* 상품 목록 */}
      {filteredProducts.length === 0 ? (
        <p>상품이 없습니다.</p>
      ) : (
        <ul>
          {filteredProducts.map((product) => (
            <li key={product.id}>
              {product.name} - {product.price}원 ({product.category})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default POS;