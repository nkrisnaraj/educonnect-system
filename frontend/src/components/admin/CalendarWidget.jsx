"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]
const months = [
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

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
  }

  const hasEvent = (day) => {
    // Mock events on certain days
    return [3, 15, 22, 28].includes(day)
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-6"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          className={`h-6 flex items-center justify-center text-xs cursor-pointer rounded-md relative ${
            isToday(day) ? "text-white font-semibold bg-primary" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
          {hasEvent(day) && !isToday(day) && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <div className="flex items-center space-x-2">
          <button onClick={previousMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-900 min-w-[100px] text-center">
            {months[currentMonth]} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="h-6 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span>Events</span>
          </div>
          <span>{today.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}
