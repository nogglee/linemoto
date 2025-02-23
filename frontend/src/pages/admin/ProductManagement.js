import React, { useEffect, useState } from "react";
import { getProducts, addProduct, updateProduct, deleteProducts } from "../../api/products";
import CategorySelector from "./components/CategorySelect";
import { ReactComponent as SearchIcon } from "../../assets/icons/ico-search.svg";
import { ReactComponent as ProductAddIcon } from "../../assets/icons/ico-product-add.svg";
import { getChoseong } from 'es-hangul';
import DeleteProductModal from "./components/DeleteProductModal";
import AddProductModal from "./components/AddProductModal";

// 상품이미지가 NULL 이거나 EMPTY 상태일 때 적용하는 Default 이미지
const getDefaultImageUrl = () => {
  return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/default.png`;
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]); // 선택된 상품 상태 추가
  const [categories, setCategories] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productNames, setProductNames] = useState([]); // 선택된 상품 이름 배열

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);

      // 중복 제거 후 카테고리 리스트 생성
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    };
    fetchProducts();
  }, []);

  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct); // 상품 추가 API 호출
      if (addedProduct) {
        setProducts((prevProducts) => [...prevProducts, addedProduct]); // 로컬 상태에 추가
        setIsAddModalOpen(false); // 모달 닫기
      }
    } catch (error) {
      console.error("상품 추가 실패:", error);
    }
  };

  const openDeleteModal = () => {
    const names = products
      .filter(product => selectedProducts.includes(product.id))
      .map(product => product.name);
    setProductNames(names); // 선택된 상품 이름 설정
    setIsDeleteModalOpen(true); // 삭제 모달 열기
  };

  const confirmDelete = async () => {
    try {
      await deleteProducts(selectedProducts); // 선택된 상품 삭제 API 호출
      setProducts(products.filter(product => !selectedProducts.includes(product.id))); // 상태 업데이트
      setSelectedProducts([]); // 선택 해제
    } catch (error) {
      console.error("상품 삭제 실패:", error);
    } finally {
      setIsDeleteModalOpen(false); // 삭제 모달 닫기
    }
  };

  // 상품 수정 핸들러 (자동 저장)
  const handleUpdateProduct = async (productId, field, value) => {
    const updatedProducts = products.map((item) =>
      item.id === productId ? { ...item, [field]: value } : item
    );
    setProducts(updatedProducts);

    const productToUpdate = updatedProducts.find((item) => item.id === productId);

    // 상품 수정 요청 데이터 포맷팅
    const formattedProduct = {
      name: productToUpdate.name,
      price: parseInt(productToUpdate.price, 10),
      stock: parseInt(productToUpdate.stock, 10) || 0,
      category: productToUpdate.category,
      image_url: productToUpdate.imageUrl || getDefaultImageUrl(), 
    };
    console.log("업데이트할 상품 데이터:", formattedProduct);
    
    try {
      await updateProduct(productId, formattedProduct); 
    } catch (error) {
      console.error("❌ 상품 업데이트 오류:", error);
    }
  };

  // 전체 선택 핸들러
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(product => product.id)); // 모든 상품 선택
    } else {
      setSelectedProducts([]); // 선택 해제
    }
  };

  // 개별 선택 핸들러
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId); // 선택 해제
      } else {
        return [...prevSelected, productId]; // 선택 추가
      }
    });
  };

  // 필터링된 상품 리스트
  const filteredProducts = products.filter(product => {
    const productChoseong = getChoseong(product.name); // 상품명에서 초성 추출
    return productChoseong.includes(getChoseong(searchTerm)); // 검색어의 초성과 비교
  });

  return (
    <div className="font-body">
      <div className="py-2.5 flex justify-between items-center">
        <div className="font-600 text-2xl">상품 관리</div>
        <div className="flex ">
          {selectedProducts.length > 0 && ( // 선택된 항목이 있을 때만 삭제 버튼 표시
            <div className="flex">
              <button 
                onClick={openDeleteModal} 
                className="text-sm bg-red-50 text-red-500 font-400 px-8 py-2 rounded-md mr-2"
              >삭제</button>
              <DeleteProductModal 
              isOpen={isDeleteModalOpen} 
              onClose={() => setIsDeleteModalOpen(false)} 
              onDelete={confirmDelete} 
              productNames={productNames}
              productCount={selectedProducts.length} 
              />
            </div>
          )}
          <button onClick={() => setIsAddModalOpen(true)} className="text-sm text-gray-700 font-500 px-4 py-2 rounded-md border stroke-gray-100">
            <div className="stroke-none flex gap-1"><ProductAddIcon className="w-4 pt-0.5"/>상품 추가</div>
          </button>
        </div>
      </div>
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
      <table className="mt-4 w-full">
        <thead className="text-sm text-gray-400">
          <tr className=" h-[50px]">
            <th className="px-4">
              <div className="flex">
                <input
                  type="checkbox"
                  onChange={handleSelectAll} // 전체 선택 핸들러
                  checked={selectedProducts.length === products.length && products.length > 0} // 전체 선택 상태
                />
              </div>
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
            <tr key={product.id}  className="">
              <td className="p-4 flex ">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)} // 개별 선택 상태
                  onChange={() => handleSelectProduct(product.id)} // 개별 선택 핸들러
                />
              </td>
              <td className="px-4">
                <div className="w-8 h-8 overflow-hidden rounded-md">
                  <img
                    src={product.imageUrl ? product.imageUrl : getDefaultImageUrl()}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = getDefaultImageUrl())}
                  />
                </div>
              </td>
              <td className="px-4">
                <input
                  type="text"
                  value={product.name}
                  onChange={(e) => handleUpdateProduct(product.id, "name", e.target.value)}
                />
              </td>
              <td className="flex items-center">
                <input
                  className="text-right tracking-[0.01em]"
                  type="text"
                  value={Number(product.price).toLocaleString('ko-KR')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleUpdateProduct(product.id, "price", value);
                  }}
                />
                <p className="ml-1">원</p>
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

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProduct} 
        categories={categories} 
        setProducts={setProducts}
        addProduct={addProduct}
        setCategories={setCategories}  // 추가
      />
    </div>
  );
};

export default ProductManagement;