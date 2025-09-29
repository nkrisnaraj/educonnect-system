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
    // Load tokens & user from sessionStorage on mount, fallback to cookies
    console.log('🔄 AuthContext initializing...');
    
    const userJson = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("accessToken") || Cookies.get("accessToken");
    const refresh = sessionStorage.getItem("refreshToken");
    const richUserJson = sessionStorage.getItem("richUser");
    
    console.log('📊 Auth initialization data:', {
      hasUserJson: !!userJson,
      hasToken: !!token,
      hasRefresh: !!refresh,
      hasRichUser: !!richUserJson,
      tokenSource: sessionStorage.getItem("accessToken") ? 'sessionStorage' : 'cookie'
    });
    
    // Set user data first
    if (userJson) {
      const userData = JSON.parse(userJson);
      setUser(userData);
      console.log('✅ User loaded from sessionStorage:', userData.username);
    }
    
    if (richUserJson) {
      const richUserData = JSON.parse(richUserJson);
      setRichUser(richUserData);
      console.log('✅ Rich user loaded from sessionStorage');
    }
    
    if (token) {
      setAccessToken(token);
      // Sync sessionStorage with cookie if sessionStorage was empty
      if (!sessionStorage.getItem("accessToken") && Cookies.get("accessToken")) {
        sessionStorage.setItem("accessToken", token);
        console.log('🔄 Synced cookie token to sessionStorage');
      }
    }
    
    if (refresh) {
      setRefreshToken(refresh);
    }
    
    // Only set loading to false after we've attempted to load all data
    console.log('✅ AuthContext initialization complete');
    setLoading(false);
  }, []);


// Login saves tokens and user info
const login = async (userData) => {
  console.log('🚀 Login process starting...');
  setLoading(true); // Set loading true during login process
  
  sessionStorage.setItem("user", JSON.stringify(userData.user));
  sessionStorage.setItem("userRole", userData.user.role);
  sessionStorage.setItem("accessToken", userData.access);
  sessionStorage.setItem("refreshToken", userData.refresh);
  
  // Also set the cookie to ensure middleware access
  Cookies.set("accessToken", userData.access, { 
    path: "/",
    expires: 1, // 1 day
    secure: false, // Allow HTTP for development
    sameSite: 'lax'
  });
  
  setUser(userData.user);
  setAccessToken(userData.access);
  setRefreshToken(userData.refresh);

  // Only fetch student profile if role is student
  if (userData.user.role === "student") {
    try {
      console.log('📋 Fetching student profile...');
      const res = await axios.get("http://127.0.0.1:8000/students/profile/", {
        headers: { Authorization: `Bearer ${userData.access}` }
      });

      const studentProfile = res.data.student_profile;

      const enrichedUser = {
        ...userData.user,
        accessToken: userData.access,
        refreshToken: userData.refresh,
        student_profile: studentProfile
      };

      sessionStorage.setItem("richUser", JSON.stringify(enrichedUser));
      setRichUser(enrichedUser);
      console.log('✅ Student profile loaded successfully');
    } catch (err) {
      console.error("Error fetching student profile:", err);
      // Continue with login even if profile fetch fails
    }
  }
  
  console.log('✅ Login process complete');
  setLoading(false); // Set loading false after everything is done
};


  const logout = () => {
    console.log('🚪 Logout called from:', new Error().stack);
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
      
      // Also update cookie
      Cookies.set("accessToken", newAccessToken, { 
        path: "/",
        expires: 1, 
        secure: false,
        sameSite: 'lax'
      });
      
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

    // Always add request interceptor, even without token
    api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Always add response interceptor for error handling
    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();

            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed in interceptor:', refreshError);
            // Don't logout here to prevent infinite loops
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }, [accessToken, refreshToken]); // Keep dependencies


  return (
    <AuthContext.Provider value={{ user, richUser, accessToken, refreshToken, login, logout, refreshAccessToken, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);