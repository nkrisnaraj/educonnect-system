"use client"

import { useState } from "react"
import { Plus, BookOpen, Users, Clock, Eye, Edit, X, Upload } from "lucide-react"

export default function CoursesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("all")

  const courses = [
    {
      id: 1,
      name: "Chemistry - 2025 A/L",
      code: "CHE2025",
      subject: "Chemistry",
      batch: "2025 A/L",
      students: 45,
      lessons: 24,
      progress: 75,
      startDate: "2024-01-15",
      endDate: "2024-12-15"
    },
    {
      id: 2,
      name: "Chemistry - 2026 A/L",
      code: "CHE2026",
      subject: "Chemistry",
      batch: "2026 A/L",
      students: 38,
      lessons: 20,
      progress: 60,
      startDate: "2024-02-01",
      endDate: "2024-11-30"
    },
    {
      id: 3,
      name: "Chemistry - 2027 A/L",
      code: "CHE2027",
      subject: "Chemistry",
      batch: "2025 A/L",
      students: 52,
      lessons: 28,
      progress: 85,
      startDate: "2024-01-10",
      endDate: "2024-12-10"
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My A/L Courses</h1>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white/60 backdrop-blur-sm border border-primary rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">A/L Course Management</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search courses..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Course Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white/50 border border-primary rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{course.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {course.code} • {course.subject}
                    </p>
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
              </div>
            ))}
          </div>
        </div>
     </div>
     </div>
  )
}
