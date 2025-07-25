"use client"

import { useState } from "react"
import { Download, Award, Eye, Edit, } from "lucide-react"

export default function ResultsPage() {
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedBatch, setSelectedBatch] = useState("all")

  const results = [
    {
      id: 1,
      examTitle: "Physics Final Exam - 2025 A/L",
      subject: "Physics",
      batch: "2025 A/L",
      date: "2024-06-15",
      totalStudents: 45,
      submitted: 43,
      avgScore: 87.5,
      highestScore: 98,
      lowestScore: 65,
      status: "published",
      passRate: 95.3,
    },
    {
      id: 2,
      examTitle: "Chemistry Practical Test - 2026 A/L",
      subject: "Chemistry",
      batch: "2026 A/L",
      date: "2024-06-12",
      totalStudents: 38,
      submitted: 36,
      avgScore: 82.3,
      highestScore: 95,
      lowestScore: 58,
      status: "published",
      passRate: 89.5,
    },
    {
      id: 3,
      examTitle: "Biology Theory Paper - 2025 A/L",
      subject: "Biology",
      batch: "2025 A/L",
      date: "2024-06-10",
      totalStudents: 52,
      submitted: 50,
      avgScore: 0,
      highestScore: 0,
      lowestScore: 0,
      status: "pending",
      passRate: 0,
    },
    {
      id: 4,
      examTitle: "Mathematics Unit Test - 2026 A/L",
      subject: "Mathematics",
      batch: "2026 A/L",
      date: "2024-06-08",
      totalStudents: 48,
      submitted: 48,
      avgScore: 91.2,
      highestScore: 100,
      lowestScore: 72,
      status: "published",
      passRate: 97.9,
    },
  ]

  const batches = [
    { id: "all", name: "All Batches" },
    { id: "2025", name: "2025 A/L" },
    { id: "2026", name: "2026 A/L" },
  ]

  const subjects = [
    { id: "all", name: "All Subjects" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
    { id: "mathematics", name: "Mathematics" },
  ]

  const topPerformers = [
    { name: "Kasun Perera", subject: "Physics", score: 98, exam: "Final Exam", batch: "2025 A/L" },
    { name: "Nimali Silva", subject: "Chemistry", score: 95, exam: "Practical Test", batch: "2026 A/L" },
    { name: "Tharindu Fernando", subject: "Mathematics", score: 100, exam: "Unit Test", batch: "2026 A/L" },
    { name: "Sachini Jayawardena", subject: "Physics", score: 94, exam: "Final Exam", batch: "2025 A/L" },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredResults = results.filter((result) => {
    const subjectMatch = selectedCourse === "all" || result.subject.toLowerCase().includes(selectedCourse)
    const batchMatch = selectedBatch === "all" || result.batch.includes(selectedBatch)
    return subjectMatch && batchMatch
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Results Management</h1>
          <p className="text-gray-600">View and manage A/L exam results and student performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700">
          <Download className="h-4 w-4" />
          Export All Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Results Table */}
        <div className="lg:col-span-3 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">A/L Exam Results</h3>
                <p className="text-gray-600">View and manage all A/L exam results</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
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
                <input
                  type="text"
                  placeholder="Search..."
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Exam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Pass Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{result.examTitle}</td>
                      <td className="py-3 px-4">{result.subject}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{result.batch}</span>
                      </td>
                      <td className="py-3 px-4">{new Date(result.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>
                            {result.submitted}/{result.totalStudents}
                          </span>
                          <span className="text-xs text-gray-500">submitted</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {result.status === "pending" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className="font-medium">{result.avgScore}%</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {result.status === "pending" ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${result.passRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{result.passRate}%</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                            <Eye className="h-4 w-4" />
                          </button>
                          {result.status === "pending" && (
                            <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                            <Download className="h-4 w-4" />
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

        {/* Top Performers */}
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              Top A/L Performers
            </h3>
            <p className="text-gray-600">Recent high achievers</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-purple-100"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{performer.name}</p>
                    <p className="text-xs text-gray-500">
                      {performer.subject} - {performer.batch}
                    </p>
                    <p className="text-xs text-gray-500">{performer.exam}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{performer.score}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
