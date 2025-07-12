"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import {
  Plus,
  FileText,
  Upload,
  X,
  Search,
  Filter,
} from "lucide-react"

export default function NotesPage() {
  const {accessToken, refreshAccessToken, logout } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [notes, setNotes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState([])

  const fetchNotes = async (token = accessToken) => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedClass !== "all") params.batch = selectedClass;

      const res = await axios.get("http://127.0.0.1:8000/instructor/notes/", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setNotes(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) fetchNotes(newToken);
          else logout();
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error(err);
        alert("Failed to load notes.");
      }
    }
  };

  const fetchClasses = async (token = accessToken) => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/instructor/classes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses([{ id: "all", topic: "All Classes" }, ...res.data]);
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) fetchClasses(newToken);
          else logout();
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error(err);
        alert("Failed to load classes.");
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotes();
      fetchClasses();
    }
  }, [accessToken, searchQuery, selectedClass]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      setUploadedFiles((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.split(".").pop().toLowerCase(),
        },
      ]);
    });
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmitNote = async (e, newToken = null) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) return alert("No files selected!");

    const tokenToUse = newToken || accessToken;
    const formData = new FormData();
    const file = uploadedFiles[0].file;

    formData.append("title", e.target.title.value);
    formData.append("description", e.target.description.value);
    formData.append("batch", e.target.batch.value);
    formData.append("related_class", e.target.related_class.value);
    formData.append("file", file);

    try {
      await axios.post("http://127.0.0.1:8000/instructor/notes/", formData, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Note uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadedFiles([]);
      fetchNotes();
    } catch (err) {
      if (err.response?.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) return handleSubmitNote(e, refreshedToken);
        logout();
      } else {
        console.error(err);
        alert("Failed to upload note.");
      }
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "🔴";
      case "docx":
      case "doc":
        return "🔵";
      case "pptx":
      case "ppt":
        return "🟠";
      case "xlsx":
      case "xls":
        return "🟢";
      default:
        return "📄";
    }
  };

  const filteredNotes = notes.filter((note) => {
    const batchMatch = selectedClass === "all" || note.batch === selectedClass;
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
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.topic || cls.name}
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
                    <span className="text-2xl">{getFileIcon(note.file_url.split('.').pop())}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-xl">{note.title}</h4>
                      <p className="text-lg text-gray-500">{note.class_name}</p>
                    </div>
                  </div>
                </div>

                <p className="text-lg text-gray-600 mb-3 line-clamp-2">{note.description}</p>

                <div className="flex items-center justify-between text-lg text-gray-500">
                  <span>{note.upload_date}</span>
                  <a
                href={note.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Download
              </a>
                </div>
              </div>
            ))}
          </div>

          {notes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upload Study Notes</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitNote} className="space-y-4">
              <input
                name="title"
                type="text"
                placeholder="Title"
                required
                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                name="description"
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                name="batch"
                required
                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Batch</option>
                <option value="2025 A/L">2025 A/L</option>
                <option value="2026 A/L">2026 A/L</option>
              </select>
              <select
                name="related_class"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Class</option>
                {classes
                  .filter((cls) => cls.id !== "all")
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.topic}
                    </option>
                  ))}
              </select>

              <div>
                <label className="text-gray-600 mb-4 block font-medium">Upload File</label>
                <input type="file" onChange={handleFileUpload} accept="*"/>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
                >
                  Upload
                </button>
              </div>
            </form>

            {/* Selected Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Selected Files:</p>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex justify-between items-center">
                    <span>{file.name}</span>
                    <button onClick={() => removeUploadedFile(file.id)}>
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}