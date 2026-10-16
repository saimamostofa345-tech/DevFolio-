import axios from "axios";

// Generate or retrieve persistent visitor UUID for like toggle (B-10, F-5)
export function getOrCreateVisitorId() {
  let visitorId = localStorage.getItem("devfolio_visitor_id");
  if (!visitorId) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      visitorId = crypto.randomUUID();
    } else {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem("devfolio_visitor_id", visitorId);
  }
  return visitorId;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor: attaches Bearer token & X-Visitor-Id header (F-5)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devfolio_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const visitorId = getOrCreateVisitorId();
    if (visitorId) {
      config.headers["X-Visitor-Id"] = visitorId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles token refreshing on 401 (F-5)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("devfolio_refresh");
      if (!refreshToken) {
        isRefreshing = false;
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data?.access;
        if (newAccessToken) {
          localStorage.setItem("devfolio_access", newAccessToken);
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (window.location.pathname.startsWith("/dashboard")) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function clearAuth() {
  localStorage.removeItem("devfolio_access");
  localStorage.removeItem("devfolio_refresh");
  localStorage.removeItem("devfolio_user");
}

export function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return data;
}

export function errorMessage(error) {
  const data = error?.response?.data;
  if (!data) return error?.message || "An unexpected error occurred.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => `${k !== "non_field_errors" ? k + ": " : ""}${Array.isArray(v) ? v.join(" ") : v}`)
      .join(" | ");
  }
  return "An unexpected error occurred.";
}

export default api;
