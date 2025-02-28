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