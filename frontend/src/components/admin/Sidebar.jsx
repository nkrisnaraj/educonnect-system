"use client"

import { useAuth } from "@/context/AuthContext"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  DollarSign,
  FileText,
  Settings,
  Bell,
  LogOut,
  BookOpen,
  Video,
} from "lucide-react"
import Image from "next/image";

const navigation = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Students", id: "students", icon: Users },
  { name: "Classes", id: "classes", icon: BookOpen },
  { name: "Webinars", id: "webinars", icon: Video },
  { name: "Payments", id: "payments", icon: DollarSign },
  { name: "Reports", id: "reports", icon: FileText },
  { name: "Notifications", id: "notifications", icon: Bell },
  { name: "Settings", id: "settings", icon: Settings },
]

export default function Sidebar({ activeSection, onSectionChange }) {
  const { logout } = useAuth();
  return (
    <div className="flex h-screen w-64 flex-col bg-primary">
      {/* Logo */}
      <div className="flex items-center justify-center py-6">
        <div className="flex flex-col items-center space-x-3">
          <div className="flex items-center justify-center ">
            <Image src="/logo.png" width={120} height={120} alt="Logo" />
          </div>
          {/* <div className="text-white flex">
            <h1 className="text-xl font-bold">EduConnect</h1>
          </div> */}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          return (
            <button
              key={item.name}
              onClick={() => onSectionChange(item.id)}
              className={`group flex w-full items-center rounded-xl px-4 py-3 mx-2 text-sm font-medium transition-colors ${isActive ? "text-white shadow-sm bg-accent" : "text-blue-100 hover:text-white hover:bg-accent"
                }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 flex items-center justify-center border-t border-gray-700">
        <button
          onClick={() =>
            logout()
          }
          className="group flex w-full items-center rounded-xl px-4 py-3 mx-2 text-lg font-medium text-red-700 transition-colors hover:text-white bg-white hover:bg-red-600">
          <LogOut className="mr-5 h-8 w-8" />
          Logout
        </button>
      </div>
    </div>
  )
}
