"use client";

import { useState } from "react";
import StudentNavbar from "@/components/student/studentnavbar/StudentNavbar";
import Topbar from "../studenttopbar/studenttopbar";


export default function StudentLayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-x-hidden">
      <StudentNavbar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 bg-gray-50">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
