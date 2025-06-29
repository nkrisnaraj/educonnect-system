"use client"

import { useEffect, useState } from "react"
import {Search, Bell, BookOpen, Upload, Calendar, Clock, MessageCircle, Send, Users, Eye} from "lucide-react"
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

  const recentSchedules = [
    { id: 1, class: "2025 A/L Physics", time: "8:00 AM", date: "Today"},
    { id: 2, class: "2026 A/L Chemistry", time: "10:00 AM", date: "Today"},
    { id: 3, class: "2025 A/L Biology", time: "2:00 PM", date: "Tomorrow"},
    { id: 4, class: "2025 A/L Day Batch", time: "4:00 PM", date: "Tomorrow"},
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
      const role = sessionStorage.getItem("userRole");
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

      </div>
    </div>
  )
}
