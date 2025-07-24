"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CalendarClock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function WebinarsPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [webinars, setWebinars] = useState([]);
  const [expandedWebinarId, setExpandedWebinarId] = useState(null);
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const processWebinars = (webinarsData) => {
    const now = new Date();
    const fifteenDaysAhead = new Date();
    fifteenDaysAhead.setDate(now.getDate() + 15);

    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(now.getDate() - 15);

    return webinarsData.map((webinar) => {
      const upcomingOccurrences = (webinar.occurrences || []).filter((occ) => {
        const occDate = new Date(occ.start_time);
        return occDate >= now && occDate <= fifteenDaysAhead;
      });

      const completedOccurrences = (webinar.occurrences || []).filter((occ) => {
        const occDate = new Date(occ.start_time);
        return occDate <= now && occDate >= fifteenDaysAgo;
      });

      const [date, time] = webinar.start_time?.split("T") ?? ["", ""];
      const formattedTime = time ? time.split("+")[0].slice(0, 5) : "";

      return {
        ...webinar,
        upcomingOccurrences,
        completedOccurrences,
        date,
        time: formattedTime,
      };
    });
  };

  const fetchWebinars = async (token = accessToken) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/edu_admin/webinars-list/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const processed = processWebinars(res.data);
      setWebinars(processed);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            await fetchWebinars(newToken);
          } else {
            logout();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error("Error fetching webinars:", error);
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchWebinars(accessToken);
      setExpandedWebinarId(null);
    }
  }, [accessToken]);

  useEffect(() => {
    setExpandedWebinarId(null);
  }, [selectedTab]);

  const toggleExpand = (id) => {
    setExpandedWebinarId((prev) => (prev === id ? null : id));
  };

  const getStatusColor = (tab) => {
    switch (tab) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const filteredWebinars = webinars.filter((webinar) => {
    if (selectedTab === "upcoming") return webinar.upcomingOccurrences.length > 0;
    if (selectedTab === "completed") return webinar.completedOccurrences.length > 0;
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">A/L Webinars Management</h1>
      </div>

      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">A/L Webinars</h3>
            <input
              type="text"
              placeholder="Search webinars..."
              className="px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            {["upcoming", "completed", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-lg font-medium ${
                  selectedTab === tab
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWebinars.map((webinar, index) => {
              const isExpanded = String(expandedWebinarId) === String(webinar.id);
              const status =
                selectedTab === "all"
                  ? "All"
                  : selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1);

              const uniqueKey = `webinar-${webinar?.id ?? index}-${webinar?.start_time ?? ""}-${webinar?.topic ?? "topic"}`;

              return (
                <div
                  key={uniqueKey}
                  className="bg-white/50 border border-primary rounded-xl p-6 transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-white/80 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">
                          {webinar.topic ?? "Untitled Webinar"}
                        </h4>
                        <span className={`px-2 py-1 text-lg rounded-full ${getStatusColor(selectedTab)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    {(webinar.upcomingOccurrences.length > 0 || webinar.completedOccurrences.length > 0) && (
                      <button
                        onClick={() => toggleExpand(webinar.id)}
                        className="text-purple-600 hover:text-purple-800"
                        aria-expanded={isExpanded}
                        aria-controls={`webinar-details-${webinar.id}`}
                      >
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-lg text-gray-600">Date & Time</span>
                      </div>
                      <p className="text-base font-medium text-gray-500">
                        {webinar.date} - {webinar.time}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-lg text-gray-600">Duration</span>
                      </div>
                      <p className="text-base text-gray-500">
                        {webinar.duration} minutes
                      </p>
                    </div>
                  </div>

                  {webinar.registration_url && (
                    <div className="mb-4 text-center">
                      <a
                        href={webinar.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-accent transition"
                      >
                        Join Webinar
                      </a>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-lg text-gray-600">
                      <span>Webinar ID: </span>
                      {webinar.webinar_id}
                    </div>
                  </div>

                  {isExpanded && (
                    <div id={`webinar-details-${webinar.id}`} className="mt-2">
                      {(selectedTab === "all" || selectedTab === "upcoming") &&
                        webinar.upcomingOccurrences.length > 0 && (
                          <div className="mb-4">
                            <h5 className="text-md font-semibold mb-2 text-gray-700">
                              Upcoming Occurrences
                            </h5>
                            <ul className="space-y-2 text-sm">
                              {webinar.upcomingOccurrences.map((occ, idx) => {
                                const date = new Date(occ.start_time);
                                const day = date.toLocaleDateString(undefined, { weekday: "long" });
                                const dateStr = date.toLocaleDateString(undefined, {
                                  month: "short", day: "numeric", year: "numeric"
                                });
                                const timeStr = date.toLocaleTimeString(undefined, {
                                  hour: "2-digit", minute: "2-digit", hour12: true
                                });

                                return (
                                  <li
                                    key={`webinar-${webinar?.id ?? index}-up-${idx}-${occ.start_time}`}
                                    className="flex items-center gap-2 text-gray-600"
                                  >
                                    <CalendarClock className="h-4 w-4 text-purple-500" />
                                    {day}, {dateStr} at {timeStr} ({occ.duration} mins)
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                      {(selectedTab === "all" || selectedTab === "completed") &&
                        webinar.completedOccurrences.length > 0 && (
                          <div>
                            <h5 className="text-md font-semibold mb-2 text-gray-700">
                              Completed Occurrences (Last 15 Days)
                            </h5>
                            <ul className="space-y-2 text-sm">
                              {webinar.completedOccurrences.map((occ, idx) => {
                                const date = new Date(occ.start_time);
                                const day = date.toLocaleDateString(undefined, { weekday: "long" });
                                const dateStr = date.toLocaleDateString(undefined, {
                                  month: "short", day: "numeric", year: "numeric"
                                });
                                const timeStr = date.toLocaleTimeString(undefined, {
                                  hour: "2-digit", minute: "2-digit", hour12: true
                                });

                                return (
                                  <li
                                    key={`webinar-${webinar?.id ?? index}-comp-${idx}-${occ.start_time}`}
                                    className="flex items-center gap-2 text-gray-600"
                                  >
                                    <CalendarClock className="h-4 w-4 text-gray-400" />
                                    {day}, {dateStr} at {timeStr} ({occ.duration} mins)
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
