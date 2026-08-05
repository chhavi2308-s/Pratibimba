import axios from "axios";

const api = axios.create({
  baseURL:
    "https://bug-free-eureka-r4jrjvp4ppjxfwqp5-5000.app.github.dev/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;