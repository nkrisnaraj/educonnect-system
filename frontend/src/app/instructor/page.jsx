"use client"

import { useEffect, useState } from "react"
import {
  Search,
  Bell,
  BookOpen,
  Upload,
  Calendar,
  Clock,
  MessageCircle,
  Send,
  Users,
  Eye,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [newMessage, setNewMessage] = useState("")

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

  const notesToUpload = [
    { id: 1, subject: "Physics", topic: "Quantum Mechanics", dueDate: "2024-06-20"},
    { id: 2, subject: "Chemistry", topic: "Organic Chemistry", dueDate: "2024-06-22"},
    { id: 3, subject: "Biology", topic: "Cell Biology", dueDate: "2024-06-25"},
  ]

  const recentSchedules = [
    { id: 1, class: "2025 A/L Physics", time: "8:00 AM", date: "Today"},
    { id: 2, class: "2026 A/L Chemistry", time: "10:00 AM", date: "Today"},
    { id: 3, class: "2025 A/L Biology", time: "2:00 PM", date: "Tomorrow"},
    { id: 4, class: "2025 A/L Day Batch", time: "4:00 PM", date: "Tomorrow"},
  ]

  const students = [
    {
      id: 1,
      name: "Kasun Perera",
      email: "kasun@email.com",
      school: "Royal College",
      subjects: ["Physics", "Chemistry", "Biology"],
      batch: "2025 A/L"
    },
    {
      id: 2,
      name: "Nimali Silva",
      email: "nimali@email.com",
      school: "Visakha Vidyalaya",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      batch: "2025 A/L"
    },
    {
      id: 3,
      name: "Tharindu Fernando",
      email: "tharindu@email.com",
      school: "S. Thomas' College",
      subjects: ["Biology", "Chemistry", "Physics"],
      batch: "2026 A/L"
    },
    {
      id: 4,
      name: "Sachini Jayawardena",
      email: "sachini@email.com",
      school: "Ladies' College",
      subjects: ["Physics", "Mathematics"],
      batch: "2025 A/L"
    },
    {
      id: 5,
      name: "Ravindu Wickramasinghe",
      email: "ravindu@email.com",
      school: "Trinity College",
      subjects: ["Chemistry", "Biology"],
      batch: "2026 A/L"
    },
  ]

  const chatMessages = [
    { id: 1, sender: "Kasun Perera", message: "Sir, when is the next Physics practical?", time: "10:30 AM" },
    { id: 2, sender: "Nimali Silva", message: "Can you share the Chemistry notes?", time: "11:15 AM" },
    { id: 3, sender: "Tharindu Fernando", message: "Thank you for the Biology revision session!", time: "2:45 PM" },
  ]

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  
    const {user } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      const role = localStorage.getItem("userRole");
      if (!role || role !== 'instructor') {
        router.replace("/login");
      }
    }, []);
  
    if (!user || user.role !== 'instructor') {
      return null; // or a loading spinner
    }
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
            <h1 className="text-2xl font-bold mb-2">Welcome back, {instructorData.name.split(" ")[1]}!</h1>
            <p className="text-purple-100">Ready to inspire and educate your A/L students today</p>
          </div>
          <div className="absolute right-4 top-4 opacity-20">
            <BookOpen className="h-24 w-24" />
          </div>
        </div>

        {/* First Row: Courses, Notes to Upload, Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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

          {/* Notes to Upload */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
            <div className="p-6 border-b border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-purple-600" />
                Notes to Upload
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {notesToUpload.map((note) => (
                  <div key={note.id} className="p-3 bg-white/50 rounded-xl border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{note.subject}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          note.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : note.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {note.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{note.topic}</p>
                    <p className="text-xs text-gray-500">Due: {note.dueDate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
            <div className="p-6 border-b border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Calendar
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-4">
                <h4 className="text-lg font-semibold">
                  {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h4>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const day = i - 5 // Adjust for month start
                  const isToday = day === new Date().getDate()
                  const isCurrentMonth = day > 0 && day <= 30
                  return (
                    <div
                      key={i}
                      className={`p-2 text-sm ${
                        isToday
                          ? "bg-primary text-white rounded-full"
                          : isCurrentMonth
                            ? "text-gray-900 hover:bg-purple-100 rounded"
                            : "text-gray-300"
                      }`}
                    >
                      {isCurrentMonth ? day : ""}
                    </div>
                  )
                })}
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                Student Messages
              </h3>
            </div>
            <div className="flex flex-col h-64">
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div key={message.id} className="bg-white/50 rounded-xl p-3">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{message.message}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-purple-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row: Student Details Table */}
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                A/L Student Details
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700">Export</button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Subjects</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-white/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-purple-600">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.email}</td>
                      <td className="py-3 px-4 text-gray-600">{student.school}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {student.subjects.map((subject, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {student.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
