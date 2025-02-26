import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/products";

const ProductList = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getProducts(); // ✅ 전체 상품 불러오기
      setProducts(allProducts); // ✅ 상태 저장

      // ✅ 처음부터 필터링 적용
      if (selectedCategory) {
        const filtered = allProducts.filter(product => product.category === selectedCategory);
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(allProducts);
      }
    };
    
    fetchProducts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto mt-4 px-4">
      <h2 className="text-xl font-bold mt-4">{selectedCategory} 상품 목록</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-4 lg:grid-cols-8 gap-4 w-full mt-4 mb-10">
        {products.map((product) => (
          <div key={product.id} className="w-full">
            <img src={product.image_url} alt={product.name} className="w-full h-auto aspect-square shadow-sm rounded-lg object-cover" />
            <h3 className="mt-2 text-sm font-semilight text-gray-950">{product.name}</h3>
            <p className="text-base font-bold text-gray-950">{product.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;