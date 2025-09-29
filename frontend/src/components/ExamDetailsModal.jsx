"use client"

import { useState, useEffect } from "react"
import { X, Download, Users, Clock, CheckCircle, AlertCircle, Loader2, ChevronDown, FileText, FileImage } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"

export default function ExamDetailsModal({ examId, examTitle, isOpen, onClose }) {
  const [examDetails, setExamDetails] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloadingCSV, setDownloadingCSV] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState(false)
  const { getExamDetails, downloadExamResultsCSV, downloadExamResultsPDF } = useInstructorApi()

  useEffect(() => {
    if (isOpen && examId) {
      fetchExamDetails()
    }
  }, [isOpen, examId])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDownloadDropdownOpen && !event.target.closest('.relative')) {
        setIsDownloadDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDownloadDropdownOpen])

  const fetchExamDetails = async () => {
    setLoading(true)
    try {
      const details = await getExamDetails(examId)
      setExamDetails(details)
    } catch (error) {
      console.error('Error fetching exam details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true)
    try {
      const blob = await downloadExamResultsCSV(examId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('Failed to download CSV. Please try again.')
    } finally {
      setDownloadingCSV(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${baseUrl}/api/instructor/exam-results/pdf/${examId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${examTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_results.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleDownload = (format) => {
    setIsDownloadDropdownOpen(false)
    if (format === 'csv') {
      handleDownloadCSV()
    } else if (format === 'pdf') {
      handleDownloadPDF()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{examTitle}</h2>
            <p className="text-gray-600">Exam Details & Student Results</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDownloadDropdownOpen(!isDownloadDropdownOpen)}
                disabled={downloadingCSV || downloadingPDF || loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingCSV || downloadingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>
                  {downloadingCSV ? 'Downloading CSV...' 
                   : downloadingPDF ? 'Downloading PDF...' 
                   : 'Download'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDownloadDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDownloadDropdownOpen && !loading && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleDownload('csv')}
                    disabled={downloadingCSV || downloadingPDF}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>Download as CSV</span>
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloadingCSV || downloadingPDF}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-50 last:rounded-b-lg disabled:opacity-50"
                  >
                    <FileImage className="h-4 w-4 text-red-600" />
                    <span>Download as PDF</span>
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-gray-600">Loading exam details...</p>
              </div>
            </div>
          ) : examDetails ? (
            <div className="space-y-6">
              {/* Exam Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Participants</p>
                      <p className="text-2xl font-bold text-purple-600">{examDetails.analytics.total_participants}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{examDetails.analytics.completed_count}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(examDetails.analytics.average_score)}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Pass Rate</p>
                      <p className="text-2xl font-bold text-yellow-600">{Math.round(examDetails.analytics.pass_rate)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium">{examDetails.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">{examDetails.date} at {examDetails.start_time}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{examDetails.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Marks</p>
                    <p className="font-medium">{examDetails.total_marks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passing Marks</p>
                    <p className="font-medium">{examDetails.passing_marks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-medium">{examDetails.class_name}</p>
                  </div>
                </div>
              </div>

              {/* Students Table */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Student Results</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Student Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Percentage</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examDetails.students.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{student.student_name}</td>
                          <td className="py-3 px-4 text-gray-600">{student.student_email}</td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {student.score}/{student.total_marks}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                student.percentage >= examDetails.passing_marks 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {Math.round(student.percentage)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {student.submitted_at || 'Not submitted'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {examDetails.students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No students have participated in this exam yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load exam details. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}