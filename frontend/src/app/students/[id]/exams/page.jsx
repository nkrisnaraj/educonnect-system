"use client"

import { useState, useEffect } from "react"
import { 
  Clock, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle,
  Trophy,
  BookOpen,
  AlertCircle,
  Play,
  Eye
} from "lucide-react"
import { useStudentExamApi } from "@/hooks/useStudentExamApi"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function StudentExamsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [exams, setExams] = useState([])
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const { getAvailableExams, loading, error } = useStudentExamApi()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await getAvailableExams()
      console.log('Student Exams:', response)
      if (response && response.exams) {
        setExams(response.exams)
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error)
    }
  }

  const getFilteredExams = () => {
    let filtered = exams.filter((exam) => {
      const today = new Date()
      const examDate = new Date(exam.date)
      
      if (selectedTab === "upcoming") {
        return !exam.attempted && examDate >= today
      }
      if (selectedTab === "completed") {
        return exam.attempted
      }
      if (selectedTab === "all") {
        return true
      }
      return true
    })

    if (searchQuery) {
      filtered = filtered.filter((exam) =>
        exam.examname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getStatusBadge = (exam) => {
    if (exam.attempted) {
      const score = exam.score || 0
      if (score >= 80) {
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Excellent</span>
      } else if (score >= 60) {
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Good</span>
      } else if (score >= 40) {
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">Average</span>
      } else {
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">Needs Improvement</span>
      }
    }
    
    const today = new Date()
    const examDate = new Date(exam.date)
    
    if (examDate < today) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Missed</span>
    } else {
      return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Available</span>
    }
  }

  const startExam = (examId) => {
    router.push(`/students/${id}/exams/take/${examId}`)
  }

  const viewResults = (examId) => {
    router.push(`/students/${id}/exams/results/${examId}`)
  }

  const filteredExams = getFilteredExams()
  const upcomingCount = exams.filter(exam => !exam.attempted).length
  const completedCount = exams.filter(exam => exam.attempted).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Exams</h1>
          <p className="text-gray-600">Track your exam schedule and results</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
                <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {completedCount > 0 
                    ? Math.round(exams.filter(e => e.attempted).reduce((sum, e) => sum + (e.score || 0), 0) / completedCount)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex space-x-1">
              <button
                onClick={() => setSelectedTab("upcoming")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === "upcoming"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
              <button
                onClick={() => setSelectedTab("completed")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === "completed"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed ({completedCount})
              </button>
              <button
                onClick={() => setSelectedTab("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All ({exams.length})
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-80"
              />
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500">
              {selectedTab === "upcoming" && "You don't have any upcoming exams."}
              {selectedTab === "completed" && "You haven't completed any exams yet."}
              {selectedTab === "all" && "No exams available at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{exam.examname}</h3>
                      <p className="text-sm text-gray-600 mb-2">{exam.class_name}</p>
                      {exam.description && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{exam.description}</p>
                      )}
                    </div>
                    {getStatusBadge(exam)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(exam.date).toLocaleDateString()} at {exam.start_time}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {exam.duration_minutes} minutes
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {exam.questions_count} questions • {exam.total_marks} marks
                    </div>
                  </div>

                  {exam.attempted && exam.score !== null && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Your Score:</span>
                        <span className="text-lg font-bold text-blue-600">{exam.score.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {exam.attempted ? (
                      <button
                        onClick={() => viewResults(exam.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Results
                      </button>
                    ) : (
                      <button
                        onClick={() => startExam(exam.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Start Exam
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}