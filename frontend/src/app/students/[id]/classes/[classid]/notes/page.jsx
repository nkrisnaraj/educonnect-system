"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";


export default function ClassNotes() {
  const { classid } = useParams();
  const router = useRouter();
  const { accessToken, api } = useAuth();

  const [notes, setNotes] = useState([]);
  const [classDetails, setClassDetails] = useState({});
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoadingNotes(true);
        setError(null);

        console.log("🔍 Fetching notes for classid:", classid);

        const response = await api.get(`students/class/${classid}/notes/`,{
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        console.log("✅ Full API response:", response.data);
        console.log("📚 Notes array:", response.data.notes);
        console.log("🏫 Class details:", response.data.class_details);

        const allNotes = response.data.notes || [];
        console.log(`📋 Total notes received: ${allNotes.length}`);
        
        // Log each note for debugging
        allNotes.forEach((note, index) => {
          console.log(`📝 Note ${index + 1}:`, note);
        });

        // Don't filter - show ALL notes
        setNotes(allNotes);
        setClassDetails(response.data.class_details || {});
        
      } catch (error) {
        console.error("❌ Error fetching notes:", error);
        console.error("❌ Error response:", error.response?.data);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoadingNotes(false);
      }
    };

    if (accessToken && classid) {
      fetchNotes();
    }
  }, [accessToken, classid, api]);

  if (loadingNotes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {classDetails.title || "Class Notes"}
              </h1>
              <p className="text-gray-600">{classDetails.instructor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Debug Info */}
        {/* <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Debug:</strong> Found {notes.length} notes for class "{classDetails.title}"
          </p>
        </div> */}

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
            <p className="text-gray-600">Notes for this class haven't been uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{note.title}</h3>
                  {note.file && (
                    <a
                      href={`${note.file}`}
                      download
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {note.description && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{note.description}</p>
                )}
                
                <div className="space-y-3">
                  {note.file ? (
                    <a
                      href={`${note.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-4 py-4 transition-colors font-medium"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      View File
                    </a>
                  ) : (
                    <div className="flex items-center justify-center text-gray-600 bg-gray-100 rounded-lg px-4 py-4 font-medium">
                      <FileText className="w-5 h-5 mr-2" />
                      Text Note Only
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Class: {note.class_name}</span>
                    <span>
                      Uploaded: {new Date(note.upload_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}