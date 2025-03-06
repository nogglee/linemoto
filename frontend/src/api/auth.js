import apiClient from "./index";

export const login = async (phoneNumber, password) => {
  return apiClient.post("/auth/login", {
    phone_number: phoneNumber,
    password: password,
  });
};

export const signupUser = async ({ name, phone, birth }) => {
  try {
    const response = await apiClient.post("/auth/signup", {
      name,
      phone_number: phone,
      birth,
    });
    return response.data;
  } catch (error) {
    console.error("❌ 회원가입 실패:", error.message);
    throw error;
  }
};