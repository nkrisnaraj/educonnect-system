'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">

      {/* Navbar */}
      <header className="flex justify-between items-center p-4 shadow-md bg-blue-600 text-white dark:bg-blue-700">
        <div className="text-xl font-bold">EduConnect</div>
        <nav className="space-x-4 flex items-center">
          <Link href="#">About</Link>
          <Link href="#">Pricing</Link>
          <Link href="#">Courses</Link>
          <Link href="/login">
            <button className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-blue-100">Login</button>
          </Link>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="ml-4 text-xl focus:outline-none"
            title="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center p-10 bg-blue-50 dark:bg-gray-800 transition-colors">
        <h1 className="text-3xl font-bold mb-2 text-blue-600 dark:text-blue-400">Welcome to EduConnect!</h1>
        <p className="mb-4 text-gray-700 dark:text-gray-300">Streamline payments and webinars for education!</p>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded">Learn More</button>
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white dark:bg-gray-900">
        {['Automated Payment Verification', 'Webinar Integration', 'Calendar Sync', 'Monthly Reports'].map((text, i) => (
          <div
            key={i}
            className="border border-blue-100 dark:border-blue-600 bg-blue-100 dark:bg-gray-800 p-4 rounded text-center shadow hover:shadow-lg transition"
          >
            <p className="font-medium text-blue-700 dark:text-blue-400">{text}</p>
          </div>
        ))}
      </section>

      {/* Upcoming Webinars */}
      <section className="p-6 bg-blue-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">Upcoming Webinars</h2>
        <div className="bg-blue-100 dark:bg-gray-800 p-4 rounded flex justify-between items-center border border-blue-200 dark:border-blue-600">
          <div>
            <p className="font-semibold">Management Seminar</p>
            <p className="text-sm text-gray-700 dark:text-gray-400">Sep. 20, 2025</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">View All</button>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="p-6 bg-white dark:bg-gray-900">
        <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-400">Watch: How to Use EduConnect</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'How to Login', src: '/videos/how-to-login.mp4' },
            { title: 'How to Register', src: '/videos/how-to-register.mp4' }
          ].map((video, i) => (
            <div
              key={i}
              className="border border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-gray-800 p-4 rounded shadow text-center"
            >
              <h3 className="font-semibold mb-2 text-blue-600 dark:text-blue-300">{video.title}</h3>
              <video className="w-full rounded" controls>
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-600 text-white mt-10 dark:bg-blue-700">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-2">EduConnect</h3>
            <p className="text-sm text-white/90">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul className="space-y-1 text-sm text-white/90">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Pricing</a></li>
              <li><a href="#" className="hover:underline">Courses</a></li>
              <li><a href="/login" className="hover:underline">Login</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-sm text-white/90">📧 support@educonnect.lk</p>
            <p className="text-sm text-white/90">📞 +94 77 123 4567</p>
            <p className="text-sm text-white/90">🏫 Uva Wellassa University, Sri Lanka</p>
          </div>
        </div>
        <div className="text-center py-4 bg-blue-800 text-sm">
          © {new Date().getFullYear()} EduConnect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
