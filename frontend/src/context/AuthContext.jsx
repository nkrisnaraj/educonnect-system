// src/context/AuthContext.js
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
  const userJson = localStorage.getItem("user");
  const token = localStorage.getItem("accessToken");
  if (userJson) setUser(JSON.parse(userJson));
  if (token) setAccessToken(token);
}, []);



  const login = (userData) => {
    
    localStorage.setItem("user",JSON.stringify(userData.user));
    localStorage.setItem("userRole", userData.user.role);
    localStorage.setItem("accessToken", userData.access);
    localStorage.setItem("refreshToken", userData.refresh);
    setUser(userData.user);
    setAccessToken(userData.access);
};

  const logout = () => {
    Cookies.remove("accessToken");

    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.clear();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);
