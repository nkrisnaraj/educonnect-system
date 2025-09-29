"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, BookOpen, X } from "lucide-react";
import { useInstructorApi } from "@/hooks/useInstructorApi";

export default function CalendarPage() {
  const instructorApi = useInstructorApi();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null); // For modal popup

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      setError(null);
      const classesData = await instructorApi.getClasses();
      setClasses(classesData?.classes || []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError(error.message || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else {
      newDate.setDate(currentDate.getDate() + direction * 7);
    }
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDaysInWeek = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAllEvents = () => {
    const allEvents = [];

    classes.forEach(classItem => {
      // Class schedules
      if (classItem.schedules && classItem.schedules.length > 0) {
        classItem.schedules.forEach(schedule => {
          if (schedule.date && schedule.start_time) {
            const classDate = new Date(`${schedule.date}T${schedule.start_time}`);
            allEvents.push({
              id: `class-${classItem.id}-${schedule.id}`,
              title: classItem.title,
              date: classDate,
              type: 'class',
              data: classItem
            });
          }
        });
      }

      // Webinar events
      if (classItem.webinar_info && classItem.webinar_info.start_time) {
        const webinarDate = new Date(classItem.webinar_info.start_time);
        allEvents.push({
          id: `webinar-${classItem.id}`,
          title: classItem.webinar_info.topic || classItem.title,
          date: webinarDate,
          type: 'webinar',
          data: classItem.webinar_info
        });
      }
    });

    return allEvents;
  };

  const getEventsForDate = (date) => {
    const allEvents = getAllEvents();
    return allEvents.filter(event => event.date.toDateString() === date.toDateString());
  };

  const getCalendarStats = () => {
    const allEvents = getAllEvents();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = allEvents.filter(event => event.date.toDateString() === today.toDateString()).length;
    const upcomingEvents = allEvents.filter(event => event.date > today).length;
    const webinarsCount = allEvents.filter(event => event.type === 'webinar').length;
    const classesCount = allEvents.filter(event => event.type === 'class').length;

    return { totalEvents: allEvents.length, todayEvents, upcomingEvents, webinarsCount, classesCount };
  };

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const days = viewMode === "month" ? getDaysInMonth(currentDate) : getDaysInWeek(currentDate);
  const { totalEvents, todayEvents, upcomingEvents, webinarsCount, classesCount } = getCalendarStats();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button onClick={fetchCalendarData} className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">View your classes and webinar schedules</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg"><CalendarIcon className="h-4 w-4 text-blue-600" /></div>
          <div>
            <p className="text-base text-gray-600">Total Events</p>
            <p className="text-lg font-bold">{totalEvents}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg"><Clock className="h-4 w-4 text-green-600" /></div>
          <div>
            <p className="text-base text-gray-600">Today</p>
            <p className="text-lg font-bold">{todayEvents}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg"><CalendarIcon className="h-4 w-4 text-purple-600" /></div>
          <div>
            <p className="text-base text-gray-600">Upcoming</p>
            <p className="text-lg font-bold">{upcomingEvents}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg"><Video className="h-4 w-4 text-red-600" /></div>
          <div>
            <p className="text-base text-gray-600">Webinars</p>
            <p className="text-lg font-bold">{webinarsCount}</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                <h2 className="text-xl font-semibold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Today</button>
                <div className="flex bg-gray-100 rounded-lg">
                  <button onClick={() => setViewMode("month")} className={`px-3 py-2 rounded-lg ${viewMode === "month" ? "bg-white shadow-sm" : ""}`}>Month</button>
                  <button onClick={() => setViewMode("week")} className={`px-3 py-2 rounded-lg ${viewMode === "week" ? "bg-white shadow-sm" : ""}`}>Week</button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-2 mb-6">
                {dayNames.map(day => <div key={day} className="text-center font-medium text-gray-700 py-2">{day}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const events = getEventsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  return (
                    <div key={index} className={`min-h-24 border border-gray-200 rounded-lg p-2 relative ${isToday ? "bg-blue-50 border-blue-300" : "bg-white"}`}>
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-700"}`}>{day.getDate()}</div>
                      {events.map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 mb-1 rounded truncate cursor-pointer ${
                            event.type === "webinar" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          }`}
                          title={`${event.title} (${event.type === "webinar" ? "Webinar" : "Class"})`}
                          onClick={() => event.type === "webinar" && setSelectedWebinar(event.data)}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Webinar Modal */}
      {selectedWebinar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button onClick={() => setSelectedWebinar(null)} className="absolute top-3 right-3 p-1 hover:bg-gray-200 rounded-full">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">{selectedWebinar.topic}</h3>
            <div className="space-y-2 text-gray-700 text-sm">
              <p><strong>Start Time:</strong> {new Date(selectedWebinar.start_time).toLocaleString()}</p>
              {selectedWebinar.duration && <p><strong>Duration:</strong> {selectedWebinar.duration}</p>}
              {selectedWebinar.agenda && <p><strong>Agenda:</strong> {selectedWebinar.agenda}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
