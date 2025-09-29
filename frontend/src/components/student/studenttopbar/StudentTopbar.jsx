"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Topbar({ toggleSidebar }) {
  const [notifications,setNotifications] = useState([])
  const [authReady, setAuthReady] = useState(false);
  const {user,richUser,api,token,accessToken,refreshAccessToken,loading} = useAuth();
  const route = useRouter();
  const {id}= useParams();
  
  // Track when auth is truly ready (separate from loading state)
  useEffect(() => {
    const isAuthReady = !loading && accessToken && user && (user.role !== 'student' || richUser?.student_profile);
    setAuthReady(isAuthReady);
    console.log("Auth ready state changed:", isAuthReady);
  }, [loading, accessToken, user, richUser]);
  
  // If still loading or no user, show basic topbar
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
  
  const profileSrc = richUser?.student_profile?.profile_image
    ? `http://127.0.0.1:8000${richUser.student_profile.profile_image}`
    : "/student.png";

  console.log("Profile image URL:", profileSrc);
  
  console.log("user:",user);
  //console.log("batch:" ,user.student_profile.year_of_al);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        // Final safety check before making API call
        if (!accessToken) {
          console.log("No access token available, aborting fetch");
          return;
        }
        
        console.log("Fetching notifications for student...");
        
        // Use the api instance from AuthContext which has interceptors for token refresh
        const response = await api.get("students/notifications/");
        console.log("Successfully fetched notifications:", response.data);
        setNotifications(response.data.notifications || []);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          console.log("401 Unauthorized - this should not happen with interceptors");
        } else if (error.response?.status === 400) {
          console.log("400 Bad Request - user profile may not exist");
        } else if (error.response?.status === 403) {
          console.log("403 Forbidden - user may not have permission");
        }
        
        // Set empty array on error to prevent UI issues
        setNotifications([]);
      }
    };
    
    // Only fetch if auth is ready and user is a student
    if (authReady && user?.role === 'student' && richUser?.student_profile) {
      console.log("All conditions met, fetching notifications...");
      fetchNotice();
    }
  }, [authReady, user?.role, richUser?.student_profile, accessToken, api]);

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n)=>!n.read_status).length : 0;

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
