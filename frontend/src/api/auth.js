import apiClient from "./index";

export const login = async (phoneNumber, password) => {
  return apiClient.post("/auth//login", {
    phone_number: phoneNumber,
    password: password,
  });
};