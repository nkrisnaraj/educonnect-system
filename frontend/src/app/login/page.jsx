"use client";
import { useAuth } from "@/context/AuthContext"; // ✅ Fix the error
import axios from "axios";
import { User, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import {useRouter} from "next/navigation";
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
            console.log(data);
            console.log(data.user.role);

            Cookies.set("accessToken", data.access, { path: "/" });

            localStorage.setItem("userRole",data.user.role);
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);

            

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
      <>
      <MainNavbar />
      
        <div className="flex items-center justify-center min-h-screen px-6 py-6">
            <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
                {/* Title */}
                <h1 className="text-3xl font-bold text-primary text-center mb-4">
                    Login
                </h1>

                {message && (
                  <div
                    className={`
                      fixed top-5 right-5 w-[350px] max-w-full px-6 py-4 rounded-xl shadow-2xl border-l-8 z-50
                      text-sm font-semibold
                      transition-all duration-500 ease-in-out

                      ${isSuccess
                        ? 'bg-green-100 text-green-900 border-green-700 animate-fadeIn animate-pulse-border-green'
                        : 'bg-red-100 text-red-900 border-red-700 animate-fadeIn animate-pulse-border-red'
                      }
                    `}
                  >
                    {message}
                  </div>
                )}




                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6 mt-6">
                   <div className="relative">
                        <input
                            type="text"
                            placeholder="Username"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right text-sm ">
                        <span className="text-primary font-medium cursor-pointer hover:underline">
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

                {/* Register Link */}
                <p className="mt-6 mb-6 text-gray-700 text-center">
                    Don't have an account?{" "}
                    <span className="text-primary font-bold cursor-pointer hover:underline" onClick={()=>{router.push("/register")}}>
                        Register Now
                    </span>
                </p>
            </div>
        </div>
        <Footer />
        </>
    );
}
