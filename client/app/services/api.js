import axios from "axios";

// Dynamic API base: in local dev connects to 5000, in production connects to deployed backend or relative /api
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    const raw = import.meta.env.VITE_API_URL;
    return raw.endsWith("/api") ? raw : `${raw}/api`;
  }
  if (typeof window !== "undefined" && window.location.port === "3000") {
    return "http://localhost:5000/api";
  }
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mailpilot_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle session expiration gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");
    const isAuthPage =
      window.location.pathname.startsWith("/login") ||
      window.location.pathname.startsWith("/register");

    // Only redirect to login if an authenticated session expired on a protected app page
    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthRequest &&
      !isAuthPage
    ) {
      localStorage.removeItem("mailpilot_token");
      localStorage.removeItem("mailpilot_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
