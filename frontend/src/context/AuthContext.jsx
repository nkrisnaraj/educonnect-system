// src/context/AuthContext.js
"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";




const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken,setRefreshToken] = useState(null)
  
  // const [richUser,setRichuser] = useState(null);

  useEffect(() => {
    // Load tokens & user from sessionStorage on mount
    const userJson = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("accessToken");
    const refresh = sessionStorage.getItem("refreshToken")
    if (userJson) setUser(JSON.parse(userJson));
    if (token) setAccessToken(token);
    if(refresh) setRefreshToken(refresh);
  }, []);


// Login saves tokens and user info
  const login = (userData) => {
    const enrichedUser = {
      ...userData.user,
      accessToken:userData.access,
      refreshToken:userData.refresh
    }
    
    sessionStorage.setItem("user",JSON.stringify(userData.user));
    sessionStorage.setItem("userRole", userData.user.role);
    sessionStorage.setItem("accessToken", userData.access);
    sessionStorage.setItem("refreshToken", userData.refresh);
    setUser(userData.user);
    setAccessToken(userData.access);
    setRefreshToken(userData.refresh);
    //sessionStorage.setItem("richUser",JSON.stringify(enrichedUser));
    //setRichuser(enrichedUser);
};

  const logout = () => {
    Cookies.remove("accessToken");

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.clear();
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null)
    router.push("/login");
  };

  const refreshAccessToken = async() => {
    try{
      if(!refreshToken) throw new Error("No refresh token")

      const res = await axios.post("http://127.0.0.1:8000/api/accounts/token/refresh/", {
        refresh:refreshToken,
      })

      const newAccessToken = res.data.access;
      sessionStorage.setItem("accessToken",newAccessToken);
      setAccessToken(newAccessToken);
      return newAccessToken;

    }catch(err){
      logout()
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, refreshToken, login, logout,refreshAccessToken, }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);