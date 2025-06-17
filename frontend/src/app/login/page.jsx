"use client";
import axios from "axios";
import { User, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "../globals.css";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/", {
        username,
        password,
      });

      if (response.status === 200) {
        setMessage("Login Successfully");
        setIsSuccess(true);
        const userrole = response.data.role;
        setTimeout(() => {
          if (userrole === "admin") router.push("/admin");
          else if (userrole === "instructor") router.push("/instructor");
          else if (userrole === "student") router.push("/students");
        }, 1000);
      } else {
        setMessage("Login Failed");
        setIsSuccess(false);
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data?.detail || "Invalid Credentials");
      } else {
        setMessage("An Error Occurred");
      }
      setIsSuccess(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Header - Same as Home Page */}
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
        <nav className="space-x-4 flex items-center">
          <Link href="#" className="hover:text-blue-200 transition-colors">About</Link>
          <Link href="#" className="hover:text-blue-200 transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-blue-200 transition-colors">Courses</Link>
          <Link href="/">
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors">
              Home
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

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen px-6 py-6 bg-gray-100 dark:bg-gray-800 transition-colors">
        <div className="bg-white dark:bg-gray-700 shadow-lg rounded-2xl p-8 w-full max-w-md transition-colors">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Login</h1>

          {message && (
            <div
              className={`fixed top-5 right-5 w-[350px] max-w-full px-6 py-4 rounded-xl shadow-2xl border-l-8 z-50 text-sm font-semibold transition-all duration-500 ${
                isSuccess
                  ? "bg-green-100 text-green-900 border-green-700 dark:bg-green-800 dark:text-green-100 dark:border-green-400"
                  : "bg-red-100 text-red-900 border-red-700 dark:bg-red-800 dark:text-red-100 dark:border-red-400"
              }`}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 mt-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Username"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:outline-none bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
            </div>

            <div className="text-right text-sm">
              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
          </form>

          <p className="mt-6 mb-6 text-center text-gray-700 dark:text-gray-300">
            Don't have an account?{" "}
            <Link 
              href="/register"
              className="text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>

      {/* Footer - Same as Home Page */}
      <footer className="bg-blue-600 text-white mt-10 dark:bg-blue-700">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Image 
                src="/images/logos/logo.png" 
                alt="EduConnect Logo" 
                width={40} 
                height={40}
                className="rounded bg-white p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-blue-600 font-bold text-lg">E</span>
              </div>
              <h3 className="text-xl font-bold">EduConnect</h3>
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              EduConnect streamlines class registration, payment verification, and webinar access for online learners and instructors.
            </p>
            <div className="flex space-x-2 mt-4">
              <span className="text-2xl">🎓</span>
              <span className="text-2xl">💻</span>
              <span className="text-2xl">🌟</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link href="#" className="hover:underline hover:text-white transition-colors">📖 About Us</Link></li>
              <li><Link href="#" className="hover:underline hover:text-white transition-colors">💰 Pricing</Link></li>
              <li><Link href="#" className="hover:underline hover:text-white transition-colors">📚 Courses</Link></li>
              <li><Link href="/" className="hover:underline hover:text-white transition-colors">🏠 Home</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm text-white/90">
              <p className="flex items-center space-x-2">
                <span>📧</span>
                <a href="mailto:support@educonnect.lk" className="hover:underline">support@educonnect.lk</a>
              </p>
              <p className="flex items-center space-x-2">
                <span>📞</span>
                <a href="tel:+94771234567" className="hover:underline">+94 77 123 4567</a>
              </p>
              <p className="flex items-center space-x-2">
                <span>🏫</span>
                <span>Uva Wellassa University, Sri Lanka</span>
              </p>
              <p className="flex items-center space-x-2 mt-3">
                <span>🌐</span>
                <span>Serving students nationwide</span>
              </p>
            </div>
          </div>
        </div>
        <div className="text-center py-4 bg-blue-800 border-t border-blue-500">
          <p className="text-sm">
            © {new Date().getFullYear()} EduConnect. All rights reserved. | Made with ❤️ in Sri Lanka
          </p>
        </div>
      </footer>
    </div>
  );
}