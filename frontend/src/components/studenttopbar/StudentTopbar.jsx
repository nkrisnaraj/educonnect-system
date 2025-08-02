"use client";

import { useAuth } from "@/context/AuthContext";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Topbar({ toggleSidebar }) {
  
  const {user,richUser} = useAuth();
  //  if (!richUser) return null;
  
const profileSrc = richUser?.student_profile?.profile_image
  ? `http://127.0.0.1:8000${richUser.student_profile.profile_image}`
  : "/student.png";

  console.log("Profile image URL:", profileSrc);
  
  console.log("user:",user);
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
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></span>
        </div>
      </div>
    </div>
  );
}
