"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  ArrowLeft, 
  UserPlus, 
  BookOpen, 
  CreditCard, 
  Video, 
  FileText, 
  HelpCircle,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";

export default function HelpPage() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const tutorials = [
    {
      id: 1,
      title: "How to Register for an Account",
      description: "Learn how to create your EduConnect account step by step",
      duration: "2:45",
      successRate: "98%",
      icon: <UserPlus className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Sample YouTube embed
      topics: ["Account Creation", "Profile Setup", "Email Verification"]
    },
    {
      id: 2,
      title: "How to Enroll in a Course",
      description: "Discover how to browse and enroll in courses that match your interests",
      duration: "3:20",
      successRate: "95%",
      icon: <BookOpen className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: ["Course Selection", "Enrollment Process", "Prerequisites"]
    },
    {
      id: 3,
      title: "How to Verify Your Payment Status",
      description: "Check and manage your payment history and verification status",
      duration: "2:15",
      successRate: "92%",
      icon: <CreditCard className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: ["Payment Verification", "Transaction History", "Refund Process"]
    },
    {
      id: 4,
      title: "How to Join a Webinar or Online Class",
      description: "Access live sessions and participate in interactive webinars",
      duration: "4:10",
      successRate: "97%",
      icon: <Video className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: ["Webinar Access", "Interactive Features", "Recording Playback"]
    },
    {
      id: 5,
      title: "How to Submit Assignments or Documents",
      description: "Upload and manage your assignments and required documents",
      duration: "3:35",
      successRate: "94%",
      icon: <FileText className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: ["File Upload", "Assignment Submission", "Document Management"]
    },
    {
      id: 6,
      title: "How to Watch Tutorial Videos and Find Support",
      description: "Navigate the help center and access additional support resources",
      duration: "2:55",
      successRate: "99%",
      icon: <HelpCircle className="w-8 h-8 text-blue-600" />,
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: ["Help Center", "Support Tickets", "FAQ Access"]
    }
  ];

  const openVideoModal = (tutorial) => {
    setSelectedVideo(tutorial);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <MainNavbar />
      
      {/* Header Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-500 mr-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600 dark:text-blue-400">
              Video Tutorials
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Learn how to use EduConnect with our comprehensive video guides. 
              Master every feature from registration to advanced functionality.
            </p>
          </div>
        </div>
      </section>

      {/* Tutorial Stats */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">6</h3>
              <p className="text-gray-600 dark:text-gray-400">Tutorial Videos</p>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">18min</h3>
              <p className="text-gray-600 dark:text-gray-400">Total Duration</p>
            </div>
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">96%</h3>
              <p className="text-gray-600 dark:text-gray-400">Average Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Tutorials Grid */}
      <section className="py-16 bg-blue-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-700 dark:text-blue-400">
            Getting Started Tutorials
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                onClick={() => openVideoModal(tutorial)}
              >
                {/* Video Thumbnail */}
                <div className="relative">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {tutorial.duration}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {tutorial.successRate} success
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      {tutorial.icon}
                    </div>
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {tutorial.successRate} complete
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {tutorial.description}
                  </p>

                  {/* Topics covered */}
                  <div className="flex flex-wrap gap-2">
                    {tutorial.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Help Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-8 text-blue-700 dark:text-blue-400">
            Need More Help?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                Contact Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get personalized help from our support team
              </p>
              <Link href="/#contact">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Contact Us
                </button>
              </Link>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                Browse Courses
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Explore our comprehensive course catalog
              </p>
              <Link href="/courses">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  View Courses
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {selectedVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Video Player */}
              <div className="aspect-video mb-6">
                <iframe
                  src={selectedVideo.videoUrl}
                  title={selectedVideo.title}
                  className="w-full h-full rounded-lg"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              {/* Video Details */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                  {selectedVideo.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{selectedVideo.duration}</span>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {selectedVideo.successRate} success rate
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {selectedVideo.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {selectedVideo.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm px-3 py-1 rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}