"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MainNavbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load saved theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  // Update theme when state changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div>
      <header className="flex justify-between items-center p-2 shadow-md bg-primary dark:bg-gray-800 text-white dark:text-gray-100">
        <div className="flex items-center ms-6">
          <Image src="/logo.png" alt="EduConnect Logo" width={80} height={80} />
          {/* <span className="text-xl font-bold hidden sm:inline">EduConnect</span> */}
        </div>

        <nav className="space-x-6 flex items-center">
          <Link href="/" className="hover:text-blue-200 dark:hover:text-blue-300">
            Home
          </Link>
          <Link href="#" className="hover:text-blue-200 dark:hover:text-blue-300">
            About
          </Link>
          <Link href="#" className="hover:text-blue-200 dark:hover:text-blue-300">
            Courses
          </Link>
          <Link href="#" className="hover:text-blue-200 dark:hover:text-blue-300">
            Contact
          </Link>
          <Link href="/login">
            <button className="bg-white text-primary px-4 py-1 rounded hover:bg-blue-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
              Login
            </button>
          </Link>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="ml-4 text-xl focus:outline-none hover:scale-110 transition-transform"
            title="Toggle theme"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </nav>
      </header>
    </div>
  );
}