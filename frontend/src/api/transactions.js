import apiClient from "./index";

// ✅ 결제 요청 API
export const submitTransaction = async (transactionData) => {
  try {
    const response = await apiClient.post("/transactions", transactionData);
    return response.data;
  } catch (error) {
    console.error("❌ 결제 실패:", error);
    return null;
  }
};

// ✅ 특정 관리자의 결제 내역 조회
export const fetchAdminSales = async (admin_id) => {
  try {
    const response = await apiClient.get(`/transactions/sales/${admin_id}`);
    return response.data;
  } catch (error) {
    console.error("❌ 매출 내역 조회 실패:", error);
    return [];
  }
};