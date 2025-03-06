import React, { useState } from 'react';
import CategorySelector from './CategorySelect';
import { showToast } from '../../common/components/Toast';
import { uploadImage } from '../../../api/products';

const getDefaultImageUrl = () => {
  return `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/default.png`;
};

const AddProductModal = ({ isOpen, onClose, onAdd, categories, setProducts, addProduct, setCategories, fetchProducts }) => {
  // console.log("✅ AddProductModal props:", { isOpen, onClose, onAdd, categories, setProducts, addProduct, setCategories });
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    imageFile: null,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewProduct((prev) => ({ ...prev, imageFile: file }));
  };

  const handleCategorySelect = (category) => {
    setNewProduct((prev) => ({ ...prev, category }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("🛠 [handleSubmit 실행됨] 상품 추가 요청 시작");
  console.log("📌 onAdd 존재 여부:", onAdd);

  if (!onAdd) {
    console.error("❌ onAdd 함수가 존재하지 않습니다.");
    return;
  }

    if (!newProduct.name) {
      showToast("상품명을 입력해 주세요!", "fail");
      return;
    }
    
    if (!newProduct.price) {
      showToast("가격을 입력해 주세요!", "fail");
      return;
    }
    
    if (!newProduct.category) {
      showToast("카테고리를 선택해 주세요!", "fail");
      return;
    }
    
    const storeId = localStorage.getItem("selected_store_id");
    if (!storeId) {
        console.error("❌ store_id가 없습니다.");
        showToast("스토어 정보를 찾을 수 없습니다.", "fail");
        return;
    }

    try {
      let imageUrl = getDefaultImageUrl();

      if (newProduct.imageFile) {
          console.log("📌 이미지 업로드 시작...");
          const uploadedImageUrl = await uploadImage(newProduct.imageFile);
          if (uploadedImageUrl) {
              imageUrl = `${uploadedImageUrl}?timestamp=${Date.now()}`;
          }
          console.log("✅ 이미지 업로드 완료:", imageUrl);
      }


      const formattedProduct = {
          name: newProduct.name,
          price: parseInt(newProduct.price, 10),
          stock: newProduct.stock ? parseInt(newProduct.stock, 10) : 0,
          category: newProduct.category,
          image_url: imageUrl,
          store_id: parseInt(storeId, 10)
      };

      console.log("📌 [addProduct 호출] 요청 데이터:", formattedProduct);
      const addedProduct = await onAdd(formattedProduct);

      console.log("📌 [addProduct 응답 확인]:", addedProduct);

      if (addedProduct) {
          console.log("✅ 상품 추가 완료:", addedProduct);
          setProducts((prevProducts) => [addedProduct, ...prevProducts]);
          showToast("상품이 추가되었습니다!", "success");
          onClose();

          fetchProducts();
      } else {
          console.error("❌ addProduct 호출 후 응답이 없음");
          showToast("상품 추가 중 오류가 발생했습니다.", "fail");
      }
  } catch (error) {
      console.error("❌ 상품 추가 중 오류:", error);
      showToast("상품 추가 중 오류가 발생했습니다.", "fail");
  }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>상품 추가</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="상품명" value={newProduct.name} onChange={handleChange} />
          <input type="number" name="price" placeholder="가격" value={newProduct.price} onChange={handleChange} />
          <input type="number" name="stock" placeholder="재고" value={newProduct.stock} onChange={handleChange} />
          <CategorySelector 
            categories={categories} 
            selectedCategory={newProduct.category} 
            onSelect={handleCategorySelect} 
            onAddCategory={(newCategory) => {
              // 새로운 카테고리를 categories 배열에 추가
              setCategories(prev => [...prev, newCategory]);
            }}
          />
          <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} />
          <button type="submit">추가</button>
          <button type="button" onClick={onClose}>취소</button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
