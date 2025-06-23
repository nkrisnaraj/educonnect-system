"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {Home,BookOpen,Users,GraduationCap,ClipboardList,Upload,BarChart3,Calendar,Bell,Settings,LogOut} from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const menuItems = [
  {
    title: "Dashboard",
    url: "/instructor",
    icon: Home,
  },
  {
    title: "My Courses",
    url: "/instructor/courses",
    icon: BookOpen,
  },
  {
    title: "Students",
    url: "/instructor/students",
    icon: Users,
  },
  {
    title: "Exams",
    url: "/instructor/exams",
    icon: GraduationCap,
  },
  {
    title: "Results",
    url: "/instructor/results",
    icon: ClipboardList,
  },
  {
    title: "Upload Marks",
    url: "/instructor/upload-marks",
    icon: Upload,
  },
  {
    title: "Reports",
    url: "/instructor/reports",
    icon: BarChart3,
  },
  {
    title: "Calendar",
    url: "/instructor/calendar",
    icon: Calendar,
  },
  {
    title: "Notifications",
    url: "/instructor/notifications",
    icon: Bell,
  },
]

export function InstructorSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth();

  return (
    <div className="mt-4 ml-4 w-64 bg-primary border-r border-purple-200 flex flex-col rounded-xl">
      {/* Header */}
      <div className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-2 rounded-lg">
            {/* <GraduationCap className="h-6 w-6 text-white" /> */}
            <Image src="/logo.png" alt="Logo" width={120} height={120}/>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4">
        <div className="space-y-3">

          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.url}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === item.url
                  ? "bg-purple-100 text-purple-700"
                  : "text-white hover:bg-accent hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">SJ</span>
          </div>
          <div className="flex-1">
            <p className="text-m text-white font-medium">Dr. Sarah Johnson</p>
            <p className="text-m text-white">Senior Instructor</p>
          </div>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 text-m text-white hover:bg-accent rounded-lg">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 text-m text-white hover:bg-accent rounded-lg"
            onClick={()=>
              logout()
            }>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
