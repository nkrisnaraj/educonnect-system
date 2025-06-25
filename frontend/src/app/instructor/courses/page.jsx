"use client"

import { useState } from "react"
import { Plus, BookOpen, Users, Clock, Eye, Edit, X, Upload } from "lucide-react"

export default function CoursesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("all")

  const courses = [
    {
      id: 1,
      name: "Advanced Physics - 2025 A/L",
      subject: "Physics",
      batch: "2025 A/L",
      students: 45,
      lessons: 24,
      progress: 75,
      status: "active",
      startDate: "2024-01-15",
      fees: 2000,
      description: "Comprehensive A/L Physics course covering mechanics, waves, electricity and modern physics",
      type: "Theory + Paper",
    },
    {
      id: 2,
      name: "Organic Chemistry - 2026 A/L",
      subject: "Chemistry",
      batch: "2026 A/L",
      students: 38,
      lessons: 20,
      progress: 60,
      status: "active",
      startDate: "2024-02-01",
      fees: 2000,
      description: "In-depth study of organic compounds, reactions and mechanisms for A/L Chemistry",
      type: "Theory + Paper",
    },
    {
      id: 3,
      name: "Cell Biology & Genetics - 2025 A/L",
      subject: "Biology",
      batch: "2025 A/L",
      students: 52,
      lessons: 28,
      progress: 85,
      status: "active",
      startDate: "2024-01-10",
      fees: 2000,
      description: "Advanced biological concepts including cell structure, genetics and molecular biology",
      type: "Theory + Paper",
    },
    {
      id: 4,
      name: "Pure Mathematics - 2025 A/L",
      subject: "Mathematics",
      batch: "2025 A/L",
      students: 41,
      lessons: 32,
      progress: 45,
      status: "active",
      startDate: "2024-01-20",
      fees: 1000,
      description: "Advanced mathematics covering calculus, algebra, trigonometry and statistics",
      type: "Theory",
    },
    {
      id: 5,
      name: "Applied Mathematics - 2026 A/L",
      subject: "Applied Mathematics",
      batch: "2026 A/L",
      students: 35,
      lessons: 30,
      progress: 30,
      status: "draft",
      startDate: "2024-03-01",
      fees: 1000,
      description: "Practical applications of mathematics in real-world scenarios",
      type: "Theory",
    },
  ]

  const subjects = ["Physics", "Chemistry", "Biology", "Mathematics", "Applied Mathematics"]
  const batches = ["2025 A/L", "2026 A/L"]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredCourses = courses.filter((course) => {
    if (selectedTab === "all") return true
    if (selectedTab === "active") return course.status === "active"
    if (selectedTab === "draft") return course.status === "draft"
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Courses</h1>
          <p className="text-gray-600">Manage your A/L courses and track student progress</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Create New Course
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total A/L Courses</p>
              <p className="text-xl font-bold">{courses.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-xl font-bold">{courses.reduce((sum, course) => sum + course.students, 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Courses</p>
              <p className="text-xl font-bold">{courses.filter((c) => c.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Progress</p>
              <p className="text-xl font-bold">
                {Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">A/L Course Management</h3>
              <p className="text-gray-600">Create, edit and manage your A/L courses</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search courses..."
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setSelectedTab("all")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedTab === "all" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Courses
            </button>
            <button
              onClick={() => setSelectedTab("active")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedTab === "active" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setSelectedTab("draft")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedTab === "draft" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Draft
            </button>
          </div>

          {/* Course Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white/50 border border-purple-100 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{course.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {course.code} • {course.subject}
                    </p>
                    <p className="text-sm text-gray-500">{course.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Students</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.students}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Lessons</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.lessons}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Progress</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{course.progress}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Course Fees:</span>
                    <span className="text-lg font-bold text-green-600">Rs. {course.fees.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">{course.batch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Course Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New A/L Course</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Set up a new A/L course for your students</p>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="Enter course name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Choose subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="">Choose batch</option>
                    {batches.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Course description and objectives"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Fees (Rs.)</label>
                  <input
                    type="number"
                    placeholder="15000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
