"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"




export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 1)) // June 2025
  const [events, setEvents] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const {user,api,loading,accessToken,token,refreshToken,refreshAccessToken} = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

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
              className={`${event.color} text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 mb-1 cursor-pointer`}
              onClick={() =>{setSelectedEvent(event); setShowModal(true);}}
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

  
 const fetchEvents = async () => {
  setIsLoading(true);
  try {
    // Fetch enrolled classes
    const classesResponse = await api.get("/students/classes/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Fetch exams
    const examsResponse = await api.get("/students/exams/", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log("Classes data:", classesResponse.data);
    console.log("Exams data:", examsResponse.data);

    if (classesResponse.status === 200) {
      const eventMap = {};
      
      // Process enrolled classes (active and pending only)
      const enrolledClasses = classesResponse.data.enrolled || [];
      const currentDate = new Date();
      
      enrolledClasses.forEach(classItem => {
        // Filter for active and pending classes only
        const startDate = new Date(classItem.start_date);
        const endDate = new Date(classItem.end_date);
        const isActive = startDate <= currentDate && endDate >= currentDate;
        const isPending = startDate > currentDate;
        
        if (isActive || isPending) {
          const dateKey = classItem.start_date.slice(0, 10); // "YYYY-MM-DD"
          if (!eventMap[dateKey]) {
            eventMap[dateKey] = [];
          }

          // Determine color based on class status
          let colorClass = isActive ? "bg-green-500" : "bg-yellow-500";

          eventMap[dateKey].push({
            id: `class_${classItem.classid}`,
            title: classItem.title,
            webinarid: classItem.webinar_id,
            date: classItem.start_date,
            type: isActive ? "Active Class" : "Pending Class",
            color: colorClass,
            fee: classItem.fee,
            description: classItem.description
          });
        }
      });

      // Process exams
      if (examsResponse.status === 200 && examsResponse.data) {
        const exams = Array.isArray(examsResponse.data) ? examsResponse.data : examsResponse.data.results || [];
        
        exams.forEach(exam => {
          const dateKey = exam.exam_date ? exam.exam_date.slice(0, 10) : exam.created_at.slice(0, 10);
          if (!eventMap[dateKey]) {
            eventMap[dateKey] = [];
          }

          eventMap[dateKey].push({
            id: `exam_${exam.id}`,
            title: `Exam: ${exam.title}`,
            webinarid: exam.webinar_id || 'N/A',
            date: exam.exam_date || exam.created_at,
            type: "Exam",
            color: "bg-red-500",
            duration: exam.duration,
            description: exam.description || 'Class Exam'
          });
        });
      }

      setEvents(eventMap);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  } finally {
    setIsLoading(false);
  }
};

  
  useEffect(() => {
    if (accessToken) {
      fetchEvents();
    }
  }, [accessToken])

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

          {/* Loading state */}
          {(loading || isLoading) && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
                <p className="text-gray-600 font-medium text-lg">Loading calendar events...</p>
              </div>
            </div>
          )}

          {/* Calendar grid */}
          {!(loading || isLoading) && (
            <div className="grid grid-cols-7">{renderCalendarDays()}</div>
          )}
        </div>

        
      </div>
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              {selectedEvent.type === "Exam" ? "Exam Details" : "Class Details"}
            </h2>
            <div className="space-y-3">
              <p className="text-gray-600"><strong>Title:</strong> {selectedEvent.title}</p>
              
              {selectedEvent.webinarid && selectedEvent.webinarid !== 'N/A' && (
                <p className="text-gray-600"><strong>Webinar ID:</strong> {selectedEvent.webinarid}</p>
              )}
              
              <p className="text-gray-600"><strong>Type:</strong> {selectedEvent.type}</p>
              
              {selectedEvent.fee && (
                <p className="text-gray-600"><strong>Fee:</strong> ₨{selectedEvent.fee}</p>
              )}
              
              {selectedEvent.duration && (
                <p className="text-gray-600"><strong>Duration:</strong> {selectedEvent.duration} minutes</p>
              )}
              
              {selectedEvent.description && (
                <p className="text-gray-600"><strong>Description:</strong> {selectedEvent.description}</p>
              )}
              
              <p className="text-gray-600">
                <strong>Time:</strong> {
                  selectedEvent.date
                    ? (() => {
                        const date = new Date(selectedEvent.date);
                        if (isNaN(date.getTime())) return "Invalid date";
                        const hours = date.getUTCHours().toString().padStart(2, '0');
                        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
                        return `${hours}:${minutes}`;
                      })()
                    : "No time available"
                }
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              {selectedEvent.webinarid && selectedEvent.webinarid !== 'N/A' && selectedEvent.type !== "Exam" && (
                <button
                  onClick={() => {
                    window.open(`https://zoom.us/j/${selectedEvent.webinarid}`, '_blank');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  🎥 Join Webinar
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
