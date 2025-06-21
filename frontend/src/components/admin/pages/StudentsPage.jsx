"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
} from "lucide-react"

const studentsData = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, New York, NY",
    enrollmentDate: "2023-09-15",
    status: "active",
    grade: "A",
    course: "Computer Science",
    avatar: "JS",
    gpa: 3.8,
    credits: 45,
    fees: "$12,000",
    feeStatus: "paid",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 234-5678",
    address: "456 Oak Ave, Los Angeles, CA",
    enrollmentDate: "2023-08-20",
    status: "active",
    grade: "A+",
    course: "Mathematics",
    avatar: "SJ",
    gpa: 3.9,
    credits: 48,
    fees: "$11,500",
    feeStatus: "paid",
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@email.com",
    phone: "+1 (555) 345-6789",
    address: "789 Pine St, Chicago, IL",
    enrollmentDate: "2023-09-01",
    status: "active",
    grade: "B+",
    course: "Physics",
    avatar: "MD",
    gpa: 3.6,
    credits: 42,
    fees: "$12,500",
    feeStatus: "pending",
  },
  {
    id: 4,
    name: "Emily Brown",
    email: "emily.brown@email.com",
    phone: "+1 (555) 456-7890",
    address: "321 Elm St, Houston, TX",
    enrollmentDate: "2023-07-10",
    status: "inactive",
    grade: "B",
    course: "Chemistry",
    avatar: "EB",
    gpa: 3.4,
    credits: 38,
    fees: "$10,800",
    feeStatus: "overdue",
  },
  {
    id: 5,
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 567-8901",
    address: "654 Maple Dr, Phoenix, AZ",
    enrollmentDate: "2023-09-05",
    status: "active",
    grade: "A-",
    course: "Biology",
    avatar: "DW",
    gpa: 3.7,
    credits: 44,
    fees: "$11,200",
    feeStatus: "paid",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    email: "lisa.anderson@email.com",
    phone: "+1 (555) 678-9012",
    address: "987 Cedar Ln, Miami, FL",
    enrollmentDate: "2023-08-15",
    status: "active",
    grade: "A",
    course: "English Literature",
    avatar: "LA",
    gpa: 3.8,
    credits: 46,
    fees: "$10,500",
    feeStatus: "paid",
  },
]

function getStatusColor(status) {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-50"
    case "inactive":
      return "text-red-600 bg-red-50"
    case "suspended":
      return "text-yellow-600 bg-yellow-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

function getFeeStatusColor(status) {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-50"
    case "pending":
      return "text-yellow-600 bg-yellow-50"
    case "overdue":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredStudents = studentsData.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || student.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600">Manage student profiles, enrollment, and academic records</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{studentsData.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-gray-900">
                {studentsData.filter((s) => s.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average GPA</p>
              <p className="text-2xl font-bold text-gray-900">3.7</p>
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
            placeholder="Search students by name, email, or course..."
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
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Academic</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Fees</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{student.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">ID: {student.id.toString().padStart(4, "0")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{student.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.course}</p>
                      <p className="text-sm text-gray-500">Grade: {student.grade}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        GPA: <span className="font-medium">{student.gpa}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Credits: <span className="font-medium">{student.credits}</span>
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{student.fees}</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getFeeStatusColor(student.feeStatus)}`}
                      >
                        {student.feeStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Student Details</h2>
                <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-xl font-medium text-primary">{selectedStudent.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedStudent.name}</h3>
                    <p className="text-gray-600">{selectedStudent.course}</p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedStudent.status)}`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedStudent.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedStudent.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{selectedStudent.address}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">GPA</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.gpa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Credits</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.credits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.grade}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Enrollment</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedStudent.enrollmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Financial Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Fees</p>
                      <p className="font-semibold text-gray-900">{selectedStudent.fees}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Status</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getFeeStatusColor(selectedStudent.feeStatus)}`}
                      >
                        {selectedStudent.feeStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Edit Student</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
