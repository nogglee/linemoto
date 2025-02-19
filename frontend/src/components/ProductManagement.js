import React, { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct } from "../api/api";
import CategorySelector from "./CategorySelect";

const getDefaultImageUrl = () => {
  return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/default.png`;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 상품 추가 모달 상태
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "", imageUrl: "" });

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);

      // 📌 중복 제거 후 카테고리 리스트 만들기
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  // 🔹 상품 추가 핸들러
  const handleAddProduct = async () => {
    console.log("📌 상품 추가 요청 데이터 (수정 전):", newProduct);
  
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert("⚠️ 상품명, 가격, 카테고리는 필수 입력값입니다.");
      return;
    }
  
    const formattedProduct = {
      name: newProduct.name,
      price: parseInt(newProduct.price, 10) || 0, // ✅ 가격 정수 변환
      stock: parseInt(newProduct.stock, 10) || 0, // ✅ 수량 정수 변환
      category: newProduct.category, // ✅ 카테고리 올바르게 유지
      image_url: newProduct.imageUrl || getDefaultImageUrl(), // ✅ 기본 이미지 적용
    };
  
    console.log("🛠 실제 서버로 보내는 데이터:", formattedProduct);
  
    // ✅ `addProduct` 호출 시, 필드 순서 명확하게 지정
    const addedProduct = await addProduct({
      name: formattedProduct.name,
      price: formattedProduct.price,
      stock: formattedProduct.stock,
      category: formattedProduct.category,
      image_url: formattedProduct.image_url,
    });
  
    if (addedProduct) {
      setProducts([...products, addedProduct]);
      setNewProduct({
        name: "",
        price: "",
        stock: "",
        category: "",
        imageUrl: getDefaultImageUrl(),
      });
      setIsModalOpen(false);
    }
  };

  // 🔹 상품 수정 핸들러 (자동 저장)
  const handleUpdateProduct = async (productId, field, value) => {
    const updatedProducts = products.map((item) =>
      item.id === productId ? { ...item, [field]: value } : item
    );
    setProducts(updatedProducts);

    const productToUpdate = updatedProducts.find((item) => item.id === productId);

    try {
      await updateProduct(productId, {
        name: productToUpdate.name,
        price: parseInt(productToUpdate.price, 10) || 0,
        stock: parseInt(productToUpdate.stock, 10) || 0,
        category: productToUpdate.category,
        imageUrl: productToUpdate.imageUrl || "", // ✅ 기본 이미지 적용
      });
    } catch (error) {
      console.error("❌ 상품 업데이트 오류:", error);
    }
  };

  return (
    <div>
      <h1>상품 관리</h1>
      <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md">
        상품 추가
      </button>

      <table className="mt-4 w-full border">
        <thead>
          <tr>
            <th>상품 이미지</th>
            <th>상품명</th>
            <th>가격</th>
            <th>카테고리</th>
            <th>수량</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <img
                  src={product.imageUrl ? product.imageUrl : getDefaultImageUrl()}
                  alt={product.name}
                  width="50"
                  height="50"
                  onError={(e) => (e.target.src = getDefaultImageUrl())}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) => handleUpdateProduct(product.id, "price", e.target.value)}
                />
              </td>
              <td>
                <CategorySelector
                  categories={categories}
                  selectedCategory={product.category}
                  onSelect={(category) => handleUpdateProduct(product.id, "category", category)}
                  onAddCategory={(newCategory) => setCategories([...categories, newCategory])}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) => handleUpdateProduct(product.id, "stock", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 상품 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold">새 상품 추가</h2>
            <input
              type="text"
              placeholder="상품명"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="w-full border p-2 mt-2"
            />
            <input
              type="number"
              placeholder="가격"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="w-full border p-2 mt-2"
            />
            <input
              type="number"
              placeholder="수량"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              className="w-full border p-2 mt-2"
            />
            <CategorySelector
              categories={categories}
              selectedCategory={newProduct.category}
              onSelect={(newCategory) =>
                setNewProduct({ ...newProduct, category: newCategory })} // ✅ 올바르게 설정
              onAddCategory={(newCategory) => setCategories([...categories, newCategory])}
            />
            <button onClick={handleAddProduct} className="bg-green-500 text-white px-4 py-2 rounded-md mt-4">
              완료
            </button>
            <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded-md mt-4 ml-2">
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;