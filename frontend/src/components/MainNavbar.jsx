"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MainNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div>
      <header className="flex justify-between items-center p-2 text-white  shadow-md bg-primary dark:bg-primary">
      
        <div className="flex items-center ms-6">
            <Image src="/logo.png" alt="EduConnect Logo" width={80} height={80} />
            {/* <span className="text-xl font-bold hidden sm:inline">EduConnect</span> */}
        </div>

        <nav className="space-x-6 text-white flex items-center">
          <Link href="/">Home</Link>
          <Link href="#">About</Link>
          <Link href="#">Courses</Link>
          <Link href="#">Contact</Link>
          <Link href="/login">
            <button className="bg-white text-primary px-4 py-1 rounded hover:bg-blue-100">
              Login
            </button>
          </Link>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="ml-4 text-xl focus:outline-none"
            title="Toggle theme"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </nav>
      </header>
    </div>
  );
}
