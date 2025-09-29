"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Check } from "lucide-react";
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
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState(null);

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
        message: newMessage,
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      console.log("✅ Message sent:", res.data);
      setChatMessages((prev) => [...(prev || []), res.data]);
      console.log(`📝 Chat updated. Total messages: ${chatMessages.length + 1}`);
      
      setNewMessage("");
      console.log("✨ Input cleared");
      setChatError(null);
    } catch (err) {
      console.error("❌ Send failed:", err);
      setChatError("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-xl">
      <div className="p-6 border-b border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 flex gap-2 mb-2">
          <MessageCircle className="h-5 w-5 text-purple-600" />
          Student Messages
        </h3>
        
        {/* Student Selection */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {loading ? (
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 w-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : chatError ? (
            <div className="text-red-500 text-sm p-4 text-center w-full">
              {chatError}
            </div>
          ) : (students || []).length > 0 ? (
            (students || []).map((student) => (
              <button
                key={student.id}
                className={`px-6 py-4 mt-4 rounded-xl w-full font-large border border-purple-200 focus:outline-none flex flex-col transition-all duration-200
                  ${selectedStudent === student.id ? 'bg-primary text-white border-purple-500 shadow-md' : 'bg-white hover:bg-purple-50'}`}
                onClick={() => {
                  console.log(`👤 Selected student: ${student.first_name} ${student.last_name} (ID: ${student.id})`);
                  setSelectedStudent(student.id);
                }}
                title={`${student.first_name} ${student.last_name}`}
              >
                <span className="font-bold truncate w-full text-sm">
                  {student.first_name} {student.last_name}
                </span>
              </button>
            ))
          ) : (
            <div className="text-gray-500 text-sm p-4 text-center w-full">
              No students found. Students will appear here when they join your classes.
            </div>
          )}
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
                  className={`max-w-[40%] rounded-xl px-4 py-2 shadow-md mb-2 flex flex-col
                    ${msg.sender && msg.sender.id === user?.id ? 'ml-auto bg-blue-500 text-white text-right' : 'mr-auto bg-white border border-gray-200'}`}
                >
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {msg.sender?.username || 'Unknown'}
                  </div>
                  
                  {/* Message Content - Try multiple fields */}
                  <div className="text-base font-medium mb-2">
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
        {selectedStudent && (
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
        )}
      </div>
    </div>
  );
};

export default InstructorChatBox;