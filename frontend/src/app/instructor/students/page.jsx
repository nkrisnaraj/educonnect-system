"use client"

import { useState } from "react"
import { Plus, Users, Search, Eye, Edit, Trash2, X, Mail, Phone, Download } from "lucide-react"

export default function StudentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const students = [
    {
      id: 1,
      name: "Kasun Perera",
      email: "kasun.perera@email.com",
      phone: "+94 77 123 4567",
      school: "Royal College",
      subjects: ["Physics", "Chemistry", "Biology"],
      batch: "2025 A/L",
      joinDate: "2024-01-15",
      attendance: 95,
      avgScore: 87,
      status: "active",
      address: "Colombo 07",
      parentContact: "+94 77 765 4321",
      parentName: "Mr. Sunil Perera",
    },
    {
      id: 2,
      name: "Nimali Silva",
      email: "nimali.silva@email.com",
      phone: "+94 76 234 5678",
      school: "Visakha Vidyalaya",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      batch: "2025 A/L",
      joinDate: "2024-01-20",
      attendance: 88,
      avgScore: 92,
      status: "active",
      address: "Nugegoda",
      parentContact: "+94 77 876 5432",
      parentName: "Mrs. Kamala Silva",
    },
    {
      id: 3,
      name: "Tharindu Fernando",
      email: "tharindu.fernando@email.com",
      phone: "+94 75 345 6789",
      school: "S. Thomas' College",
      subjects: ["Biology", "Chemistry", "Physics"],
      batch: "2026 A/L",
      joinDate: "2024-02-01",
      attendance: 92,
      avgScore: 85,
      status: "active",
      address: "Mount Lavinia",
      parentContact: "+94 77 987 6543",
      parentName: "Dr. Pradeep Fernando",
    },
    {
      id: 4,
      name: "Sachini Jayawardena",
      email: "sachini.j@email.com",
      phone: "+94 74 456 7890",
      school: "Ladies' College",
      subjects: ["Physics", "Mathematics"],
      batch: "2025 A/L",
      joinDate: "2024-01-25",
      attendance: 85,
      avgScore: 78,
      status: "active",
      address: "Bambalapitiya",
      parentContact: "+94 77 098 7654",
      parentName: "Mr. Rohan Jayawardena",
    },
    {
      id: 5,
      name: "Ravindu Wickramasinghe",
      email: "ravindu.w@email.com",
      phone: "+94 73 567 8901",
      school: "Trinity College",
      subjects: ["Chemistry", "Biology"],
      batch: "2026 A/L",
      joinDate: "2024-02-10",
      attendance: 98,
      avgScore: 94,
      status: "active",
      address: "Kandy",
      parentContact: "+94 77 109 8765",
      parentName: "Prof. Nimal Wickramasinghe",
    },
    {
      id: 6,
      name: "Ishara Mendis",
      email: "ishara.mendis@email.com",
      phone: "+94 72 678 9012",
      school: "Ananda College",
      subjects: ["Mathematics", "Physics"],
      batch: "2025 A/L",
      joinDate: "2024-01-30",
      attendance: 75,
      avgScore: 82,
      status: "inactive",
      address: "Maharagama",
      parentContact: "+94 77 210 9876",
      parentName: "Mrs. Sandya Mendis",
    },
  ]

  const subjects = ["Physics", "Chemistry", "Biology", "Mathematics"]
  const batches = ["2025 A/L", "2026 A/L"]
  const schools = [
    "Royal College",
    "Visakha Vidyalaya",
    "S. Thomas' College",
    "Ladies' College",
    "Trinity College",
    "Ananda College",
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredStudents = students.filter((student) => {
    const batchMatch = selectedBatch === "all" || student.batch === selectedBatch
    const subjectMatch = selectedSubject === "all" || student.subjects.includes(selectedSubject)
    const searchMatch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.toLowerCase())
    return batchMatch && subjectMatch && searchMatch
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total A/L Students</p>
              <p className="text-xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-xl font-bold">{students.filter((s) => s.status === "active").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">2025 A/L Batch</p>
              <p className="text-xl font-bold">{students.filter((s) => s.batch === "2025 A/L").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-xl font-bold">
                {Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Batches</option>
            {batches.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-lg font-semibold">A/L Student Directory</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Subjects</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-white/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {student.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.school}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {student.subjects.map((subject, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{student.batch}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Score: </span>
                          <span className="font-medium">{student.avgScore}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Attendance: </span>
                          <span className="font-medium">{student.attendance}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                          <Eye className="h-4 w-4" />
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
