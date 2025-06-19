"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, CreditCard, Calendar, BarChart3 } from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import "../globals.css";
import Footer from "@/components/Footer";


export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">

      
       {/* Nav bar */}
            <MainNavbar />
      

      {/* Hero Section */}
      <section className="relative text-center p-10 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 transition-colors overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Welcome to EduConnect!
            </h1>
            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
              Streamline payments and webinars for education! 
              Connect students and instructors seamlessly.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Learn More
            </button>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center">
            <Image
              src="/images/hero/studentlearning.png"
              alt="Student Learning"
              width={500}
              height={400}
              className="rounded-xl shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="p-8 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700 dark:text-blue-400">
          Why Choose EduConnect?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Automated Payment Verification",
              icon: <CreditCard className="w-12 h-12 text-blue-600" />,
              description: "Secure and instant payment processing",
              emoji: "💳"
            },
            {
              title: "Webinar Integration", 
              icon: <Play className="w-12 h-12 text-blue-600" />,
              description: "Seamless video conferencing tools",
              emoji: "🎥"
            },
            {
              title: "Calendar Sync",
              icon: <Calendar className="w-12 h-12 text-blue-600" />,
              description: "Never miss a class or meeting",
              emoji: "📅"
            },
            {
              title: "Monthly Reports",
              icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
              description: "Track progress and analytics",
              emoji: "📊"
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="border border-blue-100 dark:border-blue-600 bg-blue-50 dark:bg-gray-800 p-6 rounded-xl text-center shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
              </div>
              <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="p-8 bg-blue-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">
            Upcoming Webinars
          </h2>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Management Seminar
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Sep. 20, 2025 • 2:00 PM</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">50+ registered</p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                View All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="p-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400">
            Watch: How to Use EduConnect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: "How to Login", emoji: "🔐", description: "Learn how to access your account" },
              { title: "How to Register", emoji: "📝", description: "Create your EduConnect account" }
            ].map((video, i) => (
              <div
                key={i}
                className="border border-blue-200 dark:border-blue-600 bg-blue-50 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-700 dark:to-gray-800 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{video.emoji}</div>
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-300 text-lg mb-1">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}