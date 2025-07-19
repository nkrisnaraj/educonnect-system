"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, Users, } from "lucide-react"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState("month") // month, week, day

  const events = [
    {
      id: 1,
      title: "Physics - Quantum Mechanics",
      date: "2024-06-20",
      time: "14:00",
      duration: "90 min",
      type: "class",
      batch: "2025 A/L",
      students: 45,
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Chemistry Practical",
      date: "2024-06-20",
      time: "16:00",
      duration: "60 min",
      type: "practical",
      batch: "2026 A/L",
      students: 38,
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "Biology Final Exam",
      date: "2024-06-22",
      time: "10:00",
      duration: "180 min",
      type: "exam",
      batch: "2025 A/L",
      students: 52,
      color: "bg-red-500",
    },
    {
      id: 4,
      title: "Mathematics Revision",
      date: "2024-06-25",
      time: "15:00",
      duration: "120 min",
      type: "revision",
      batch: "2025 A/L",
      students: 41,
      color: "bg-purple-500",
    },
    {
      id: 5,
      title: "Parent Meeting",
      date: "2024-06-23",
      time: "18:00",
      duration: "60 min",
      type: "meeting",
      batch: "All",
      students: 0,
      color: "bg-orange-500",
    },
  ]

  const eventTypes = [
    { id: "class", name: "Class", color: "bg-blue-500" },
    { id: "practical", name: "Practical", color: "bg-green-500" },
    { id: "exam", name: "Exam", color: "bg-red-500" },
    { id: "revision", name: "Revision", color: "bg-purple-500" },
    { id: "meeting", name: "Meeting", color: "bg-orange-500" },
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0]
    return events.filter((event) => event.date === dateString)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const days = getDaysInMonth(currentDate)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Class Calendar</h1>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Today
              </button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === "month" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 rounded text-sm ${
                    viewMode === "week" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-24 p-1"></div>
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dayEvents = getEventsForDate(date)
              const isToday = new Date().toDateString() === date.toDateString()
              const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`h-24 p-1 border border-gray-200 rounded cursor-pointer hover:bg-purple-50 ${
                    isToday ? "bg-purple-100 border-purple-300" : ""
                  } ${isSelected ? "bg-purple-200 border-purple-400" : ""}`}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium ${isToday ? "text-purple-700" : "text-gray-900"}`}>
                      {day}
                    </span>
                    <div className="flex-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div key={event.id} className={`text-xs p-1 mb-1 rounded text-white truncate ${event.color}`}>
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Event Legend */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          {eventTypes.map((type) => (
            <div key={type.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${type.color}`}></div>
              <span className="text-sm text-gray-700">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-lg font-semibold">Upcoming A/L Events</h3>
          <p className="text-gray-600">Your scheduled classes and activities</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-white/50 rounded-lg border border-purple-100"
              >
                <div className={`w-4 h-4 rounded ${event.color}`}></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {event.time} ({event.duration})
                    </div>
                    {event.students > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.students} students
                      </div>
                    )}
                  </div>
                </div>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{event.batch}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
