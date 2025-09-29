"use client";
import { useAuth } from "@/context/AuthContext";
import { Bell, BookAIcon, BookOpenCheck, CreditCard } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";
import { Check } from "lucide-react";
import StudentChatBox from "@/components/student/StudentChatBox";
import { AnimatePresence, motion } from "framer-motion";




export default function StudentPage() {
  const {user, accessToken, refreshToken, refreshAccessToken, logout,api,loading} = useAuth();
  const router = useRouter();
  const {id} = useParams();
  const [selectedChat, setSelectedChat] = useState('instructor');
  const [instructorMessages, setInstructorMessages] = useState([]);
  const [adminMessages, setAdminMessages] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [activeEnrolledClasses, setActiveEnrolledClasses] = useState([]);
  const receiverId = selectedChat === 'admin' ? "admin" : "instructor";
  const messages = selectedChat === 'instructor' ? instructorMessages : adminMessages;
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  


useEffect(() => {
      const fetchAllClasses = async () => {
        try {
          // Wait for AuthContext to finish loading
          if (loading) {
            console.log("Auth context still loading, waiting...");
            return;
          }
          
          if (!accessToken) {
            console.log("No access token available");
            return;
          }
          
          console.log("Making API call with token:", accessToken ? 'Token exists' : 'No token');
          const response = await api.get("/students/classes/",{
            headers:{
              Authorization: `Bearer ${accessToken}`
            }
          });
          console.log("Fetched Classes:", response.data);
          setClasses(response.data.others || []);
          setEnrolledClasses(response.data.enrolled || []);
          
          // Filter for active enrolled classes only
          const currentDate = new Date();
          const activeClasses = (response.data.enrolled || []).filter(cls => {
            const startDate = new Date(cls.start_date);
            const endDate = new Date(cls.end_date);
            return startDate <= currentDate && endDate >= currentDate;
          });
          setActiveEnrolledClasses(activeClasses);
        } catch (error) {
          console.error("Error fetching classes:", error);
          // If it's a 401 error, try to refresh token manually
          if (error.response?.status === 401) {
            console.log("Got 401, attempting manual token refresh");
            try {
              const newToken = await refreshAccessToken();
              if (newToken) {
                console.log("Token refreshed, retrying in 2 seconds...");
                setTimeout(() => fetchAllClasses(), 2000);
              }
            } catch (refreshError) {
              console.error("Failed to refresh token:", refreshError);
            }
          }
        }
      };

      fetchAllClasses();
    }, [accessToken, loading]); // Add loading dependency

  useEffect(() => {
    if (classes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % classes.length);
    }, 10000); 
    return () => clearInterval(interval); // cleanup on unmount
  }, [classes.length]);

  console.log(accessToken);

  const fetchEnrolledClass = async () => {
    try {
      if (loading) {
        console.log("Auth not ready for enrolled classes fetch");
        return;
      }
      
      if (!accessToken) {
        console.log("No access token for enrolled classes");
        return;
      }
      
      console.log("Fetching enrolled classes with token:", accessToken ? 'Token exists' : 'No token');
      const enrollClass = await api.get("/students/enroll-class/",{
        headers:{
          Authorization: `Bearer ${accessToken}`
        }
      });
      console.log("Enrolled Classes:", enrollClass.data);
      setEnrolledClasses(enrollClass.data || []);

    } catch (error) {
      console.error("Failed to fetch enrolled classes", error);
      // Handle 401 errors with manual refresh
      if (error.response?.status === 401) {
        console.log("Got 401 for enrolled classes, attempting manual refresh");
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            console.log("Token refreshed for enrolled classes, retrying in 2 seconds...");
            setTimeout(() => fetchEnrolledClass(), 2000);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token for enrolled classes:", refreshError);
        }
      }
    }
  }

  useEffect(() => {
    if (!loading && accessToken) {
      fetchEnrolledClass();
    }
  }, [loading, accessToken]); // Add loading dependency

  const markMessagesReadStudent = async (token) => {
    await axios.post(`http://127.0.0.1:8000/students/mark_messages_read_student/`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const renderTick = (msg) => {
    if (msg.is_seen) return <DoubleTick color="blue" />;
    if (msg.is_delivered) return <DoubleTick color="gray" />;
    return <SingleTick />;
  };

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
        is_delivered: msg.is_delivered,
        is_seen: msg.is_seen,
      })
    );
    if (selectedChat === "instructor") {
      setInstructorMessages(transformed);
      await markMessagesReadStudent(token);
    } else {
      setAdminMessages(transformed);
      await markMessagesReadStudent(token);
    }
  };

  const [formatdate, setFormatdate] = useState("");

  // Fix hydration mismatch by setting date on client side
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    setFormatdate(formattedDate);
  }, []);

//console.log("messages:", messages);
  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="relative z-10 p-4">
          <p className="text-sm mb-6">{formatdate || "Loading date..."}</p>
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
            {classesLoading ? (
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <p>Loading new classes...</p>
                </div>
              </div>
            ) : classes.length === 0 ? (
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 text-white relative overflow-hidden">
                <p>No New Classes found</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentAdIndex}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9 }}
                  transition={{ 
                    duration: 1,
                    ease: [0.4, 0.0, 0.2, 1], // Custom ease curve for smooth transitions
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-6 text-white relative overflow-hidden"
                >
                  <div className="relative z-10 space-y-3">
                    <p className="text-xl font-semibold mb-1">
                      {classes[currentAdIndex]?.title}
                    </p>
                    <h3 className="text-lg font-bold mb-1">
                      RS.{classes[currentAdIndex]?.fee}
                    </h3>
                    <p className="text-sm mb-4 opacity-90">
                      Start- {classes[currentAdIndex]?.start_date}
                    </p>
                    <button
                      onClick={()=>{router.push(`/students/${id}/classes`)}}
                      className="bg-white text-blue-600 px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      Learn More
                    </button>
                  </div>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden sm:block">
                    <div className="bg-white rounded-full p-4">
                      <BookOpenCheck className="w-20 h-20 text-primary" />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Enrolled Courses */}
          <div>
            <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
              <h2 className="text-lg font-bold">Enrolled Courses</h2>
              <a href="#" className="text-purple-500 text-sm">See all</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {
                activeEnrolledClasses.length === 0 ? ( 
                  <p>No active enrolled classes found.</p>
                ) : (
                  activeEnrolledClasses.map((cls, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-6 bg-white border rounded-xl shadow-xl hover:bg-blue-600 hover:text-white transition"
                >
                  <div>
                    <h3 className="text-md font-semibold mb-2">{cls.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Rs {cls.fee}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                    <button onClick = {()=>{router.push(`/students/${id}/classes`)}} className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition">
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
        <StudentChatBox  />
      </div>
  </div>
  </div>
  );
}


