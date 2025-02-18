import axios from "axios";

const API_BASE_URL =
process.env.NODE_ENV === "production"
? "https://dodo-lyart.vercel.app" // Vercel 배포된 백엔드 주소
: "http://localhost:5001"; // 로컬 개발 주소COSR

export const getProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`); // 이 URL 확인!
    return response.data;
  } catch (error) {
    console.error("❌ 상품 목록 가져오기 실패:", error);
    return [];
  }
};

// 🔹 결제 API (POS에서 결제 완료 시)
export const submitTransaction = async (transactionData) => {
  return axios.post(`${API_BASE_URL}/transactions`, transactionData);
};

// 🔹 회원 정보 조회 API (고객 포인트 조회 등)
export const getMemberInfo = async (memberId) => {
  return axios.get(`${API_BASE_URL}/members/${memberId}`);
};

export const addProduct = async (shopId, name, price, stock, category) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, {
      shop_id: shopId,
      name,
      price,
      stock,
      category, // 카테고리 추가
    });
    return response.data;
  } catch (error) {
    console.error("❌ 상품 추가 실패:", error);
    return null;
  }
};

export const login = async (phoneNumber, password) => {
  return axios.post(`${API_BASE_URL}/login`, {
    phone_number: phoneNumber,
    password: password,
  });
};