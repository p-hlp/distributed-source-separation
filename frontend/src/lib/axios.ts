import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY_URL,
});

export const rawAxiosInstance = axios.create();
