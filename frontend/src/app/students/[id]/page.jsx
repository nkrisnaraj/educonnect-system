"use client";
import { useAuth } from "@/context/AuthContext";
import { Bell, CreditCard } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";

export default function StudentPage() {
  const {user, accessToken, refreshToken, refreshAccessToken, logout,api,loading} = useAuth();
  const router = useRouter();
  const {id} = useParams();

  const [selectedChat, setSelectedChat] = useState('instructor');
  const [instructorMessages, setInstructorMessages] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [enrollClasses, setEnrollClasses] = useState([]);

  const [inputMessage, setInputMessage] = useState('');
  // const bottomRef = useRef(null);

  const messages = selectedChat === 'instructor' ? instructorMessages : adminMessages;

  // useEffect(()=>{
  //   const role = sessionStorage.getItem("userRole");
  //   const token = sessionStorage.getItem("accessToken");
  //   if(!token || !user || role !== "student"){
  //     router.push("/login");
  //   }
  // }, [user]);

  // useEffect(() => {
  //     const role = sessionStorage.getItem("userRole");
  //     if (!role || role !== 'students') {
  //       router.replace("/login");
  //     }
  //   }, []);
  
  //   if (!user || user.role !== 'students') {
  //     return null; // or a loading spinner
  //   }

  // useEffect(() => {
  //   bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);


  console.log(accessToken);

  const fetchEnrolledClass = async () => {
    try {
      const enrollClass = await api.get("/students/enroll-class/" ,{
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      console.log("Enrolled Classes:", enrollClass.data);
      //const result = enrollClass.data?.enrolled_classes || [];
      setEnrollClasses(enrollClass.data || []);

    } catch (error) {
      console.error("Failed to fetch enrolled classes", error);
      
    }
  }

  useEffect(() => {
  if (!loading && accessToken) {
    fetchEnrolledClass();
  }
}, [loading, accessToken]);

  
  const loadMessages = async (token) => {
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


  const today = new Date();
  const formatdate = today.toLocaleDateString("en-GB",{
    weekday:"long",
    year:"numeric",
    month:"long",
    day:"numeric"
  })


  // const courses = [
  //   {
  //     title: "Object Oriented Programming",
  //     icon: "/placeholder.svg",
  //   },
  //   {
  //     title: "Fundamentals of Database Systems",
  //     icon: "/placeholder.svg",
  //   },
   
  // ];

//const User = sessionStorage.getItem("user");
//console.log("User:", User);
console.log("messages:", messages);
  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="relative z-10 p-4">
          <p className="text-sm mb-6">{formatdate}</p>
          <h1 className="text-xl md:text-3xl font-bold mb-2">Welcome back {user?.first_name || 'Student'}!</h1>
          <p className="text-sm opacity-90">Always stay updated in your student portal</p>
        </div>
        <div className="absolute right-4 bottom-0 hidden sm:block">
          <Image
            src={"/student.png"}
            alt="Student illustration"
            width={280}
            height={150}
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Content */}
        <div className="w-full lg:w-8/12 flex flex-col gap-6">
          {/* Ad Section */}
          <div>
            <h2 className="text-lg font-bold mb-2">New Classes</h2>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <p className="text-xs font-semibold mb-1">SPECIAL OFFER</p>
                <h3 className="text-lg font-bold mb-1">50% Off Tuition Fee</h3>
                <p className="text-xs mb-3">For early payment before October 15</p>
                <button className="bg-white text-blue-600 px-4 py-1.5 rounded-md text-xs font-medium">
                  Learn More
                </button>
              </div>

              <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                <div className="bg-white/20 rounded-full p-3">
                  <CreditCard className="w-14 h-14" />
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
              <h2 className="text-lg font-bold">Enrolled Courses</h2>
              <a href="#" className="text-purple-500 text-sm">See all</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {
                enrollClasses.length === 0 ? ( 
                  <p>No enrolled classes found.</p>
                ) : (
                  enrollClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-6 bg-white border rounded-xl shadow-xl hover:bg-blue-600 hover:text-white transition"
                >
                  <div>
                    <h3 className="text-md font-semibold mb-2">{cls.title}</h3>
                    <button onClick = {()=>{router.push(`/students/${id}/courses`)}} className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
                      View
                    </button>
                  </div>
                  
                </div>
                ))
                )
              }
              
            </div>
          </div>
        </div>

        {/* Right Content (Chat Box) */}
       <div className="w-full lg:w-4/12 border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
      {/* Header with chat target selector */}
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
        {messages?.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              msg.sender === 'student' ? 'flex-row-reverse' : ''
            }`}
          >
            {/* {msg.sender !== 'student' && (
              <Image src="/images/icons/profile1.png" alt={msg.sender} width={40} height={40} className="rounded-full mt-1" />
            )} */}
            <div
              className={`rounded-lg p-2 text-sm max-w-[80%] ${
                msg.sender === 'student' ? 'bg-purple-100' : 'bg-gray-100'
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-xs text-gray-500 mt-1 block">{msg.time}</span>
            </div>
            
          </div>
        ))}
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
  </div>
  </div>
  );
}
