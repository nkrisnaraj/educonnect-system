"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import MainNavbar from "@/components/MainNavbar";
import "../globals.css";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    nicNo: "",
    address: "",
    yearOfAL: "",
    schoolName: "",
    city:"",
    district:""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {

    e.preventDefault();

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      first_name: form.firstName,
      last_name: form.lastName,
      student_profile: {
        mobile: form.mobile,
        nic_no: form.nicNo,
        address: form.address,
        year_of_al: form.yearOfAL,
        school_name: form.schoolName,
        city: form.city,
        district: form.district
      }
    };

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/accounts/register/", payload);
      if (res.status === 201) {
        setMessage("Registered successfully!");
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(res.data.detail || "Registration failed!");

        setIsSuccess(false);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setMessage(JSON.stringify(err.response.data));
      } else {
        setMessage("Server error. Try again later.");
      }
      setIsSuccess(false);
    }
  };

  return (
    <>
    <MainNavbar />
    <div className="font-sans mx-auto mt-24 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
       
      {/* Registration Form */}
      <div className="flex items-center justify-center px-6 py-6 bg-gray-100 dark:bg-gray-800 transition-colors">
        {message && (
          <div
            className={`fixed top-5 right-5 w-[380px] px-6 py-4 rounded-xl shadow-2xl border-l-8 z-50 text-sm font-semibold transition-all duration-500 ease-in-out animate-fadeIn ${
              isSuccess
                ? "bg-green-100 text-green-900 border-green-700 dark:bg-green-800 dark:text-green-100 dark:border-green-400"
                : "bg-red-100 text-red-900 border-red-700 dark:bg-red-800 dark:text-red-100 dark:border-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <form
          onSubmit={handleRegister}
          className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg w-full max-w-5xl transition-colors"
        >
          <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
            Create an Account
          </h2>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter Username"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter Email"
                required
              />
            </div>


            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="First Name"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Last Name"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0771234567"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">NIC No</label>
              <input
                type="text"
                name="nicNo"
                value={form.nicNo}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="200012345678"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Year of A/L</label>
              <input
                type="text"
                name="yearOfAL"
                value={form.yearOfAL}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="2021"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">School Name</label>
              <input
                type="text"
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="School Name"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Address"
                rows={2}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">City</label>
              <textarea
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="City"
                rows={2}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">district</label>
              <textarea
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="District"
                rows={2}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter password"
                required
              />
            </div>

          </div>

        <button
          type="submit"
          className="mt-8 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold transition duration-300"
        >
          Register
        </button>

          <p className="text-md mt-4 font-semibold text-center text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold dark:text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>

      
    
      
    </div>
    <Footer />
    
    
    </>
  );
}