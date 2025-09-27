"use client"

import { useState, useEffect } from "react"
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings, 
  ArrowLeft, 
  CheckCircle, 
  Circle,
  Type,
  AlignLeft,
  List,
  Star,
  Calendar,
  Clock,
  Upload,
  ToggleLeft,
  FileText
} from "lucide-react"
import { useInstructorApi } from "@/hooks/useInstructorApi"
import { useRouter } from "next/navigation"

const QUESTION_TYPES = [
  { 
    value: 'multiple_choice', 
    label: 'Multiple Choice', 
    icon: Circle,
    description: 'Single answer from options'
  },
  { 
    value: 'multiple_select', 
    label: 'Multiple Select', 
    icon: CheckCircle,
    description: 'Multiple answers from options'
  },
  { 
    value: 'short_answer', 
    label: 'Short Answer', 
    icon: Type,
    description: 'Brief text response'
  },
  { 
    value: 'paragraph', 
    label: 'Paragraph', 
    icon: AlignLeft,
    description: 'Long text response'
  },
  { 
    value: 'true_false', 
    label: 'True/False', 
    icon: ToggleLeft,
    description: 'True or false question'
  },
  { 
    value: 'dropdown', 
    label: 'Dropdown', 
    icon: List,
    description: 'Select from dropdown list'
  },
  { 
    value: 'linear_scale', 
    label: 'Linear Scale', 
    icon: Star,
    description: 'Rating scale (1-5, 1-10)'
  },
  { 
    value: 'date', 
    label: 'Date', 
    icon: Calendar,
    description: 'Date picker'
  },
  { 
    value: 'time', 
    label: 'Time', 
    icon: Clock,
    description: 'Time picker'
  },
  { 
    value: 'file_upload', 
    label: 'File Upload', 
    icon: Upload,
    description: 'File attachment'
  },
]

export default function CreateExamPage() {
  const router = useRouter()
  const { createExam, getClasses, createQuestion, loading, error } = useInstructorApi()
  
  const [examData, setExamData] = useState({
    examname: '',
    description: '',
    classid: '',
    date: '',
    start_time: '',
    duration_minutes: 60,
    total_marks: 100,
    passing_marks: 50,
    is_published: false,
    allow_multiple_attempts: false,
    shuffle_questions: false,
    show_results_immediately: true,
    require_authentication: true,
    collect_email: true,
    confirmation_message: 'Thank you for submitting your exam. Your responses have been recorded.',
  })
  
  const [questions, setQuestions] = useState([])
  const [classes, setClasses] = useState([])
  const [currentStep, setCurrentStep] = useState(1) // 1: Basic Info, 2: Questions, 3: Settings
  const [showQuestionTypes, setShowQuestionTypes] = useState(false)
  const [draggedQuestion, setDraggedQuestion] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const response = await getClasses()
      if (response && response.classes) {
        setClasses(response.classes)
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error)
    }
  }

  const handleExamDataChange = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addQuestion = (type) => {
    const newQuestion = {
      id: `temp_${Date.now()}`, // Use a prefix to make it clear this is temporary
      question_text: 'Untitled Question',
      question_type: type,
      order: questions.length + 1,
      is_required: true,
      marks: 1,
      description: '',
      options: type.includes('multiple') || type === 'dropdown' || type === 'true_false' 
        ? [{ option_text: 'Option 1', is_correct: false, order: 1 }] 
        : [],
      scale_min: type === 'linear_scale' ? 1 : null,
      scale_max: type === 'linear_scale' ? 5 : null,
      scale_min_label: type === 'linear_scale' ? 'Strongly Disagree' : '',
      scale_max_label: type === 'linear_scale' ? 'Strongly Agree' : '',
      allow_other_option: false,
      shuffle_options: false,
    }

    if (type === 'true_false') {
      newQuestion.options = [
        { option_text: 'True', is_correct: false, order: 1 },
        { option_text: 'False', is_correct: false, order: 2 }
      ]
    }

    setQuestions(prev => [...prev, newQuestion])
    setShowQuestionTypes(false)
  }

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, [field]: value }
        : q
    ))
  }

  const deleteQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const addOption = (questionId) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: [...q.options, { 
              option_text: `Option ${q.options.length + 1}`, 
              is_correct: false, 
              order: q.options.length + 1 
            }] 
          }
        : q
    ))
  }

  const updateOption = (questionId, optionIndex, field, value) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex 
                ? { ...opt, [field]: value }
                : field === 'is_correct' && q.question_type === 'multiple_choice' 
                  ? { ...opt, is_correct: false } // For single choice, uncheck others
                  : opt
            ) 
          }
        : q
    ))
  }

  const deleteOption = (questionId, optionIndex) => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ))
  }

  const handleDragStart = (e, questionId) => {
    setDraggedQuestion(questionId)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, targetQuestionId) => {
    e.preventDefault()
    
    if (draggedQuestion === targetQuestionId) return

    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion)
    const targetIndex = questions.findIndex(q => q.id === targetQuestionId)
    
    if (draggedIndex === -1 || targetIndex === -1) return

    const newQuestions = [...questions]
    const [draggedItem] = newQuestions.splice(draggedIndex, 1)
    newQuestions.splice(targetIndex, 0, draggedItem)
    
    // Update order
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }))
    
    setQuestions(updatedQuestions)
    setDraggedQuestion(null)
  }

  const saveExam = async () => {
    try {
      // Validate required fields
      if (!examData.examname || !examData.classid || !examData.date) {
        alert('Please fill in all required fields (Exam Name, Class, and Date)')
        return
      }

      // First create the exam
      console.log('Creating exam with data:', examData)
      const examResponse = await createExam(examData)
      console.log('Exam created:', examResponse)
      
      if (examResponse && examResponse.id) {
        console.log(`Created exam with ID: ${examResponse.id}`)
        console.log(`Creating ${questions.length} questions...`)
        
        // Then create all questions
        let successCount = 0
        let errorCount = 0
        
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i]
          try {
            // Prepare question data - remove temporary frontend ID
            const questionData = {
              question_text: question.question_text,
              question_type: question.question_type,
              order: question.order,
              is_required: question.is_required,
              marks: question.marks,
              description: question.description || '',
              scale_min: question.scale_min,
              scale_max: question.scale_max,
              scale_min_label: question.scale_min_label || '',
              scale_max_label: question.scale_max_label || '',
              allow_other_option: question.allow_other_option,
              shuffle_options: question.shuffle_options,
            }

            // Add options if they exist and are needed for this question type
            if (question.options && question.options.length > 0 && 
                ['multiple_choice', 'multiple_select', 'dropdown', 'true_false'].includes(question.question_type)) {
              questionData.options = question.options.map((opt, index) => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct || false,
                order: index + 1
              }))
            }

            console.log(`Creating question ${i + 1}:`, questionData)
            
            const questionResponse = await createQuestion(examResponse.id, questionData)
            console.log(`Question ${i + 1} created:`, questionResponse)
            successCount++
          } catch (questionError) {
            console.error(`Failed to create question ${i + 1}:`, questionError)
            errorCount++
          }
        }
        
        if (errorCount === 0) {
          alert(`Exam created successfully with ${successCount} questions!`)
        } else {
          alert(`Exam created with ${successCount} questions. ${errorCount} questions failed to save.`)
        }
        
        router.push('/instructor/exams')
      } else {
        throw new Error('Failed to create exam - no response ID')
      }
    } catch (error) {
      console.error('Failed to create exam:', error)
      alert(`Failed to create exam: ${error.message || 'Please try again.'}`)
    }
  }

  const renderQuestionEditor = (question) => {
    const QuestionIcon = QUESTION_TYPES.find(t => t.value === question.question_type)?.icon || Type

    return (
      <div 
        key={question.id}
        className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm"
        draggable
        onDragStart={(e) => handleDragStart(e, question.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, question.id)}
      >
        <div className="flex items-center gap-3 mb-4">
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
          <QuestionIcon className="h-5 w-5 text-blue-600" />
          <input
            type="text"
            value={question.question_text}
            onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
            className="flex-1 text-lg font-medium border-none outline-none bg-transparent"
            placeholder="Question text"
          />
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {question.description && (
          <textarea
            value={question.description}
            onChange={(e) => updateQuestion(question.id, 'description', e.target.value)}
            placeholder="Question description (optional)"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            rows={2}
          />
        )}

        {/* Render question type specific inputs */}
        {(question.question_type === 'multiple_choice' || 
          question.question_type === 'multiple_select' || 
          question.question_type === 'dropdown' ||
          question.question_type === 'true_false') && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type={question.question_type === 'multiple_choice' ? 'radio' : 'checkbox'}
                  checked={option.is_correct}
                  onChange={(e) => updateOption(question.id, index, 'is_correct', e.target.checked)}
                  name={`question_${question.id}`}
                  className="text-blue-600"
                />
                <input
                  type="text"
                  value={option.option_text}
                  onChange={(e) => updateOption(question.id, index, 'option_text', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder={`Option ${index + 1}`}
                />
                {question.question_type !== 'true_false' && question.options.length > 1 && (
                  <button
                    onClick={() => deleteOption(question.id, index)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {question.question_type !== 'true_false' && (
              <button
                onClick={() => addOption(question.id)}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Add option
              </button>
            )}
          </div>
        )}

        {question.question_type === 'linear_scale' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scale Min</label>
              <input
                type="number"
                value={question.scale_min || 1}
                onChange={(e) => updateQuestion(question.id, 'scale_min', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scale Max</label>
              <input
                type="number"
                value={question.scale_max || 5}
                onChange={(e) => updateQuestion(question.id, 'scale_max', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
                min="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Label</label>
              <input
                type="text"
                value={question.scale_min_label}
                onChange={(e) => updateQuestion(question.id, 'scale_min_label', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Strongly Disagree"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Label</label>
              <input
                type="text"
                value={question.scale_max_label}
                onChange={(e) => updateQuestion(question.id, 'scale_max_label', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="e.g., Strongly Agree"
              />
            </div>
          </div>
        )}

        {/* Question settings */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={question.is_required}
                onChange={(e) => updateQuestion(question.id, 'is_required', e.target.checked)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Marks:</span>
              <input
                type="number"
                value={question.marks}
                onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value) || 1)}
                className="w-16 p-1 border border-gray-300 rounded text-sm"
                min="1"
              />
            </div>
          </div>
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
                  {examData.examname || 'Untitled Exam'}
                </h1>
                <p className="text-sm text-gray-500">Google Forms-style Exam Builder</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                onClick={saveExam}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Exam Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examData.examname}
                  onChange={(e) => handleExamDataChange('examname', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter exam name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={examData.classid}
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
                  value={examData.date}
                  onChange={(e) => handleExamDataChange('date', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={examData.start_time}
                  onChange={(e) => handleExamDataChange('start_time', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={examData.duration_minutes}
                  onChange={(e) => handleExamDataChange('duration_minutes', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                <input
                  type="number"
                  value={examData.total_marks}
                  onChange={(e) => handleExamDataChange('total_marks', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={examData.description}
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
                Next: Add Questions
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
                        key={type.value}
                        onClick={() => addQuestion(type.value)}
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
              {questions.map(renderQuestionEditor)}
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
                    checked={examData.allow_multiple_attempts}
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
                    checked={examData.shuffle_questions}
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
                    checked={examData.show_results_immediately}
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
                    checked={examData.require_authentication}
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
                  value={examData.confirmation_message}
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
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}