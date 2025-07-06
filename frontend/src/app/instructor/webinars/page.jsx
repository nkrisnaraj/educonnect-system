"use client";

import { useState } from "react";
import { Calendar, Clock } from "lucide-react";

export default function WebinarsPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming");

  const webinars = [
    {
      id: 1,
      title: "Calculations",
      batch: "2025 A/L",
      date: "2024-06-25",
      time: "14:00",
      duration: "90 minutes",
      status: "upcoming",
      description:
        "Deep dive into quantum mechanics principles and applications",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      webinar_id: "12345678",
    },
    {
      id: 2,
      title: "Organic Chemistry Reactions",
      batch: "2026 A/L",
      date: "2024-06-22",
      time: "16:00",
      duration: "60 minutes",
      status: "upcoming",
      description: "Understanding organic reaction mechanisms and synthesis",
      meetingLink: "https://zoom.us/j/123456789",
      webinar_id: "12345678",
    },
    {
      id: 3,
      title: "Inorganic Chemistry",
      batch: "2025 A/L",
      date: "2024-06-18",
      time: "15:00",
      duration: "75 minutes",
      status: "completed",
      description:
        "Comprehensive overview of cellular processes and genetic principles",
      meetingLink: "https://teams.microsoft.com/l/meetup-join/...",
      webinar_id: "12345678",
    },
    {
      id: 4,
      title: "General Chemistry",
      batch: "2025 A/L",
      date: "2024-06-15",
      time: "10:00",
      duration: "120 minutes",
      status: "completed",
      description:
        "Real-world applications of differential and integral calculus",
      meetingLink: "https://meet.google.com/xyz-uvwx-rst",
      webinar_id: "12345678",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "live":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredWebinars = webinars.filter((webinar) => {
    if (selectedTab === "upcoming")
      return webinar.status === "upcoming" || webinar.status === "live";
    if (selectedTab === "completed") return webinar.status === "completed";
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          A/L Webinars Management
        </h1>
      </div>

      {/* Webinars List */}
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
          {/* Tabs */}
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

          {/* Webinar Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWebinars.map((webinar) => (
              <div
                key={webinar.id}
                className="bg-white/50 border border-primary rounded-xl p-6 transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-white/80 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {webinar.title}
                      </h4>
                      <span
                        className={`px-2 py-1 text-lg rounded-full ${getStatusColor(
                          webinar.status
                        )}`}
                      >
                        {webinar.status}
                      </span>
                    </div>
                    <p className="text-base text-gray-500">
                      {webinar.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-lg text-gray-600">Date & Time</span>
                    </div>
                    <p className="text-base font-medium text-gray-500">
                      {new Date(webinar.date).toLocaleDateString()} - {webinar.time}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-lg text-gray-600">Duration</span>
                    </div>
                    <p className="text-base text-gray-500">{webinar.duration}</p>
                  </div>
                </div>

                {/* Webinar Info */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-lg text-gray-600">
                    <span>Meeting Link: </span>
                    <a
                      href={webinar.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 truncate max-w-32"
                    >
                      Join Meeting
                    </a>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-lg text-gray-600">
                    <span>Webinar id: </span>
                        <div className="text-gray-500">{webinar.webinar_id}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
