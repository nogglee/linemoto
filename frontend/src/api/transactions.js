import apiClient from "./index";

export const getAdminStoreId = async (accountId) => {
  try {
    const response = await apiClient.get(`/admins/store/${accountId}`);
    console.log("✅ 관리자 및 스토어 정보 응답:", response.data);

    // store_id가 0이거나 undefined일 경우만 에러 처리
    if (!response.data || response.data.store_id == null) {
      console.warn("⚠️ 관리자에게 할당된 스토어가 없음:", response.data);
      return null; // `null`을 반환하여 처리
    }

    return response.data; // { admin_id, store_id }
  } catch (error) {
    console.error("❌ 관리자 및 스토어 정보 조회 실패:", error);
    return null; // ❌ `throw` 하지 않고 `null` 반환
  }
};

export const submitTransaction = async (transactionData) => {
  console.log("🛠 결제 데이터 전송 시작:", transactionData);
  try {
    const response = await apiClient.post("/transactions", transactionData);
    console.log("✅ 결제 성공:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 결제 요청 실패:", error.response?.data || error.message);
    throw error;
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