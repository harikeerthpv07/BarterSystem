import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // backend URL for development
});

// Add token automatically if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
