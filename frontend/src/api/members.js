import apiClient from "./index";

// 회원 목록 조회
export const fetchMembers = async () => {
  try {
    const response = await apiClient.get("/members");
    console.log("fetchMembers response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch members:", error.response?.data || error.message);
    throw error;
  }
};

// 특정 회원 정보 조회
export const fetchMemberInfo = async (memberId) => {
  try {
    const response = await apiClient.get(`/members/${memberId}`);
    console.log("fetchMemberInfo response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch member ${memberId}:`, error.response?.data || error.message);
    throw error;
  }
};

// 포인트 업데이트
export const updateMemberPoints = async (memberId, points, reason) => {
  try {
    const response = await apiClient.patch(`/members/${memberId}/points`, {
      points,
      reason,
    });
    console.log("updateMemberPoints response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update points for member ${memberId}:`, error.response?.data || error.message);
    throw error;
  }
};

// ✅ 회원의 거래 내역 조회 (추가)
export const fetchMemberTransactions = async (memberId) => {
  try {
    const response = await apiClient.get(`/members/${memberId}/transactions`);
    console.log("fetchMemberTransactions response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch transactions for member ${memberId}:`, error.response?.data || error.message);
    return [];
  }
};

// ✅ 미수금 고객 조회 API
export const fetchArrearMembers = async () => {
  try {
    const response = await apiClient.get("/members/arrears");
    console.log("fetchArrearMembers response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 미수금 회원 조회 실패:", error.response?.data || error.message);
    return [];
  }
};

export const payArrears = async (memberId, paymentMethod) => {
  try {
    const response = await apiClient.patch(`/members/${memberId}/pay-arrears`, { payment_method: paymentMethod });
    console.log("payArrears response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ 미수금 결제 실패:", error.response?.data || error.message);
    return null;
  }
};

export const fetchMyPageData = async (accountId) => {
  try {
    const response = await apiClient.get(`/members/mypage/${accountId}`);
    console.log("fetchMyPageData response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ MyPage 데이터 불러오기 실패:", error.response?.data || error.message);
    return null;
  }
};