"use client"

import { useState, useEffect } from "react"
import { Download, Award, Eye, RefreshCw, AlertCircle, BarChart3, Users, Clock, Loader2, ChevronDown, FileText, FileImage } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"
import ExamDetailsModal from "@/components/ExamDetailsModal"

export default function ResultsPage() {
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingStates, setLoadingStates] = useState({})
  const [exportingAll, setExportingAll] = useState(false)
  
  const { getExamResults, downloadExamResultsCSV, downloadAllResultsCSV, loading, error } = useInstructorApi()

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async (retryCount = 0) => {
    console.log('🔍 Starting fetchResults...')
    try {
      console.log('📡 Calling getExamResults API...')
      const response = await getExamResults()
      console.log('📊 Exam Results Response:', response)
      
      if (response && response.results) {
        console.log('✅ Found results:', response.results.length, 'exams')
        setResults(response.results)
        
        // Extract top performers from submissions (class-based highest achievers)
        const classPerformers = {}
        response.results.forEach(result => {
          console.log('🎯 Processing exam:', result.examTitle, 'with', result.submissions?.length || 0, 'submissions')
          if (result.submissions && Array.isArray(result.submissions)) {
            result.submissions.forEach(submission => {
              if (submission.is_completed && submission.percentage > 0) {
                const classKey = result.subject
                if (!classPerformers[classKey] || submission.percentage > classPerformers[classKey].score) {
                  classPerformers[classKey] = {
                    name: submission.student_name || 'Unknown Student',
                    subject: result.subject,
                    score: Math.round(submission.percentage),
                    exam: result.examTitle,
                    class: classKey
                  }
                }
              }
            })
          }
        })
        
        // Convert to array and take top 4 classes
        const topPerformers = Object.values(classPerformers)
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
        
        console.log('🏆 Top performers found:', topPerformers.length)
        setTopPerformers(topPerformers)
      } else {
        console.log('⚠️ No results in response, setting empty arrays')
        setResults([])
        setTopPerformers([])
      }
    } catch (error) {
      console.error('❌ Failed to fetch results:', error)
      
      // Retry logic for network issues
      if (retryCount < 3 && (!error.response || error.response.status >= 500)) {
        console.log(`🔄 Retrying results fetch (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchResults(retryCount + 1)
        }, 2000 * (retryCount + 1))
        return
      }
      
      // Don't throw error, just show empty state
      console.log('💥 Setting empty results due to error')
      setResults([])
      setTopPerformers([])
    }
  }

  const handleViewExam = (exam) => {
    setSelectedExam(exam)
    setIsModalOpen(true)
  }

  const handleDownloadExam = async (examId, examTitle, format = 'csv') => {
    const loadingKey = `${examId}_${format}`
    setLoadingStates(prev => ({ ...prev, [loadingKey]: 'downloading' }))
    try {
      let blob
      if (format === 'pdf') {
        // Direct fetch for PDF download
        const response = await fetch(`http://127.0.0.1:8000/instructor/exams/${examId}/download-pdf/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to download PDF')
        }
        
        blob = await response.blob()
      } else {
        blob = await downloadExamResultsCSV(examId)
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error downloading exam results as ${format}:`, error)
      alert(`Failed to download exam results as ${format.toUpperCase()}. Please try again.`)
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: null }))
    }
  }

  const handleExportAllResults = async (format = 'csv') => {
    const exportingKey = `all_${format}`
    setExportingAll(exportingKey)
    try {
      let blob
      if (format === 'pdf') {
        // Direct fetch for PDF download
        const response = await fetch(`http://127.0.0.1:8000/instructor/download-all-results-pdf/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to download all results PDF')
        }
        
        blob = await response.blob()
      } else {
        blob = await downloadAllResultsCSV()
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `all_exam_results.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`Error exporting all results as ${format}:`, error)
      alert(`Failed to export all results as ${format.toUpperCase()}. Please try again.`)
    } finally {
      setExportingAll(false)
    }
  }

  // Generate dynamic filter options from data
  const subjects = [
    { id: "all", name: "All Subjects" },
    ...Array.from(new Set(results.map(r => r.subject)))
      .filter(subject => subject && subject !== 'General')
      .map(subject => ({ id: subject.toLowerCase(), name: subject }))
  ]

  const filteredResults = results.filter((result) => {
    const subjectMatch = selectedCourse === "all" || 
      result.subject.toLowerCase().includes(selectedCourse) ||
      selectedCourse === result.subject.toLowerCase()
      
    const searchMatch = !searchQuery || 
      result.examTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.subject.toLowerCase().includes(searchQuery.toLowerCase())
      
    return subjectMatch && searchMatch
  })

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exam Results Management</h1>
            <p className="text-gray-600">Loading exam results and student performance data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <BarChart3 className="h-6 w-6 text-blue-600 animate-pulse" />
                  <p className="text-blue-700 font-medium">Loading exam results...</p>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-300 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
            <div className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Results Management</h1>
          <p className="text-gray-600">View and manage A/L exam results and student performance</p>
        </div>
        <div className="relative group">
          <button 
            onClick={() => handleExportAllResults('csv')}
            disabled={exportingAll}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exportingAll === 'all_csv' ? 'Exporting CSV...' : exportingAll === 'all_pdf' ? 'Exporting PDF...' : 'Export All Results'}
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <button
              onClick={() => handleExportAllResults('csv')}
              disabled={exportingAll}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Export as CSV</p>
                <p className="text-xs text-gray-500">Excel-compatible spreadsheet</p>
              </div>
            </button>
            <button
              onClick={() => handleExportAllResults('pdf')}
              disabled={exportingAll}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileImage className="h-4 w-4 text-red-600" />
              <div>
                <p className="font-medium text-gray-900">Export as PDF</p>
                <p className="text-xs text-gray-500">Formatted report document</p>
              </div>
            </button>
          </div>
        </div>
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
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Score</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => (
                    <tr key={result.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 font-medium">{result.examTitle}</td>
                      <td className="py-3 px-4">{result.subject}</td>
                      <td className="py-3 px-4">{new Date(result.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>
                            {result.analytics?.total_submissions || 0}
                          </span>
                          <span className="text-xs text-gray-500">submitted</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium">{Math.round(result.analytics?.average_score || 0)}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewExam(result)}
                            disabled={loadingStates[result.examId] === 'viewing'}
                            className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="View exam details and students"
                          >
                            {loadingStates[result.examId] === 'viewing' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          
                          {/* Download Dropdown */}
                          <div className="relative group">
                            <button 
                              className="p-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Download exam results"
                            >
                              {loadingStates[`${result.examId}_csv`] === 'downloading' || loadingStates[`${result.examId}_pdf`] === 'downloading' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <button
                                onClick={() => handleDownloadExam(result.examId, result.examTitle, 'csv')}
                                disabled={loadingStates[`${result.examId}_csv`] === 'downloading'}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FileText className="h-3 w-3 text-green-600" />
                                <span className="text-sm">CSV</span>
                              </button>
                              <button
                                onClick={() => handleDownloadExam(result.examId, result.examTitle, 'pdf')}
                                disabled={loadingStates[`${result.examId}_pdf`] === 'downloading'}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FileImage className="h-3 w-3 text-red-600" />
                                <span className="text-sm">PDF</span>
                              </button>
                            </div>
                          </div>
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
              Top A/L Performers by Class
            </h3>
            <p className="text-gray-600">Highest achievers in each subject</p>
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
                      {performer.subject}
                    </p>
                    <p className="text-xs text-gray-500">{performer.exam}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">{performer.score}%</p>
                    <p className="text-xs text-gray-500">Top in class</p>
                  </div>
                </div>
              ))}
              
              {topPerformers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No top performers data available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details Modal */}
      <ExamDetailsModal 
        examId={selectedExam?.examId}
        examTitle={selectedExam?.examTitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
