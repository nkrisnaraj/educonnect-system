"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";

const studentChatBox = ({  }) => {
    const [inputMessage, setInputMessage] = useState('');
    const [selectedChat, setSelectedChat] = useState('instructor');
    const [instructorMessages, setInstructorMessages] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const {user, accessToken, refreshToken, refreshAccessToken, logout,api,loading} = useAuth();
    const messages = selectedChat === 'instructor' ? instructorMessages : adminMessages;
    const renderTick = (msg) => {
    if (msg.is_seen) return <DoubleTick color="blue" />;
    if (msg.is_delivered) return <DoubleTick color="gray" />;
    return <SingleTick />;
  };
  // const bottomRef = useRef(null);

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  const loadMessages = async (token) => {
    // await axios.post(`http://127.0.0.1:8000/students/mark_messages_read_student/`, {}, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });
  const response = await axios.get(
      `http://127.0.0.1:8000/students/messages/${selectedChat}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const transformed = (Array.isArray(response.data) ? response.data : []).map(
      (msg) => ({
        sender: msg.sender.role,
        text: msg.message,
        time: new Date(msg.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        is_delivered: msg.is_delivered,
        is_seen: msg.is_seen,
      })
    );
    if (selectedChat === "instructor") {
      setInstructorMessages(transformed);
    } else {
      setAdminMessages(transformed);
    }
  };

    useEffect(() => {
      const fetchChat = async () => {
        if (!accessToken || !refreshToken) {
          console.log("Tokens not ready yet");
          return;
        }
        try {
          await loadMessages(accessToken);
        } catch (error) {
          console.error("Failed to fetch messages", error);
    
          if (error.response?.status === 401) {
            // token expired, try refreshing
            try {
              const newAccess = await refreshAccessToken();
              await loadMessages(newAccess);
            } catch (refreshErr) {
              console.error("Failed to refresh token", refreshErr);
              logout();
            }
          } else {
            console.error("Other error:", error);
          }
        }
      };
      fetchChat();
    }, [selectedChat, accessToken, refreshAccessToken, logout]);
    
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }
    const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messagePayload = {
      message: inputMessage,
    };
    console.log("messagePayload", messagePayload);
    const token = sessionStorage.getItem("accessToken");

    try {
      const response = await axios.post(`http://127.0.0.1:8000/students/messages/${selectedChat}/send/`,
        messagePayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      const savedMessage = {
        sender: 'student',
        text: response.data.message,
        time: new Date(response.data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_delivered: response.data.is_delivered || false,
        is_seen: response.data.is_seen || false,
      };

      if (selectedChat === 'instructor') {
        setInstructorMessages((prev) => [...prev, savedMessage]);
      } else {
        setAdminMessages((prev) => [...prev, savedMessage]);
      }

      setInputMessage('');
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };
  return (
     <div className="w-full  border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
      <div className="bg-primary p-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-white text-md">Chat with {selectedChat === 'instructor' ? 'Instructor' : 'Admin'}</h3>
        <select
          value={selectedChat}
          onChange={(e) => setSelectedChat(e.target.value)}
          className="text-sm rounded p-1 text-white bg-accent font-semibold"
        >
          <option value="instructor">Instructor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Chat messages */}
      <div className="bg-white p-3 flex-1 overflow-y-auto flex flex-col space-y-3">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              msg.sender === 'student' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`relative rounded-lg p-2 text-sm max-w-[80%] ${
                msg.sender === 'student' ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-xs text-gray-500 mt-1 block">{msg.time}</span>

              {msg.sender === 'student' && (
               <div className="absolute bottom-1 right-2 flex items-center gap-1 text-xs">
                {renderTick(msg)}
              </div>
                    )}
            </div>
          </div>
        ))}
        {/* <div ref={bottomRef} /> */}

      </div>

      {/* Input Box */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex gap-2">
         <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-primary text-white rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
          </button>
        </div>
      </div>
    </div>
    
  )
}

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

export default studentChatBox