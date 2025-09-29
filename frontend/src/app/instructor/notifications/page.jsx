"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Filter, Search, AlertCircle, Info, CheckCircle, Clock } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // Import notification API functions
  const { 
    getNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    loading: apiLoading,
    error: apiError
  } = useInstructorApi()

  // Fetch notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const data = await getNotifications()
        if (data) {
          setNotifications(data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [getNotifications])

  // Mark single as read
  const markAsRead = async (id) => {
    try {
      const res = await markNotificationAsRead(id)
      if (res !== null) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  // Delete notification
  const removeNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const res = await deleteNotification(id)
        if (res !== null) {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await markAllNotificationsAsRead()
      if (res !== null) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Delete all notifications
  const deleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        const res = await deleteAllNotifications()
        if (res !== null) {
          setNotifications([])
        }
      } catch (error) {
        console.error('Failed to delete all notifications:', error)
      }
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Enhanced filtering and search
  const filteredNotifications = notifications.filter((notification) => {
    const filterMatch =
      selectedFilter === "all" ||
      (selectedFilter === "unread" && !notification.read) ||
      (selectedFilter === "read" && notification.read) ||
      notification.type === selectedFilter ||
      notification.color === selectedFilter

    const searchMatch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())

    return filterMatch && searchMatch
  })

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconColor = getNotificationIconColor(type)
    
    switch (type) {
      case "success":
      case "enrollment":
        return <CheckCircle className={`h-5 w-5 ${iconColor}`} />
      case "warning":
      case "exam":
        return <AlertCircle className={`h-5 w-5 ${iconColor}`} />
      case "alert":
        return <AlertCircle className={`h-5 w-5 ${iconColor}`} />
      case "message":
        return <Bell className={`h-5 w-5 ${iconColor}`} />
      case "webinar":
        return <Info className={`h-5 w-5 ${iconColor}`} />
      case "class":
        return <Info className={`h-5 w-5 ${iconColor}`} />
      case "info":
      case "system":
      default:
        return <Info className={`h-5 w-5 ${iconColor}`} />
    }
  }

  // Get notification color classes based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case "success":
      case "enrollment":
        return "border-l-green-500 bg-green-50"
      case "warning":
      case "exam":
        return "border-l-yellow-500 bg-yellow-50"
      case "alert":
        return "border-l-red-500 bg-red-50"
      case "message":
        return "border-l-purple-500 bg-purple-50"
      case "webinar":
        return "border-l-blue-500 bg-blue-50"
      case "class":
        return "border-l-indigo-500 bg-indigo-50"
      case "info":
      case "system":
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  // Get notification icon color based on type
  const getNotificationIconColor = (type) => {
    switch (type) {
      case "success":
      case "enrollment":
        return "text-green-600"
      case "warning":
      case "exam":
        return "text-yellow-600"
      case "alert":
        return "text-red-600"
      case "message":
        return "text-purple-600"
      case "webinar":
        return "text-blue-600"
      case "class":
        return "text-indigo-600"
      case "info":
      case "system":
      default:
        return "text-gray-600"
    }
  }

  // Format time display
  const formatTime = (createdAt) => {
    const now = new Date()
    const notificationDate = new Date(createdAt)
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading notifications: {apiError}</p>
        </div>
      </div>
    )
  }

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
          {notifications.length > 0 && (
            <button
              onClick={deleteAll}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete All
            </button>
          )}
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
              <option value="webinar">Webinars</option>
              <option value="class">Classes</option>
              <option value="exam">Exams</option>
              <option value="message">Messages</option>
              <option value="enrollment">Enrollments</option>
              <option value="system">System</option>
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
                        <span className={`px-2 py-1 text-xs rounded-full ${getNotificationIconColor(notification.type)} bg-opacity-20`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(notification.created_at)}
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
                      onClick={() => removeNotification(notification.id)}
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
