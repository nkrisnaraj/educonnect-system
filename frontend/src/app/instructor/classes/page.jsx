"use client";

import { useState, useEffect } from "react";
import { useInstructorApi } from "@/hooks/useInstructorApi";
import { Calendar, Clock, DollarSign, Video } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState("active"); // all | active | pending | completed
  const instructorApi = useInstructorApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await instructorApi.getClasses();

      if (response && response.classes) {
        setClasses(response.classes || []);
      } else if (Array.isArray(response)) {
        setClasses(response);
      } else {
        setError("Failed to fetch classes");
      }
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses =
    selectedTab === "all"
      ? classes
      : classes.filter((cls) => cls.status === selectedTab);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">📚 My Classes</h1>

      {/* Tabs */}
      <div className="flex gap-3 border-b pb-2">
        {["active", "pending", "completed", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              selectedTab === tab
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {cls.title || "Unnamed Class"}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    cls.status === "active"
                      ? "bg-green-100 text-green-700"
                      : cls.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : cls.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {cls.status || "Unknown"}
                </span>
              </div>

              {/* Fee */}
              <div className="flex items-center gap-2 text-gray-700 mb-4">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span>Rs.{cls.fee || "0"}</span>
              </div>

              {/* Duration */}
              {cls.start_date && cls.end_date && (
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  {new Date(cls.start_date).toLocaleDateString()} -{" "}
                  {new Date(cls.end_date).toLocaleDateString()}
                </div>
              )}

              {/* Schedules */}
              {cls.schedules && cls.schedules.length > 0 && (
                <div className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">📅 Schedules</p>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {cls.schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-50 rounded px-1 py-1"
                      >
                        <span className="flex items-center gap-1 text-gray-700">
                          <Clock className="h-6 w-6" />
                          {schedule.start_time} ({schedule.duration_minutes}m)
                        </span>
                        <span className="text-gray-500 ">
                          {schedule.days_of_week?.join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Webinar Info */}
              {cls.webinar_info && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-700 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Webinar</span>
                  </div>
                  <p>
                    <strong>ID:</strong> {cls.webinar_info.webinar_id}
                  </p>
                </div>
              )}

              {/* Register Button */}
              {cls.webinar_info?.registration_url && (
                <div className="mt-auto">
                  <a
                    href={
                      cls.status === "active"
                        ? cls.webinar_info.registration_url
                        : undefined
                    }
                    target={cls.status === "active" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`inline-block w-full text-center px-4 py-2 text-sm rounded-lg transition ${
                      cls.status === "active"
                        ? "bg-primary text-white hover:bg-accent cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      if (cls.status !== "active") e.preventDefault(); // disable navigation
                    }}
                  >
                    {cls.status === "active" ? "Join Webinar" : "Not Available"}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-gray-500 text-lg">
            No {selectedTab} classes found
          </h3>
          <p className="text-gray-400">Try switching to another tab</p>
        </div>
      )}
    </div>
  );
}