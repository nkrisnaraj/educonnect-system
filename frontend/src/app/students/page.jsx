"use client";
import { Bell, CreditCard } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StudentPage() {
  const router = useRouter();

  useEffect(()=>{
    const role = localStorage.getItem("userRole");
    const token = localStorage.getItem("accessToken");
    if(!token || role !== "student"){
      router.push("/login");
    }
  }, []);


  const courses = [
    {
      title: "Object Oriented Programming",
      icon: "/placeholder.svg",
    },
    {
      title: "Fundamentals of Database Systems",
      icon: "/placeholder.svg",
    },
   
  ];

  

  return (
    <div className="flex-1 p-4 md:p-6 overflow-auto w-full">
      {/* Welcome Banner */}
      <div className="bg-primary rounded-xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="relative z-10 p-4">
          <p className="text-sm mb-6">September 4, 2023</p>
          <h1 className="text-xl md:text-3xl font-bold mb-2">Welcome back, John!</h1>
          <p className="text-sm opacity-90">Always stay updated in your student portal</p>
        </div>
        <div className="absolute right-4 bottom-0 hidden sm:block">
          <Image
            src="/student.png"
            alt="Student illustration"
            width={220}
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
              {courses.map((course, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-white border rounded-lg shadow hover:bg-blue-600 hover:text-white transition"
                >
                  <div>
                    <h3 className="text-md font-semibold mb-2">{course.title}</h3>
                    <button className="bg-blue-500 text-white text-sm px-4 py-1 rounded hover:bg-blue-700 transition">
                      View
                    </button>
                  </div>
                  <div>
                    <Image
                      src={course.icon}
                      alt={course.title}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content (Chat Box) */}
        <div className="w-full lg:w-4/12 border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[500px]">
          <div className="bg-blue-100 p-3 border-b border-gray-200">
            <h3 className="font-medium text-md">Chat with instructors</h3>
          </div>
          <div className="bg-white p-3 flex-1 overflow-y-auto flex flex-col space-y-3">
            {/* Chat messages */}
            <div className="flex items-start gap-2">
              <Image src="/placeholder.svg" alt="Instructor" width={32} height={32} className="rounded-full mt-1" />
              <div className="bg-gray-100 rounded-lg p-2 text-sm max-w-[80%]">
                <p>Hello! How can I help you with your coursework today?</p>
                <span className="text-xs text-gray-500 mt-1 block">10:30 AM</span>
              </div>
            </div>
            <div className="flex items-start gap-2 flex-row-reverse">
              <div className="bg-purple-100 rounded-lg p-2 text-sm max-w-[80%]">
                <p>I have a question about the upcoming assignment deadline.</p>
                <span className="text-xs text-gray-500 mt-1 block">10:32 AM</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Image src="/placeholder.svg" alt="Instructor" width={32} height={32} className="rounded-full mt-1" />
              <div className="bg-gray-100 rounded-lg p-2 text-sm max-w-[80%]">
                <p>Sure, the deadline has been extended to next Friday.</p>
                <span className="text-xs text-gray-500 mt-1 block">10:35 AM</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button className="bg-blue-500 text-white rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
