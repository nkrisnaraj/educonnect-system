"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, Edit3, GripVertical, Eye, FileText, Circle, CheckCircle, Star, Upload, Calendar, Clock } from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"

const QUESTION_TYPES = [
  { type: 'multiple_choice', label: 'Multiple Choice', icon: Circle, description: 'Single answer selection' },
  { type: 'multiple_select', label: 'Multiple Select', icon: CheckCircle, description: 'Multiple answer selection' },
  { type: 'short_answer', label: 'Short Answer', icon: FileText, description: 'Brief text response' },
  { type: 'paragraph', label: 'Paragraph', icon: FileText, description: 'Long text response' },
  { type: 'true_false', label: 'True/False', icon: CheckCircle, description: 'True or false question' },
  { type: 'linear_scale', label: 'Linear Scale', icon: Star, description: 'Scale rating question' },
  { type: 'dropdown', label: 'Dropdown', icon: FileText, description: 'Dropdown selection' },
  { type: 'file_upload', label: 'File Upload', icon: Upload, description: 'File submission' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'time', label: 'Time', icon: Clock, description: 'Time picker' },
]

export default function ExamEditPage() {
  const params = useParams()
  const router = useRouter()
  const { 
    getExam, 
    updateExam, 
    getExamQuestions, 
    createQuestion, 
    updateQuestion, 
    deleteQuestion,
    getClasses,
    loading, 
    error 
  } = useInstructorApi()
  
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [classes, setClasses] = useState([])
  const [currentStep, setCurrentStep] = useState(1)
  const [showQuestionTypes, setShowQuestionTypes] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const fetchData = async () => {
    try {
      const [examData, questionsData, classesData] = await Promise.all([
        getExam(params.id),
        getExamQuestions(params.id),
        getClasses()
      ])
      
      if (examData) setExam(examData)
      if (questionsData) setQuestions(questionsData.questions || [])
      if (classesData) setClasses(classesData.classes || [])
    } catch (error) {
      console.error('Failed to fetch exam data:', error)
    }
  }

  const handleExamDataChange = (field, value) => {
    setExam(prev => ({ ...prev, [field]: value }))
  }

  const saveExam = async () => {
    if (!exam?.examname || !exam?.classid) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setSaveLoading(true)
      const result = await updateExam(params.id, exam)
      if (result) {
        alert('Exam updated successfully!')
      }
    } catch (error) {
      console.error('Failed to update exam:', error)
      alert('Failed to update exam')
    } finally {
      setSaveLoading(false)
    }
  }

  const addQuestion = async (questionType) => {
    const newQuestion = {
      question_text: 'New Question',
      question_type: questionType,
      is_required: true,
      marks: 1,
      order: questions.length + 1,
      options: questionType === 'multiple_choice' || questionType === 'multiple_select' || questionType === 'dropdown' 
        ? [{ option_text: 'Option 1', is_correct: false, order: 1 }]
        : []
    }

    try {
      const result = await createQuestion(params.id, newQuestion)
      if (result) {
        const updatedQuestions = await getExamQuestions(params.id)
        if (updatedQuestions) {
          setQuestions(updatedQuestions.questions || [])
        }
        setEditingQuestion(result.id)
      }
    } catch (error) {
      console.error('Failed to create question:', error)
      alert('Failed to create question')
    }
    
    setShowQuestionTypes(false)
  }

  const updateQuestionData = async (questionId, updates) => {
    try {
      const result = await updateQuestion(params.id, questionId, updates)
      if (result) {
        setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...updates } : q))
      }
    } catch (error) {
      console.error('Failed to update question:', error)
      alert('Failed to update question')
    }
  }

  const removeQuestion = async (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(params.id, questionId)
        setQuestions(prev => prev.filter(q => q.id !== questionId))
      } catch (error) {
        console.error('Failed to delete question:', error)
        alert('Failed to delete question')
      }
    }
  }

  const addOption = (questionId, questionIndex) => {
    const question = questions[questionIndex]
    const newOption = {
      option_text: `Option ${(question.options?.length || 0) + 1}`,
      is_correct: false,
      order: (question.options?.length || 0) + 1
    }
    
    const updatedOptions = [...(question.options || []), newOption]
    const updatedQuestion = { ...question, options: updatedOptions }
    
    setQuestions(prev => prev.map((q, idx) => idx === questionIndex ? updatedQuestion : q))
    updateQuestionData(questionId, { options: updatedOptions })
  }

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const question = questions[questionIndex]
    const updatedOptions = [...(question.options || [])]
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value }
    
    // For multiple choice, only one option can be correct
    if (field === 'is_correct' && value && question.question_type === 'multiple_choice') {
      updatedOptions.forEach((opt, idx) => {
        if (idx !== optionIndex) opt.is_correct = false
      })
    }
    
    const updatedQuestion = { ...question, options: updatedOptions }
    setQuestions(prev => prev.map((q, idx) => idx === questionIndex ? updatedQuestion : q))
    updateQuestionData(question.id, { options: updatedOptions })
  }

  const removeOption = (questionIndex, optionIndex) => {
    const question = questions[questionIndex]
    const updatedOptions = (question.options || []).filter((_, idx) => idx !== optionIndex)
    const updatedQuestion = { ...question, options: updatedOptions }
    
    setQuestions(prev => prev.map((q, idx) => idx === questionIndex ? updatedQuestion : q))
    updateQuestionData(question.id, { options: updatedOptions })
  }

  const renderQuestionEditor = (question, index) => {
    const isEditing = editingQuestion === question.id
    const QuestionIcon = QUESTION_TYPES.find(t => t.type === question.question_type)?.icon || FileText

    return (
      <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <QuestionIcon className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Question {question.order}</span>
                <select
                  value={question.question_type}
                  onChange={(e) => updateQuestionData(question.id, { question_type: e.target.value })}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border-none"
                >
                  {QUESTION_TYPES.map(type => (
                    <option key={type.type} value={type.type}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={question.marks}
                  onChange={(e) => updateQuestionData(question.id, { marks: parseInt(e.target.value) })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1"
                />
                <span className="text-xs text-gray-500">marks</span>
                <button
                  onClick={() => setEditingQuestion(isEditing ? null : question.id)}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={question.question_text}
                  onChange={(e) => updateQuestionData(question.id, { question_text: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg font-medium"
                  placeholder="Enter your question"
                />
                
                {question.description !== undefined && (
                  <textarea
                    value={question.description || ''}
                    onChange={(e) => updateQuestionData(question.id, { description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={2}
                    placeholder="Add description or instructions (optional)"
                  />
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={question.is_required}
                      onChange={(e) => updateQuestionData(question.id, { is_required: e.target.checked })}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Required</span>
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-medium text-gray-900 mb-2">
                  {question.question_text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {question.description && (
                  <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                )}
              </div>
            )}

            {/* Question Options */}
            {renderQuestionOptions(question, index, isEditing)}
          </div>
        </div>
      </div>
    )
  }

  const renderQuestionOptions = (question, index, isEditing) => {
    switch (question.question_type) {
      case 'multiple_choice':
      case 'multiple_select':
      case 'dropdown':
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <input
                      type="checkbox"
                      checked={option.is_correct}
                      onChange={(e) => updateOption(index, optionIndex, 'is_correct', e.target.checked)}
                      className="text-green-600"
                      title="Mark as correct answer"
                    />
                    <input
                      type="text"
                      value={option.option_text}
                      onChange={(e) => updateOption(index, optionIndex, 'option_text', e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded"
                      placeholder="Option text"
                    />
                    <button
                      onClick={() => removeOption(index, optionIndex)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {question.question_type === 'multiple_choice' ? (
                      <Circle className={`h-4 w-4 ${option.is_correct ? 'text-green-500' : 'text-gray-400'}`} />
                    ) : (
                      <div className={`w-4 h-4 border rounded ${option.is_correct ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                    )}
                    <span className="text-gray-700">{option.option_text}</span>
                    {option.is_correct && <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />}
                  </>
                )}
              </div>
            ))}
            
            {isEditing && (
              <button
                onClick={() => addOption(question.id, index)}
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Option
              </button>
            )}
          </div>
        )

      case 'linear_scale':
        return (
          <div className="space-y-3">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum</label>
                  <input
                    type="number"
                    value={question.scale_min || 1}
                    onChange={(e) => updateQuestionData(question.id, { scale_min: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="0"
                  />
                  <input
                    type="text"
                    value={question.scale_min_label || ''}
                    onChange={(e) => updateQuestionData(question.id, { scale_min_label: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    placeholder="Label (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum</label>
                  <input
                    type="number"
                    value={question.scale_max || 5}
                    onChange={(e) => updateQuestionData(question.id, { scale_max: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                    min="2"
                  />
                  <input
                    type="text"
                    value={question.scale_max_label || ''}
                    onChange={(e) => updateQuestionData(question.id, { scale_max_label: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded mt-1"
                    placeholder="Label (optional)"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between max-w-md">
                <span className="text-sm text-gray-600">{question.scale_min_label || question.scale_min || 1}</span>
                <div className="flex gap-2">
                  {Array.from({ length: (question.scale_max || 5) - (question.scale_min || 1) + 1 }).map((_, idx) => (
                    <div key={idx} className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-sm">
                      {(question.scale_min || 1) + idx}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{question.scale_max_label || question.scale_max || 5}</span>
              </div>
            )}
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
            <div className="flex items-center gap-3">
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">True</span>
            </div>
            <div className="flex items-center gap-3">
              <Circle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">False</span>
            </div>
            {isEditing && (
              <div className="mt-2 text-sm text-gray-600">
                <span>Correct answer: </span>
                <select
                  value={question.correct_answer || 'true'}
                  onChange={(e) => updateQuestionData(question.id, { correct_answer: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}
          </div>
        )

      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Students will upload files here</p>
          </div>
        )

      case 'date':
        return (
          <input
            type="date"
            disabled
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        )

      case 'time':
        return (
          <input
            type="time"
            disabled
            className="w-full max-w-xs p-3 border border-gray-300 rounded-lg bg-gray-50"
          />
        )

      default:
        return null
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
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit: {exam.examname || 'Untitled Exam'}
                </h1>
                <p className="text-sm text-gray-500">Modify exam details and questions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/instructor/exams/${params.id}`)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={saveExam}
                disabled={saveLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Step Navigation */}
        <div className="flex items-center mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {step}
              </button>
              <span className="ml-2 text-sm text-gray-600">
                {step === 1 && 'Basic Info'}
                {step === 2 && 'Questions'}
                {step === 3 && 'Settings'}
              </span>
              {step < 3 && <div className="w-12 h-0.5 bg-gray-300 mx-4"></div>}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Exam Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={exam.examname || ''}
                  onChange={(e) => handleExamDataChange('examname', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter exam name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={exam.classid || ''}
                  onChange={(e) => handleExamDataChange('classid', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={exam.date || ''}
                  onChange={(e) => handleExamDataChange('date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={exam.start_time || ''}
                  onChange={(e) => handleExamDataChange('start_time', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={exam.duration_minutes || ''}
                  onChange={(e) => handleExamDataChange('duration_minutes', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={exam.total_marks || ''}
                  onChange={(e) => handleExamDataChange('total_marks', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={exam.description || ''}
                onChange={(e) => handleExamDataChange('description', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter exam description"
              />
            </div>
            <div className="mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next: Edit Questions
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
              <button
                onClick={() => setShowQuestionTypes(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            {/* Question Type Selector */}
            {showQuestionTypes && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-lg font-medium mb-4">Choose Question Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {QUESTION_TYPES.map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.type}
                        onClick={() => addQuestion(type.type)}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left"
                      >
                        <Icon className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="mt-4 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => renderQuestionEditor(question, index))}
            </div>

            {questions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-500 mb-4">Add your first question to get started</p>
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Question
                </button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next: Settings
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Exam Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exam.allow_multiple_attempts || false}
                    onChange={(e) => handleExamDataChange('allow_multiple_attempts', e.target.checked)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Allow Multiple Attempts</div>
                    <div className="text-sm text-gray-500">Students can retake the exam</div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exam.shuffle_questions || false}
                    onChange={(e) => handleExamDataChange('shuffle_questions', e.target.checked)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Shuffle Questions</div>
                    <div className="text-sm text-gray-500">Randomize question order</div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exam.show_results_immediately || false}
                    onChange={(e) => handleExamDataChange('show_results_immediately', e.target.checked)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Show Results Immediately</div>
                    <div className="text-sm text-gray-500">Display results after submission</div>
                  </div>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={exam.require_authentication || false}
                    onChange={(e) => handleExamDataChange('require_authentication', e.target.checked)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Require Authentication</div>
                    <div className="text-sm text-gray-500">Students must be logged in</div>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Message</label>
                <textarea
                  value={exam.confirmation_message || ''}
                  onChange={(e) => handleExamDataChange('confirmation_message', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Message shown after exam submission"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={saveExam}
                disabled={saveLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}