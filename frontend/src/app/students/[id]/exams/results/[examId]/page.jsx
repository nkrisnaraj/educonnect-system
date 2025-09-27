"use client"

import { useState, useEffect } from "react"
import { 
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ArrowLeft,
  Download,
  TrendingUp,
  Target,
  Award
} from "lucide-react"
import { useStudentExamApi } from "@/hooks/useStudentExamApi"
import { useRouter, useParams } from "next/navigation"

export default function ExamResultsPage() {
  const router = useRouter()
  const { id, examId } = useParams()
  const [results, setResults] = useState(null)
  const { getExamResults, loading, error } = useStudentExamApi()

  useEffect(() => {
    if (examId) {
      fetchResults()
    }
  }, [examId])

  const fetchResults = async () => {
    try {
      const response = await getExamResults(examId)
      console.log('Exam Results:', response)
      setResults(response)
    } catch (error) {
      console.error('Failed to fetch results:', error)
    }
  }

  const getGradeInfo = (percentage) => {
    if (percentage >= 90) {
      return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Outstanding!' }
    } else if (percentage >= 80) {
      return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100', message: 'Excellent!' }
    } else if (percentage >= 70) {
      return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100', message: 'Good work!' }
    } else if (percentage >= 60) {
      return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100', message: 'Well done!' }
    } else if (percentage >= 50) {
      return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100', message: 'Keep improving!' }
    } else {
      return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100', message: 'Needs improvement' }
    }
  }

  const getQuestionIcon = (isCorrect) => {
    return isCorrect ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Results Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load exam results at this time.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const gradeInfo = getGradeInfo(results.percentage)
  const correctAnswers = results.results.filter(r => r.is_correct).length
  const totalQuestions = results.results.length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/students/${id}/exams`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{results.exam_name}</h1>
          <p className="text-gray-600">Exam Results</p>
        </div>

        {/* Score Overview */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${gradeInfo.bgColor} rounded-full mb-4`}>
              <span className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{results.percentage.toFixed(1)}%</h2>
            <p className={`text-lg font-medium ${gradeInfo.color} mb-4`}>{gradeInfo.message}</p>
            
            <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{results.total_score}</div>
                <div>Points Earned</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{results.total_possible_marks}</div>
                <div>Total Points</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{correctAnswers}/{totalQuestions}</div>
                <div>Correct Answers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Accuracy</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Submitted</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(results.submitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Grade</h3>
                <p className="text-2xl font-bold text-gray-900">{gradeInfo.grade}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Question-by-Question Results</h3>
            <p className="text-sm text-gray-600 mt-1">Review your answers and see the correct responses</p>
          </div>

          <div className="divide-y divide-gray-200">
            {results.results.map((result, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getQuestionIcon(result.is_correct)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-medium text-gray-900">
                        Q{index + 1}. {result.question_text}
                      </h4>
                      <div className="text-right text-sm">
                        <div className={`font-medium ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                          {result.marks_obtained}/{result.marks} points
                        </div>
                      </div>
                    </div>

                    {/* Show answers based on question type */}
                    {(result.selected_options || result.correct_options) && (
                      <div className="space-y-2">
                        {result.selected_options && result.selected_options.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Your answer: </span>
                            <span className={`text-sm ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                              {result.selected_options.join(', ')}
                            </span>
                          </div>
                        )}
                        {result.correct_options && result.correct_options.length > 0 && !result.is_correct && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Correct answer: </span>
                            <span className="text-sm text-green-600">
                              {result.correct_options.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {result.text_answer && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Your answer: </span>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                          {result.text_answer}
                        </div>
                      </div>
                    )}

                    {result.numeric_answer !== undefined && result.numeric_answer !== null && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Your answer: </span>
                        <span className={`text-sm ${result.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                          {result.numeric_answer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => router.push(`/students/${id}/exams`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Print Results
          </button>
        </div>
      </div>
    </div>
  )
}