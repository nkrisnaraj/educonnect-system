"use client"

import { useState, useEffect } from "react"
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

// Mock student data
const students = [
  { id: 1, name: "John Smith", avatar: "JS", status: "online", lastSeen: "now", unreadCount: 2 },
  { id: 2, name: "Sarah Johnson", avatar: "SJ", status: "offline", lastSeen: "2 hours ago", unreadCount: 0 },
  { id: 3, name: "Mike Davis", avatar: "MD", status: "online", lastSeen: "now", unreadCount: 1 },
  { id: 4, name: "Emily Brown", avatar: "EB", status: "offline", lastSeen: "1 day ago", unreadCount: 0 },
  { id: 5, name: "David Wilson", avatar: "DW", status: "online", lastSeen: "now", unreadCount: 3 },
  { id: 6, name: "Lisa Anderson", avatar: "LA", status: "offline", lastSeen: "5 minutes ago", unreadCount: 0 },
  { id: 7, name: "Alex Chen", avatar: "AC", status: "online", lastSeen: "now", unreadCount: 1 },
  { id: 8, name: "Maria Garcia", avatar: "MG", status: "offline", lastSeen: "3 hours ago", unreadCount: 0 },
]

// Mock chat messages for each student
const mockChats = {
  1: [
    {
      id: 1,
      text: "Hello sir, I have a question about today's assignment",
      sender: "student",
      timestamp: "10:30 AM",
      status: "delivered",
    },
    {
      id: 2,
      text: "Hi John! Sure, what would you like to know?",
      sender: "admin",
      timestamp: "10:32 AM",
      status: "read",
    },
    {
      id: 3,
      text: "I'm having trouble with question 5. Could you help me understand the concept?",
      sender: "student",
      timestamp: "10:35 AM",
      status: "delivered",
    },
  ],
  2: [
    {
      id: 1,
      text: "Good morning! When is the next exam scheduled?",
      sender: "student",
      timestamp: "9:15 AM",
      status: "read",
    },
    {
      id: 2,
      text: "Good morning Sarah! The exam is scheduled for next Friday at 10 AM.",
      sender: "admin",
      timestamp: "9:20 AM",
      status: "read",
    },
  ],
  3: [
    {
      id: 1,
      text: "Can I get an extension for the project deadline?",
      sender: "student",
      timestamp: "2:45 PM",
      status: "delivered",
    },
  ],
  5: [
    {
      id: 1,
      text: "I missed today's class. Can you share the notes?",
      sender: "student",
      timestamp: "3:20 PM",
      status: "delivered",
    },
    {
      id: 2,
      text: "Also, what's the homework for tomorrow?",
      sender: "student",
      timestamp: "3:21 PM",
      status: "delivered",
    },
    {
      id: 3,
      text: "Is there any makeup class this week?",
      sender: "student",
      timestamp: "3:22 PM",
      status: "delivered",
    },
  ],
  7: [
    {
      id: 1,
      text: "Thank you for the feedback on my presentation!",
      sender: "student",
      timestamp: "1:10 PM",
      status: "delivered",
    },
  ],
}
// Fetch students on mount and get last message for each
useEffect(() => {
  const fetchStudents = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch("http://127.0.0.1:8000/instructor/chat/instructor/students/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data.students);
      // For each student, fetch their last message
      const lastMsgObj = {};
      await Promise.all(
        data.students.map(async (student) => {
          try {
            const resMsg = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${student.id}/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const messages = await resMsg.json();
            if (messages && messages.length > 0) {
              lastMsgObj[student.id] = messages[messages.length - 1];
            }
          } catch (err) {
            // ignore error for individual student
          }
        })
      );
      setLastMessages(lastMsgObj);
    } catch (err) {
      console.error("Error fetching students", err);
    } finally {
      setLoading(false);
    }
  };
  fetchStudents();
}, []);

// Fetch messages when a student is selected
useEffect(() => {
  if (!selectedStudent) return;
  const fetchMessages = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch(`http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatMessages(data);
    } catch (err) {
      console.error("Error fetching chat messages", err);
    }
  };
  fetchMessages();
}, [selectedStudent]);

const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedStudent) return;
  const token = sessionStorage.getItem("accessToken");
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/instructor/chat/instructor/${selectedStudent}/send/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      }
    );
    const data = await res.json();
    setChatMessages((prev) => [...prev, data]);
    setNewMessage("");
  } catch (err) {
    console.error("Error sending message", err);
  }
};

export default function Chatbot() {
  const [isMinimized, setIsMinimized] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [chats, setChats] = useState(mockChats)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if device is mobile
//   useEffect(() => {
//   const isMobile = window.innerWidth < 768
//   setIsMobile(isMobile)
//   setIsMinimized(isMobile)
// }, [])

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsMinimized(mobile)
    }

    checkMobile()
    console.log("ismobile in set ", isMobile);
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  },[])


  // Filter students based on search
  const filteredStudents = students.filter((student) => student.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Get total unread count
  const totalUnreadCount = students.reduce((total, student) => total + student.unreadCount, 0)

  // Simulate receiving new messages
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly send a message from a student
      if (Math.random() > 0.98) {
        // 2% chance every second
        const randomStudent = students[Math.floor(Math.random() * students.length)]
        const newMessage = {
          id: Date.now(),
          text: "New message from student",
          sender: "student",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "delivered",
        }

        setChats((prev) => ({
          ...prev,
          [randomStudent.id]: [...(prev[randomStudent.id] || []), newMessage],
        }))

        // Add notification
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            studentName: randomStudent.name,
            message: newMessage.text,
            timestamp: newMessage.timestamp,
          },
        ])

        // Update unread count
        const studentIndex = students.findIndex((s) => s.id === randomStudent.id)
        if (studentIndex !== -1) {
          students[studentIndex].unreadCount += 1
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = () => {
    if (inputValue.trim() && selectedStudent) {
      const newMessage = {
        id: Date.now(),
        text: inputValue,
        sender: "admin",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
      }

      setChats((prev) => ({
        ...prev,
        [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newMessage],
      }))

      setInputValue("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const selectStudent = (student) => {
    setSelectedStudent(student)
    // Mark messages as read
    const studentIndex = students.findIndex((s) => s.id === student.id)
    if (studentIndex !== -1) {
      students[studentIndex].unreadCount = 0
    }
  }

  const clearNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
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
              <h3 className="font-semibold text-gray-900">{selectedStudent ? selectedStudent.name : "Student Chat"}</h3>
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
              {filteredStudents.map((student) => (
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
                      <p className="text-base font-medium text-gray-900 truncate">{student.name}</p>
                      {student.unreadCount > 0 && (
                        <span className="text-white text-xs rounded-full h-6 w-6 flex items-center justify-center bg-primary ml-2">
                          {student.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {student.status === "online" ? "Online" : `Last seen ${student.lastSeen}`}
                    </p>
                    {chats[student.id] && chats[student.id].length > 0 && (
                      <p className="text-sm text-gray-400 truncate mt-1">
                        {chats[student.id][chats[student.id].length - 1].text}
                      </p>
                    )}
                  </div>
                </div>
              ))}
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
                            className={`text-xs ${
                              message.status === "read"
                                ? ""
                                : message.status === "delivered"
                                  ? "text-gray-500"
                                  : "text-gray-400"
                            }`}
                            style={message.status === "read" ? { color: "#2064d4" } : {}}
                          >
                            {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Message ${selectedStudent.name}...`}
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
            {filteredStudents.map((student) => (
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
                    <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                    {student.unreadCount > 0 && (
                      <span className="text-white text-xs rounded-full h-5 w-5 flex items-center justify-center bg-primary">
                        {student.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {student.status === "online" ? "Online" : `Last seen ${student.lastSeen}`}
                  </p>
                  {chats[student.id] && chats[student.id].length > 0 && (
                    <p className="text-xs text-gray-400 truncate mt-1">
                      {chats[student.id][chats[student.id].length - 1].text}
                    </p>
                  )}
                </div>
              </div>
            ))}
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
                <h4 className="font-semibold text-gray-900 text-sm">{selectedStudent.name}</h4>
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
                          className={`text-xs ${
                            message.status === "read"
                              ? ""
                              : message.status === "delivered"
                                ? "text-gray-500"
                                : "text-gray-400"
                          }`}
                          style={message.status === "read" ? { color: "#2064d4" } : {}}
                        >
                          {message.status === "read" ? "✓✓" : message.status === "delivered" ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${selectedStudent.name}...`}
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
