"use client"

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
} from "lucide-react"

const navigation = [
  { name: "Dashboard", id: "dashboard", icon: LayoutDashboard },
  { name: "Students", id: "students", icon: Users },
  { name: "Classes", id: "classes", icon: BookOpen },
  { name: "Payments", id: "payments", icon: DollarSign },
  { name: "Reports", id: "reports", icon: FileText },
  { name: "Notifications", id: "notifications", icon: Bell },
  { name: "Settings", id: "settings", icon: Settings },
]

export default function Sidebar({ activeSection, onSectionChange }) {
  return (
    <div className="flex h-screen w-64 flex-col bg-primary">
      {/* Logo */}
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div className="text-white">
            <h1 className="text-xl font-bold">AdminConnect</h1>
            <p className="text-sm text-blue-200">ADMIN PANEL</p>
          </div>
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
              className={`group flex w-full items-center rounded-lg px-4 py-3 mx-2 text-sm font-medium transition-colors ${
                isActive ? "text-white shadow-sm bg-accent" : "text-blue-100 hover:text-white hover:bg-accent"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button className="group flex w-full items-center rounded-lg px-4 py-3 mx-2 text-sm font-medium text-blue-100 transition-colors hover:text-white hover:bg-accent">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
