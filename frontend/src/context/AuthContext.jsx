"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [richUser,setRichUser]=useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken,setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(true);
  const api = axios.create({
    baseURL:"http://127.0.0.1:8000/",
  });
  
  

  useEffect(() => {
    // Load tokens & user from sessionStorage on mount
    const userJson = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("accessToken");
    const refresh = sessionStorage.getItem("refreshToken")
    const richUserJson = sessionStorage.getItem("richUser");
    if (userJson) setUser(JSON.parse(userJson));
    if (richUserJson) setRichUser(JSON.parse(richUserJson));
    if (token) setAccessToken(token);
    if (refresh) setRefreshToken(refresh);
    setLoading(false);
  }, []);


// Login saves tokens and user info
  const login = async(userData) => {

    sessionStorage.setItem("user",JSON.stringify(userData.user));
    sessionStorage.setItem("userRole", userData.user.role);
    sessionStorage.setItem("accessToken", userData.access);
    sessionStorage.setItem("refreshToken", userData.refresh);
    setUser(userData.user);
    setAccessToken(userData.access);
    setRefreshToken(userData.refresh);

    const res = await axios.get("http://127.0.0.1:8000/students/profile/", {
      headers: { Authorization: `Bearer ${userData.access}` }
    });

    const studentProfile = res.data.student_profile;
    const enrichedUser = {
      ...userData.user,
      accessToken:userData.access,
      refreshToken:userData.refresh,
      student_profile: studentProfile
    }
    sessionStorage.setItem("richUser",JSON.stringify(enrichedUser));
    setRichUser(enrichedUser);
};

  const logout = () => {
    Cookies.remove("accessToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.clear();
    setUser(null);
    setRichUser(null);
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


  useEffect(() => {
    // Remove all old interceptors
    api.interceptors.request.handlers = [];
    api.interceptors.response.handlers = [];

    if (!accessToken) return;

    api.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const newToken = await refreshAccessToken();

          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }

        return Promise.reject(error);
      }
    );
  }, [accessToken, refreshToken]);


  return (
    <AuthContext.Provider value={{ user, richUser, accessToken, refreshToken, login, logout, refreshAccessToken, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);