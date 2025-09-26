"use client"
import { useAuth } from "@/context/AuthContext"
import { Bell, MessageSquare, ClipboardCheck, Calendar, Play, Video, BookOpen, FileText } from "lucide-react"
import { useEffect, useState } from "react"

export default function Notice() {
  const [notifications,setNotifications] = useState([])
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


  useEffect(() => {
  const fetchNotice = async () => {
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
    }
  };
  fetchNotice();
}, [api]);

  
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

  const unreadCount = notifications.filter((n)=>!n.read_status).length;
  return (
    <div className="max-w-6xl shadow-lg bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notifications</h2>
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-100 flex flex-col w-full">
        {notifications.map((note, index) => (
          <div
            key={note.note_id}
            onClick={() => markAsRead(note.note_id)}
            className={`${note.read_status ? "bg-white" : "bg-gray-100"} flex items-start gap-4 p-6 hover:bg-gray-50 transition-colors cursor-pointer`}
          >
            {/* Icon */}
            <div className="text-xl text-blue-500 bg-gray-50 shadow-lg rounded-full p-2">
              {getIconByType(note.type)}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-lg font-medium text-gray-900 leading-tight">{note.title}</p>
              <p className="text-sm text-gray-500 mt-1">{note.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
