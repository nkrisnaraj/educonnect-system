"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import axios from "axios"
import { headers } from "next/headers"

const events = {
  "2025-06-02": [
    {
      id: 1,
      title: "ANSWERS- Multiple Choice Quiz",
      type: "quiz",
      color: "bg-purple-500",
    },
  ],
  "2025-06-15": [
    {
      id: 2,
      title: "Mathematics Exam",
      type: "exam",
      color: "bg-blue-500",
    },
  ],
  "2025-06-22": [
    {
      id: 3,
      title: "Biology Lab",
      type: "lab",
      color: "bg-green-500",
    },
  ],
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)) // June 2025

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

  const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1 // Convert Sunday (0) to be last (6)
  }

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getPrevMonth = () => {
    const prevDate = new Date(currentDate)
    prevDate.setMonth(currentDate.getMonth() - 1)
    return `${monthNames[prevDate.getMonth()]} ${prevDate.getFullYear()}`
  }

  const getNextMonth = () => {
    const nextDate = new Date(currentDate)
    nextDate.setMonth(currentDate.getMonth() + 1)
    return `${monthNames[nextDate.getMonth()]} ${nextDate.getFullYear()}`
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const dayEvents = events[dateKey] || []

      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1 relative">
          <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
          {dayEvents.map((event) => (
            <div
              key={event.id}
              className={`${event.color} text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 mb-1`}
            >
              <Play className="w-3 h-3" />
              <span className="truncate">{event.title}</span>
            </div>
          ))}
        </div>,
      )
    }

    return days
  }
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      console.error("No access token found in session storage");
    }
    const fetchdetails = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/edu_admin/calender/",{
        headers:{
          Authorization:`Bearer ${token}`,
        },
      }); 
      } catch (error) {
        console.error("Failed to fetch calendar details", error);
      }
    }
      
    fetchdetails();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header with navigation */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <button
              onClick={() => navigateMonth("prev")}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-1">{getPrevMonth()}</span>
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>

            <button
              onClick={() => navigateMonth("next")}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <span className="mr-1">{getNextMonth()}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 bg-gray-50">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">{renderCalendarDays()}</div>
        </div>

        
      </div>
    </div>
  )
}
