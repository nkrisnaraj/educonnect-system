"use client"
import { useAuth } from "@/context/AuthContext"
import { Bell, MessageSquare, ClipboardCheck, Calendar, Play, Video, BookOpen, FileText, Trash2, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

export default function Notice() {
  const [notifications,setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const {user,api,loading,accessToken,token,refreshAccessToken} = useAuth();

  const getIconByType = (type) => {
    switch (type) {
      case "exam":
        return <Calendar className="text-red-500" />;
      case "webinar":
        return <Video className="text-blue-500" />;
      case "notes":
        return <BookOpen className="text-green-500" />;
      case "message":
        return <MessageSquare className="text-yellow-500" />;
      default:
        return <FileText className="text-gray-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "exam":
        return "bg-red-50 border-red-200";
      case "webinar":
        return "bg-blue-50 border-blue-200";
      case "notes":
        return "bg-green-50 border-green-200";
      case "message":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "exam":
        return "Exam";
      case "webinar":
        return "Webinar";
      case "notes":
        return "Study Notes";
      case "message":
        return "Message";
      default:
        return "Notification";
    }
  };


  useEffect(() => {
    const fetchNotice = async () => {
      if (!accessToken) return;
      
      setIsLoading(true);
      try {
        const response = await api.get("students/notifications/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log("Fetched notifications:", response.data);
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotice();
  }, [api, accessToken]);

  const refreshNotifications = async () => {
    if (!accessToken) return;
    
    setIsRefreshing(true);
    try {
      const response = await api.get("students/notifications/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Refreshed notifications:", response.data);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error("Failed to refresh notifications:", error.response?.data || error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  
  const markAsRead = async (id) => {
    const alreadyRead = notifications.find((n) => n.note_id === id)?.read_status;
    if (alreadyRead) return;

    try {
      await api.post(`students/notifications/${id}/read/`, null,{
        headers:{
          Authorization: `Bearer ${accessToken}`
        }
      });
      setNotifications((prev) =>
        prev.map((n) => (n.note_id === id ? { ...n, read_status: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`students/notifications/${id}/delete/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setNotifications((prev) => prev.filter((n) => n.note_id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((n)=>!n.read_status).length;
  return (
    <div className="max-w-6xl shadow-lg bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notifications</h2>
        <div className="flex items-center gap-4">
          {/* Refresh Button */}
          <button 
            onClick={refreshNotifications}
            disabled={isRefreshing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Notification Bell */}
          <div className="relative">
            <Bell className="w-6 h-6 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100 flex flex-col w-full">
        {isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">You'll see notifications about exams, webinars, and messages here.</p>
          </div>
        ) : (
          notifications.map((note, index) => (
            <div
              key={note.note_id}
              onClick={() => markAsRead(note.note_id)}
              className={`${
                note.read_status ? "bg-white" : getNotificationColor(note.type)
              } flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer relative border-l-4 ${
                note.read_status ? "border-transparent" : 
                note.type === "exam" ? "border-red-400" :
                note.type === "webinar" ? "border-blue-400" :
                note.type === "notes" ? "border-green-400" :
                note.type === "message" ? "border-yellow-400" : "border-gray-400"
              }`}
            >
              {/* Icon */}
              <div className="text-xl text-blue-500 bg-white shadow-lg rounded-full p-3">
                {getIconByType(note.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Type and Status */}
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    note.type === "exam" ? "bg-red-100 text-red-800" :
                    note.type === "webinar" ? "bg-blue-100 text-blue-800" :
                    note.type === "notes" ? "bg-green-100 text-green-800" :
                    note.type === "message" ? "bg-yellow-100 text-yellow-800" : 
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {getTypeLabel(note.type)}
                  </span>
                  {!note.read_status && (
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </div>
                
                <p className="text-lg font-medium text-gray-900 leading-tight mb-1">
                  {note.title}
                </p>
                <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                  {note.message}
                </p>
                
                {/* Timestamp */}
                <p className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Delete Button */}
              <div className="flex-shrink-0">
                <Trash2 
                  className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors" 
                  size={20}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(note.note_id);
                  }} 
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
