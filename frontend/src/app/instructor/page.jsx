"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Bell,
  BookOpen,
  Clock,
  MessageCircle,
  Send,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useApiCall } from "@/hooks/useApiCall";
import { useSearch } from "@/hooks/useSearch";
import {
  ClassCardSkeleton,
  WebinarCardSkeleton,
  ChatSkeleton,
} from "@/components/ui/SkeletonLoader";
import { ErrorMessage, EmptyState } from "@/components/ui/ErrorMessage";
import InstructorChatBox from "@/components/instructor/InstructorChatBox";

export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [todayTomorrowWebinars, setTodayTomorrowWebinars] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const { accessToken, user, refreshAccessToken, logout, api } = useAuth();
  const router = useRouter();
  // Removed student, selectedStudent, chatMessages, messageRefreshInterval, lastMessages state variables

  // New state for error handling
  const [classesError, setClassesError] = useState(null);
  const [webinarsError, setWebinarsError] = useState(null);
  const [chatError, setChatError] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);

  // Enhanced search with debouncing - with safety checks
  const filteredClasses = useSearch(
    classes || [],
    ["title", "description"],
    searchQuery
  );

  // Retry functions
  const retryAllData = () => {
    if (accessToken) {
      fetchClasses(accessToken);
      fetchWebinars(accessToken);
      fetchInstructorName(accessToken);
    }
  };

  const params = useParams();
  const studentId = params.student_id;

  const fetchClasses = async (token) => {
    try {
      setLoadingClasses(true);
      setClassesError(null);
      const res = await fetch(
        "http://127.0.0.1:8000/instructor/instructor/classes/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) throw new Error("Unauthorized");

      const data = await res.json();
      if (data?.classes) {
        setClasses(data.classes);
      }
    } catch (err) {
      if (err.message === "Unauthorized") {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) fetchClasses(newToken);
          else logout();
        } catch {
          logout();
        }
      } else {
        console.error("Fetch error:", err);
        setClassesError("Failed to load classes. Please try again.");
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const fetchWebinars = async (token) => {
    try {
      setLoadingWebinars(true);
      setWebinarsError(null);
      const res = await axios.get(
        "http://127.0.0.1:8000/edu_admin/webinars-list/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;
      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrowStr = new Date(Date.now() + 86400000)
        .toISOString()
        .split("T")[0];

      const filteredOccurrences = [];

      data.forEach((webinar) => {
        const wId = webinar.id ?? Math.random().toString(36).slice(2, 8);
        (webinar.occurrences || []).forEach((occ, index) => {
          if (!occ?.start_time) return;

          const occDateStr = new Date(occ.start_time)
            .toISOString()
            .split("T")[0];
          if (occDateStr === todayStr || occDateStr === tomorrowStr) {
            const occDateTime = new Date(occ.start_time);

            filteredOccurrences.push({
              key: `webinar-${wId}-${
                occ.occurrence_id || index
              }-${occDateTime.getTime()}`,
              webinarId: wId,
              topic: webinar.topic || "Untitled",
              date: occDateTime.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "short",
                day: "numeric",
              }),
              time: occDateTime.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              }),
              day: occDateStr === todayStr ? "Today" : "Tomorrow",
              duration: occ.duration || "N/A",
            });
          }
        });
      });

      setTodayTomorrowWebinars(filteredOccurrences);
    } catch (error) {
      console.error("Failed to fetch webinars:", error);
      setWebinarsError("Failed to load webinars. Please try again.");
    } finally {
      setLoadingWebinars(false);
    }
  };

  const fetchInstructorName = async (token) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/instructor/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInstructorName(res.data.last_name);
      setProfileImage(res.data.profile_image || null);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            fetchInstructorName(newToken);
          } else {
            logout();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error("Failed to load instructor profile:", err);
      }
    }
  };

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    if (!role || role !== "instructor") {
      router.replace("/login");
      return;
    }
    if (accessToken) {
      fetchInstructorName(accessToken);
      fetchClasses(accessToken);
      fetchWebinars(accessToken);
    }
  }, [accessToken]);

  // if (!user || user.role !== "instructor") {
  //   return null;
  // }

  useEffect(() => {
    if (!user || user.role !== "instructor") {
      router.replace("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchTotalStudents = async () => {
      if (!accessToken) return;
      try {
        const res = await api.get("instructor/chat/instructor/students/");
        setTotalStudents(res.data.students?.length || 0);
      } catch (err) {
        console.error("Failed to fetch student count:", err);
        // Set to 0 on error to prevent UI issues
        setTotalStudents(0);
      }
    };
    fetchTotalStudents();
  }, [accessToken, api]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="mt-4 ml-6 mr-10 bg-white/80 backdrop-blur-sm border-b border-purple-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search classes, students, webinars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              <Bell className="h-5 w-5" />
              {/* Dynamic notification count - can be connected to actual notification data */}
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center space-x-3">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {instructorName
                      ? instructorName.charAt(0).toUpperCase()
                      : "I"}
                  </span>
                </div>
              )}
              <div className="text-right">
                <p className="text-lg font-medium">
                  {instructorName || "Instructor"}
                </p>
                <p className="text-base text-gray-500">Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Welcome Banner */}
        <div className="bg-primary rounded-xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-purple-200 mb-2">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {instructorName || "Instructor"}!
            </h1>
            <p className="text-purple-100">
              {(todayTomorrowWebinars || []).length > 0
                ? `You have ${(todayTomorrowWebinars || []).length} webinar${
                    (todayTomorrowWebinars || []).length > 1 ? "s" : ""
                  } today/tomorrow`
                : "Ready to inspire and educate your A/L students today"}
            </p>
            {(classes || []).length > 0 && (
              <p className="text-purple-200 text-sm mt-2">
                Managing {(classes || []).length} class
                {(classes || []).length > 1 ? "es" : ""}
              </p>
            )}
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <BookOpen className="h-24 w-24" />
          </div>
        </div>

        {/* Classes */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-white/80 cursor-pointer">
            <div className="p-6 border-b border-purple-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Classes
              </h3>
            </div>
            <div className="p-6">
              {loadingClasses ? (
                <div className="h-64 overflow-y-auto space-y-4">
                  {[1, 2, 3].map((i) => (
                    <ClassCardSkeleton key={i} />
                  ))}
                </div>
              ) : classesError ? (
                <ErrorMessage
                  error={classesError}
                  onRetry={() => fetchClasses(accessToken)}
                />
              ) : (filteredClasses || []).length > 0 ? (
                <div className="h-64 overflow-y-auto space-y-4">
                  {(filteredClasses || []).map((cls) => (
                    <div
                      key={cls.id}
                      className="p-4 bg-white/50 rounded-xl shadow-md"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xl text-gray-800">
                          {cls.title}
                        </span>
                        <p className="text-gray-600 mt-1">{cls.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No classes found"
                  description={
                    searchQuery
                      ? "No classes match your search."
                      : "You haven't created any classes yet."
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Webinars and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-white/80 cursor-pointer">
            <div className="p-6 border-b border-purple-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Recent Webinars (Today & Tomorrow)
              </h3>
            </div>
            <div className="p-6">
              {loadingWebinars ? (
                <div className="space-y-3 h-64 overflow-y-auto">
                  {[1, 2, 3].map((i) => (
                    <WebinarCardSkeleton key={i} />
                  ))}
                </div>
              ) : webinarsError ? (
                <ErrorMessage
                  error={webinarsError}
                  onRetry={() => fetchWebinars(accessToken)}
                />
              ) : (todayTomorrowWebinars || []).length > 0 ? (
                <div className="space-y-3 h-64 overflow-y-auto">
                  {(todayTomorrowWebinars || []).map((webinar) => (
                    <div
                      key={webinar.key}
                      className="flex items-center justify-between p-3 bg-white/50 rounded-xl"
                    >
                      <div>
                        <h4 className="font-medium text-lg">{webinar.topic}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium">{webinar.time}</p>
                        <p className="text-lg text-gray-500">{webinar.day}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="No upcoming webinars"
                  description="No webinars scheduled for today or tomorrow."
                />
              )}
            </div>
          </div>

          {/* Chat Box */}
          <InstructorChatBox />
        </div>
      </div>
    </div>
  );
}
