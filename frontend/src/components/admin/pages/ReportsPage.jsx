"use client"

import { useState } from "react"
import { TrendingUp, Users, DollarSign, BookOpen, Download, Filter } from "lucide-react"

const reportData = {
  enrollment: {
    total: 8998,
    thisMonth: 245,
    lastMonth: 198,
    growth: 23.7,
  },
  revenue: {
    total: 2450000,
    thisMonth: 185000,
    lastMonth: 167000,
    growth: 10.8,
  },
  classes: {
    total: 520,
    active: 485,
    completed: 35,
    utilization: 93.3,
  },
  performance: {
    averageGPA: 3.7,
    passRate: 94.2,
    attendanceRate: 87.5,
    satisfactionScore: 4.3,
  },
}

const departmentData = [
  { name: "Computer Science", students: 1850, revenue: 485000, classes: 95 },
  { name: "Mathematics", students: 1420, revenue: 368000, classes: 78 },
  { name: "Physics", students: 1180, revenue: 295000, classes: 65 },
  { name: "Chemistry", students: 980, revenue: 245000, classes: 58 },
  { name: "Biology", students: 1250, revenue: 312000, classes: 72 },
  { name: "English", students: 1320, revenue: 285000, classes: 68 },
  { name: "History", students: 998, revenue: 210000, classes: 52 },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedReport, setSelectedReport] = useState("overview")

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "enrollment", label: "Enrollment" },
    { id: "financial", label: "Financial" },
    { id: "academic", label: "Academic" },
    { id: "departments", label: "Departments" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into institutional performance and metrics</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
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
      {selectedReport === "overview" && (
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
                  <p className="text-2xl font-bold text-gray-900">{reportData.enrollment.total.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{reportData.enrollment.growth}% this month</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(reportData.revenue.total / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-green-600">+{reportData.revenue.growth}% this month</p>
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
                  <p className="text-2xl font-bold text-gray-900">{reportData.classes.active}</p>
                  <p className="text-sm text-blue-600">{reportData.classes.utilization}% utilization</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average GPA</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.performance.averageGPA}</p>
                  <p className="text-sm text-green-600">{reportData.performance.passRate}% pass rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Classes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Revenue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Avg per Student</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept) => (
                    <tr key={dept.name} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium text-gray-900">{dept.name}</td>
                      <td className="py-3 px-4 text-gray-600">{dept.students}</td>
                      <td className="py-3 px-4 text-gray-600">{dept.classes}</td>
                      <td className="py-3 px-4 text-gray-600">${(dept.revenue / 1000).toFixed(0)}K</td>
                      <td className="py-3 px-4 text-gray-600">${Math.round(dept.revenue / dept.students)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Other report sections would go here */}
      {selectedReport !== "overview" && (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
          </h3>
          <p className="text-gray-600">Detailed {selectedReport} analytics and insights will be displayed here.</p>
        </div>
      )}
    </div>
  )
}
