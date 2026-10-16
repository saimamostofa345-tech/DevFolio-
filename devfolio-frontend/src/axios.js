```javascript
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach the owner's access token when available.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("devfolio_access");

    if (token) {
      config.headers.Authorization = `Bearer ${ token } `;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize common API errors.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("devfolio_access");
      localStorage.removeItem("devfolio_refresh");
    }

    return Promise.reject(error);
  }
);

// Supports both paginated and non-paginated DRF responses.
export function unwrap(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return data;
}

export function errorMessage(error) {
  const data = error?.response?.data;

  if (data?.detail) {
    return data.detail;
  }

  if (data?.message) {
    return data.message;
  }

  if (data && typeof data === "object") {
    return Object.values(data)
      .flat()
      .join(" ");
  }

  return error?.message || "Something went wrong.";
}

export default api;
```