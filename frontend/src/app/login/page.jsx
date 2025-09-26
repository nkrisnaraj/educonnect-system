"use client";
import { useAuth } from "@/context/AuthContext"; // ✅ Fix the error
import axios from "axios";
import { User, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import "../globals.css";
import MainNavbar from "@/components/MainNavbar";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showEmailModel, setShowEmailModel] = useState(false);
  const [email, setEmail] = useState("");

  const { login } = useAuth();

    const handleLogin = async(e) => {
        e.preventDefault();
        try {
          const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/",{
            username,
            password
          });
          if(response.status === 200){

            setMessage("Login Successfully")
            setIsSuccess(true);

            const data = response.data;
            console.log('🔐 Login successful:', data); //contains user, access, refresh
            console.log('👤 User role:', data.user.role);

            // Set cookie with explicit options
            Cookies.set("accessToken", data.access, { 
              path: "/",
              expires: 1, // 1 day
              secure: false, // Allow HTTP for development
              sameSite: 'lax'
            });
            
            console.log('🍪 Cookie set:', Cookies.get("accessToken") ? 'Success' : 'Failed');

            login(data); // this replace all loalstorage
            
            //sessionStorage.setItem("user", JSON.stringify(userObject));
            //sessionStorage.setItem("userRole",data.user.role);
            //sessionStorage.setItem("accessToken", response.data.access);
            //sessionStorage.setItem("refreshToken", response.data.refresh);

            //const userrole = sessionStorage.getItem("userRole");
            console.log(data.user.id);
            setTimeout(() => {
              try {
                if (data.user.role === 'admin') {
                  router.push("/admin");
                } else if (data.user.role === 'instructor') {
                  router.push("/instructor");
                } else if (data.user.role === 'student') {
                  router.push(`/students/${data.user.id}`);
                }
              } catch (err) {
                console.error("Router push error:", err);
              }
            }, 1000);
          }else{
            setMessage("Login Failed")
            setIsSuccess(false);
            console.log("Login Failed");
          }
        } catch (error) {
            console.error("Login error:", error);
            if(error.response){
              setMessage(error.response.data?.detail || "Invalid Credentials");
            }
            else{
              setMessage("An Error Occurred")
            }
        } 
    };

    const handleforgotPassword = () => {
      setShowEmailModel(true);
    }

    const handleOTP = async () => {
      setShowEmailModel(false);
      if (!email) {
        alert("Please enter your email.");
        return;
      }
      try {
        const response = await axios.post("http://127.0.0.1:8000/api/accounts/send-otp/",{ email });
        console.log(email);
        if (response.status === 200) {
          alert("Check your email address for the OTP.");
          sessionStorage.setItem("reset_email", email);
          router.push("/otp");
        }
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.error || "Failed to send OTP.");
      }
    };


    

  return (
    <>
    {/* Nav bar */}
    <MainNavbar />
    <div className="font-sans bg-white mx-auto text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Login Form */}
      <div className="flex mt-12 items-center justify-center min-h-screen px-6 py-6 bg-gray-100 dark:bg-gray-800 transition-colors">
        <div className="bg-white dark:bg-gray-700 shadow-lg rounded-2xl p-8 w-full max-w-md transition-colors">
          {/* Logo & Welcome */}
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/logo.png"
                alt="EduConnect Logo"
                width={100}
                height={80}
                className="mb-2"
              />
              
              <p className="text-primary dark:text-gray-300 text-lg font-semibold">Welcome back to EduConnect !</p>
            </div>

          {message && (
            <div
              className={` mt-16 mb-6 fixed top-5 right-5 w-[350px] max-w-full px-6 py-4  rounded-xl shadow-2xl border-l-8 z-50 text-sm font-semibold transition-all duration-500 ${
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
                <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline" onClick={handleforgotPassword}>
                  Forgot Password?
                </span>
            </div>
            <button type="submit"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition duration-300">
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
    </div>
    {showEmailModel && (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          {/* <h2 className="text-xl font-semibold mb-4">Forgot Password</h2> */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Please Enter the Email to send your OTP
          </p>
          <input
            type="email"
            className="border p-2 w-full mb-4"
            placeholder="Enter your email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            // onClick={() => {router.push("/otp")}}
            type="button"
            onClick={handleOTP}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Send 
          </button>
        </div>
      </div>
    )}
    <Footer />
    </>
  );
}
