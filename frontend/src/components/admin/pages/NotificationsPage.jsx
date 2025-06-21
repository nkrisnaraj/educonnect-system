"use client"

import { useState } from "react"
import {
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Send,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"

const notificationsData = [
  {
    id: 1,
    title: "New Student Registration",
    message: "John Smith has completed registration for Computer Science program",
    type: "info",
    priority: "medium",
    recipient: "all_admins",
    status: "sent",
    createdAt: "2024-12-18T10:30:00Z",
    readBy: ["admin1", "admin2"],
    category: "enrollment",
  },
  {
    id: 2,
    title: "Payment Overdue Alert",
    message: "5 students have overdue payments totaling $12,500",
    type: "warning",
    priority: "high",
    recipient: "finance_team",
    status: "sent",
    createdAt: "2024-12-18T09:15:00Z",
    readBy: ["admin1"],
    category: "finance",
  },
  {
    id: 3,
    title: "Class Cancellation Notice",
    message: "Physics Lab session on Dec 20th has been cancelled due to equipment maintenance",
    type: "alert",
    priority: "high",
    recipient: "all_students",
    status: "scheduled",
    createdAt: "2024-12-18T08:45:00Z",
    readBy: [],
    category: "academic",
    scheduledFor: "2024-12-19T08:00:00Z",
  },
  {
    id: 4,
    title: "System Maintenance",
    message: "Scheduled system maintenance on Dec 22nd from 2:00 AM to 4:00 AM",
    type: "info",
    priority: "low",
    recipient: "all_users",
    status: "draft",
    createdAt: "2024-12-18T08:00:00Z",
    readBy: [],
    category: "system",
  },
]

function getTypeIcon(type) {
  switch (type) {
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />
    case "alert":
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case "reminder":
      return <Bell className="h-4 w-4 text-purple-500" />
    default:
      return <Info className="h-4 w-4 text-gray-500" />
  }
}

function getTypeColor(type) {
  switch (type) {
    case "info":
      return "text-blue-600 bg-blue-50"
    case "warning":
      return "text-yellow-600 bg-yellow-50"
    case "alert":
      return "text-red-600 bg-red-50"
    case "reminder":
      return "text-purple-600 bg-purple-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function getPriorityColor(priority) {
  switch (priority) {
    case "high":
      return "text-red-600 bg-red-50"
    case "medium":
      return "text-yellow-600 bg-yellow-50"
    case "low":
      return "text-green-600 bg-green-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function getStatusColor(status) {
  switch (status) {
    case "sent":
      return "text-green-600 bg-green-50"
    case "scheduled":
      return "text-blue-600 bg-blue-50"
    case "draft":
      return "text-gray-600 bg-gray-50"
    case "failed":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredNotifications = notificationsData.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || notification.type === selectedType
    const matchesStatus = selectedStatus === "all" || notification.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
          <p className="text-gray-600">Create, manage, and track institutional notifications and alerts</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Notification</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900">{notificationsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {notificationsData.filter((n) => n.status === "sent").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {notificationsData.filter((n) => n.status === "scheduled").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {notificationsData.filter((n) => n.priority === "high").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="reminder">Reminder</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
            <option value="failed">Failed</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Notification</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Recipient</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((notification) => (
                <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</p>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                        {notification.category}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(notification.type)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}
                    >
                      {notification.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-600">{notification.recipient.replace("_", " ")}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}
                    >
                      {notification.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm text-gray-600">
                      <p>{new Date(notification.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="p-1 text-gray-400 hover:text-primary"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {notification.status === "draft" && (
                        <button className="p-1 text-gray-400 hover:text-green-600" title="Send">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
