import apiClient from "./index";

// 특정 회원 정보 불러오기 (포인트 포함)
export const getMemberInfo = async (memberId) => {
  try {
    const response = await apiClient.get(`/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("❌ 회원 정보 가져오기 실패:", error);
    return null;
  }
};

// 회원 포인트 업데이트 (사용 or 지급)
export const updateMemberPoints = async (memberId, points) => {
  try {
    const response = await apiClient.patch(`/members/${memberId}/points`, { points });
    return response.data;
  } catch (error) {
    console.error("❌ 포인트 업데이트 실패:", error);
    return null;
  }
};