import React, { useState, useEffect } from "react";
import api from "../services/api";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : null);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return data;
  };

  const signup = async (userData) => {
    const data = await api.signup(userData);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Server logout failed, clearing client anyway", e);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      console.log("[AUTH] client-side logout complete");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
