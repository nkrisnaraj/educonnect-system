"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, FileText, Calendar, Clock, User } from "lucide-react";

export default function ClassNotes() {
  const { id: classId } = useParams();
  const { id: studentId } = useParams();
  const router = useRouter();
  const { accessToken, api, loading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoadingNotes(true);
        setError(null);
        
        const response = await api.get(`/students/class/${classId}/notes/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        
        setNotes(response.data.notes || []);
        setClassDetails(response.data.class_details || null);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoadingNotes(false);
      }
    };

    if (accessToken && classId) {
      fetchNotes();
    }
  }, [accessToken, classId, api]);

  if (loading || loadingNotes) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Notes</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.back()}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Classes
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Class Notes</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Class Details */}
      {classDetails && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{classDetails.title}</h2>
              <p className="text-gray-600 mb-4">{classDetails.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Instructor: {classDetails.instructor || 'Mr. Sivathiran'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule: {classDetails.schedule || 'Not specified'}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Duration: {classDetails.duration || 'Not specified'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
            <p className="text-gray-600">Notes for this class haven't been uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Notes</h3>
            {notes.map((note, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {note.title || `Note ${index + 1}`}
                    </h4>
                    {note.description && (
                      <p className="text-gray-600 mb-3">{note.description}</p>
                    )}
                    <div className="flex items-center text-sm text-gray-500">
                      {note.created_at && (
                        <span className="flex items-center mr-4">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                      )}
                      {note.file_size && (
                        <span className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {note.file_size}
                        </span>
                      )}
                    </div>
                  </div>
                  {note.file_url && (
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Note
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 