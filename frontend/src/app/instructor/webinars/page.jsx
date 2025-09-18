"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Video,
  Users,
  Play,
} from "lucide-react";
import { useInstructorApi } from "@/hooks/useInstructorApi";

export default function WebinarsPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [webinars, setWebinars] = useState([]);
  const [expandedWebinarId, setExpandedWebinarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const instructorApi = useInstructorApi();

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

  const fetchWebinars = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.getWebinars();
      
      if (data) {
        const processed = processWebinars(data || []);
        setWebinars(processed);
      } else {
        setError("Failed to fetch webinars");
      }
    } catch (err) {
      console.error("Error fetching webinars:", err);
      setError(err.message || "Failed to load webinars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebinars();
    setExpandedWebinarId(null);
  }, []);

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

  const getFilteredWebinars = () => {
    let filtered = webinars.filter((webinar) => {
      if (selectedTab === "upcoming") return webinar.upcomingOccurrences.length > 0;
      if (selectedTab === "completed") return webinar.completedOccurrences.length > 0;
      return true;
    });

    if (searchQuery) {
      filtered = filtered.filter((webinar) =>
        webinar.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.agenda?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        webinar.id?.toString().includes(searchQuery)
      );
    }

    return filtered;
  };

  const getWebinarStats = () => {
    const totalWebinars = webinars.length;
    const upcomingWebinars = webinars.filter(w => w.upcomingOccurrences.length > 0).length;
    const completedWebinars = webinars.filter(w => w.completedOccurrences.length > 0).length;
    
    return { totalWebinars, upcomingWebinars, completedWebinars };
  };

  const { totalWebinars, upcomingWebinars, completedWebinars } = getWebinarStats();
  const filteredWebinars = getFilteredWebinars();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchWebinars}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Webinars Management</h1>
          <p className="text-gray-600">Manage and monitor your webinars</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Webinars</p>
              <p className="text-2xl font-bold text-gray-900">{totalWebinars}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingWebinars}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Play className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedWebinars}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-xl font-semibold">Webinars</h3>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {["upcoming", "completed", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredWebinars.length > 0 ? (
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
                    className="bg-white border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {webinar.topic ?? "Untitled Webinar"}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTab)}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                      {(webinar.upcomingOccurrences.length > 0 || webinar.completedOccurrences.length > 0) && (
                        <button
                          onClick={() => toggleExpand(webinar.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
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
                          <span className="text-sm text-gray-600">Date & Time</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {webinar.date} - {webinar.time}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Duration</span>
                        </div>
                        <p className="text-sm text-gray-900">
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
                          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Join Webinar
                        </a>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Webinar ID: </span>
                        <span className="font-mono">{webinar.webinar_id}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div id={`webinar-details-${webinar.id}`} className="mt-4 pt-4 border-t border-gray-200">
                        {(selectedTab === "all" || selectedTab === "upcoming") &&
                          webinar.upcomingOccurrences.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-semibold mb-2 text-gray-700">
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
                                      <CalendarClock className="h-4 w-4 text-blue-500" />
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
                              <h5 className="text-sm font-semibold mb-2 text-gray-700">
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
          ) : (
            <div className="text-center py-12">
              <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No webinars found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? `No webinars match "${searchQuery}"`
                  : selectedTab === 'upcoming' 
                    ? 'No upcoming webinars scheduled'
                    : selectedTab === 'completed'
                      ? 'No completed webinars in the last 15 days'
                      : 'No webinars available'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
