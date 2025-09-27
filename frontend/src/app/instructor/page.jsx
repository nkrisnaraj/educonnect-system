"use client";

import { useEffect, useState } from "react";
import {Search,Bell,BookOpen,Clock,MessageCircle,Send,} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useParams, useRouter } from "next/navigation"
import { Check } from "lucide-react";
import { useApiCall } from "@/hooks/useApiCall";
import { useSearch } from "@/hooks/useSearch";
import { ClassCardSkeleton, WebinarCardSkeleton, ChatSkeleton } from "@/components/ui/SkeletonLoader";
import { ErrorMessage, EmptyState } from "@/components/ui/ErrorMessage";



export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [todayTomorrowWebinars, setTodayTomorrowWebinars] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingWebinars, setLoadingWebinars] = useState(true);
  const { accessToken, user, refreshAccessToken, logout } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [lastMessages, setLastMessages] = useState({});
  
  // New state for error handling
  const [classesError, setClassesError] = useState(null);
  const [webinarsError, setWebinarsError] = useState(null);
  const [chatError, setChatError] = useState(null);
  
  // Enhanced search with debouncing - with safety checks
  const filteredClasses = useSearch(classes || [], ['title', 'description'], searchQuery);
  
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
      const res = await axios.get("http://127.0.0.1:8000/edu_admin/webinars-list/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;
      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

      const filteredOccurrences = [];

      data.forEach((webinar) => {
        const wId = webinar.id ?? Math.random().toString(36).slice(2, 8);
        (webinar.occurrences || []).forEach((occ, index) => {
          if (!occ?.start_time) return;

          const occDateStr = new Date(occ.start_time).toISOString().split("T")[0];
          if (occDateStr === todayStr || occDateStr === tomorrowStr) {
            const occDateTime = new Date(occ.start_time);

            filteredOccurrences.push({
              key: `webinar-${wId}-${occ.occurrence_id || index}-${occDateTime.getTime()}`,
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

const renderTick = (msg) => {
    if (msg.is_seen) return <DoubleTick color="blue" />;
    if (msg.is_delivered) return <DoubleTick color="gray" />;
    return <SingleTick />;
  };
// Fetch students on mount and get last message for each
useEffect(() => {
  const fetchStudents = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch("http://127.0.0.1:8000/instructor/chat/instructor/students/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data.students || []);
      // For each student, fetch their last message
      const lastMsgObj = {};
      await Promise.all(
        (data.students || []).map(async (student) => {
          try {
            const resMsg = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${student.id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const messages = await resMsg.json();
            if (messages && Array.isArray(messages) && messages.length > 0) {
              lastMsgObj[student.id] = messages[messages.length - 1];
            }
          } catch (err) {
            // ignore error for individual student
          }
        })
      );
      setLastMessages(lastMsgObj);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };
  fetchStudents();
}, []);

// Fetch messages when a student is selected
useEffect(() => {
  if (!selectedStudent) return;
  const markMessagesReadStudent = async (token) => {
    await axios.post(`http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/mark_messages_read/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  const fetchMessages = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(res);
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching chat messages", err);
    }
  };
  const token = accessToken;

  const run = async () => {
      await markMessagesReadStudent(token);
      await fetchMessages();
    };

    run();
}, [selectedStudent]);


const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedStudent) return;
  const token = sessionStorage.getItem("accessToken");
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/send/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      }
    );
    const data = await res.json();
    setChatMessages((prev) => [...(prev || []), data]);
    setNewMessage("");
  } catch (err) {
    console.error("Error sending message", err);
  }
};

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
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {instructorName ? instructorName.charAt(0).toUpperCase() : "I"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium">{instructorName || "Instructor"}</p>
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
                ? `You have ${(todayTomorrowWebinars || []).length} webinar${(todayTomorrowWebinars || []).length > 1 ? 's' : ''} today/tomorrow`
                : "Ready to inspire and educate your A/L students today"
              }
            </p>
            {(classes || []).length > 0 && (
              <p className="text-purple-200 text-sm mt-2">
                Managing {(classes || []).length} class{(classes || []).length > 1 ? 'es' : ''} • {(students || []).length} student{(students || []).length > 1 ? 's' : ''}
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
                    <div key={cls.id} className="p-4 bg-white/50 rounded-xl shadow-md">
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
                  description={searchQuery ? "No classes match your search." : "You haven't created any classes yet."}
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
            <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
              <div className="p-6 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 flex  gap-2 mb-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Student Messages
                </h3>
                {/* Student name tabs with last message preview */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-purple-200">
                  {loading ? (
                    <div className="flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 w-32 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : (students || []).length > 0 ? (
                    (students || []).map((student) => {
                      const lastMsg = lastMessages[student.id];
                      return (
                        <button
                          key={student.id}
                          className={`px-4 py-2 rounded-lg w-full font-medium  items-start border border-purple-200 focus:outline-none  flex flex-col transition-all duration-200
                            ${selectedStudent === student.id ? 'bg-primary text-white border-purple-500 shadow-md' : 'bg-white hover:bg-purple-50'}`}
                          onClick={() => setSelectedStudent(student.id)}
                          title={student.first_name + ' ' + student.last_name}
                        >
                          <span className="font-bold truncate w-full">{student.first_name} {student.last_name}</span>
                          <span className="text-xs text-gray-300 truncate w-full mt-1">
                            {lastMsg ? (lastMsg.message && lastMsg.message.length > 30 ? lastMsg.message.slice(0, 30) + '…' : lastMsg.message || 'No message content') : 'No messages yet.'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-gray-500 text-sm p-4 text-center w-full">
                      No students found. Students will appear here when they join your classes.
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col h-96">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-purple-50 to-white rounded-b-xl">
                  {loading && selectedStudent ? (
                    <ChatSkeleton />
                  ) : chatError ? (
                    <ErrorMessage 
                      error={chatError} 
                      onRetry={() => {
                        setChatError(null);
                        // Refetch selected student messages
                      }}
                    />
                  ) : selectedStudent && (chatMessages || []).length > 0 ? (
                    (chatMessages || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md mb-2 flex flex-col
                          ${msg.sender && msg.sender.id === user?.id ? 'ml-auto bg-white text-right border border-purple-200' : 'mr-auto bg-white border border-gray-200'}`}
                      >
                        <div className="text-xs font-semibold text-purple-600 mb-1">
                          {msg.sender?.username || 'Unknown'}
                        </div>
                        <div className="text-base text-gray-900">{msg.message || ''}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                          {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {msg.sender && msg.sender.id === user?.id && renderTick(msg)}
                        </div>
                      </div>
                    ))
                  ) : selectedStudent ? (
                    <EmptyState
                      icon={MessageCircle}
                      title="No messages yet"
                      description="Start a conversation with this student."
                    />
                  ) : (
                    <EmptyState
                      icon={MessageCircle}
                      title="Select a student"
                      description="Choose a student from the list to view messages."
                    />
                  )}
                </div>
                {selectedStudent && (
                  <div className="p-4 border-t border-purple-100 bg-white rounded-b-xl">
                    <form
                      className="flex gap-2"
                      onSubmit={e => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 text-gray-900"
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-full font-semibold shadow-md hover:from-purple-600 hover:to-indigo-500 transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}


function SingleTick() {
  return <Check className="w-4 h-4 text-gray-400" />;
}

function DoubleTick({ color }) {
  const colorClass = {
    blue: "text-blue-400",
    gray: "text-gray-400",
  }[color] || "text-gray-400";

  return (
    <div className="flex">
      <Check className={`w-4 h-4 ${colorClass}`} />
      <Check className={`w-4 h-4 ${colorClass} -ml-2`} />
    </div>
  );
}