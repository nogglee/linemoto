import React, { useEffect, useState } from "react";
import { getProductsByCategory } from "../../api/products"; // ✅ 변경된 API 함수 가져오기
import { useSearchParams } from "react-router-dom";
import SearchBar from "../common/components/SearchBar";
import { getChoseong } from "es-hangul";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchProducts = async () => {
      const categoryProducts = await getProductsByCategory(selectedCategory); // ✅ 고객용 API 사용
      setProducts(categoryProducts);
      setFilteredProducts(categoryProducts); // 검색 대비 초기값 설정
    };

    fetchProducts();
  }, [selectedCategory]);

  // ✅ 검색 필터링
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const productChoseong = getChoseong(product.name);
      return productChoseong.includes(getChoseong(searchTerm));
    });

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  return (
    <div className="w-full mt-4 px-4 md:px-[160px] lg:px-[200px]">
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        placeholder="상품명으로 검색해 보세요"
      />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] md:grid-cols-4 lg:grid-cols-8 gap-4 w-full mt-4 mb-10">
        {filteredProducts.map((product) => (
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