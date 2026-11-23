import axios from "axios";
import { API_BASE_URL } from "../services/apiBase.js";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export { axiosInstance };
