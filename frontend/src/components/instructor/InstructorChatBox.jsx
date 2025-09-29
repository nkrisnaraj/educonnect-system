"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Check, X, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";



function SingleTick() {
  return <Check className="w-4 h-4 text-gray-400" />;
}

function DoubleTick({ color }) {
  const colorClass = {
    blue: "text-blue-400",
    gray: "text-gray-400",
  }[color] || "text-gray-400";

  return (
    <div className="flex">
      <Check className={`w-4 h-4 ${colorClass}`} />
      <Check className={`w-4 h-4 ${colorClass} -ml-2`} />
    </div>
  );
}

const InstructorChatBox = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStudentData, setSelectedStudentData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState(null);
  const [showChat, setShowChat] = useState(false); // New state to control view

  const { accessToken, user, api } = useAuth();

  const renderTick = (msg) => {
    if (msg.is_seen) return <DoubleTick color="blue" />;
    if (msg.is_delivered) return <DoubleTick color="gray" />;
    return <SingleTick />;
  };

  // Fetch students on mount
  const fetchStudents = async () => {
    console.log("🔍 Starting fetchStudents");
    console.log("🔍 accessToken exists:", !!accessToken);
    console.log("🔍 user object:", user);
    console.log("🔍 user role:", user?.role);
    
    if (!accessToken) {
      console.log("❌ No access token available");
      setLoading(false);
      return;
    }
    
    console.log("👥 Fetching students list");
    console.log("🔑 Token preview:", accessToken ? accessToken.substring(0, 50) + "..." : "NO TOKEN");
    
    try {
      // Also try manual headers as backup
      const res = await api.get("instructor/chat/instructor/students/", {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = res.data;
      console.log("✅ Response received:", data);
      setStudents(data.students || []);
      setChatError(null);
    } catch (err) {
      console.error("❌ Full error details:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);
      console.error("❌ Request config:", err.config);
      setChatError("Failed to load students. Please check authentication.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for selected student
  const fetchMessages = async () => {
    if (!selectedStudent || !accessToken) return;
    
    console.log(`📥 Fetching messages for student: ${selectedStudent}`);
    try {
      const res = await api.get(`instructor/chat/instructor/${selectedStudent}/`,{
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = res.data;
      console.log(`💬 Raw response:`, data);
      console.log(`💬 First message full object:`, data[0]);
      console.log(`💬 Message content check:`, {
        message: data[0]?.message,
        content: data[0]?.content,
        text: data[0]?.text
      });
      console.log(`💬 Received ${data?.length || 0} messages`);
      setChatMessages(Array.isArray(data) ? data : []);
      setChatError(null);
    } catch (err) {
      console.error("❌ Fetch messages failed:", err);
      setChatError("Failed to load messages. Please try again.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [accessToken, api]);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent, accessToken, api]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;
    
    console.log(`🚀 Sending message: ${newMessage}`);
    console.log(`📤 To student: ${selectedStudent}`);
    
    try {
      const res = await api.post(`instructor/chat/instructor/${selectedStudent}/send/`, {
        message: newMessage
      });
      
      console.log("✅ Message sent:", res.data);
      setChatMessages((prev) => [...(prev || []), res.data]);
      console.log(`📝 Chat updated. Total messages: ${chatMessages.length + 1}`);
      
      setNewMessage("");
      console.log("✨ Input cleared");
      setChatError(null);
      
      // Refresh student list to update last message info and reorder
      setTimeout(() => {
        fetchStudents();
      }, 500);
      
    } catch (err) {
      console.error("❌ Send failed:", err);
      console.error("❌ Error details:", err.response?.data);
      setChatError(err.response?.data?.error || "Failed to send message. Please try again.");
    }
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    console.log(`👤 Selected student: ${student.first_name} ${student.last_name} (ID: ${student.id})`);
    setSelectedStudent(student.id);
    setSelectedStudentData(student);
    setShowChat(true);
  };

  // Handle closing chat and returning to student list
  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedStudent(null);
    setSelectedStudentData(null);
    setChatMessages([]);
    setChatError(null);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
      {!showChat ? (
        // Student List View
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 flex gap-2 mb-4">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Student Messages
            {(students || []).length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                {(students || []).length} active
              </span>
            )}
          </h3>
          
          {/* Student List - Simplified Names Only */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 w-full bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : chatError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center w-full">
                <div className="text-red-600 text-sm font-medium mb-2">⚠️ Error Loading Students</div>
                <div className="text-red-500 text-sm mb-3">{chatError}</div>
                <button
                  onClick={fetchStudents}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : (students || []).length > 0 ? (
              (students || []).map((student) => {
                const formatTime = (timeString) => {
                  try {
                    const date = new Date(timeString);
                    const now = new Date();
                    const diffMs = now - date;
                    const diffMins = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffMins < 1) return "Just now";
                    if (diffMins < 60) return `${diffMins}m ago`;
                    if (diffHours < 24) return `${diffHours}h ago`;
                    if (diffDays < 7) return `${diffDays}d ago`;
                    return date.toLocaleDateString();
                  } catch {
                    return "";
                  }
                };

                return (
                  <button
                    key={student.id}
                    className="w-full p-4 rounded-lg border bg-white hover:bg-blue-50 border-blue-200 transition-all duration-200 text-left relative group"
                    onClick={() => handleStudentSelect(student)}
                  >
                    {/* Unread Messages Badge */}
                    {/* {student.unread_messages > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {student.unread_messages > 9 ? '9+' : student.unread_messages}
                      </div>
                    )} */}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base text-gray-900 group-hover:text-blue-700">
                          {student.first_name} {student.last_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {student.last_message_preview}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-400">
                          {formatTime(student.last_message_time)}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {student.total_messages} messages
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-2">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm font-medium">No chat history</p>
                <p className="text-gray-400 text-xs">
                  Students will appear here when they start conversations with you.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat View
        <div>
          {/* Chat Header with Close Button */}
          <div className="p-4 border-b border-purple-200 bg-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                  title="Back to student list"
                >
                  <ArrowLeft className="h-5 w-5 text-purple-600" />
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedStudentData?.first_name} {selectedStudentData?.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedStudentData?.profile_school || selectedStudentData?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
                title="Close chat"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex flex-col h-96">
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gradient-to-b from-purple-50 to-white">
              {selectedStudent && (chatMessages || []).length > 0 ? (
                (chatMessages || []).map((msg) => {
                  // Debug each message
                  console.log('Rendering message:', msg);
                  
                  // Try multiple field names for message content
                  const messageContent = msg.message || msg.content || msg.text || '';
                  console.log('Message content:', messageContent);
                  
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[70%] rounded-xl px-4 py-3 shadow-md mb-2 flex flex-col
                        ${msg.sender && msg.sender.id === user?.id ? 'ml-auto bg-blue-500 text-white' : 'mr-auto bg-white border border-gray-200'}`}
                    >
                      <div className="text-xs font-semibold mb-1 opacity-75">
                        {msg.sender?.username || 'Unknown'}
                      </div>
                      
                      {/* Message Content - Try multiple fields */}
                      <div className="text-sm font-medium mb-2">
                        {messageContent || '[No message content]'}
                      </div>
                      
                      <div className="text-xs opacity-75 flex items-center gap-1 justify-end">
                        {msg.created_at && new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {msg.sender && msg.sender.id === user?.id && renderTick(msg)}
                      </div>
                    </div>
                  );
                })
              ) : selectedStudent ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Start a conversation with this student.</p>
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">Select a student</p>
                  <p className="text-sm">Choose a student from the list to view messages.</p>
                </div>
              )}
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-purple-100 bg-white rounded-b-xl">
              <form className="flex gap-2" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-purple-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50 text-gray-900"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-purple-500 to-indigo-400 text-white rounded-full font-semibold shadow-md hover:from-purple-600 hover:to-indigo-500 transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorChatBox;