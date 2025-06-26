"use client"

import { useState } from "react"
import { Download, BarChart3, Users, TrendingUp, CheckCircle, Calendar } from "lucide-react"

export default function ReportsPage() {
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const subjects = [
    { id: "all", name: "All Subjects" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "mathematics", name: "Mathematics" },
  ]

  const batches = [
    { id: "all", name: "All Batches" },
    { id: "2025", name: "2025 A/L" },
    { id: "2026", name: "2026 A/L" },
  ]

  const performanceData = [
    { student: "Kasun Perera", subject: "Physics", avgScore: 92, attendance: 95, trend: "up", batch: "2025 A/L" },
    { student: "Nimali Silva", subject: "Chemistry", avgScore: 85, attendance: 88, trend: "stable", batch: "2025 A/L" },
    { student: "Tharindu Fernando", subject: "Biology", avgScore: 89, attendance: 92, trend: "up", batch: "2026 A/L" },
    {
      student: "Sachini Jayawardena",
      subject: "Physics",
      avgScore: 78,
      attendance: 85,
      trend: "down",
      batch: "2025 A/L",
    },
    {
      student: "Ravindu Wickramasinghe",
      subject: "Mathematics",
      avgScore: 94,
      attendance: 98,
      trend: "up",
      batch: "2026 A/L",
    },
  ]

  const monthlyStats = {
    totalStudents: 156,
    avgPerformance: 87.5,
    completionRate: 92,
    examsHeld: 24,
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Reports & Analytics</h1>
          <p className="text-gray-600">Track A/L student performance and subject analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-primary">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total A/L Students</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalStudents}</p>
              <p className="text-sm text-green-600">+12% from last month</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.avgPerformance}%</p>
              <p className="text-sm text-green-600">+5.2% improvement</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.completionRate}%</p>
              <p className="text-sm text-green-600">+3% increase</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">A/L Exams Held</p>
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.examsHeld}</p>
              <p className="text-sm text-blue-600">+3 this month</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Student Performance Overview */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            A/L Student Performance Overview
          </h3>
          <p className="text-gray-600">Detailed performance metrics for all A/L students</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {performanceData.map((student, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-purple-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {student.student
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{student.student}</h4>
                    <p className="text-sm text-gray-500">
                      {student.subject} - {student.batch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Avg Score</p>
                    <p className="text-lg font-bold text-gray-900">{student.avgScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Attendance</p>
                    <p className="text-lg font-bold text-gray-900">{student.attendance}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Trend</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        student.trend === "up"
                          ? "bg-green-100 text-green-800"
                          : student.trend === "down"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {student.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
