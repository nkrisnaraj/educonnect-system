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
  Eye,
  Timer,
  Lock,
  Unlock
} from "lucide-react"
import { useStudentExamApi } from "@/hooks/useStudentExamApi"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function StudentExamsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [exams, setExams] = useState([])
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const { loading: authLoading, accessToken } = useAuth()
  const { getAvailableExams, loading, error } = useStudentExamApi()

  useEffect(() => {
    // Only fetch exams when auth is ready
    if (!authLoading && accessToken) {
      console.log('✅ Auth ready, fetching exams...');
      fetchExams()
    } else {
      console.log('⏳ Waiting for auth:', { authLoading, hasToken: !!accessToken });
    }
  }, [authLoading, accessToken]) // Add dependencies

  const fetchExams = async (retryCount = 0) => {
    const fetchStartTime = Date.now();
    
    try {
      console.log('🚀 Fetching exams with auth state:', {
        authLoading,
        hasToken: !!accessToken,
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      // Set a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });
      
      const response = await Promise.race([
        getAvailableExams(),
        timeoutPromise
      ]);
      
      const fetchDuration = Date.now() - fetchStartTime;
      console.log(`✅ Exams fetched successfully in ${fetchDuration}ms:`, response);
      
      if (response && response.exams) {
        setExams(response.exams)
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        setExams([])
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error)
      
      // Handle authentication errors
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        console.log('Authentication issue, waiting for auth context...')
        // Don't retry authentication errors immediately
        return
      }
      
      // Retry logic for network issues only
      if (retryCount < 3 && (!error.response || error.response.status >= 500)) {
        console.log(`Retrying exams fetch (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchExams(retryCount + 1)
        }, 2000 * (retryCount + 1)) // Exponential backoff
        return
      }
      
      // Don't throw error, just log it and show empty state
      setExams([])
    }
  }

  const getFilteredExams = () => {
    let filtered = exams.filter((exam) => {
      if (selectedTab === "upcoming") {
        return exam.availability_status === "not_started" || exam.availability_status === "available"
      }
      if (selectedTab === "completed") {
        return exam.availability_status === "completed"
      }
      if (selectedTab === "expired") {
        return exam.availability_status === "expired"
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
    switch (exam.availability_status) {
      case "completed":
        const score = exam.score || 0
        if (score >= 80) {
          return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />Excellent</span>
        } else if (score >= 60) {
          return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />Good</span>
        } else if (score >= 40) {
          return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />Average</span>
        } else {
          return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><XCircle className="h-3 w-3" />Needs Improvement</span>
        }
      case "available":
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Unlock className="h-3 w-3" />Available Now</span>
      case "not_started":
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Timer className="h-3 w-3" />Scheduled</span>
      case "expired":
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Lock className="h-3 w-3" />Expired</span>
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">Unknown</span>
    }
  }

  const startExam = (exam) => {
    if (!exam.is_available) {
      alert(exam.availability_message)
      return
    }
    router.push(`/students/${id}/exams/take/${exam.id}`)
  }

  const viewResults = (examId) => {
    router.push(`/students/${id}/exams/results/${examId}`)
  }

  const filteredExams = getFilteredExams()
  const upcomingCount = exams.filter(exam => exam.availability_status === "not_started" || exam.availability_status === "available").length
  const completedCount = exams.filter(exam => exam.availability_status === "completed").length
  const expiredCount = exams.filter(exam => exam.availability_status === "expired").length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-blue-50 rounded-lg">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <BookOpen className="h-4 w-4 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                <p className="text-blue-700 font-medium">Loading your exams...</p>
              </div>
            </div>
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

  // Show loading state while auth is loading
  if (authLoading || (loading && exams.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exams...</p>
          {authLoading && <p className="text-sm text-gray-500 mt-2">Authenticating...</p>}
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-100 rounded-full p-3 mx-auto mb-4 w-fit">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Exams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchExams()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Exams</h1>
            <p className="text-gray-600">Track your exam schedule and results</p>
          </div>
          {/* <button
            onClick={() => fetchExams()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Timer className="h-4 w-4" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button> */}
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
                onClick={() => setSelectedTab("expired")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTab === "expired"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Expired ({expiredCount})
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
            <div className="relative mb-6">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto" />
              {exams.length === 0 && <AlertCircle className="h-6 w-6 text-orange-500 absolute -top-1 -right-1" />}
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                {exams.length === 0 ? "No exams available" : "No exams found"}
              </h3>
            </div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="h-4 w-4 text-gray-500" />
              <p className="text-gray-600">
                {exams.length === 0 
                  ? "You don't have any exams assigned yet."
                  : searchQuery
                  ? `No exams match "${searchQuery}" in the ${selectedTab} category.`
                  : selectedTab === "upcoming" 
                  ? "You don't have any upcoming exams."
                  : selectedTab === "completed" 
                  ? "You haven't completed any exams yet."
                  : selectedTab === "expired" 
                  ? "No expired exams found."
                  : "No exams available at the moment."
                }
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Clear Search
                </button>
              )}
              <button
                onClick={() => fetchExams()}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Timer className="h-4 w-4" />
                )}
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
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
                      {exam.end_time && ` - ${exam.end_time}`}
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

                  {/* Availability Message */}
                  {exam.availability_message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      exam.availability_status === "available" 
                        ? "bg-green-50 border border-green-200"
                        : exam.availability_status === "not_started"
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-200"
                    }`}>
                      <div className="flex items-center gap-2">
                        {exam.availability_status === "available" && <Unlock className="h-4 w-4 text-green-600" />}
                        {exam.availability_status === "not_started" && <Timer className="h-4 w-4 text-blue-600" />}
                        {exam.availability_status === "expired" && <Lock className="h-4 w-4 text-gray-600" />}
                        <span className={`text-sm font-medium ${
                          exam.availability_status === "available" 
                            ? "text-green-700"
                            : exam.availability_status === "not_started"
                            ? "text-blue-700"
                            : "text-gray-700"
                        }`}>
                          {exam.availability_message}
                        </span>
                      </div>
                    </div>
                  )}

                  {exam.attempted && exam.score !== null && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Your Score:</span>
                        <span className="text-lg font-bold text-blue-600">{exam.score.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {exam.availability_status === "completed" ? (
                      <button
                        onClick={() => viewResults(exam.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View Results
                      </button>
                    ) : exam.availability_status === "available" ? (
                      <button
                        onClick={() => startExam(exam)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                        Start Exam
                      </button>
                    ) : (
                      <button
                        onClick={() => startExam(exam)}
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                        title={exam.availability_message}
                      >
                        <Lock className="h-4 w-4" />
                        {exam.availability_status === "not_started" ? "Not Started" : "Expired"}
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