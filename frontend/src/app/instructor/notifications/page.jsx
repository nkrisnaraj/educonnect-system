"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Filter, Search, AlertCircle, Info, CheckCircle, Clock } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // ✅ Import notification API functions
  const { getNotifications, markNotificationAsRead, deleteNotification } = useInstructorApi()

  // Fetch notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      const data = await getNotifications()
      if (data) setNotifications(data)
    }
    fetchNotifications()
  }, [getNotifications])

  // Mark single as read
  const markAsRead = async (id) => {
    const res = await markNotificationAsRead(id)
    if (res !== null) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
    }
  }

  // Delete notification
  const removeNotification = async (id) => {
    const res = await deleteNotification(id)
    if (res !== null) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }

  // Mark all as read (UI only, backend not called)
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Filtering + Search
  const filteredNotifications = notifications.filter((n) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "unread" && !n.read) ||
      (selectedFilter === "read" && n.read)

    const matchesSearch =
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.type.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesFilter && matchesSearch
  })

  // Icon selector
  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Check className="h-4 w-4" />
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            {["all", "unread", "read"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  selectedFilter === filter
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 border hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow-sm border divide-y">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications found
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 flex items-start gap-4 hover:bg-gray-50 ${
                  !notification.read ? "bg-indigo-50/50" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
