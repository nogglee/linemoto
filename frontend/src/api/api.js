import axios from "axios";
import supabase from "./supabase";

const API_BASE_URL =
process.env.NODE_ENV === "production"
? "https://dodo-6b1h.onrender.com" // Vercel 배포된 백엔드 주소
: "http://localhost:5001"; // 로컬 개발 주소COSR

export const getDefaultImageUrl = () => {
  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl("default.png");

  console.log("🛠 Default Image URL:", data?.publicUrl); // 🔥 확인용 로그
  return data?.publicUrl || "/default.png"; // URL이 없으면 로컬 기본 이미지
};
console.log("🛠 Default Image URL:", getDefaultImageUrl());

export const login = async (phoneNumber, password) => {
  return axios.post(`${API_BASE_URL}/login`, {
    phone_number: phoneNumber,
    password: password,
  });
};

// 상품 목록 불러오기
export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
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

// 상품 추가하기
export const addProduct = async ({ name, price, stock, category, image_url }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, {
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

// 상품 정보 수정 (자동 저장)
export const updateProduct = async (productId, updateData) => {
  try {
    if (!updateData.name) {
      console.error("❌ updateProduct 오류: 'name' 값이 없습니다.", updateData);
      return;
    }

    const updatedData = {
      ...updateData,
      imageUrl: updateData.imageUrl || getDefaultImageUrl(),
    };

    const response = await axios.put(`${API_BASE_URL}/products/${productId}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("❌ 상품 수정 실패:", error);
  }
};

// 이미지 업로드 API
export const uploadImage = async (file) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) throw error;

    // 업로드된 이미지 URL 가져오기
    const imageUrl = `${supabase.storage.from("product-images").getPublicUrl(fileName).data.publicUrl}`;
    return imageUrl;
  } catch (error) {
    console.error("❌ 이미지 업로드 실패:", error);
    return null;
  }
};

// 재고 업데이트 (수량 추가/차감)
export const updateStock = async (productId, quantity) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/products/${productId}/stock`, { quantity });
    return response.data;
  } catch (error) {
    console.error("❌ 재고 업데이트 실패:", error);
    return null;
  }
};

// 결제 요청 (회원 포인트 차감 및 매출 반영)
export const submitTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error("❌ 결제 실패:", error);
    return null;
  }
};

// 특정 회원 정보 불러오기 (포인트 포함)
export const getMemberInfo = async (memberId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("❌ 회원 정보 가져오기 실패:", error);
    return null;
  }
};

// 회원 포인트 업데이트 (사용 or 지급)
export const updateMemberPoints = async (memberId, points) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/members/${memberId}/points`, { points });
    return response.data;
  } catch (error) {
    console.error("❌ 포인트 업데이트 실패:", error);
    return null;
  }
};


