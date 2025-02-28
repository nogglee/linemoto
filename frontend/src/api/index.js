import axios from "axios";
import supabase from "./supabase";

const API_BASE_URL =
process.env.NODE_ENV === "production"
? "https://api.linemoto.co.kr"
: "http://localhost:5001"; 

const SUPABASE_API_KEY = process.env.REACT_APP_SUPABASE_KEY;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "apikey": SUPABASE_API_KEY,
    // "Authorization": `Bearer ${SUPABASE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

export default apiClient; 








