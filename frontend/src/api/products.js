import apiClient from "./index";
import { getSupabaseClient } from "./supabase";


export const addProduct = async ({ name, price, stock, category, image_url, store_id }) => {
  console.log("🛠 상품 추가 요청 시작:", { name, price, stock, category, image_url, store_id });
  try {
    const response = await apiClient.post("/products", {
      name,
      price,
      stock,
      category,
      image_url,
      store_id
    });

    console.log("✅ 상품 추가 API 전체 응답:", response);
console.log("✅ response.data:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ 상품 추가 실패:", error.response?.data || error.message);
    return null;
  }
};

// 전체 카테고리 목록 불러오기
export const getCategories = async () => {
  
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_categories");

  if (error) {
    // console.error("❌ 카테고리 목록 불러오기 오류:", error.message);
    return [];
  }

  return data;
};

// 특정 카테고리 상품 가져오기 (고객 페이지 전용 API)
export const getProductsByCategory = async (category) => {
  try {
    // console.log(`🛠 [${category}] 카테고리 상품 가져오기 시작`);

    const response = await apiClient.get(`/products/category/${encodeURIComponent(category)}`);
    // console.log(`🛠 [${category}] 가져온 상품 데이터:`, response.data);
    
    return response.data;
  } catch (error) {
    // console.error(`❌ [${category}] 카테고리 상품 불러오기 오류:`, error.message);
    return [];
  }
};


// 상품 목록 불러오기
export const getProducts = async () => {
  try {
    const response = await apiClient.get("/products");

    // 🔥 API 응답 데이터에서 `image_url`을 `imageUrl`로 매핑
    const formattedData = response.data.map((product) => ({
      ...product,
      imageUrl: product.image_url, // ✅ `image_url`을 `imageUrl`로 변환
    }));

    return formattedData;
  } catch (error) {
    // console.error("❌ 상품 목록 가져오기 실패:", error);
    return [];
  }
};
// export const getProducts = async (storeId) => {
//   try {
//     const response = await apiClient.get(`/products?store_id=${storeId}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ 상품 조회 실패:", error);
//     return [];
//   }
// };

// 상품 정보 수정 (자동 저장)
export const updateProduct = async (productId, updateData) => {
  try {
    if (!updateData.name || !updateData.price || !updateData.category) {
      console.error("❌ updateProduct 오류: 필수 값 누락", updateData);
      return;
    }

    // 🔥 백엔드 스키마에 맞게 `imageUrl`을 `image_url`로 변경
    const formattedData = {
      name: updateData.name,
      price: parseInt(updateData.price, 10) || 0,  // 🔹 숫자 변환
      stock: parseInt(updateData.stock, 10) || 0,  // 🔹 숫자 변환
      category: updateData.category,
      image_url: updateData.image_url || getDefaultImageUrl(), // 🔹 기본 이미지 적용
      store_id: updateData.store_id,
    };
    // delete formattedData.imageUrl; // ✅ 불필요한 필드 삭제

    // console.log("🛠 업데이트 요청 데이터 (수정됨):", formattedData); // 확인용

    const response = await apiClient.put(`/products/${productId}`, formattedData);
    return response.data;
  } catch (error) {
    // console.error("❌ 상품 수정 실패:", error);
  }
};

// 상품 삭제 함수
export const deleteProducts = async (productIds) => {
  try {
    const promises = productIds.map(id => 
      apiClient.delete(`/products/${id}`) // 각 상품 ID에 대해 삭제 요청
    );
    const responses = await Promise.all(promises);
    return responses.map(response => response.data);
  } catch (error) {
    // console.error("❌ 상품 삭제 오류:", error);
    throw error;
  }
};

// 기본 이미지 URL 가져오기
export const getDefaultImageUrl = () => {
  const { data } = getSupabaseClient().storage.from("product-images").getPublicUrl("default.png");

  console.log("🛠 Default Image URL:", data?.publicUrl); // 🔥 확인용 로그
  return data?.publicUrl || "/images/DEFAULT.png"; // URL이 없으면 로컬 기본 이미지
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_'); // 유효하지 않은 문자를 '_'로 대체
};

// 이미지 업로드 API
export const uploadImage = async (file) => {
  const sanitizedFileName = sanitizeFileName(`${Date.now()}-${file.name}`); // 파일 이름 정리
  const { data, error } = await getSupabaseClient().storage
    .from('product-images') // 버킷 이름
    .upload(sanitizedFileName, file);

  if (error) {
    console.error("이미지 업로드 실패:", error);
    return null;
  }

  // 업로드된 이미지 URL 가져오기
  const imageUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/product-images/${sanitizedFileName}`;
  return imageUrl;
};

// 상품 이미지 삭제
export const deleteProductImage = async (productId) => {
  try {
    const response = await apiClient.delete(`/products/${productId}/deleteImage`);
    return response.data.success;
  } catch (error) {
    console.error("❌ 이미지 삭제 실패:", error);
    return false;
  }
};

// 상품 이미지 업데이트
export const updateProductImage = async (productId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // ✅ 파일 추가
    formData.append("productId", productId); // ✅ 상품 ID 추가 (백엔드에서 필요할 경우)

    const response = await apiClient.put(`/products/${productId}/updateImage`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // ✅ 헤더 설정 (중요)
      },
    });

    return response.data.imageUrl;
  } catch (error) {
    console.error("❌ 이미지 업데이트 실패:", error);
    return null;
  }
};

// 상품 재고 변경 
export const updateProductStock = async (productId, quantityChange) => {
  console.log(`📌 [updateProductStock 호출됨] 상품 ID: ${productId}, 변경 수량: ${quantityChange}`);
  try {
    await apiClient.query(
      `UPDATE shops.products
       SET stock = stock - $1
       WHERE id = $2`,
      [quantityChange, productId]
    );
    console.log(`✅ 상품 ID: ${productId}, 재고 ${quantityChange} 차감 성공`);
  } catch (error) {
    console.error(`❌ 재고 차감 실패:`, error);
  }
};


