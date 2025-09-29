"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Eye,
  EyeOff,
  XCircle,
  AlertCircle,
  BookOpen
} from "lucide-react"
import { useStudentExamApi } from "@/hooks/useStudentExamApi"
import { useRouter, useParams } from "next/navigation"

export default function TakeExamPage() {
  const router = useRouter()
  const { id, examId } = useParams()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [submissionId, setSubmissionId] = useState(null)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [examError, setExamError] = useState(null)
  const timerRef = useRef(null)
  
  const { 
    getExamDetails, 
    startExamAttempt, 
    submitExamAnswers, 
    loading, 
    error 
  } = useStudentExamApi()

  useEffect(() => {
    if (examId) {
      fetchExamDetails()
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [examId])

  const fetchExamDetails = async (retryCount = 0) => {
    try {
      const response = await getExamDetails(examId)
      console.log('Exam Details:', response)
      
      if (response && response.id) {
        setExam(response)
        setExamError(null)
      } else {
        throw new Error('Invalid exam data received')
      }
    } catch (error) {
      console.error('Failed to fetch exam details:', error)
      
      // Retry logic for network issues
      if (retryCount < 3 && (!error.response || error.response.status >= 500)) {
        console.log(`Retrying exam details fetch (attempt ${retryCount + 1})`)
        setTimeout(() => {
          fetchExamDetails(retryCount + 1)
        }, 2000 * (retryCount + 1)) // Exponential backoff
        return
      }
      
      // Handle time-based restrictions
      if (error.response?.status === 403) {
        setExamError(error.response.data.error)
      } else if (error.response?.status === 404) {
        setExamError('Exam not found. Please check if the exam exists and try again.')
      } else {
        setExamError('Failed to load exam. Please check your connection and try again.')
      }
    }
  }

  const startExam = async () => {
    try {
      const response = await startExamAttempt(examId)
      console.log('Exam started:', response)
      setSubmissionId(response.submission_id)
      setExamStarted(true)
      setExamError(null)
      
      // Start timer
      const durationMs = exam.duration_minutes * 60 * 1000
      setTimeRemaining(durationMs)
      
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(timerRef.current)
            handleSubmitExam() // Auto-submit when time runs out
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    } catch (error) {
      console.error('Failed to start exam:', error)
      
      // Handle time-based restrictions  
      if (error.response?.status === 403) {
        setExamError(error.response.data.error)
      } else {
        setExamError('Failed to start exam. Please try again.')
      }
    }
  }

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        question_id: questionId,
        ...value
      }
    }))
  }

  const handleSubmitExam = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Convert answers to array format
      const answersArray = Object.values(answers)
      console.log('Submitting answers:', answersArray)
      
      const response = await submitExamAnswers(examId, answersArray)
      console.log('Exam submitted:', response)
      
      router.push(`/students/${id}/exams/results/${examId}`)
    } catch (error) {
      console.error('Failed to submit exam:', error)
      alert('Failed to submit exam. Please try again.')
    }
  }

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  const renderQuestion = (question, index) => {
    const answer = answers[question.id] || {}

    switch (question.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <div className="space-y-3">
            {question.options.map(option => (
              <label key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.id}
                  checked={answer.selected_option === option.id}
                  onChange={(e) => handleAnswerChange(question.id, { selected_option: parseInt(e.target.value) })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="flex-1">{option.option_text}</span>
              </label>
            ))}
          </div>
        )

      case 'multiple_select':
        return (
          <div className="space-y-3">
            {question.options.map(option => (
              <label key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.id}
                  checked={answer.selected_options?.includes(option.id) || false}
                  onChange={(e) => {
                    const selectedOptions = answer.selected_options || []
                    const newSelected = e.target.checked
                      ? [...selectedOptions, option.id]
                      : selectedOptions.filter(id => id !== option.id)
                    handleAnswerChange(question.id, { selected_options: newSelected })
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="flex-1">{option.option_text}</span>
              </label>
            ))}
          </div>
        )

      case 'dropdown':
        return (
          <select
            value={answer.selected_option || ''}
            onChange={(e) => handleAnswerChange(question.id, { selected_option: parseInt(e.target.value) || null })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an option...</option>
            {question.options.map(option => (
              <option key={option.id} value={option.id}>{option.option_text}</option>
            ))}
          </select>
        )

      case 'short_answer':
        return (
          <input
            type="text"
            value={answer.text_answer || ''}
            onChange={(e) => handleAnswerChange(question.id, { text_answer: e.target.value })}
            placeholder="Type your answer..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'paragraph':
        return (
          <textarea
            value={answer.text_answer || ''}
            onChange={(e) => handleAnswerChange(question.id, { text_answer: e.target.value })}
            placeholder="Type your answer..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'linear_scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{question.scale_min_label}</span>
              <span>{question.scale_max_label}</span>
            </div>
            <div className="flex justify-between items-center">
              {Array.from({ length: question.scale_max - question.scale_min + 1 }, (_, i) => {
                const value = question.scale_min + i
                return (
                  <label key={value} className="flex flex-col items-center space-y-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`scale_${question.id}`}
                      value={value}
                      checked={answer.numeric_answer === value}
                      onChange={(e) => handleAnswerChange(question.id, { numeric_answer: parseInt(e.target.value) })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm">{value}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            value={answer.date_answer || ''}
            onChange={(e) => handleAnswerChange(question.id, { date_answer: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'time':
        return (
          <input
            type="time"
            value={answer.time_answer || ''}
            onChange={(e) => handleAnswerChange(question.id, { time_answer: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                handleAnswerChange(question.id, { file_answer: file })
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        )

      default:
        return <p className="text-gray-500">Question type not supported yet.</p>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <FileText className="h-8 w-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-gray-600 animate-pulse" />
            <p className="text-gray-600 text-lg font-medium">Loading exam details...</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <p className="text-sm text-gray-500">Please wait while we prepare your exam</p>
          </div>
        </div>
      </div>
    )
  }

  if (examError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="relative mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
            <XCircle className="h-6 w-6 text-red-600 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Unable to Load Exam</h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <FileText className="h-4 w-4 text-gray-500" />
            <p className="text-gray-600">{examError}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setExamError(null)
                fetchExamDetails()
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <button
              onClick={() => router.push(`/students/${id}/exams`)}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="relative mb-4">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto" />
            <FileText className="h-6 w-6 text-orange-600 absolute -top-1 -right-1" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Exam Not Found</h2>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <p className="text-gray-600">The exam you're looking for doesn't exist or you don't have access to it.</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => fetchExamDetails()}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => router.push(`/students/${id}/exams`)}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 shadow-lg">
          <div className="text-center mb-6">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.examname}</h1>
            <p className="text-gray-600">{exam.class_name}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Exam Instructions:</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Duration: {exam.duration_minutes} minutes</li>
                <li>• Total Questions: {exam.questions?.length || 0}</li>
                <li>• Total Marks: {exam.total_marks}</li>
                <li>• You can navigate between questions freely</li>
                <li>• Make sure to submit before time runs out</li>
                <li>• Once submitted, you cannot change your answers</li>
              </ul>
            </div>

            {exam.description && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">{exam.description}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={startExam}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Starting...' : 'Start Exam'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = exam.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{exam.examname}</h1>
              <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {exam.questions.length}</p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Answered</div>
                <div className="text-lg font-semibold text-green-600">
                  {getAnsweredCount()} / {exam.questions.length}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Time Remaining</div>
                <div className={`text-lg font-mono font-bold ${timeRemaining < 300000 ? 'text-red-600' : 'text-blue-600'}`}>
                  <Clock className="inline h-4 w-4 mr-1" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Question Navigation */}
          <div className="border-b border-gray-200 p-6">
            <div className="grid grid-cols-10 gap-2 mb-4">
              {exam.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-8 h-8 rounded text-xs font-medium ${
                    index === currentQuestion
                      ? 'bg-blue-600 text-white'
                      : answers[exam.questions[index].id]
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Current Question */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex-1 pr-4">
                  Q{currentQuestion + 1}. {currentQ.question_text}
                  {currentQ.is_required && <span className="text-red-500 ml-1">*</span>}
                </h2>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>
              
              {currentQ.description && (
                <p className="text-gray-600 mb-4">{currentQ.description}</p>
              )}
            </div>

            {renderQuestion(currentQ, currentQuestion)}
          </div>

          {/* Navigation Buttons */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-3">
                {currentQuestion === exam.questions.length - 1 ? (
                  <button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                    Submit Exam
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.min(exam.questions.length - 1, prev + 1))}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Exam</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You have answered {getAnsweredCount()} out of {exam.questions.length} questions.
              Once submitted, you cannot make any changes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}