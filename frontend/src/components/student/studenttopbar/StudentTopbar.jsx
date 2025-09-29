"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Topbar({ toggleSidebar }) {
  // All state hooks first
  const [notifications, setNotifications] = useState([]);
  const [authReady, setAuthReady] = useState(false);
  
  // All context hooks
  const { user, richUser, api, token, accessToken, refreshAccessToken, loading } = useAuth();
  const route = useRouter();
  const { id } = useParams();
  
  // All useEffect hooks must come before any conditional returns
  // Effect 1: Track when auth is truly ready
  useEffect(() => {
    const isAuthReady = !loading && accessToken && user && (user.role !== 'student' || richUser?.student_profile);
    setAuthReady(isAuthReady);
    console.log("Auth ready state changed:", isAuthReady);
  }, [loading, accessToken, user, richUser]);

  // Effect 2: Fetch notifications
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        // Don't fetch if auth is still loading or tokens not available
        if (loading || !accessToken || !user) {
          console.log("Auth not ready for notifications fetch - loading:", loading, "hasToken:", !!accessToken, "hasUser:", !!user);
          return;
        }
        
        // Add a small delay to ensure auth is fully ready after login
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log("🔔 Fetching notifications for user:", user.username);
        console.log("🔔 Using token:", accessToken ? `${accessToken.substring(0, 20)}...` : 'none');
        
        // Don't add manual headers - api interceptor handles authentication automatically
        const response = await api.get("students/notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        console.log("✅ Fetched notifications successfully:", response.data);
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("❌ Failed to fetch notifications:", error);
        console.error("❌ Error details:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config
        });
        
        // Handle 401 errors but don't cause redirects
        if (error.response?.status === 401) {
          console.log("🔄 Token expired in notifications fetch, attempting refresh...");
          try {
            const newToken = await refreshAccessToken();
            console.log("✅ Token refreshed successfully, new token:", newToken ? `${newToken.substring(0, 20)}...` : 'none');
            // Let the next useEffect cycle handle retry when accessToken updates
          } catch (refreshError) {
            console.error("❌ Failed to refresh token:", refreshError);
            // Don't do anything here that could cause a redirect
            // Let the main auth flow handle session expiry
          }
        } else {
          console.error("Non-401 error fetching notifications:", error.message);
        }
      }
    };
    
    fetchNotice();
  }, [loading, accessToken, user, api, refreshAccessToken]);

  // Calculate values that don't depend on conditional logic
  const profileSrc = richUser?.student_profile?.profile_image
    ? `http://127.0.0.1:8000${richUser.student_profile.profile_image}`
    : "/student.png";

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read_status).length : 0;

  // Early return AFTER all hooks
  if (loading || !user || !authReady) {
    return (
      <div className="flex justify-between items-center mb-2 mt-2 gap-6 px-6 pt-6">
        <button className="md:hidden" onClick={toggleSidebar}>
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <div className="flex items-center gap-4">
          <div className="animate-pulse flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  console.log("Profile image URL:", profileSrc);
  console.log("user:", user);
  //console.log("batch:" ,user.student_profile.year_of_al);

  return (
    <div className="flex justify-between items-center mb-2  mt-2 gap-6 px-6 pt-6">
      <button className="md:hidden" onClick={toggleSidebar}>
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
      <div className="relative w-full mt-6 max-w-md">
        <input
          type="text"
          placeholder="Search"
          className="w-full py-2 px-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Image
            src={profileSrc}
            alt="Profile picture"
            width={40}
            height={40}
            className="rounded-full "
           
          />
          <div>
            <p className="text-sm font-medium">{user?.username || "Loading..."}</p>
            <p className="text-xs text-gray-500">{(user?.student_profile?.year_of_al || 2025)+" Batch"}</p>
          </div>
        </div>
        <div className="relative" >
          <Bell
            onClick={() => id && route.push(`/students/${id}/notice`)}
            className="w-5 h-5 text-gray-500 cursor-pointer"
            aria-label="Notifications"
            role="button"
          />
           {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
