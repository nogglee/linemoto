import React, { useEffect, useState } from "react";
import { getProducts } from "../../api/products";

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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto mt-20">
      <input
        type="text"
        placeholder="상품 검색"
        className="w-full p-2 border rounded mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover" />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">{product.price.toLocaleString()} 원</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;