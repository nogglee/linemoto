import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/products";
import { getChoseong } from 'es-hangul';
import { ReactComponent as SearchIcon } from "../../assets/icons/ico-search.svg";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(product => {
    const productChoseong = getChoseong(product.name); // 상품명에서 초성 추출
    return productChoseong.includes(getChoseong(searchTerm)); // 검색어의 초성과 비교
  });

  return (
    <div className="container my-1 px-4 md:px-[160px] lg:px-[200px] w-full overflow-x-hidden max-w-full">
      <div className="bg-gray-100 rounded-[10px] px-5 py-2.5 gap-3 flex text-gray-400 text-base items-center">
        <SearchIcon />
        <input
          type="text"
          placeholder="상품명으로 검색해 보세요"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-2 border-none bg-transparent mt-0.5 rounded focus:outline-none text-gray-950 w-full"
        />
      </div>

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