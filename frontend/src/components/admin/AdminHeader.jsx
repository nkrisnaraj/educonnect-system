"use client"

import { useState } from "react"
import { Search, Bell, User, Menu, LogOut, Shield } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  console.log("AdminHeader user:", user.username)
  console.log("AdminHeader user role:", user?.role)
  

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search - Hidden on small screens */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Mobile Search Button */}
          <button className="sm:hidden p-2 text-gray-400 hover:text-gray-600">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="h-7 w-7 rounded-full flex items-center justify-center bg-primary">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="text-sm hidden sm:block text-left">
                <p className="font-medium text-gray-900">{user?.last_name}</p>
                <div className="flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <p className="text-gray-500 text-xs capitalize">{user?.role}</p>
                </div>
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.last_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Shield className="h-3 w-3 text-primary" />
                      <span className="text-xs text-primary font-medium capitalize">{user?.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
