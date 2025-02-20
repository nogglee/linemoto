import apiClient from "./index";
import supabase from "./supabase";

// 상품 추가하기
export const addProduct = async ({ name, price, stock, category, image_url }) => {
  try {
    const response = await apiClient.post("/products", {
      name,
      price,
      stock,
      category,
      image_url,
    });

    return response.data;
  } catch (error) {
    console.error("❌ 상품 추가 실패:", error);
    return null;
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
    console.error("❌ 상품 목록 가져오기 실패:", error);
    return [];
  }
};

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
    };
    delete formattedData.imageUrl; // ✅ 불필요한 필드 삭제

    console.log("🛠 업데이트 요청 데이터 (수정됨):", formattedData); // 확인용

    const response = await apiClient.put(`/products/${productId}`, formattedData);
    return response.data;
  } catch (error) {
    console.error("❌ 상품 수정 실패:", error);
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
    console.error("❌ 상품 삭제 오류:", error);
    throw error;
  }
};

// 기본 이미지 URL 가져오기
export const getDefaultImageUrl = () => {
  const { data } = supabase.storage.from("product-images").getPublicUrl("default.png");

  console.log("🛠 Default Image URL:", data?.publicUrl); // 🔥 확인용 로그
  return data?.publicUrl || "/default.png"; // URL이 없으면 로컬 기본 이미지
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, '_'); // 유효하지 않은 문자를 '_'로 대체
};

// 이미지 업로드 API
export const uploadImage = async (file) => {
  const sanitizedFileName = sanitizeFileName(`${Date.now()}-${file.name}`); // 파일 이름 정리
  const { data, error } = await supabase.storage
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
