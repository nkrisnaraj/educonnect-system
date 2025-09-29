"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, Calendar, Users, FileText, CheckCircle, Circle, Star, Upload, Edit, Play, Pause, Share, Settings, Eye } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"

export default function ExamViewPage() {
  const params = useParams()
  const router = useRouter()
  const { getExam, getExamQuestions, publishExam, getExamSubmissions, loading, error } = useInstructorApi()
  
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [activeTab, setActiveTab] = useState("preview")
  const [publishLoading, setPublishLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchExamDetails()
    }
  }, [params.id])

  const fetchExamDetails = async () => {
    try {
      const [examData, questionsData, submissionsData] = await Promise.all([
        getExam(params.id),
        getExamQuestions(params.id),
        getExamSubmissions(params.id)
      ])
      
      if (examData) setExam(examData)
      if (questionsData) setQuestions(questionsData.questions || [])
      if (submissionsData) setSubmissions(submissionsData.submissions || [])
    } catch (error) {
      console.error('Failed to fetch exam details:', error)
    }
  }

  const handlePublish = async () => {
    try {
      setPublishLoading(true)
      const result = await publishExam(params.id)
      if (result) {
        setExam({ ...exam, status: 'published', is_published: true })
        alert('Exam published successfully!')
      }
    } catch (error) {
      console.error('Failed to publish exam:', error)
      alert('Failed to publish exam')
    } finally {
      setPublishLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800"
      case "published": return "bg-blue-100 text-blue-800"
      case "scheduled": return "bg-green-100 text-green-800"
      case "active": return "bg-orange-100 text-orange-800"
      case "completed": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const renderQuestionPreview = (question) => {
    const QuestionIcon = getQuestionIcon(question.question_type)
    
    return (
      <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <QuestionIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-gray-900">
                Question {question.order}
                {question.is_required && <span className="text-red-500">*</span>}
              </h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </span>
            </div>
            
            <p className="text-gray-800 mb-4">{question.question_text}</p>
            
            {question.description && (
              <p className="text-sm text-gray-600 mb-4">{question.description}</p>
            )}

            {/* Render options based on question type */}
            {renderQuestionOptions(question)}
          </div>
        </div>
      </div>
    )
  }

  const renderQuestionOptions = (question) => {
    switch (question.question_type) {
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={option.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{option.option_text}</span>
                {option.is_correct && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              </label>
            ))}
          </div>
        )
      
      case 'multiple_select':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={option.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <div className="w-4 h-4 border border-gray-300 rounded"></div>
                <span className="text-gray-700">{option.option_text}</span>
                {option.is_correct && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
              </label>
            ))}
          </div>
        )
      
      case 'short_answer':
        return (
          <input
            type="text"
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            placeholder="Student's short answer will appear here"
          />
        )
      
      case 'paragraph':
        return (
          <textarea
            disabled
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
            placeholder="Student's paragraph answer will appear here"
          />
        )
      
      case 'true_false':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">True</span>
            </label>
            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">False</span>
            </label>
          </div>
        )
      
      case 'linear_scale':
        return (
          <div className="flex items-center justify-between max-w-md">
            <span className="text-sm text-gray-600">{question.scale_min_label || question.scale_min || 1}</span>
            <div className="flex gap-2">
              {Array.from({ length: (question.scale_max || 5) - (question.scale_min || 1) + 1 }).map((_, index) => (
                <button key={index} className="w-8 h-8 border border-gray-300 rounded-full hover:bg-gray-50">
                  {(question.scale_min || 1) + index}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-600">{question.scale_max_label || question.scale_max || 5}</span>
          </div>
        )
      
      case 'dropdown':
        return (
          <select disabled className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
            <option>Choose...</option>
            {question.options?.map((option) => (
              <option key={option.id} value={option.option_text}>
                {option.option_text}
              </option>
            ))}
          </select>
        )
      
      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Students can upload files here</p>
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 max-w-xs"
          />
        )
      
      case 'time':
        return (
          <input
            type="time"
            disabled
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 max-w-xs"
          />
        )
      
      default:
        return null
    }
  }

  const getQuestionIcon = (type) => {
    switch (type) {
      case 'multiple_choice': return Circle
      case 'multiple_select': return CheckCircle
      case 'short_answer': return FileText
      case 'paragraph': return FileText
      case 'true_false': return CheckCircle
      case 'linear_scale': return Star
      case 'dropdown': return FileText
      case 'file_upload': return Upload
      case 'date': return Calendar
      case 'time': return Clock
      default: return FileText
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Exam not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{exam.examname}</h1>
                <p className="text-sm text-gray-500">Exam Preview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exam.status)}`}>
                {exam.status?.charAt(0).toUpperCase() + exam.status?.slice(1)}
              </span>
              <button
                onClick={() => router.push(`/instructor/exams/${params.id}/edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              {exam.status === 'draft' && (
                <button
                  onClick={handlePublish}
                  disabled={publishLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  {publishLoading ? 'Publishing...' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['preview', 'details', 'submissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'preview' && <Eye className="h-4 w-4 inline mr-2" />}
                {tab === 'details' && <Settings className="h-4 w-4 inline mr-2" />}
                {tab === 'submissions' && <Users className="h-4 w-4 inline mr-2" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {activeTab === 'preview' && (
          <div>
            {/* Exam Header */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.examname}</h2>
                {exam.description && (
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                )}
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(exam.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {exam.duration_minutes} minutes
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    {exam.total_marks} marks
                  </div>
                </div>
              </div>
              
              {exam.require_authentication && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Students must be logged in to take this exam.
                  </p>
                </div>
              )}
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Questions ({questions.length})
              </h3>
              
              {questions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-500 mb-4">Add questions to your exam</p>
                  <button
                    onClick={() => router.push(`/instructor/exams/${params.id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Questions
                  </button>
                </div>
              ) : (
                questions.map(renderQuestionPreview)
              )}
            </div>

            {/* Confirmation Message */}
            {exam.confirmation_message && (
              <div className="bg-white rounded-lg p-6 mt-6 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Confirmation Message</h4>
                <p className="text-gray-600">{exam.confirmation_message}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Exam Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Exam ID</span>
                    <p className="font-medium">{exam.examid}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Class</span>
                    <p className="font-medium">{exam.classid?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date & Time</span>
                    <p className="font-medium">
                      {new Date(exam.date).toLocaleDateString()} at {exam.start_time}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Duration</span>
                    <p className="font-medium">{exam.duration_minutes} minutes</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Multiple Attempts</span>
                    <span className={`px-2 py-1 text-xs rounded ${exam.allow_multiple_attempts ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {exam.allow_multiple_attempts ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shuffle Questions</span>
                    <span className={`px-2 py-1 text-xs rounded ${exam.shuffle_questions ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {exam.shuffle_questions ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Show Results</span>
                    <span className={`px-2 py-1 text-xs rounded ${exam.show_results_immediately ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {exam.show_results_immediately ? 'Immediately' : 'Later'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Authentication</span>
                    <span className={`px-2 py-1 text-xs rounded ${exam.require_authentication ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {exam.require_authentication ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
              <p className="text-gray-600">View and manage student exam submissions</p>
            </div>
            
            <div className="p-6">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-500">
                    {exam.status === 'draft' 
                      ? 'Publish the exam to start receiving submissions' 
                      : 'Students haven\'t submitted yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Submitted At</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {submission.student?.user?.first_name} {submission.student?.user?.last_name}
                              </p>
                              <p className="text-sm text-gray-500">{submission.student?.stuid}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'In Progress'}
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium">
                              {submission.percentage?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              submission.is_completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.is_completed ? 'Completed' : 'In Progress'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}