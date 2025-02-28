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