"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext"; // use the context

export default function MainNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center p-4 shadow-md bg-blue-600 text-white dark:bg-blue-700">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/logos/logo.png"
          alt="EduConnect Logo"
          width={40}
          height={40}
          className="rounded"
        />
        <div className="text-xl font-bold">EduConnect</div>
      </div>
      <nav className="space-x-6 flex items-center">
        <Link href="/" className="hover:text-blue-200 dark:hover:text-blue-300">Home</Link>
        <Link href="/about" className="hover:text-blue-200 dark:hover:text-blue-300">About</Link>
        <Link href="#" className="hover:text-blue-200 dark:hover:text-blue-300">Courses</Link>
        <Link href="/contact" className="hover:text-blue-200 dark:hover:text-blue-300">Contact</Link>
        <Link href="/login">
          <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors">Login</button>
        </Link>
        <button
          onClick={toggleTheme}
          className="ml-4 text-xl focus:outline-none hover:scale-110 transition-transform"
          title="Toggle theme"
        >
          {isDarkMode ? "🌙" : "☀️"}
        </button>
      </nav>
    </header>
  );
}
