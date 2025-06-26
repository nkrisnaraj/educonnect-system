"use client"

import { useState } from "react"
import { Download, Upload, FileText } from "lucide-react"

export default function UploadMarksPage() {
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedBatch, setSelectedBatch] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState("")
  const [activeTab, setActiveTab] = useState("upload")

  const subjects = [
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "mathematics", name: "Mathematics" },
  ]

  const batches = [
    { id: "2025", name: "2025 A/L" },
    { id: "2026", name: "2026 A/L" },
  ]

  const assessments = [
    { id: "1", name: "Unit Test 1", type: "Test", maxMarks: 50 },
    { id: "2", name: "Practical Exam", type: "Practical", maxMarks: 25 },
    { id: "3", name: "Final Exam", type: "Final", maxMarks: 100 },
  ]

  const students = [
    { id: "1", name: "Kasun Perera", email: "kasun@email.com", batch: "2025 A/L", marks: 85, status: "graded" },
    { id: "2", name: "Nimali Silva", email: "nimali@email.com", batch: "2025 A/L", marks: null, status: "pending" },
    { id: "3", name: "Tharindu Fernando", email: "tharindu@email.com", batch: "2026 A/L", marks: 92, status: "graded" },
    {
      id: "4",
      name: "Sachini Jayawardena",
      email: "sachini@email.com",
      batch: "2025 A/L",
      marks: 78,
      status: "graded",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload A/L Marks</h1>
          <p className="text-gray-600">Manage A/L student assessments and grades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700">
          <Download className="h-4 w-4" />
          Export Grades
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === "upload" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Upload Marks
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
            activeTab === "manage" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Manage Grades
        </button>
      </div>

      {activeTab === "upload" && (
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              Upload A/L Student Marks
            </h3>
            <p className="text-gray-600">
              Select subject, batch and assessment, then upload marks individually or via CSV file
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Batch</label>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Select Assessment</label>
                <select
                  value={selectedAssessment}
                  onChange={(e) => setSelectedAssessment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose assessment</option>
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.name} ({assessment.maxMarks} marks)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center">
              <FileText className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Marks File</h3>
              <p className="text-gray-600 mb-4">Drag and drop your file here, or click to browse</p>

              <input
                type="file"
                id="marks-file-upload"
                className="hidden"
                accept=".pdf,.xlsx,.xls,.docx,.doc,.png,.jpg,.jpeg,.csv"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    console.log("Selected file:", file.name)
                    // Handle file upload logic here
                    alert(`File selected: ${file.name}`)
                  }
                }}
              />

              <label
                htmlFor="marks-file-upload"
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 mb-2 cursor-pointer inline-block"
              >
                Choose File
              </label>

              <p className="text-xs text-gray-500">Supports PDF, Excel, Word, Images and other document formats</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "manage" && (
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Manage A/L Student Grades</h3>
                <p className="text-gray-600">View and edit individual A/L student marks</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Marks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{student.name}</td>
                      <td className="py-3 px-4">{student.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {student.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {student.marks ? (
                          <span className="font-medium">{student.marks}/100</span>
                        ) : (
                          <span className="text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            student.status === "graded" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
