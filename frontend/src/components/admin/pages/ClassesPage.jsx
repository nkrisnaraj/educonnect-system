"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, Clock, Users, DollarSign, Search, Filter } from "lucide-react";
import { useAdminData } from "@/context/AdminDataContext";
import { adminApi } from "@/services/adminApi";

const defaultInstructorId = 1;
const defaultWebinarId = 1;

function formatTime(timeString) {
  if (!timeString) return "Time not set";
  // If timeString is already in HH:MM format, return as is
  if (typeof timeString === 'string' && timeString.includes(':')) {
    return timeString;
  }
  // Handle other time formats if needed
  return timeString;
}

function getStatusColor(status) {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50";
    case "cancelled":
      return "text-red-600 bg-red-50";
    case "pending":
      return "text-yellow-600 bg-yellow-50";
    case "completed":
      return "text-blue-600 bg-blue-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [zoomAccounts, setZoomAccounts] = useState([]);
  
  // Use AdminDataContext instead of individual state
  const { 
    classes, 
    loading, 
    error, 
    fetchClasses,
    clearError 
  } = useAdminData();
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    fee: "",
    start_date: "",
    end_date: "",
    zoom_account_key: "",
    repeat_type: "daily",
    schedules: [
      {
        days_of_week: [],
        start_time: "",
        duration_minutes: 90,
      },
    ],
  });

  useEffect(() => {
    // Use centralized data fetching
    fetchClasses();
  }, []); // Empty dependency array to run only once

  const filtered = classes.filter((c) => {
    const matchSearch =
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.instructor_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = selectedStatus === "all" || c.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const handleScheduleChange = (index, field, value) => {
    const newSchedules = [...form.schedules];
    newSchedules[index][field] = value;
    setForm({ ...form, schedules: newSchedules });
  };

  const handleDayToggle = (index, day) => {
    const newSchedules = [...form.schedules];
    const exists = newSchedules[index].days_of_week.includes(day);
    newSchedules[index].days_of_week = exists
      ? newSchedules[index].days_of_week.filter((d) => d !== day)
      : [...newSchedules[index].days_of_week, day];
    setForm({ ...form, schedules: newSchedules });
  };

  const addScheduleBlock = () => {
    setForm({
      ...form,
      schedules: [
        ...form.schedules,
        {
          days_of_week: [],
          start_time: "",
          duration_minutes: 90,
        },
      ],
    });
  };

  const removeScheduleBlock = (index) => {
    const updated = [...form.schedules];
    updated.splice(index, 1);
    setForm({ ...form, schedules: updated });
  };

  useEffect(() => {
    async function fetchZoomAccounts() {
      try {
        const response = await adminApi.getZoomAccounts();
        const data = response.data;
        setZoomAccounts(data);

        if (data.length > 0) {
          setForm((prev) => ({
            ...prev,
            zoom_account_key: data[0].key, // Set default to first account
          }));
        }
      } catch (err) {
        console.error("Error fetching Zoom accounts:", err);
        // Don't show alert for non-critical errors
      }
    }

    fetchZoomAccounts();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();
    const dayNameToNumber = {
      Sunday: 1,
      Monday: 2,
      Tuesday: 3,
      Wednesday: 4,
      Thursday: 5,
      Friday: 6,
      Saturday: 7,
    };

    const allDaysSet = new Set();
    form.schedules.forEach(schedule => {
      schedule.days_of_week.forEach(day => allDaysSet.add(day));
    });

    const zoom_schedule = {
      weekly_days: [...allDaysSet].map(day => dayNameToNumber[day]),
      start_time: form.schedules[0]?.start_time,
      duration_minutes: parseInt(form.schedules[0]?.duration_minutes),
    };

    const payload = {
      title: form.title,
      description: form.description,
      fee: parseFloat(form.fee),
      start_date: form.start_date,
      end_date: form.end_date,
      repeat_type: form.repeat_type,
      zoom_account_key: form.zoom_account_key,
      schedules: form.schedules, // full schedules stored in DB
      zoom_schedule,
    };

    try {
      // Use adminApi service instead of direct fetch
      const response = await adminApi.createClass(payload);
      console.log("New class created:", response.data);

      // Refresh classes data through context
      await fetchClasses();
      
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        fee: "",
        start_date: "",
        end_date: "",
        zoom_account_key: zoomAccounts.length > 0 ? zoomAccounts[0].key : "",
        schedules: [
          {
            days_of_week: [],
            start_time: "",
            duration_minutes: 90,
          },
        ],
      });
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to create class.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto ">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                Classes Management
              </h1>
              <p className="text-slate-600 text-lg">
                Manage your educational programs and Zoom webinars
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Class
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search classes, instructors..."
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
            <div className="relative sm:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm font-medium">
                Error: {error}
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading classes...</span>
            </div>
          </div>
        )}

        {/* Classes Grid */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 ">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                        {c.title}
                      </h3>
                      <p className="text-slate-600 font-medium">{c.instructor_name || "Auto Assigned"}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(c.status)}`}>
                      {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : "Active"}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                    {c.description}
                  </p>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                      <div className="flex items-center text-slate-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <div className="text-sm text-slate-800">
                        <div>{c.start_date ? new Date(c.start_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : "Not set"}</div>
                        <div className="text-slate-500">to {c.end_date ? new Date(c.end_date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        }) : "Not set"}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-slate-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                        <span className="text-sm font-medium">Fee</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900">
                        LKR {c.fee ? parseInt(c.fee).toLocaleString() : "0"}
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center text-slate-600 mb-3">
                      <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="text-sm font-medium">Schedule</span>
                    </div>
                    <div className="space-y-2">
                      {c.schedules && c.schedules.length > 0 ? (
                        c.schedules.map((s, i) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {s.days_of_week && s.days_of_week.length > 0 ? (
                                s.days_of_week.map((day, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                                    {day.slice(0, 3)}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                  Daily
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-700 font-medium">
                              {formatTime(s.start_time)} • {s.duration_minutes || 90} minutes
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50 rounded-lg p-3">
                          <div className="text-sm text-slate-500 text-center">
                            No schedule information available
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <Calendar className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Classes Found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm || selectedStatus !== "all" 
                    ? "No classes match your current filters. Try adjusting your search or filter criteria."
                    : "You haven't created any classes yet. Click the 'Add New Class' button to get started."
                  }
                </p>
                {(!searchTerm && selectedStatus === "all") && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Class
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">

            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="sticky top-4 left-[calc(100%-2.5rem)] z-50 text-white hover:text-white-700 bg-red-300 hover:bg-red-500 p-1 rounded-xl transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>


              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {/* Modal Header */}
                <div className="text-center pb-6 border-b border-slate-200">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    Create New Class
                  </h2>
                  <p className="text-slate-600">Set up a new educational program with Zoom integration</p>
                </div>

                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Class Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter class title"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Course Fee (LKR)
                      </label>
                      <input
                        type="number"
                        name="fee"
                        value={form.fee}
                        onChange={(e) => setForm({ ...form, fee: e.target.value })}
                        placeholder="Enter fee amount"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the class content and objectives"
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Zoom Account
                    </label>
                    <select
                      value={form.zoom_account_key}
                      onChange={(e) => setForm({ ...form, zoom_account_key: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      <option value="" disabled>Select Zoom account</option>
                      {zoomAccounts.map((acc) => (
                        <option key={acc.key} value={acc.key}>
                          {acc.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Schedules */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Class Schedules</h3>
                    <button
                      type="button"
                      onClick={addScheduleBlock}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Schedule
                    </button>
                  </div>

                  {form.schedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-2xl p-6 bg-slate-50 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-900">
                          Schedule {index + 1}
                        </h4>
                        {form.schedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleBlock(index)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          Repeat Type
                        </label>
                        <select
                          value={form.repeat_type}
                          onChange={(e) => setForm({ ...form, repeat_type: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      {/* Show Days only if repeat_type is weekly */}
                      {form.repeat_type === "weekly" && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">
                            Class Days
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                            {[
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                              "Sunday",
                            ].map((day) => (
                              <label
                                key={day}
                                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors duration-200 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={schedule.days_of_week.includes(day)}
                                  onChange={() => handleDayToggle(index, day)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                  {day.slice(0, 3)}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={schedule.start_time}
                            onChange={(e) =>
                              handleScheduleChange(index, "start_time", e.target.value)
                            }
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-slate-700">
                            Duration (minutes)
                          </label>
                          <input
                            type="number"
                            value={schedule.duration_minutes}
                            onChange={(e) =>
                              handleScheduleChange(index, "duration_minutes", e.target.value)
                            }
                            placeholder="e.g., 90"
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}