// // utils/axiosClient.js
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";

// export const useAxios = () => {
//   const { accessToken, refreshAccessToken, logout } = useAuth();

//   const axiosInstance = axios.create({
//     baseURL: "http://127.0.0.1:8000/",
//     headers: { Authorization: `Bearer ${accessToken}` },
//   });

//   // Add interceptor to handle 401 responses and refresh token
//   axiosInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const originalRequest = error.config;

//       if (error.response?.status === 401 && !originalRequest._retry) {
//         originalRequest._retry = true;

//         try {
//           const newAccessToken = await refreshAccessToken();

//           originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

//           return axiosInstance(originalRequest);
//         } catch (err) {
//           // Refresh token failed, logout user
//           logout();
//           return Promise.reject(err);
//         }
//       }
//       return Promise.reject(error);
//     }
//   );

//   return axiosInstance;
// };
