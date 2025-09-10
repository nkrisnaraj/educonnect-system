"use client"

import { useState, useEffect, useRef } from "react"
import {
  Send,
  User,
  Minimize2,
  Search,
  Bell,
  MessageCircle,
  X,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
} from "lucide-react"


export default function Chatbot() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [students, setStudents] = useState([]) // Students with existing chats
  const [allStudents, setAllStudents] = useState([]) // All students for search
  const [searchResults, setSearchResults] = useState([]) // Search results for new chats
  const [chats, setChats] = useState({})
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastMessages, setLastMessages] = useState({})
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats, selectedStudent])

  // Fetch students with existing chats
  useEffect(() => {
    const fetchStudentsWithChats = async () => {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return;
      
      setLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/edu_admin/chat/admin/students/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.students) {
          // Only include students who have existing chat messages
          const studentsWithChats = [];
          
          await Promise.all(
            data.students.map(async (student) => {
              try {
                const resMsg = await fetch(`http://127.0.0.1:8000/edu_admin/chat/admin/${student.id}/`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const messages = await resMsg.json();
                
                // Only add student if they have messages in admin chat
                if (messages && messages.length > 0) {
                  const lastMessage = messages[messages.length - 1];
                  // Only count messages from student that are not seen by admin
                  // AND make sure the sender is actually a student (not admin/instructor)
                  // AND only count messages from admin chat room
                  const unreadCount = messages.filter(msg => 
                    msg.sender.id === student.id && 
                    msg.sender.role === 'student' && 
                    !msg.is_seen
                  ).length;
                  
                  studentsWithChats.push({
                    ...student,
                    avatar: `${student.first_name?.charAt(0) || student.username?.charAt(0)}${student.last_name?.charAt(0) || student.username?.charAt(1) || ''}`.toUpperCase(),
                    status: onlineUsers.has(student.id) ? "online" : "offline",
                    lastSeen: onlineUsers.has(student.id) ? "now" : "recently",
                    unreadCount: unreadCount,
                    lastMessage: lastMessage,
                    lastMessageTime: new Date(lastMessage.created_at)
                  });
                  
                  // Update last messages
                  setLastMessages(prev => ({
                    ...prev,
                    [student.id]: lastMessage
                  }));
                }
              } catch (err) {
                console.error(`Error fetching messages for student ${student.id}`, err);
              }
            })
          );
          
          // Sort by most recent message time
          studentsWithChats.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
          setStudents(studentsWithChats);
        }
      } catch (err) {
        console.error("Error fetching students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentsWithChats();
  }, [onlineUsers]);

  // Function to refresh unread counts for all students
  const refreshUnreadCounts = async () => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    const updatedStudents = await Promise.all(
      students.map(async (student) => {
        try {
          const resMsg = await fetch(`http://127.0.0.1:8000/edu_admin/chat/admin/${student.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const messages = await resMsg.json();
          
          if (messages && messages.length > 0) {
            const unreadCount = messages.filter(msg => 
              msg.sender.id === student.id && 
              msg.sender.role === 'student' && 
              !msg.is_seen
            ).length;
            
            return { ...student, unreadCount };
          }
          return { ...student, unreadCount: 0 };
        } catch (err) {
          console.error(`Error refreshing unread count for student ${student.id}`, err);
          return student;
        }
      })
    );
    
    setStudents(updatedStudents);
  };

  // Periodic refresh of unread counts every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (students.length > 0 && !selectedStudent) {
        refreshUnreadCounts();
      }
    }, 30000); // Refresh every 30 seconds when not in a chat

    return () => clearInterval(interval);
  }, [students, selectedStudent]);

  // Refresh unread counts when window gains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (students.length > 0) {
        refreshUnreadCounts();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && students.length > 0) {
        refreshUnreadCounts();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [students]);

  // Fetch all students for search functionality
  useEffect(() => {
    const fetchAllStudents = async () => {
      const token = sessionStorage.getItem("accessToken");
      if (!token) return;
      
      try {
        const res = await fetch("http://127.0.0.1:8000/edu_admin/chat/admin/students/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (data.students) {
          const allStudentsWithMetadata = data.students.map(student => ({
            ...student,
            avatar: `${student.first_name?.charAt(0) || student.username?.charAt(0)}${student.last_name?.charAt(0) || student.username?.charAt(1) || ''}`.toUpperCase(),
            status: onlineUsers.has(student.id) ? "online" : "offline",
            lastSeen: onlineUsers.has(student.id) ? "now" : "recently",
          }));
          setAllStudents(allStudentsWithMetadata);
        }
      } catch (err) {
        console.error("Error fetching all students", err);
      }
    };
    fetchAllStudents();
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allStudents.filter((student) => 
        student.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allStudents]);

  // Fetch messages when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;
    
    const fetchMessages = async () => {
      const token = sessionStorage.getItem("accessToken");
      try {
        const res = await fetch(`http://127.0.0.1:8000/edu_admin/chat/admin/${selectedStudent.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        const formattedMessages = data.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender.id === selectedStudent.id ? "student" : "admin",
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: msg.is_seen ? "read" : msg.is_delivered ? "delivered" : "sent",
          senderData: msg.sender,
          is_seen: msg.is_seen,
          is_delivered: msg.is_delivered
        }));
        
        setChats(prev => ({
          ...prev,
          [selectedStudent.id]: formattedMessages
        }));

        // Mark messages as read and update unread count
        await markMessagesAsRead(selectedStudent.id);
        
        // Update the local student's unread count to 0 since we just read the messages
        setStudents(prev => prev.map(s => 
          s.id === selectedStudent.id ? { ...s, unreadCount: 0 } : s
        ));
        
      } catch (err) {
        console.error("Error fetching chat messages", err);
      }
    };
    fetchMessages();
  }, [selectedStudent]);

  // Mark messages as read
  const markMessagesAsRead = async (studentId) => {
    const token = sessionStorage.getItem("accessToken");
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/edu_admin/chat/admin/${studentId}/mark_messages_read/`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        // Update unread count locally immediately
        setStudents(prev => prev.map(s => 
          s.id === studentId ? { ...s, unreadCount: 0 } : s
        ));
        
        // Also update the chats state to mark student messages as read
        setChats(prev => ({
          ...prev,
          [studentId]: (prev[studentId] || []).map(msg => 
            msg.sender === "student" ? { ...msg, status: "read", is_seen: true } : msg
          )
        }));
      }
      
    } catch (err) {
      console.error("Error marking messages as read", err);
    }
  };

  // WebSocket connection for real-time messaging
  useEffect(() => {
    if (!selectedStudent) return;

    const token = sessionStorage.getItem("accessToken");
    if (!token) return;

    // Create WebSocket connection with error handling
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${selectedStudent.id}/admin/`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected for student:", selectedStudent.id);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chat') {
            const newMessage = {
              id: Date.now(),
              text: data.content || data.message, // Support both content and message for backward compatibility
              sender: data.sender_id === selectedStudent.id ? "student" : "admin",
              timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              status: data.is_seen ? "read" : data.is_delivered ? "delivered" : "sent",
              is_seen: data.is_seen || false,
              is_delivered: data.is_delivered || false
            };

            setChats(prev => ({
              ...prev,
              [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newMessage]
            }));

            // If message is from student, show notification
            if (data.sender_id === selectedStudent.id && data.sender_role === 'student') {
              setNotifications(prev => [
                ...prev,
                {
                  id: Date.now(),
                  studentName: selectedStudent.first_name + " " + selectedStudent.last_name,
                  message: data.content || data.message,
                  timestamp: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
              
              // Update unread count if chat is not active
              setStudents(prev => prev.map(s => 
                s.id === selectedStudent.id ? { ...s, unreadCount: s.unreadCount + 1 } : s
              ));
            }
          } else if (data.type === 'message_read') {
            // Handle message read status updates
            setChats(prev => ({
              ...prev,
              [selectedStudent.id]: (prev[selectedStudent.id] || []).map(msg => 
                msg.id === data.message_id ? { ...msg, status: "read", is_seen: true } : msg
              )
            }));
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket disconnected for student:", selectedStudent.id);
      };

      ws.onerror = (error) => {
        console.warn("⚠️ WebSocket error (chat will work without real-time updates):", error);
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.warn("⚠️ WebSocket connection failed (chat will work without real-time updates):", error);
    }
  }, [selectedStudent]);

  // Send message function
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedStudent) return;

    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://127.0.0.1:8000/edu_admin/chat/admin/${selectedStudent.id}/send/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputValue }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const newMessage = {
          id: data.id,
          text: data.content,
          sender: "admin",
          timestamp: new Date(data.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: data.is_seen ? "read" : data.is_delivered ? "delivered" : "sent",
          is_seen: data.is_seen || false,
          is_delivered: data.is_delivered || false
        };

        setChats(prev => ({
          ...prev,
          [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newMessage]
        }));

        setInputValue("");
        
        // If this was a new conversation, add the student to the main students list
        const existingStudent = students.find(s => s.id === selectedStudent.id);
        if (!existingStudent) {
          const newStudentEntry = {
            ...selectedStudent,
            unreadCount: 0,
            lastMessage: data,
            lastMessageTime: new Date(data.created_at)
          };
          
          setStudents(prev => [newStudentEntry, ...prev]);
          setLastMessages(prev => ({
            ...prev,
            [selectedStudent.id]: data
          }));
        }
      }
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsMinimized(mobile)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter students based on search
  const displayedStudents = searchTerm.trim() ? searchResults : students;

  // Get total unread count
  const totalUnreadCount = students.reduce((total, student) => total + (student.unreadCount || 0), 0)

  const selectStudent = (student) => {
    setSelectedStudent(student)
    // Clear search when selecting a student
    setSearchTerm("")
    setSearchResults([])
    
    // Immediately update unread count to 0 for better UX
    setStudents(prev => prev.map(s => 
      s.id === student.id ? { ...s, unreadCount: 0 } : s
    ));
    
    // Only mark messages as read if the student has existing chats
    const existingStudent = students.find(s => s.id === student.id)
    if (existingStudent && existingStudent.unreadCount > 0) {
      markMessagesAsRead(student.id)
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  const getStudentDisplayName = (student) => {
    if (student.first_name && student.last_name) {
      return `${student.first_name} ${student.last_name}`
    }
    return student.username
  }

  const getLastMessagePreview = (studentId) => {
    const studentChats = chats[studentId]
    if (studentChats && studentChats.length > 0) {
      const lastMessage = studentChats[studentChats.length - 1]
      return lastMessage.text.length > 30 ? lastMessage.text.substring(0, 30) + "..." : lastMessage.text
    }
    
    // Check if there's a last message from the initial fetch
    const lastMsg = lastMessages[studentId]
    if (lastMsg) {
      const content = lastMsg.content || lastMsg.message || ""
      return content.length > 30 ? content.substring(0, 30) + "..." : content
    }
    
    return "No messages yet"
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  // Mobile minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="relative flex items-center space-x-2 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg hover:opacity-90 transition-colors bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Student Chat</span>
          <span className="sm:hidden">Chat</span>
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
              {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
            </span>
          )}
        </button>
      </div>
    )
  }

  // Mobile full-screen overlay
  // if (isMobile && !isMinimized) {
    if (isMobile && !isMinimized) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            {selectedStudent ? (
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-gray-600">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{selectedStudent ? getStudentDisplayName(selectedStudent) : "Student Chat"}</h3>
              {selectedStudent ? (
                <p className="text-xs text-gray-500">
                  {selectedStudent.status === "online" ? "Online" : `Last seen ${selectedStudent.lastSeen}`}
                </p>
              ) : (
                <p className="text-xs text-green-600">{students.filter((s) => s.status === "online").length} online</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {selectedStudent && (
              <>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Video className="h-5 w-5" />
                </button>
              </>
            )}
            {!selectedStudent && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-gray-600"
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setIsMinimized(true)} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Content */}
        {!selectedStudent ? (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading students...</div>
              ) : displayedStudents.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm.trim() ? "No students found" : "No recent chats"}
                </div>
              ) : (
                displayedStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="flex items-center space-x-4 p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer border-b border-gray-100"
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50">
                        <span className="text-base font-medium text-primary">{student.avatar}</span>
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white ${
                          student.status === "online" ? "bg-green-400" : "bg-gray-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-gray-900 truncate">{getStudentDisplayName(student)}</p>
                        {student.unreadCount > 0 && (
                          <span className="text-white text-xs rounded-full h-6 w-6 flex items-center justify-center bg-primary ml-2">
                            {student.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {student.status === "online" ? "Online" : `Last seen ${student.lastSeen}`}
                      </p>
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {searchTerm.trim() ? "Start new conversation" : getLastMessagePreview(student.id)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(chats[selectedStudent.id] || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "admin" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === "student" ? "" : "bg-gray-100"
                      }`}
                      style={message.sender === "student" ? { backgroundColor: "#e8f2ff" } : {}}
                    >
                      {message.sender === "student" ? (
                        <span className="text-sm font-medium text-primary">{selectedStudent.avatar}</span>
                      ) : (
                        <User className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.sender === "student" ? "bg-gray-100 text-gray-900" : "text-white"
                        }`}
                        style={message.sender === "admin" ? { backgroundColor: "#2064d4" } : {}}
                      >
                        <p className="text-base">{message.text}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1">
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                        {message.sender === "admin" && (
                          <span
                            className={`text-xs font-medium ${
                              message.status === "read"
                                ? "text-blue-500"
                                : message.status === "delivered"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                            }`}
                          >
                            {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${getStudentDisplayName(selectedStudent)}...`}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-3 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-primary hover:bg-primary/90"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Mobile Notifications Overlay */}
        {showNotifications && (
          <div className="absolute inset-0 bg-white z-10">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h4 className="font-semibold text-gray-900 text-lg">New Messages</h4>
              <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">No new notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <p className="font-medium text-gray-900">{notification.studentName}</p>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-gray-400 text-sm mt-2">{notification.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop/Tablet view (original design with responsive improvements)
  return (
    <div className="w-full sm:w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Student Chat</h3>
            <p className="text-xs text-green-600">{students.filter((s) => s.status === "online").length} online</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1 sm:p-2 text-gray-400 hover:text-gray-600"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          <button onClick={() => setIsMinimized(true)} className="p-1 sm:p-2 text-gray-400 hover:text-gray-600">
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 w-64 sm:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900">New Messages</h4>
            <button onClick={clearNotifications} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                  <p className="font-medium text-gray-900 text-sm">{notification.studentName}</p>
                  <p className="text-gray-600 text-sm truncate">{notification.message}</p>
                  <p className="text-gray-400 text-xs">{notification.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!selectedStudent ? (
        // Student List View
        <>
          {/* Search */}
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading students...</div>
            ) : displayedStudents.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm.trim() ? "No students found" : "No recent chats"}
              </div>
            ) : (
              displayedStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => selectStudent(student)}
                  className="flex items-center space-x-3 p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-50">
                      <span className="text-sm font-medium text-primary">{student.avatar}</span>
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        student.status === "online" ? "bg-green-400" : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{getStudentDisplayName(student)}</p>
                      {student.unreadCount > 0 && (
                        <span className="text-white text-xs rounded-full h-5 w-5 flex items-center justify-center bg-primary">
                          {student.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {student.status === "online" ? "Online" : `Last seen ${student.lastSeen}`}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {searchTerm.trim() ? "Start new conversation" : getLastMessagePreview(student.id)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        // Chat View
        <>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSelectedStudent(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
              <div className="relative">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-50">
                  <span className="text-sm font-medium text-primary">{selectedStudent.avatar}</span>
                </div>
                <div
                  className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${
                    selectedStudent.status === "online" ? "bg-green-400" : "bg-gray-400"
                  }`}
                ></div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{getStudentDisplayName(selectedStudent)}</h4>
                <p className="text-xs text-gray-500">
                  {selectedStudent.status === "online" ? "Online" : `Last seen ${selectedStudent.lastSeen}`}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Phone className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Video className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {(chats[selectedStudent.id] || []).map((message) => (
              <div key={message.id} className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-xs sm:max-w-sm ${message.sender === "admin" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === "student" ? "" : "bg-gray-100"
                    }`}
                    style={message.sender === "student" ? { backgroundColor: "#e8f2ff" } : {}}
                  >
                    {message.sender === "student" ? (
                      <span className="text-xs font-medium text-primary">{selectedStudent.avatar}</span>
                    ) : (
                      <User className="h-3 w-3 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.sender === "student" ? "bg-gray-100 text-gray-900" : "text-white"
                      }`}
                      style={message.sender === "admin" ? { backgroundColor: "#2064d4" } : {}}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <p className="text-xs text-gray-500">{message.timestamp}</p>
                      {message.sender === "admin" && (
                        <span
                          className={`text-xs font-medium ${
                            message.status === "read"
                              ? "text-blue-500"
                              : message.status === "delivered"
                                ? "text-gray-500"
                                : "text-gray-400"
                          }`}
                        >
                          {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${getStudentDisplayName(selectedStudent)}...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                className="p-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
