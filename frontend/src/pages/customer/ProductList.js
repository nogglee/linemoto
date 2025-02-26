import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/products";import { useSearchParams } from "react-router-dom";
import SearchBar from "../common/components/SearchBar";
import { getChoseong } from 'es-hangul';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const selectedCategory = searchParams.get("category");

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    console.log(`🛠 선택한 카테고리: ${selectedCategory}`);
    console.log(`🛠 검색어: ${searchTerm}`);

    let filtered = products;

    // 1. 카테고리 필터링
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category === selectedCategory);
      console.log(`🛠 [${selectedCategory}] 카테고리로 필터링된 상품:`, filtered);
    }

    // 2. 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter((product) => {
        const productChoseong = getChoseong(product.name);
        return productChoseong.includes(getChoseong(searchTerm));
      });
      console.log(`🛠 [${searchTerm}] 검색어로 필터링된 상품:`, filtered);
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchTerm]); // searchTerm 추가

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
