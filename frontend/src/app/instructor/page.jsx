"use client"

import { useEffect, useState } from "react"
import {Search, Bell, BookOpen, Upload, Calendar, Clock, MessageCircle, Send, Users, Eye} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useParams, useRouter } from "next/navigation"

export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  

  // Mock data
  const instructorData = {
    name: "Dr. Sarah Johnson",
    role: "Senior Instructor",
  }

  const courses = [
    { id: 1, name: "Physics", students: 45, color: "bg-blue-500" },
    { id: 2, name: "Chemistry", students: 38, color: "bg-green-500" },
    { id: 3, name: "Biology", students: 52, color: "bg-purple-500" },
    { id: 4, name: "Mathematics", students: 41, color: "bg-orange-500" },
  ]

  const recentSchedules = [
    { id: 1, class: "2025 A/L Physics", time: "8:00 AM", date: "Today"},
    { id: 2, class: "2026 A/L Chemistry", time: "10:00 AM", date: "Today"},
    { id: 3, class: "2025 A/L Biology", time: "2:00 PM", date: "Tomorrow"},
    { id: 4, class: "2025 A/L Day Batch", time: "4:00 PM", date: "Tomorrow"},
  ]

  // const chatMessages = [
  //   { id: 1, sender: "Kasun Perera", message: "Sir, when is the next Physics practical?", time: "10:30 AM" },
  //   { id: 2, sender: "Nimali Silva", message: "Can you share the Chemistry notes?", time: "11:15 AM" },
  //   { id: 3, sender: "Tharindu Fernando", message: "Thank you for the Biology revision session!", time: "2:45 PM" },
  // ]

const {user } = useAuth();
const router = useRouter();
const params = useParams();
const studentId = params.student_id;

const [students, setStudents] = useState([]);
const [selectedStudent, setSelectedStudent] = useState(null);
const [chatMessages, setChatMessages] = useState([]);
const [newMessage, setNewMessage] = useState("");
const [loading, setLoading] = useState(true);
const [lastMessages, setLastMessages] = useState({});

useEffect(() => {
    if (!user || user.role !== "instructor") {
      router.replace("/login");
    }
}, [user, router]);


// Fetch students on mount and get last message for each
useEffect(() => {
  const fetchStudents = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch("http://127.0.0.1:8000/instructor/chat/instructor/students/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data.students);
      // For each student, fetch their last message
      const lastMsgObj = {};
      await Promise.all(
        data.students.map(async (student) => {
          try {
            const resMsg = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${student.id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const messages = await resMsg.json();
            if (messages && messages.length > 0) {
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
  const fetchMessages = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatMessages(data);
    } catch (err) {
      console.error("Error fetching chat messages", err);
    }
  };
  fetchMessages();
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
    setChatMessages((prev) => [...prev, data]);
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
                placeholder="Search students, courses, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 bg-white/50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">SJ</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{instructorData.name}</p>
                <p className="text-xs text-gray-500">{instructorData.role}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 flex">
      {/* Main Content: Chat Box and Dashboard */}
        <div className="flex-1">
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
              <h1 className="text-2xl font-bold mb-2">Welcome back, {instructorData.name.split(" ")[1]}!</h1>
              <p className="text-purple-100">Ready to inspire and educate your A/L students today</p>
            </div>
            <div className="absolute right-4 top-4 opacity-20">
              <BookOpen className="h-24 w-24" />
            </div>
          </div>

          {/* First Row: Courses, Notes to Upload, Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
            {/* Courses */}
            <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
              <div className="p-6 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  My Courses
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${course.color}`}></div>
                        <span className="font-medium">{course.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">{course.students} students</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Recent Schedules, Chat Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Recent Schedules */}
            <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
              <div className="p-6 border-b border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Recent Schedules
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {recentSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                      <div>
                        <h4 className="font-medium text-sm">{schedule.class}</h4>
                        <p className="text-xs text-gray-500">{schedule.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{schedule.time}</p>
                        <p className="text-xs text-gray-500">{schedule.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  {students.map((student) => {
                    const lastMsg = lastMessages[student.id];
                    return (
                      <button
                        key={student.id}
                        className={`px-4 py-2 rounded-lg w-full font-medium  items-start border border-purple-200 focus:outline-none  flex flex-col 
                          ${selectedStudent === student.id ? 'bg-primary text-white border-purple-500' : 'bg-white'}`}
                        onClick={() => setSelectedStudent(student.id)}
                        title={student.first_name + ' ' + student.last_name}
                      >
                        <span className="font-bold truncate w-full">{student.first_name} {student.last_name}</span>
                        <span className="text-xs text-gray-300 truncate w-full mt-1">
                          {lastMsg ? (lastMsg.message.length > 30 ? lastMsg.message.slice(0, 30) + '…' : lastMsg.message) : 'No messages yet.'}
                        </span>
                      </button>
                    );
                  })}
                  {students.length === 0 && (
                    <span className="text-gray-500 text-sm ml-2">No students found.</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col h-96">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-purple-50 to-white rounded-b-xl">
                  {selectedStudent && chatMessages.length > 0 ? (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-md mb-2 flex flex-col
                          ${msg.sender.id === user.id ? 'ml-auto bg-primary text-right border border-purple-200' : 'mr-auto bg-white border border-gray-200'}`}
                      >
                        <div className="text-xs font-semibold text-purple-600 mb-1">
                          {msg.sender.username}
                        </div>
                        <div className="text-base text-gray-900">{msg.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm flex h-full">
                      {selectedStudent
                        ? "No messages yet."
                        : "Select a student to view messages."}
                    </div>
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
                        className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-full font-semibold shadow-md hover:from-purple-600 hover:to-indigo-500 transition-colors duration-150 flex items-center gap-2"
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
    </div>
  )
}
