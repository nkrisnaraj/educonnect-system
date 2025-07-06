"use client"

import { useState } from "react"
import {
  Plus,
  FileText,
  Upload,
  Download,
  X,
  Search,
  Filter,
} from "lucide-react"

export default function NotesPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("all")
  const [selectedBatch, setSelectedBatch] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([])

  const notes = [
    {
      id: 1,
      title: "Quantum Mechanics - Chapter 1",
      subject: "Physics",
      batch: "2025 A/L",
      fileName: "quantum_mechanics_ch1.pdf",
      fileSize: "2.5 MB",
      uploadDate: "2024-06-20",
      description: "Introduction to quantum mechanics principles and wave-particle duality",
      type: "pdf",
    },
    {
      id: 2,
      title: "Organic Chemistry Reactions",
      subject: "Chemistry",
      batch: "2026 A/L",
      fileName: "organic_reactions.docx",
      fileSize: "1.8 MB",
      uploadDate: "2024-06-19",
      description: "Comprehensive guide to organic reaction mechanisms",
      type: "docx",
    },
    {
      id: 3,
      title: "Cell Biology Diagrams",
      subject: "Biology",
      batch: "2025 A/L",
      fileName: "cell_biology_diagrams.pptx",
      fileSize: "4.2 MB",
      uploadDate: "2024-06-18",
      description: "Detailed diagrams of cellular structures and processes",
      type: "pptx",
    },
    {
      id: 4,
      title: "Calculus Practice Problems",
      subject: "Mathematics",
      batch: "2025 A/L",
      fileName: "calculus_problems.pdf",
      fileSize: "1.2 MB",
      uploadDate: "2024-06-17",
      description: "Practice problems for differential and integral calculus",
      type: "pdf",
    },
    {
      id: 5,
      title: "Physics Formula Sheet",
      subject: "Physics",
      batch: "2026 A/L",
      fileName: "physics_formulas.pdf",
      fileSize: "800 KB",
      uploadDate: "2024-06-16",
      description: "Essential physics formulas for A/L examination",
      type: "pdf",
    },
    {
      id: 6,
      title: "Chemistry Lab Manual",
      subject: "Chemistry",
      batch: "2025 A/L",
      fileName: "chemistry_lab_manual.pdf",
      fileSize: "3.1 MB",
      uploadDate: "2024-06-15",
      description: "Complete laboratory manual for chemistry practicals",
      type: "pdf",
    },
  ]

  const batches = [
    { id: "all", name: "All Batches" },
    { id: "2025", name: "2025 A/L" },
    { id: "2026", name: "2026 A/L" },
  ]

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "🔴"
      case "docx":
      case "doc":
        return "🔵"
      case "pptx":
      case "ppt":
        return "🟠"
      case "xlsx":
      case "xls":
        return "🟢"
      default:
        return "📄"
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }

      const newFile = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: file.name.split(".").pop().toLowerCase(),
        file: file,
      }

      setUploadedFiles((prev) => [...prev, newFile])
    })
  }

  const removeUploadedFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const filteredNotes = notes.filter((note) => {
    const batchMatch = selectedBatch === "all" || note.batch.includes(selectedBatch)
    const searchMatch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase())
    return batchMatch && searchMatch
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">A/L Study Notes</h1>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-lg rounded-xl hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Upload Notes
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, descriptions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-xl font-semibold">A/L Study Materials Library</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white/50 border border-primary rounded-xl p-4 transition transform hover:scale-[1.02] hover:shadow-lg hover:bg-white/80 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileIcon(note.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xl">{note.title}</h4>
                      <p className="text-lg text-gray-500">{note.fileName}</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-600 mb-3 line-clamp-2">{note.description}</p>

                <div className="flex items-center justify-between text-lg text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{note.fileSize}</span>
                  </div>
                  <span>{note.uploadDate}</span>
                </div>
              </div>
            ))}
          </div>

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent"
              >
                Upload Your First Note
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Notes Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Study Notes</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-gray-600 text-lg mb-6">Upload study materials and notes for your A/L students</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Upload Files</h3>

                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center mb-4">
                  <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Study Notes</h4>
                  <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>

                  <input
                    type="file"
                    id="notes-file-upload"
                    multiple
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.xlsx,.xls"
                    onChange={handleFileUpload}
                  />

                  <label
                    htmlFor="notes-file-upload"
                    className="px-4 py-2 bg-primary text-white text-lg rounded-xl hover:bg-accent cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>

                  <p className="text-s text-gray-500 mt-2">
                    Supports PDF, Word, PowerPoint, Excel, Images, Text files. Max 10MB per file.
                  </p>
                </div>

                {/* File Details Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Note Title</label>
                    <input
                      type="text"
                      placeholder="Enter descriptive title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-700 mb-1">Batch</label>
                      <select className="w-full px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Select batch</option>
                        <option>2025 A/L</option>
                        <option>2026 A/L</option>
                        <option>Both Batches</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      placeholder="Brief description of the content"
                      rows={3}
                      className="w-full px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Uploaded Files Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Files ({uploadedFiles.length})</h3>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.size} • {file.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadedFile(file.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {uploadedFiles.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-lg">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No files selected yet</p>
                      <p className="text-sm">Choose files to see them here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 text-xl">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false)
                  setUploadedFiles([])
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle upload logic here
                  alert(`${uploadedFiles.length} files uploaded successfully!`)
                  setIsUploadModalOpen(false)
                  setUploadedFiles([])
                }}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
                disabled={uploadedFiles.length === 0}
              >
                Upload Notes ({uploadedFiles.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
