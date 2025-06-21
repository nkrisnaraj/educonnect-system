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

  
    const { login } = useAuth();

    const handleLogin = async(e) => {
        e.preventDefault();
        try {
          console.log(username);
          console.log(password);
          const response = await axios.post("http://127.0.0.1:8000/api/accounts/login/",{
            username,
            password
          });
          if(response.status === 200){

            setMessage("Login Successfully")
            setIsSuccess(true);

            const data = response.data;
            console.log(data); //contains user, access, refresh
            console.log(data.user.role);

            Cookies.set("accessToken", data.access, { path: "/" });

            login(data); // this replace all loalstorage
            
            //localStorage.setItem("user", JSON.stringify(userObject));
            //localStorage.setItem("userRole",data.user.role);
            //localStorage.setItem("accessToken", response.data.access);
            //localStorage.setItem("refreshToken", response.data.refresh);

            //const userrole = localStorage.getItem("userRole");
            
            setTimeout(() => {
              try {
                if (data.user.role === 'admin') {
                  router.push("/admin");
                } else if (data.user.role === 'instructor') {
                  router.push("/instructor");
                } else if (data.user.role === 'student') {
                  router.push("/students");
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

    

  return (
    <div className="font-sans min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
      {/* Nav bar */}
      <MainNavbar />


      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen px-6 py-6 bg-gray-100 dark:bg-gray-800 transition-colors">
        <div className="bg-white dark:bg-gray-700 shadow-lg rounded-2xl p-8 w-full max-w-md transition-colors">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Login</h1>

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
              <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                Forgot Password?
              </span>
            </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-900 transition duration-300"
                        
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

      

<Footer />

    </div>
  );
}
