"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, DollarSign, BookOpen, Download, Filter, RefreshCw } from "lucide-react"
import api from "@/services/api"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedReport, setSelectedReport] = useState("overview")
  const [dashboardData, setDashboardData] = useState(null)
  const [reportsData, setReportsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const tabs = [
    { id: "overview", label: "Overview" },
    // { id: "enrollment", label: "Enrollment" },
    { id: "financial", label: "Financial" },
    { id: "academic", label: "Academic" },
    { id: "subjects", label: "Subjects" },
  ]

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('🔍 Fetching data with direct api import')
      
      const [dashboardResponse, reportsResponse] = await Promise.all([
        api.get('/edu_admin/dashboard/'),
        api.get('/edu_admin/reports/')
      ])
      
      setDashboardData(dashboardResponse.data)
      setReportsData(reportsResponse.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Reports</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into institutional performance and metrics</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedReport === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Report */}
      {selectedReport === "overview" && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.users.students.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{dashboardData.users.student_growth}% this month</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.classes.total.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">All courses</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.classes.active}</p>
                  <p className="text-sm text-blue-600">{dashboardData.classes.utilization}% utilization</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Webinars</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.webinars.total}</p>
                  <p className="text-sm text-green-600">Online sessions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Enrollment Trend */}
          {reportsData?.monthly_trends && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment Trend (Last 6 Months)</h3>
              <div className="grid grid-cols-6 gap-4">
                {reportsData.monthly_trends.map((month, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-600 mb-1">{month.month_name.split(' ')[0]}</div>
                    <div className="text-lg font-semibold text-gray-900">{month.enrollments}</div>
                    <div className="text-xs text-gray-500">new students</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subjects Report */}
      {selectedReport === "subjects" && reportsData?.subjects && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Classes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Popularity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.subjects.map((subject, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{subject.name}</td>
                    <td className="py-3 px-4 text-gray-600">{subject.students}</td>
                    <td className="py-3 px-4 text-gray-600">{subject.classes}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        subject.students > 50 ? 'bg-green-100 text-green-800' :
                        subject.students > 20 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {subject.students > 50 ? 'High' : subject.students > 20 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {subject.students > 0 ? (subject.students / subject.classes).toFixed(1) : 0} students/class
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {selectedReport === "financial" && reportsData?.payment_methods && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-green-900">Successful Payments</h4>
                    <p className="text-sm text-green-600">{dashboardData?.payments?.verified || 0} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-900">
                      {dashboardData?.payments?.success_rate || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-yellow-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-yellow-900">Pending Payments</h4>
                    <p className="text-sm text-yellow-600">{dashboardData?.payments?.pending || 0} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-yellow-900">
                      Awaiting
                    </p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-blue-900">Total Payments</h4>
                    <p className="text-sm text-blue-600">{dashboardData?.payments?.total || 0} transactions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-blue-900">
                      All Time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportsData.payment_methods.map((method, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 capitalize">{method.method}</h4>
                      <p className="text-sm text-gray-600">{method.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {((method.count / dashboardData?.payments?.total) * 100 || 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">usage</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Academic Report */}
      {selectedReport === "academic" && reportsData?.top_classes && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Classes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Instructor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Enrollments</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Class Fee</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.top_classes.map((cls, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{cls.name}</td>
                    <td className="py-3 px-4 text-gray-600">{cls.instructor}</td>
                    <td className="py-3 px-4 text-gray-600">{cls.enrollments}</td>
                    <td className="py-3 px-4 text-gray-600">${cls.fee}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cls.enrollments > 30 ? 'bg-green-100 text-green-800' :
                        cls.enrollments > 10 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cls.enrollments > 30 ? 'Popular' : cls.enrollments > 10 ? 'Active' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enrollment Report */}
      {selectedReport === "enrollment" && reportsData?.instructors && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Instructor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Classes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Students</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.instructors.map((instructor, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{instructor.name}</td>
                    <td className="py-3 px-4 text-gray-600">{instructor.email}</td>
                    <td className="py-3 px-4 text-gray-600">{instructor.classes}</td>
                    <td className="py-3 px-4 text-gray-600">{instructor.students}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
