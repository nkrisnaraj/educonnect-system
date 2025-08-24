"use client"

import { useState } from "react"
import { Users, BookOpen, GraduationCap } from "lucide-react"
import Sidebar from "./Sidebar"
import StatsCard from "./StatsCard"
import { ChartCard, PerformanceChart } from "./ChartCard"
import PaymentsTable from "./PaymentsTable"
import CalendarWidget from "./CalendarWidget"
import Chatbot from "./Chatbot"
import AdminHeader from "./AdminHeader"

// Import sub-page components
import StudentsPage from "./pages/StudentsPage"
import ClassesPage from "./pages/ClassesPage"
import PaymentsPage from "./pages/PaymentsPage"
import ReportsPage from "./pages/ReportsPage"
import NotificationsPage from "./pages/NotificationsPage"
import SettingsPage from "./pages/SettingsPage"
import WebinarsPage from "./pages/WebinarsPage"


export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "students":
        return <StudentsPage />
      case "classes":
        return <ClassesPage />
      case "webinars":
        return <WebinarsPage/>
      case "payments":
        return <PaymentsPage />
      case "reports":
        return <ReportsPage />
      case "notifications":
        return <NotificationsPage />
      case "settings":
        return <SettingsPage />
      default:
        return (
          <div className="space-y-4 lg:space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-xl p-4 lg:p-6 text-white bg-gradient-to-r from-primary to-accent">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">{new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 lg:mb-2">Welcome back, Admin!</h2>
                  <p className="text-blue-100 text-sm lg:text-base">Manage your institution efficiently</p>
                </div>
                <div className="hidden sm:block">
                  <div className="h-12 w-12 lg:h-20 lg:w-20 rounded-full bg-white/20 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 lg:h-10 lg:w-10 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid Layout - Responsive */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Left Column: Stats Cards + Payments */}
              <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                {/* Stats Cards Row - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  <StatsCard title="Total Students" value="8,998" change="+5.2%" changeType="positive" icon={Users} />
                  <StatsCard title="Active Classes" value="520" change="+8.3%" changeType="positive" icon={BookOpen} />
                </div>

                {/* Payments Table */}
                <div className="overflow-x-auto">
                  <PaymentsTable />
                </div>
              </div>

              {/* Right Column: Calendar + Upcoming Classes */}
              <div className="space-y-4">
                {/* Calendar - Full width on mobile */}
                <div className="w-full">
                  <CalendarWidget />
                </div>

                {/* Upcoming Classes - Responsive height */}
                <div className="rounded-xl bg-white p-4 shadow-sm h-60 lg:h-64">
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Upcoming Classes</h3>
                  <div className="space-y-2 overflow-y-auto h-44 lg:h-48">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Mathematics 101</p>
                        <p className="text-xs text-gray-600 truncate">Room A-205</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-primary">9:00 AM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Physics Lab</p>
                        <p className="text-xs text-gray-600 truncate">Lab B-102</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-green-600">11:30 AM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Chemistry 201</p>
                        <p className="text-xs text-gray-600 truncate">Room C-301</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-yellow-600">2:00 PM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">English Literature</p>
                        <p className="text-xs text-gray-600 truncate">Room D-105</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-purple-600">3:30 PM</p>
                        <p className="text-xs text-gray-500">Today</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Biology 101</p>
                        <p className="text-xs text-gray-600 truncate">Room E-201</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-600">10:00 AM</p>
                        <p className="text-xs text-gray-500">Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">History 201</p>
                        <p className="text-xs text-gray-600 truncate">Room F-103</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-indigo-600">1:00 PM</p>
                        <p className="text-xs text-gray-500">Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-pink-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Art & Design</p>
                        <p className="text-xs text-gray-600 truncate">Studio A</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-pink-600">3:00 PM</p>
                        <p className="text-xs text-gray-500">Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-teal-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Computer Science</p>
                        <p className="text-xs text-gray-600 truncate">Lab C-204</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-teal-600">4:30 PM</p>
                        <p className="text-xs text-gray-500">Tomorrow</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Spanish 101</p>
                        <p className="text-xs text-gray-600 truncate">Room G-108</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-orange-600">11:00 AM</p>
                        <p className="text-xs text-gray-500">Wed</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-cyan-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm truncate">Music Theory</p>
                        <p className="text-xs text-gray-600 truncate">Music Room</p>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <p className="text-sm font-medium text-cyan-600">2:30 PM</p>
                        <p className="text-xs text-gray-500">Wed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Chart - Full width and responsive */}
            <div>
              <ChartCard title="Performance Overview">
                <div className="overflow-x-auto">
                  <PerformanceChart />
                </div>
              </ChartCard>
            </div>

            {/* Recent Activity - Responsive */}
            <div>
              <ChartCard title="Recent Activity">
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">New student registered</p>
                        <p className="text-xs text-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Class "Advanced Mathematics" updated
                        </p>
                        <p className="text-xs text-gray-500">15 minutes ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Class schedule updated for next week
                        </p>
                        <p className="text-xs text-gray-500">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">Payment received from John Smith</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 lg:py-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">Class "Physics Lab" cancelled</p>
                        <p className="text-xs text-gray-500">3 hours ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Main Content with Chatbot */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Content - Scrollable */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">{renderContent()}</main>

          {/* Chatbot - Hidden on mobile by default, toggleable */}
          <div
            className={`lg:block fixed lg:static md:static inset-y-0 right-0 z-30 lg:z-auto`}
          >
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  )
}
