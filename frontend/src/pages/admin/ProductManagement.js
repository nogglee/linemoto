import React, { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProducts } from "../../api/products";
import CategorySelector from "./components/CategorySelect";
import { ReactComponent as ProductAddIcon } from "../../assets/icons/ico-product-add.svg";
import { getChoseong } from "es-hangul";
import DeleteProductModal from "./components/DeleteProductModal";
import AddProductModal from "./components/AddProductModal";
import SearchBar from "../common/components/SearchBar";
import ImageOptionsModal from "./components/ImageOptionsModal";

// 기본 이미지
const DEFAULT_IMAGE = "/images/default.png";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productNames, setProductNames] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // 이미지 옵션 모달용
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageOptions, setImageOptions] = useState({
    isOpen: false,
    position: { top: 0, left: 0 },
    productId: null,
    isDefaultImage: false,
  });

  const fetchProducts = async () => {
    const storeId = localStorage.getItem("selected_store_id");
    if (!storeId) {
      console.error("❌ store_id가 설정되지 않았습니다.");
      return;
    }
  
    try {
      const data = await getProducts(storeId); // ✅ store_id 추가
      setProducts(data);
      setCategories([...new Set(data.map((item) => item.category))]); // 중복 제거된 카테고리 목록
    } catch (error) {
      console.error("❌ 상품 조회 실패:", error);
    }
  };

  useEffect(() => {
  
    fetchProducts();
  }, []);
  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const data = await getProducts();
  //     setProducts(data);
  //     setCategories([...new Set(data.map((item) => item.category))]); // 중복 제거된 카테고리 목록
  //   };
  //   fetchProducts();
  // }, []);

  // 상품 추가
  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct);
      if (addedProduct) {
        setProducts((prev) => [...prev, addedProduct]);
        // await fetchProducts();  
        setIsAddModalOpen(false);
      }

      return addedProduct;
    } catch (error) {
      console.error("상품 추가 실패:", error);
    }
  };

  // 상품 삭제
  const openDeleteModal = () => {
    setProductNames(products.filter((p) => selectedProducts.includes(p.id)).map((p) => p.name));
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProducts(selectedProducts);
      setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error("상품 삭제 실패:", error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  // 상품 수정 (자동 저장)
  const handleUpdateProduct = async (productId, field, value) => {
    const updatedProducts = products.map((item) =>
      item.id === productId ? { ...item, [field]: value } : item
    );
    setProducts(updatedProducts);
    const productToUpdate = updatedProducts.find((item) => item.id === productId);
    try {
      await updateProduct(productId, productToUpdate);
    } catch (error) {
      console.error("상품 업데이트 오류:", error);
    }
  };

  // 상품 검색 (초성 검색 포함)
  const filteredProducts = products.filter((product) => {
    return getChoseong(product.name).includes(getChoseong(searchTerm));
  });

  // 이미지 옵션 모달 열기
  const openImageModal = (product) => {
    if (!product) return;
    setSelectedImage(product);
    setIsImageModalOpen(true);
  };

  const handleImageClick = (event, productId, imageUrl) => {
    const rect = event.target.getBoundingClientRect(); // ✅ 클릭한 이미지 위치 가져오기
  
    setImageOptions({
      isOpen: true,
      position: {
        top: rect.bottom + window.scrollY - 10, // ✅ 이미지 아래에 모달 배치
        left: rect.left + window.scrollX + 20, // ✅ 이미지 중앙 정렬
      },
      productId,
      isDefaultImage: !imageUrl || imageUrl.includes("default.png"),
    });
  
    console.log("📌 이미지 클릭 위치:", rect); // ✅ 디버깅용
  };

  return (
    <div className="font-body">
      {/* 상단 영역 */}
      <div className="py-2.5 flex justify-between items-center">
        <h2 className="font-600 text-2xl">상품 관리</h2>
        <div className="flex">
          {selectedProducts.length > 0 && (
            <button onClick={openDeleteModal} className="text-sm bg-red-50 text-red-500 px-8 py-2 rounded-md mr-2">
              삭제
            </button>
          )}
          <button onClick={() => setIsAddModalOpen(true)} className="text-sm text-gray-700 px-4 py-2 rounded-md border">
            <div className="flex gap-1">
              <ProductAddIcon className="w-4 pt-0.5" /> 상품 추가
            </div>
          </button>
        </div>
      </div>

      {/* 검색창 */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="상품명으로 검색해 보세요" />

      {/* 상품 리스트 */}
      <table className="mt-4 w-full">
        <thead className="text-sm text-gray-400">
          <tr className="h-[50px]">
            <th className="px-4">
              <input type="checkbox" onChange={(e) => setSelectedProducts(e.target.checked ? products.map((p) => p.id) : [])} />
            </th>
            <th></th>
            <th className="font-400 px-4 text-start">상품명</th>
            <th className="font-400 px-4 text-start">가격</th>
            <th>카테고리</th>
            <th>수량</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() =>
                    setSelectedProducts((prev) =>
                      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
                    )
                  }
                />
              </td>
              <td className="px-4">
                <div className="w-8 h-8 overflow-hidden rounded-md cursor-pointer" onClick={() => openImageModal(product)}>
                  <img
                    src={product.imageUrl || DEFAULT_IMAGE}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = DEFAULT_IMAGE)}
                    onClick={(event) => handleImageClick(event, product.id, product.imageUrl)}
                  />
                </div>
              </td>
              <td className="px-4">
                <input type="text" value={product.name} onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)} />
              </td>
              <td className="px-4 flex items-center">
                <input
                  type="text"
                  className="text-right"
                  value={Number(product.price).toLocaleString()}
                  onChange={(e) => handleUpdateProduct(product.id, "price", e.target.value.replace(/[^0-9]/g, ""))}
                />
                <span className="ml-1">원</span>
              </td>
              <td>
                <CategorySelector
                  categories={categories}
                  selectedCategory={product.category}
                  onSelect={(category) => handleUpdateProduct(product.id, "category", category)}
                />
              </td>
              <td>
                <input type="number" value={product.stock} onChange={(e) => handleUpdateProduct(product.id, "stock", e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 모달들 */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProduct} 
        categories={categories} 
        setProducts={setProducts}
        fetchProducts={fetchProducts}
      />
      <DeleteProductModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onDelete={confirmDelete} productNames={productNames} />
      {imageOptions.isOpen && (
        <ImageOptionsModal
          isOpen={imageOptions.isOpen}
          onClose={() => setImageOptions({ ...imageOptions, isOpen: false })}
          position={imageOptions.position}
          productId={imageOptions.productId}
          isDefaultImage={imageOptions.isDefaultImage}
          onUpdateImage={(newImageUrl) => {
            setProducts((prevProducts) =>
              prevProducts.map((p) =>
                p.id === imageOptions.productId ? { ...p, imageUrl: newImageUrl } : p
              )
            );
            setImageOptions({ ...imageOptions, isOpen: false }); // 모달 닫기
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;