import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "", // default: relative path
  withCredentials: true, // penting untuk NextAuth
});

export default axiosInstance;
