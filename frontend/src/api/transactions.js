import axios from "axios";

// 결제 처리
export const submitTransaction = async (transactionData) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_SUPABASE_URL}/transactions`, transactionData);
    return response.data;
  } catch (error) {
    console.error("Failed to submit transaction:", error);
    throw error;
  }
};