"use client"

import { useState } from "react"
import { Bell, Check, Trash2, Filter, Search, AlertCircle, Info, CheckCircle, Clock } from "lucide-react"

export default function NotificationsPage() {
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const notifications = [
    {
      id: 1,
      title: "New Student Enrollment",
      message: "Kasun Perera has enrolled in Physics 2025 A/L batch",
      type: "info",
      time: "2 hours ago",
      read: false,
      priority: "medium",
      category: "enrollment",
    },
    {
      id: 2,
      title: "Assignment Submission",
      message: "15 students have submitted Chemistry practical reports",
      type: "success",
      time: "4 hours ago",
      read: false,
      priority: "low",
      category: "assignment",
    },
    {
      id: 3,
      title: "Exam Schedule Reminder",
      message: "Physics final exam is scheduled for tomorrow at 2:00 PM",
      type: "warning",
      time: "6 hours ago",
      read: true,
      priority: "high",
      category: "exam",
    },
    {
      id: 4,
      title: "Low Attendance Alert",
      message: "Nimali Silva has missed 3 consecutive Biology classes",
      type: "alert",
      time: "1 day ago",
      read: false,
      priority: "high",
      category: "attendance",
    },
    {
      id: 5,
      title: "Grade Update Required",
      message: "Please update marks for Mathematics Unit Test 2",
      type: "warning",
      time: "1 day ago",
      read: true,
      priority: "medium",
      category: "grading",
    },
    {
      id: 6,
      title: "Parent Meeting Request",
      message: "Mrs. Silva requested a meeting regarding Nimali's progress",
      type: "info",
      time: "2 days ago",
      read: false,
      priority: "medium",
      category: "meeting",
    },
    {
      id: 7,
      title: "System Maintenance",
      message: "Scheduled maintenance on Sunday 2:00 AM - 4:00 AM",
      type: "info",
      time: "3 days ago",
      read: true,
      priority: "low",
      category: "system",
    },
    {
      id: 8,
      title: "Outstanding Performance",
      message: "Tharindu Fernando scored 98% in Chemistry practical exam",
      type: "success",
      time: "3 days ago",
      read: true,
      priority: "low",
      category: "achievement",
    },
  ]

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      case "alert":
        return "border-l-red-500 bg-red-50"
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const filterMatch =
      selectedFilter === "all" ||
      (selectedFilter === "unread" && !notification.read) ||
      (selectedFilter === "read" && notification.read) ||
      notification.type === selectedFilter ||
      notification.priority === selectedFilter

    const searchMatch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    return filterMatch && searchMatch
  })

  const markAsRead = (id) => {
    // Mark notification as read logic here
    console.log("Mark as read:", id)
  }

  const markAllAsRead = () => {
    // Mark all notifications as read logic here
    console.log("Mark all as read")
  }

  const deleteNotification = (id) => {
    // Delete notification logic here
    console.log("Delete notification:", id)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-xl font-bold">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-xl font-bold">{notifications.filter((n) => n.priority === "high").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-xl font-bold">{notifications.filter((n) => n.time.includes("hour")).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
              <option value="alert">Alerts</option>
              <option value="warning">Warnings</option>
              <option value="info">Information</option>
              <option value="success">Success</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-lg font-semibold">Notification Center</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && <div className="w-2 h-2 bg-purple-600 rounded-full"></div>}
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.time}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {notification.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
