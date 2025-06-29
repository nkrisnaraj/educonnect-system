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
    title: "Calendar",
    url: "/instructor/calendar",
    icon: Calendar,
  },
  {
    title: "Notifications",
    url: "/instructor/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/instructor/settings",
    icon: Settings,
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
        <div className="space-y-2">
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
