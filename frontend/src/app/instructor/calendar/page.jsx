"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
  Users,
  X
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const generateColorPalette = (n) => {
  const baseColors = [
    "bg-blue-500", "bg-rose-500", "bg-indigo-500", "bg-red-500",
    "bg-yellow-500", "bg-orange-500", "bg-purple-500", "bg-pink-500",
    "bg-green-500", "bg-teal-500"
  ];
  return Array.from({ length: n }, (_, i) => baseColors[i % baseColors.length]);
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("month");
  const [webinarEvents, setWebinarEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const fetchWebinars = async (token = accessToken) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/edu_admin/webinars-list/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const colorMap = {};
      const colors = generateColorPalette(res.data.length);

      const processedEvents = res.data.flatMap((webinar, idx) => {
        const color = colors[idx];
        colorMap[webinar.id] = color;

        return (webinar.occurrences || []).map((occurrence, occIdx) => {
          const baseDate = new Date(occurrence.start_time);

          const datePart = baseDate.toISOString().split("T")[0];
          const time = baseDate.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false });

          return {
            id: `webinar-${webinar.id}-${occIdx}-${baseDate.getTime()}`,
            topic: webinar.topic,
            date: datePart,
            time,
            duration: webinar.duration || "90 min",
            color,
          };
        });
      });

      setWebinarEvents(processedEvents);
    } catch (error) {
      if (error.response?.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) fetchWebinars(newToken);
        else logout();
      } else {
        console.error("Failed to load webinars:", error);
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchWebinars(accessToken);
    }
  }, [accessToken]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(day);

    return days;
  };

  const getDaysInWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split("T")[0];
    return webinarEvents.filter((event) => event.date === dateString);
  };

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else {
      newDate.setDate(currentDate.getDate() + 7 * direction);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const days = viewMode === "month" ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">A/L Class Calendar</h1>
      </div>

      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
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
                  className={`px-3 py-1 rounded text-sm ${viewMode === "month" ? "bg-white shadow-sm" : "text-gray-600"}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 rounded text-sm ${viewMode === "week" ? "bg-white shadow-sm" : "text-gray-600"}`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className={`grid ${viewMode === "month" ? "grid-cols-7" : "grid-cols-7"} gap-1 mb-4`}>
            {dayNames.map((day) => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className={`grid ${viewMode === "month" ? "grid-cols-7" : "grid-cols-7"} gap-1`}>
            {days.map((day, index) => {
              const date = viewMode === "month"
                ? day === null ? null : new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                : day;

              if (!date) return <div key={`empty-${index}`} className="h-24 p-1"></div>;

              const dayEvents = getEventsForDate(date);
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();

              return (
                <div
                  key={`day-${date.toISOString()}`}
                  onClick={() => setSelectedDate(date)}
                  className={`h-24 p-1 border border-gray-200 rounded cursor-pointer hover:bg-purple-50 ${
                    isToday ? "bg-purple-100 border-purple-300" : ""
                  } ${isSelected ? "bg-purple-200 border-purple-400" : ""}`}
                >
                  <div className="h-full flex flex-col">
                    <span className={`text-sm font-medium ${isToday ? "text-purple-700" : "text-gray-900"}`}>
                      {date.getDate()}
                    </span>
                    <div className="flex-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={`text-xs p-1 mb-1 rounded text-white truncate cursor-pointer ${event.color}`}
                        >
                          {event.time} {event.topic}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Event Types</h3>
        <div className="flex flex-wrap gap-4">
          {Array.from(new Set(webinarEvents.map(e => e.color))).map((color, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${color}`}></div>
              <span className="text-sm text-gray-700">Webinar</span>
            </div>
          ))}
        </div>
      </div> */}

      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold mb-2">{selectedEvent.topic}</h2>
            <p className="text-gray-700">
              <CalendarIcon className="inline h-4 w-4 mr-1" />
              Date: {selectedEvent.date}
            </p>
            <p className="text-gray-700">
              <Clock className="inline h-4 w-4 mr-1" />
              Time: {selectedEvent.time}
            </p>
            <p className="text-gray-700">
              <Users className="inline h-4 w-4 mr-1" />
              Duration: {selectedEvent.duration} minutes
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
