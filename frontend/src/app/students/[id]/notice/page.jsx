"use client"

import { Bell, MessageSquare, ClipboardCheck, Calendar, Play } from "lucide-react"

const notifications = [
  {
    id: 1,
    icon: MessageSquare,
    title: "New message from your instructor",
    timestamp: "2h ago",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  {
    id: 2,
    icon: ClipboardCheck,
    title: "Assignment 3 has been graded",
    timestamp: "5h ago",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  {
    id: 3,
    icon: Calendar,
    title: "Reminder: Quiz 2 is due tomorrow",
    timestamp: "6h ago",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  {
    id: 4,
    icon: Play,
    title: "New lesson added to the course",
    timestamp: "1d ago",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
]

export default function Notice() {
  return (
    <div className="max-w-6xl shadow-lg bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notifications</h2>
        <Bell className="w-6 h-6 text-gray-400" />
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100">
        {notifications.map((notification, index) => (
          <div
            key={notification.id}
            className="flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {/* Icon */}
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full ${notification.iconBg} flex items-center justify-center`}
            >
              <notification.icon className={`w-6 h-6 ${notification.iconColor}`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-gray-900 leading-tight">{notification.title}</p>
              <p className="text-sm text-gray-500 mt-1">{notification.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
