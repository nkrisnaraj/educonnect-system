"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

export default function Register() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

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

      {/* Registration Form */}
      <div className="flex items-center justify-center min-h-screen px-6 py-6 bg-gray-100 dark:bg-gray-800 transition-colors">
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

            <div className="md:col-span-2">
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

            <div className="md:col-span-2">
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
            className="mt-8 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 font-semibold transition duration-300"
          >
            Register
          </button>

          <p className="text-sm mt-4 text-center text-gray-700 dark:text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 dark:text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
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