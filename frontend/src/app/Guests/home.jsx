"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Play,ArrowRight,
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
  Clock,Video,Button,
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
    <>
    <MainNavbar />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Hero Section */}
      <section 
        id="home" 
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#2064d4]/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-[#2064d4]/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#2064d4]/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Section */}
            <div className="text-center lg:text-left space-y-8 animate-fade-in">
             

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-[#2064d4] via-purple-600 to-[#2064d4] bg-clip-text text-transparent">
                    EduConnect
                  </span>
                  !
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0">
                  Streamline payments and webinars for education! Connect students and instructors seamlessly with our cutting-edge platform.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Video className="w-4 h-4 text-[#2064d4]" />
                  <span>Live Webinars</span>
                </div>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Course Management</span>
                </div>
                <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  <Users className="w-4 h-4 text-[#2064d4]" />
                  <span>Student Portal</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => scrollToSection('about')}
                  className="bg-gradient-to-r from-[#2064d4] to-purple-600 hover:from-[#1a56b8] hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
                >
                  Get Started
                </button>

                <button 
                  onClick={() => console.log('Watch Demo clicked')}
                  className="border-2 border-gray-300 dark:border-gray-600 hover:border-[#2064d4] dark:hover:border-[#2064d4] px-8 py-3 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg group backdrop-blur-sm"
                >
                  Watch Demo
                </button>
              </div>


             
            </div>

            {/* Image Section */}
            <div className="relative animate-fade-in delay-300">
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#2064d4]/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#2064d4]/10 to-purple-600/10 rounded-2xl"></div>
                
                {/* Main Image Container */}
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
                    alt="Student Learning Online"
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                  
                 
                </div>
              </div>
            </div>
          </div>
        </div>

    
      </section>

      
    

      {/* About Section */}
      <section id="about" className="py-16 bg-white dark:bg-gray-900">
  {/* Story Section with Image */}
  <div className="container mx-auto px-8 mb-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Image Section */}
      <div className="order-2 lg:order-1">
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
            alt="Students collaborating in a modern learning environment" 
            className="w-full h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-blue-900 bg-opacity-20"></div>
        </div>
      </div>

      {/* Story Content */}
      <div className="order-1 lg:order-2 space-y-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            OUR STORY
          </h2>
          <div className="w-16 h-1 bg-blue-600 mb-6"></div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            EduConnect was born from a simple observation: educational institutions were struggling with fragmented systems that made learning management unnecessarily complex. Students faced multiple platforms for different tasks, while administrators juggled countless tools to keep everything running smoothly.
          </p>
          
          <p>
            Our journey began when we witnessed firsthand how technology could either empower or overwhelm the learning experience. We decided to create a solution that brings clarity to chaos - a unified platform where education truly connects all stakeholders in meaningful ways.
          </p>

          <p>
            Today, EduConnect serves thousands of students and educators worldwide, transforming how educational institutions operate. From seamless course registrations to integrated payment processing and live interactive sessions, we've built more than just software - we've created a community where learning thrives.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">500+</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Institutions</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Features Section */}
  <div className="max-w-6xl mx-auto px-8 [#FAF9F6]">
    <h3 className="text-2xl font-bold text-center mb-8 text-blue-700 dark:text-blue-400">
      Why Choose EduConnect?
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          title: "Automated Payment Verification",
          description: "Secure and instant payment processing",
          emoji: "💳"
        },
        {
          title: "Webinar Integration",
          description: "Seamless video conferencing tools",
          emoji: "🎥"
        },
        {
          title: "Calendar Sync",
          description: "Never miss a class or meeting",
          emoji: "📅"
        },
        {
          title: "Monthly Reports",
          description: "Track progress and analytics",
          emoji: "📊"
        }
      ].map((feature, i) => (
        <div
          key={i}
          className="border border-blue-100 border-width-3 dark:border-blue-600 bg-white dark:bg-gray-800 p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white border border-primary dark:bg-blue-900 rounded-full flex items-center justify-center">
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
<section id="courses" className="p-8 py-16 bg-[#FAF9F6] dark:bg-gray-800">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-400 text-center">
      Our Courses
    </h2>
    <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
      Explore our comprehensive range of courses designed to help you achieve your goals
    </p>

    {/* First Row - Course Categories */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
           {[
        {
          title: "2025 A/L Theory",
          icon: <Users className="w-8 h-8 text-blue-600" />,
          students: "1,200+",
          description: "Comprehensive coverage of A/L Theory syllabus for 2025 examination"
        },
        {
          title: "2025 A/L Revision",
          icon: <BookOpen className="w-8 h-8 text-blue-600" />,
          students: "2,500+",
          description: "Intensive revision classes and practice sessions for A/L 2025"
        },
        {
          title: "2025 A/L Papers",
          icon: <Award className="w-8 h-8 text-blue-600" />,
          students: "800+",
          description: "Past papers and model papers for A/L 2025 examination practice"
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
                {category.students} students
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {category.description}
          </p>
        </div>
      ))}
    </div>

    {/* Second Row - Additional Courses */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      {[
        {
          title: "2026 A/L Theory",
          icon: <Users className="w-8 h-8 text-blue-600" />,
          students: "1,800+",
          description: "Early preparation for A/L Theory syllabus for 2026 examination"
        },
        {
          title: "2026 A/L Revision",
          icon: <BookOpen className="w-8 h-8 text-blue-600" />,
          students: "1,500+",
          description: "Advanced revision classes and mock tests for A/L 2026"
        },
        {
          title: "2026 A/L Papers",
          icon: <Award className="w-8 h-8 text-blue-600" />,
          students: "3,200+",
          description: "Question papers and practice materials for A/L 2026 preparation"
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
                {category.students} students
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {category.description}
          </p>
        </div>
      ))}
    </div>

    {/* See More Courses Button */}
    <div className="text-center">
      <Link href="/courses">
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center space-x-2">
          <BookOpen className="w-5 h-5" />
          <span>See More Courses</span>
        </button>
      </Link>
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

      
    </div>
    {/* Footer */}
      <Footer />
    </>
  );
}