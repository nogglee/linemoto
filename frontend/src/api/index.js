import axios from "axios";
import supabase from "./supabase";

const API_BASE_URL =
process.env.NODE_ENV === "production"
? "https://dodo-6b1h.onrender.com"
: "http://localhost:5001"; 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient; 








