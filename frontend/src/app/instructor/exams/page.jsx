"use client"

import { useState, useEffect } from "react"
import { GraduationCap, Calendar, Users, Clock, Eye, Edit, FileText, AlertCircle, Plus } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"
import { useRouter } from "next/navigation"

export default function ExamsPage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { getExams, publishExam, loading: apiLoading, error } = useInstructorApi()

  const handleNavigation = (path) => {
    try {
      console.log('Navigating to:', path)
      router.push(path)
    } catch (error) {
      console.error('Navigation error:', error)
      // Fallback to window.location if router fails
      window.location.href = path
    }
  }

  const handlePublishExam = async (examId) => {
    if (confirm('Are you sure you want to publish this exam? Students will be able to take it once published.')) {
      try {
        const result = await publishExam(examId)
        if (result) {
          // Update exam status in local state
          setExams(prev => prev.map(exam => 
            exam.id === examId 
              ? { ...exam, status: 'published', is_published: true }
              : exam
          ))
          alert('Exam published successfully!')
        }
      } catch (error) {
        console.error('Failed to publish exam:', error)
        alert('Failed to publish exam')
      }
    }
  }

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      console.log('Fetching exams...')
      const response = await getExams()
      console.log('Exams API Response:', response)
      if (response && response.exams) {
        setExams(response.exams)
        console.log('Exams loaded successfully:', response.exams.length)
      } else {
        console.log('No exams found in response')
        setExams([])
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error)
      setExams([])
    } finally {
      setLoading(false)
    }
  }

  const getFilteredExams = () => {
    let filtered = exams.filter((exam) => {
      const today = new Date()
      const examDate = new Date(exam.date)
      
      if (selectedTab === "upcoming") {
        return exam.status === "draft" || exam.status === "published" || exam.status === "scheduled" || examDate >= today
      }
      if (selectedTab === "completed") {
        return exam.status === "completed" || examDate < today
      }
      return true
    })

    if (searchQuery) {
      filtered = filtered.filter((exam) =>
        exam.examname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.class_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.examid?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getExamStats = () => {
    const totalExams = exams.length
    const today = new Date()
    
    const upcomingExams = exams.filter(e => {
      const examDate = new Date(e.date)
      return e.status === "draft" || e.status === "published" || e.status === "scheduled" || examDate >= today
    }).length
    
    const completedExams = exams.filter(e => {
      const examDate = new Date(e.date)
      return e.status === "completed" || examDate < today
    }).length
    
    const pendingResults = exams.filter(e => e.status === "completed" && !e.results_published).length
    
    return { totalExams, upcomingExams, completedExams, pendingResults }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "published":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (date, time) => {
    if (!date) return 'Not set'
    const examDate = new Date(date)
    return examDate.toLocaleDateString()
  }

  const formatDuration = (durationMinutes) => {
    if (!durationMinutes) return 'Not set'
    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`
    }
    return `${minutes}m`
  }

  const { totalExams, upcomingExams, completedExams, pendingResults } = getExamStats()
  const filteredExams = getFilteredExams()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams Management</h1>
          <p className="text-gray-600">Create and manage your exams and assessments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => console.log('Test button clicked')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Test Click
          </button>
          <button 
            onClick={() => {
              console.log('Create Exam button clicked')
              handleNavigation('/instructor/exams/create')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Exam
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-xl font-bold">{totalExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-xl font-bold">{upcomingExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold">{completedExams}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Results</p>
              <p className="text-xl font-bold">{pendingResults}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Exams & Assessments</h3>
              <p className="text-gray-600">Manage your exams and view student participation</p>
            </div>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            {["upcoming", "completed", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          ) : filteredExams.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Exam</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{exam.examname}</p>
                          <p className="text-sm text-gray-500">ID: {exam.examid}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {exam.class_name || 'No Class'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium">{formatDateTime(exam.date)}</p>
                          <p className="text-sm text-gray-500">{exam.start_time || 'Not set'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm">{formatDuration(exam.duration_minutes)}</td>
                      <td className="py-4 px-4 text-sm">{exam.total_students_attempted || 0}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exam.status)}`}>
                          {exam.status_display || exam.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              console.log('View Exam clicked for exam:', exam.id)
                              handleNavigation(`/instructor/exams/${exam.id}`)
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="View Exam"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              console.log('Edit Exam clicked for exam:', exam.id)
                              handleNavigation(`/instructor/exams/${exam.id}/edit`)
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Edit Exam"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {exam.status === 'draft' && (
                            <button
                              onClick={() => handlePublishExam(exam.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Publish Exam"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No exams found</h3>
              <p className="text-sm text-gray-500">
                {searchQuery 
                  ? `No exams match "${searchQuery}"`
                  : selectedTab === 'upcoming' 
                    ? 'No upcoming exams scheduled'
                    : selectedTab === 'completed'
                      ? 'No completed exams available'
                      : 'No exams available'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
