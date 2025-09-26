"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Topbar({ toggleSidebar }) {
  const [notifications,setNotifications] = useState([])
  const {user,richUser,api,token,accessToken,refreshAccessToken,loading} = useAuth();
  const route = useRouter();
  const {id}= useParams();
  //  if (!richUser) return null;
  
  const profileSrc = richUser?.student_profile?.profile_image
    ? `http://127.0.0.1:8000${richUser.student_profile.profile_image}`
    : "/student.png";

  console.log("Profile image URL:", profileSrc);
  
  console.log("user:",user);
  //console.log("batch:" ,user.student_profile.year_of_al);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response = await api.get("students/notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Fetched notifications:", response.data);
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotice();
  }, [api],loading);

  const unreadCount = notifications.filter((n)=>!n.read_status).length;

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
            onClick={() => route.push(`/students/${id}/notice`)}
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
