"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FileText } from "lucide-react";

export default function ClassNotes() {
  const { classid } = useParams();
  const router = useRouter();
  const { accessToken, api, loading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoadingNotes(true);
        setError(null);

        const response = await api.get(`/students/class/${classid}/notes/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Filter notes to only PDFs or images
        const filteredNotes = (response.data.notes || []).filter(note => {
          return note.file_url && (note.file_url.endsWith(".pdf") || /\.(jpg|jpeg|png|gif)$/i.test(note.file_url));
        });

        setNotes(filteredNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to load notes. Please try again.");
      } finally {
        setLoadingNotes(false);
      }
    };

    if (accessToken && classid) {
      fetchNotes();
    }
  }, [accessToken, classid, api]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Notes Available</h3>
            <p className="text-gray-600">Notes for this class haven't been uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                {note.file_url.endsWith(".pdf") ? (
                  <a
                    href={note.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-white bg-red-600 hover:bg-red-700 rounded-lg px-4 py-6"
                  >
                    📄 {note.title || `PDF Note ${index + 1}`}
                  </a>
                ) : (
                  <img
                    src={note.file_url}
                    alt={note.title || `Image Note ${index + 1}`}
                    className="rounded-lg object-cover w-full h-48"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
