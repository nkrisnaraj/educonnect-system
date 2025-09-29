"use client";
import axios from 'axios';
import { useState, useEffect } from "react";
import { useInstructorApi } from "@/hooks/useInstructorApi";
import {
  Plus,
  FileText,
  X,
  Search,
  Filter,
  Trash2,
  Pencil,
} from "lucide-react";

export default function NotesPage() {
  const instructorApi = useInstructorApi();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [noteBeingEdited, setNoteBeingEdited] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [notesData, classesData] = await Promise.all([
        instructorApi.getNotes(
          searchQuery || "",
          selectedClass !== "all" ? selectedClass : ""
        ),
        instructorApi.getClasses(),
      ]);

      if (Array.isArray(notesData)) {
        setNotes(notesData);
      } else {
        setNotes([]);
      }

      let normalizedClasses = [];
      if (Array.isArray(classesData)) {
        normalizedClasses = classesData;
      } else if (classesData?.results && Array.isArray(classesData.results)) {
        normalizedClasses = classesData.results;
      } else if (classesData?.classes && Array.isArray(classesData.classes)) {
        normalizedClasses = classesData.classes;
      }

      setClasses([{ id: "all", title: "All Classes" }, ...normalizedClasses]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedClass]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      setUploadedFiles([
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

  const openUploadModal = (note = null) => {
    setNoteBeingEdited(note);
    setUploadedFiles([]);
    setIsUploadModalOpen(true);
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const tokenToUse = sessionStorage.getItem("accessToken");
    const file = uploadedFiles[0]?.file;

    formData.append("title", e.target.title.value);
    formData.append("description", e.target.description.value);
    if (
      e.target.related_class.value &&
      e.target.related_class.value !== "all"
    ) {
      formData.append("related_class", e.target.related_class.value);
    }

    if (file) formData.append("file", file);

    try {
      if (noteBeingEdited) {
        await axios.put(
          `http://127.0.0.1:8000/instructor/notes/${noteBeingEdited.id}/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${tokenToUse}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Note updated successfully!");
      } else {
        await axios.post("http://127.0.0.1:8000/instructor/notes/", formData, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Note uploaded successfully!");
      }

      setIsUploadModalOpen(false);
      setUploadedFiles([]);
      setNoteBeingEdited(null);
      fetchData();
    } catch (err) {
      console.error("Upload failed:", err.response?.data || err.message);
      alert("Failed to submit note.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;

    try {
      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        alert("No access token found. Please log in again.");
        return;
      }

      await axios.delete(`http://127.0.0.1:8000/instructor/notes/${noteId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      fetchData();
      alert("Note deleted.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete note.");
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">A/L Study Notes</h1>
        <button
          onClick={() => openUploadModal(null)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-lg rounded-xl hover:bg-accent"
        >
          <Plus className="h-4 w-4" />
          Upload Notes
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/60 border border-purple-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes, descriptions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-lg border border-gray-300 rounded-xl"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.title || cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading notes...</p>
        </div>
      ) : notes.length > 0 ? (
        <div className="bg-white/60 border border-purple-200 rounded-xl">
          <div className="p-6 border-b border-purple-200">
            <h3 className="text-xl font-semibold">A/L Study Materials Library</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white/50 border border-primary rounded-xl p-4 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getFileIcon(note.file_url?.split(".").pop())}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-xl">
                          {note.title}
                        </h4>
                        <p className="text-lg text-gray-500">
                          {note.class_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openUploadModal(note)}>
                        <Pencil className="w-5 h-5 text-blue-600 hover:text-blue-800" />
                      </button>
                      <button onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="w-5 h-5 text-red-600 hover:text-red-800" />
                      </button>
                    </div>
                  </div>

                  <p className="text-lg text-gray-600 mb-3">{note.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={() => openUploadModal()}
            className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
          >
            Upload Your First Note
          </button>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {noteBeingEdited ? "Edit Note" : "Upload Study Notes"}
              </h2>
              <button onClick={() => setIsUploadModalOpen(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmitNote} className="space-y-4">
              <input
                name="title"
                defaultValue={noteBeingEdited?.title || ""}
                required
                placeholder="Title"
                className="w-full px-3 py-2 border rounded-xl"
              />
              <textarea
                name="description"
                defaultValue={noteBeingEdited?.description || ""}
                placeholder="Description"
                rows={3}
                className="w-full px-3 py-2 border rounded-xl"
              />
              <select
                name="related_class"
                defaultValue={noteBeingEdited?.related_class || ""}
                required
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="">Select Class</option>
                {classes
                  .filter((cls) => cls.id !== "all")
                  .map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.title}
                    </option>
                  ))}
              </select>
              <div>
                <label className="block mb-2 text-gray-700 font-medium">
                  Upload File
                </label>
                <input type="file" onChange={handleFileUpload} />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setNoteBeingEdited(null);
                    setUploadedFiles([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-accent"
                >
                  {noteBeingEdited ? "Update Note" : "Upload Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}