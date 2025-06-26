"use client"

import { useState } from "react"
import { Plus, GraduationCap, Calendar, Users, Clock, Eye, Edit, X, Upload, Trash2, ImageIcon } from "lucide-react"

export default function ExamsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState("upcoming")
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    questionImage: null,
    answers: ["", "", "", "", ""],
    correctAnswer: 0,
  })

  const exams = [
    {
      id: 1,
      title: "Physics Final Exam - 2025 A/L",
      course: "Physics",
      date: "2024-06-25",
      time: "14:00",
      duration: "3 hours",
      totalMarks: 100,
      students: 45,
      status: "upcoming",
      type: "Final Exam",
      batch: "2025 A/L",
      questionsCount: 50,
    },
    {
      id: 2,
      title: "Chemistry Practical Test",
      course: "Chemistry",
      date: "2024-06-20",
      time: "10:00",
      duration: "2 hours",
      totalMarks: 50,
      students: 38,
      status: "scheduled",
      type: "Practical",
      batch: "2026 A/L",
      questionsCount: 25,
    },
    {
      id: 3,
      title: "Biology Theory Paper",
      course: "Biology",
      date: "2024-06-15",
      time: "15:00",
      duration: "3 hours",
      totalMarks: 75,
      students: 52,
      status: "completed",
      type: "Theory",
      batch: "2025 A/L",
      questionsCount: 40,
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredExams = exams.filter((exam) => {
    if (selectedTab === "upcoming") return exam.status === "upcoming" || exam.status === "scheduled"
    if (selectedTab === "completed") return exam.status === "completed"
    return true
  })

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB!")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setCurrentQuestion({ ...currentQuestion, questionImage: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...currentQuestion.answers]
    newAnswers[index] = value
    setCurrentQuestion({ ...currentQuestion, answers: newAnswers })
  }

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim() && !currentQuestion.questionImage) {
      alert("Please add a question text or upload a question image!")
      return
    }

    const emptyAnswers = currentQuestion.answers.filter((answer) => answer.trim() === "").length
    if (emptyAnswers > 0) {
      alert("Please fill in all answer options!")
      return
    }

    const newQuestion = {
      id: Date.now(),
      ...currentQuestion,
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion({
      questionText: "",
      questionImage: null,
      answers: ["", "", "", "", ""],
      correctAnswer: 0,
    })
  }

  const removeQuestion = (questionId) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const removeQuestionImage = () => {
    setCurrentQuestion({ ...currentQuestion, questionImage: null })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Exams Management</h1>
          <p className="text-gray-600">Create and manage your A/L exams and assessments</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Create New Exam
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total A/L Exams</p>
              <p className="text-xl font-bold">24</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Participation</p>
              <p className="text-xl font-bold">92%</p>
            </div>
          </div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Results</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
        <div className="p-6 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">A/L Exams & Assessments</h3>
              <p className="text-gray-600">Manage your A/L exams and view student participation</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search exams..."
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setSelectedTab("upcoming")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium ${
                selectedTab === "upcoming" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setSelectedTab("completed")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium ${
                selectedTab === "completed" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setSelectedTab("all")}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium ${
                selectedTab === "all" ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All Exams
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Exam Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Batch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Questions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{exam.title}</td>
                    <td className="py-3 px-4">{exam.course}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{exam.batch}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span>{new Date(exam.date).toLocaleDateString()}</span>
                        <span className="text-sm text-gray-500">{exam.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{exam.duration}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        {exam.questionsCount} MCQs
                      </span>
                    </td>
                    <td className="py-3 px-4">{exam.students}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(exam.status)}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Exam Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New A/L Exam</h2>
              <button onClick={() => setIsDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Set up a new A/L exam with MCQ questions for your students</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exam Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Exam Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                    <input
                      type="text"
                      placeholder="Enter exam title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Choose subject</option>
                      <option>Physics</option>
                      <option>Chemistry</option>
                      <option>Biology</option>
                      <option>Mathematics</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select batch</option>
                      <option>2025 A/L</option>
                      <option>2026 A/L</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Select type</option>
                      <option>Theory</option>
                      <option>Practical</option>
                      <option>Final Exam</option>
                      <option>Unit Test</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                    <input
                      type="number"
                      placeholder="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Added Questions ({questions.length})</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-3 bg-gray-50 rounded-xl border">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Question {index + 1}</p>
                            {question.questionText && (
                              <p className="text-sm text-gray-600 mt-1">
                                {question.questionText.substring(0, 100)}
                                {question.questionText.length > 100 ? "..." : ""}
                              </p>
                            )}
                            {question.questionImage && (
                              <div className="mt-2">
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <ImageIcon className="h-3 w-3" />
                                  Image attached
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-green-600 mt-1">
                              Correct Answer: {String.fromCharCode(65 + question.correctAnswer)}
                            </p>
                          </div>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {questions.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No questions added yet. Add questions using the form on the right.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Add Question Form */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Add MCQ Question</h3>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    placeholder="Enter your question here..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Question Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Image (Optional)</label>
                  {currentQuestion.questionImage ? (
                    <div className="relative">
                      <img
                        src={currentQuestion.questionImage || "/placeholder.svg"}
                        alt="Question"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        onClick={removeQuestionImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload question image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="question-image"
                      />
                      <label
                        htmlFor="question-image"
                        className="px-3 py-1 bg-primary text-white rounded-xl hover:bg-purple-700 cursor-pointer text-sm"
                      >
                        Choose File
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>

                {/* Answer Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {currentQuestion.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={currentQuestion.correctAnswer === index}
                          onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index })}
                          className="text-purple-600"
                        />
                        <span className="text-sm font-medium text-gray-700 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => handleAnswerChange(index, e.target.value)}
                          placeholder={`Answer option ${String.fromCharCode(65 + index)}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Select the radio button next to the correct answer</p>
                </div>

                {/* Add Question Button */}
                <button
                  onClick={addQuestion}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (questions.length === 0) {
                    alert("Please add at least one question!")
                    return
                  }
                  setIsDialogOpen(false)
                  setQuestions([])
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary"
              >
                Create Exam ({questions.length} questions)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
