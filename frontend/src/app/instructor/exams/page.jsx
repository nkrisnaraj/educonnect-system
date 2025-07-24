"use client"

import { useState } from "react"
import { GraduationCap, Calendar, Users, Clock, Eye, Edit, } from "lucide-react"

export default function ExamsPage() {
  const [selectedTab, setSelectedTab] = useState("upcoming")

  const exams = [
    {
      id: 1,
      title: "Physics Final Exam - 2025 A/L",
      course: "Physics",
      date: "2024-06-25",
      time: "14:00",
      duration: "3 hours",
      totalMarks: 100,
      students: 45,
      status: "upcoming",
      type: "Final Exam",
      batch: "2025 A/L",
      questionsCount: 50,
    },
    {
      id: 2,
      title: "Chemistry Practical Test",
      course: "Chemistry",
      date: "2024-06-20",
      time: "10:00",
      duration: "2 hours",
      totalMarks: 50,
      students: 38,
      status: "scheduled",
      type: "Practical",
      batch: "2026 A/L",
      questionsCount: 25,
    },
    {
      id: 3,
      title: "Biology Theory Paper",
      course: "Biology",
      date: "2024-06-15",
      time: "15:00",
      duration: "3 hours",
      totalMarks: 75,
      students: 52,
      status: "completed",
      type: "Theory",
      batch: "2025 A/L",
      questionsCount: 40,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredExams = exams.filter((exam) => {
    if (selectedTab === "upcoming") return exam.status === "upcoming" || exam.status === "scheduled"
    if (selectedTab === "completed") return exam.status === "completed"
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Exams Management</h1>
          <p className="text-gray-600">Create and manage your A/L exams and assessments</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total A/L Exams</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Participation</p>
              <p className="text-xl font-bold">92%</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Results</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">A/L Exams & Assessments</h3>
              <p className="text-gray-600">Manage your A/L exams and view student participation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search exams..."
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setSelectedTab("upcoming")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedTab === "upcoming" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedTab("completed")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium ${
                selectedTab === "completed" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedTab("all")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium ${
                selectedTab === "all" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Exams
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exam Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Questions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{exam.title}</td>
                    <td className="py-3 px-4">{exam.course}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{exam.batch}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span>{new Date(exam.date).toLocaleDateString()}</span>
                        <span className="text-sm text-gray-500">{exam.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{exam.duration}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {exam.questionsCount} MCQs
                      </span>
                    </td>
                    <td className="py-3 px-4">{exam.students}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
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
  )
}
