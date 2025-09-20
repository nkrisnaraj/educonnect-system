"use client"

import { useState, useEffect } from "react"
import { Users, BookOpen, GraduationCap, Clock, Video, DollarSign } from "lucide-react"
import { useAdminData } from "@/context/AdminDataContext"
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
  
  // Use AdminDataContext for centralized data management
  const { 
    users, 
    classes, 
    webinars, 
    payments,
    dashboardStats, 
    loading, 
    error,
    fetchUsers,
    fetchClasses,
    fetchWebinars,
    fetchPayments,
    fetchDashboardStats
  } = useAdminData()

  // Filter students from users
  const students = users.filter(user => user.user_type === 'student' || user.role === 'student')

  // Fetch all data on component mount
  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchUsers();
      fetchClasses();
      fetchWebinars();
      fetchPayments();
      fetchDashboardStats();
    }
  }, [activeSection]);

  // Get real-time data for display
  const totalStudents = dashboardStats?.users?.students || users.filter(u => u.role === 'student' || u.student_profile).length || 0;
  const totalClasses = dashboardStats?.classes?.total || classes.length || 0;
  const activeClasses = dashboardStats?.classes?.active || classes.filter(c => c.status === 'active').length || 0;
  const totalWebinars = dashboardStats?.webinars?.total || webinars.length || 0;
  const studentGrowth = dashboardStats?.users?.student_growth || 0;
  
  // Payment statistics
  const totalPayments = payments?.length || 0;
  const completedPayments = payments?.filter(p => p.status === 'completed' || p.status === 'success').length || 0;
  const totalRevenue = payments?.filter(p => p.status === 'completed' || p.status === 'success')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) || 0;

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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <StatsCard 
                    title="Total Students" 
                    value={totalStudents.toString()} 
                    change={studentGrowth > 0 ? `+${studentGrowth}%` : `${studentGrowth}%`}
                    changeType={studentGrowth >= 0 ? "positive" : "negative"} 
                    icon={Users} 
                  />
                  <StatsCard 
                    title="Active Classes" 
                    value={activeClasses.toString()} 
                    change={`${totalClasses} total`} 
                    changeType="neutral" 
                    icon={BookOpen} 
                  />
                  <StatsCard 
                    title="Total Webinars" 
                    value={totalWebinars.toString()} 
                    change="Online sessions" 
                    changeType="neutral" 
                    icon={GraduationCap} 
                  />
                  <StatsCard 
                    title="Total Revenue" 
                    value={`LKR ${totalRevenue.toLocaleString()}`} 
                    change={`${completedPayments}/${totalPayments} paid`} 
                    changeType={completedPayments === totalPayments ? "positive" : "neutral"} 
                    icon={DollarSign} 
                  />
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
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">Recent Classes</h3>
                  <div className="space-y-2 overflow-y-auto h-44 lg:h-48">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : classes.length > 0 ? (
                      classes.slice(0, 8).map((classItem, index) => {
                        const colors = [
                          'bg-blue-50 text-blue-600',
                          'bg-green-50 text-green-600', 
                          'bg-yellow-50 text-yellow-600',
                          'bg-purple-50 text-purple-600',
                          'bg-pink-50 text-pink-600',
                          'bg-indigo-50 text-indigo-600',
                          'bg-teal-50 text-teal-600',
                          'bg-orange-50 text-orange-600'
                        ];
                        const colorClass = colors[index % colors.length];
                        
                        return (
                          <div key={classItem.id || classItem.class_id || `class-idx-${index}`} className={`flex items-center justify-between p-2 rounded-lg ${colorClass.replace('text-', 'bg-').replace('-600', '-50')}`}>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 text-sm truncate">{classItem.title}</p>
                              <p className="text-xs text-gray-600 truncate">
                                {classItem.instructor_name || "Auto Assigned"}
                              </p>
                            </div>
                            <div className="text-right ml-2 flex-shrink-0">
                              <p className={`text-sm font-medium ${colorClass.split(' ')[1]}`}>
                                LKR {classItem.fee ? parseInt(classItem.fee).toLocaleString() : '0'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {classItem.status || 'active'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <BookOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No classes available</p>
                        </div>
                      </div>
                    )}
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
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {/* Recent Student Registrations */}
                      {students.slice(0, 2).map((student, index) => (
                        <div key={`student-${student.id || student.user_id || `idx-${index}`}`} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {student.full_name || student.username} registered as student
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(student.date_joined).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Recent Webinars */}
                      {webinars.slice(0, 2).map((webinar, index) => (
                        <div key={`webinar-${webinar.id || webinar.webinar_id || `idx-${index}`}`} className="flex items-center justify-between py-2 lg:py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50">
                              <Video className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Webinar "{webinar.title}" {webinar.status}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(webinar.start_time).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Recent Classes */}
                      {classes.slice(0, 1).map((classItem, index) => (
                        <div key={`class-${classItem.id || classItem.class_id || `idx-${index}`}`} className={`flex items-center justify-between py-2 lg:py-3 ${index < (students.length + webinars.length) ? 'border-b border-gray-100' : ''}`}>
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Class "{classItem.title}" created
                              </p>
                              <p className="text-xs text-gray-500">
                                Instructor: {classItem.instructor_name || "Auto Assigned"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Fallback message if no data */}
                      {students.length === 0 && webinars.length === 0 && classes.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-500">
                          <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No recent activity</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
