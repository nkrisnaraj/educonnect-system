import {Bell,BookOpen,Calendar,CreditCard,FileText,Home,LogOut,Notebook,User,X} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext"; 
import { useParams, useRouter } from "next/navigation";

export default function StudentNavbar({ isOpen, onClose }) {

  const { logout } = useAuth(); 
  const router = useRouter();
  const {id} = useParams();

  const handleLogout = () => {
    logout(); //  Clears localStorage/cookies & redirects
    router.push("/login"); // Optional if not already in logout
  };

  return (
    <div
      className={`
        bg-primary text-white p-6 fixed z-40 m-4 rounded-xl top-0 left-0 h-full w-64
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:h-auto
      `}
    >
      {/* Mobile-only close button */}
      <div className="flex justify-between items-center mb-4 md:hidden">
        <span className="text-xl font-bold">Menu</span>
        <button onClick={onClose} className="text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-center mb-6">
        <Image src="/logo.png" width={120} height={120} alt="Logo" />
      </div>

      <nav className="space-y-4">
        <Link href={`/students/${id}`} className="flex items-center gap-4 px-3 py-2 hover:bg-accent rounded-md">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link href={`/students/${id}/payment-info`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <CreditCard className="w-5 h-5" />
          <span>Payment Info</span>
        </Link>
        <Link href={`/students/${id}/classes`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <BookOpen className="w-5 h-5" />
          <span>Classes</span>
        </Link>
        {/* <Link href={`/students/${id}/notes`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <Notebook className="w-5 h-5" />
          <span>Notes</span>
        </Link> */}
        <Link href={`/students/${id}/results`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <FileText className="w-5 h-5" />
          <span>Results</span>
        </Link>
        <Link href={`/students/${id}/notice`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <Bell className="w-5 h-5" />
          <span>Notice</span>
        </Link>
        <Link href={`/students/${id}/profile`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link href={`/students/${id}/calender`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </Link>

        <div className="pt-8">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
