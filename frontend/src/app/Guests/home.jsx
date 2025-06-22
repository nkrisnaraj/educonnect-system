"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,
  CreditCard,
  Calendar,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Send,
  BookOpen,
  Users,
  Award,
  Clock
} from "lucide-react";

import MainNavbar from "@/components/MainNavbar";
import "../globals.css";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const response = await fetch("http://localhost:8000/api/contact/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Nav bar */}
      <MainNavbar />

      {/* Hero Section */}
      <section 
        id="home" 
        className="relative text-center p-10 pt-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900 transition-colors overflow-hidden min-h-screen flex items-center"
      >
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Welcome to EduConnect!
            </h1>
            <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
              Streamline payments and webinars for education!
              Connect students and instructors seamlessly.
            </p>
            <button 
              onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
            >
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

      {/* About Section */}
      <section id="about" className="p-8 py-16 bg-white dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700 dark:text-blue-400">
          About EduConnect
        </h2>
        <p className="text-center max-w-3xl mx-auto text-gray-700 dark:text-gray-300 mb-12">
          EduConnect is a modern education platform built to manage class registration, payment verification, webinar hosting, and more – all from one place.
        </p>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-700 dark:text-blue-400">
            Why Choose EduConnect?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="p-8 py-16 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400 text-center">
            Our Courses
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Explore our comprehensive range of courses designed to help you achieve your goals
          </p>

          {/* Course Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                title: "Business Management",
                icon: <Users className="w-8 h-8 text-blue-600" />,
                courses: 15,
                students: "1,200+",
                description: "Leadership, strategy, and management skills"
              },
              {
                title: "Technology & Programming",
                icon: <BookOpen className="w-8 h-8 text-blue-600" />,
                courses: 25,
                students: "2,500+",
                description: "Web development, mobile apps, and more"
              },
              {
                title: "Digital Marketing",
                icon: <Award className="w-8 h-8 text-blue-600" />,
                courses: 12,
                students: "800+",
                description: "SEO, social media, and online advertising"
              }
            ].map((category, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {category.courses} courses • {category.students} students
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {category.description}
                </p>
              </div>
            ))}
          </div>

          {/* Upcoming Webinars */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border border-blue-200 dark:border-blue-600">
            <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400">
              Upcoming Webinars
            </h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Management Seminar
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">Sep. 20, 2025 • 2:00 PM</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">50+ registered</p>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                View All
              </button>
            </div>
          </div>

          {/* Video Tutorials */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-blue-700 dark:text-blue-400 text-center">
              Watch: How to Use EduConnect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "How to Login", emoji: "🔐", description: "Learn how to access your account" },
                { title: "How to Register", emoji: "📝", description: "Create your EduConnect account" }
              ].map((video, i) => (
                <div
                  key={i}
                  className="border border-blue-200 dark:border-blue-600 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
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
                    <h4 className="font-semibold text-blue-600 dark:text-blue-300 text-lg mb-1">
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="p-8 py-16 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-blue-700 dark:text-blue-400">
            Get In Touch
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Email</p>
                    <p className="text-gray-600 dark:text-gray-400">support@educonnect.lk</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Phone</p>
                    <p className="text-gray-600 dark:text-gray-400">+94 77 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">Address</p>
                    <p className="text-gray-600 dark:text-gray-400">Uva Wellassa University, Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
                Send us a Message
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {submitStatus && (
                  <div className={`p-3 rounded-lg ${
                    submitStatus === 'success'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {submitStatus === 'success'
                      ? 'Message sent successfully! We\'ll get back to you soon.'
                      : 'Failed to send message. Please try again.'}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}