"use client"

import { useState } from "react"
import { Search, Plus, Filter, Calendar, Clock, Users, MapPin, BookOpen, Edit, Trash2, Eye } from "lucide-react"

const classesData = [
  {
    id: 1,
    name: "SIVATH 2025 Unit-4,5",
    instructor: "Sivathiran sir",
    webinarID: "81865900107",
    schedule: "Mon, Wed, Fri",
    time: "9:00 AM - 10:30 AM",
    duration: "90 min",
    capacity: null, // unlimited
    enrolled: 28,
    status: "active",
    description: "Advanced calculus and mathematical analysis",
  },
  {
    id: 2,
    name: "Physics Laboratory",
    instructor: "Prof. Michael Chen",
    room: "Lab B-102",
    schedule: "Tue, Thu",
    time: "11:30 AM - 1:00 PM",
    duration: "90 min",
    capacity: null,
    enrolled: 18,
    status: "active",
    description: "Hands-on physics experiments and lab work",
  },
  {
    id: 3,
    name: "Chemistry 201",
    instructor: "Dr. Emily Rodriguez",
    room: "Room C-301",
    schedule: "Mon, Wed",
    time: "2:00 PM - 3:30 PM",
    duration: "90 min",
    capacity: null,
    enrolled: 22,
    status: "active",
    description: "Organic chemistry fundamentals",
  },
  {
    id: 4,
    name: "English Literature",
    instructor: "Prof. James Thompson",
    room: "Room D-105",
    schedule: "Tue, Thu",
    time: "3:30 PM - 5:00 PM",
    duration: "90 min",
    capacity: null,
    enrolled: 32,
    status: "active",
    description: "Modern and contemporary literature analysis",
  },
  {
    id: 5,
    name: "Computer Science Fundamentals",
    instructor: "Dr. Alex Kumar",
    room: "Lab C-204",
    schedule: "Mon, Wed, Fri",
    time: "10:00 AM - 11:30 AM",
    duration: "90 min",
    capacity: null,
    enrolled: 25,
    status: "active",
    description: "Introduction to programming and algorithms",
  },
  {
    id: 6,
    name: "Art History",
    instructor: "Prof. Maria Garcia",
    room: "Room E-201",
    schedule: "Tue, Thu",
    time: "1:00 PM - 2:30 PM",
    duration: "90 min",
    capacity: null,
    enrolled: 15,
    status: "active",
    description: "Survey of Western art from Renaissance to Modern",
  },
]

function getStatusColor(status) {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50"
    case "cancelled":
      return "text-red-600 bg-red-50"
    case "pending":
      return "text-yellow-600 bg-yellow-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function getEnrollmentColor(enrolled) {
  return "text-green-600"
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedClass, setSelectedClass] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredClasses = classesData.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.room && classItem.room.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = selectedStatus === "all" || classItem.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const totalEnrollment = classesData.reduce((sum, c) => sum + c.enrolled, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes Management</h1>
          <p className="text-gray-600">Manage class schedules and enrollment</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classesData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">{totalEnrollment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {classesData.filter((c) => c.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Enrollment</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(totalEnrollment / classesData.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes by name, instructor, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{classItem.name}</h3>
                <p className="text-gray-600 text-sm">{classItem.instructor}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(classItem.status)}`}>
                {classItem.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {classItem.room && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{classItem.room}</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{classItem.schedule}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{classItem.time}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span className={getEnrollmentColor(classItem.enrolled)}>{classItem.enrolled} students</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {/* Removed credits display */}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedClass(classItem)}
                  className="p-1 text-gray-400 hover:text-primary"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-blue-600" title="Edit">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Class Details</h2>
                <button onClick={() => setSelectedClass(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedClass.name}</h3>
                      <p className="text-gray-600">{selectedClass.instructor}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedClass.status)}`}
                    >
                      {selectedClass.status}
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedClass.description}</p>
                </div>

                {/* Schedule Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Schedule Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedClass.schedule}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedClass.time}</span>
                    </div>
                    {selectedClass.room && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedClass.room}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedClass.duration} duration</span>
                    </div>
                  </div>
                </div>

                {/* Enrollment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Enrollment Information</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Capacity</p>
                      <p className="font-semibold text-gray-900">Unlimited</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enrolled</p>
                      <p className="font-semibold text-gray-900">{selectedClass.enrolled}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Available</p>
                      <p className="font-semibold text-gray-900">Unlimited</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit Class</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
