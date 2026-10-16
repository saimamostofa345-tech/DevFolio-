import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session securely using /api/auth/me/ on app startup (F-2)
  useEffect(() => {
    async function restoreSession() {
      const accessToken = localStorage.getItem("devfolio_access");
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me/");
        setUser(response.data);
      } catch (err) {
        // If /auth/me fails and refresh failed, clear local tokens
        localStorage.removeItem("devfolio_access");
        localStorage.removeItem("devfolio_refresh");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (username, password) => {
    const response = await api.post("/auth/login/", { username, password });
    const { access, refresh, user: userData } = response.data;

    localStorage.setItem("devfolio_access", access);
    localStorage.setItem("devfolio_refresh", refresh);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    const refresh = localStorage.getItem("devfolio_refresh");
    if (refresh) {
      try {
        await api.post("/auth/logout/", { refresh });
      } catch (e) {
        // Continue clearing client storage regardless
      }
    }
    localStorage.removeItem("devfolio_access");
    localStorage.removeItem("devfolio_refresh");
    setUser(null);
  };

  const isOwner = Boolean(user && user.is_owner);

  return (
    <AuthContext.Provider
      value={{
        user,
        isOwner,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
