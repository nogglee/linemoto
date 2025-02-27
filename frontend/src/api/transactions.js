import apiClient from "./index";

// 결제 요청 (회원 포인트 차감 및 매출 반영)
export const submitTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post(`/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error("❌ 결제 실패:", error);
    return null;
  }
};

// 🔹 회원 포인트 조회
export const fetchMemberPoints = async (memberId) => {
  const { data } = await apiClient.get(`/members/${memberId}/points`);
  return data?.points || 0;
};

// 🔹 회원 포인트 업데이트
export const updateMemberPoints = async (memberId, newPoints) => {
  await apiClient.put(`/members/${memberId}/points`, { points: newPoints });
};

// 🔹 상품 재고 차감
export const updateStock = async (productId, count) => {
  await apiClient.put(`/products/${productId}/decrease-stock`, { count });
};