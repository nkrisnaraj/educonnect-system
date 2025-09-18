"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import MainNavbar from "@/components/MainNavbar";
import "../globals.css";
import Footer from "@/components/Footer";

export default function Register() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [zoomVerified, setZoomVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showZoomButton, setShowZoomButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  // Check if user came back from Zoom OAuth
  useEffect(() => {
    const urlParams = searchParams;
    if (urlParams.get('zoom_verified') === 'true') {
      const email = urlParams.get('email');
      if (email) {
        setZoomVerified(true);
        setVerifiedEmail(email);
        setForm(prev => ({ ...prev, email: email }));
        setMessage("Zoom account verified successfully! You can now complete registration.");
        setIsSuccess(true);
        
        // Clear URL parameters after processing
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Restore form data from localStorage if available
    const savedFormData = localStorage.getItem('registrationFormData');
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setForm(prev => ({ ...prev, ...parsedData }));
        localStorage.removeItem('registrationFormData');
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, [searchParams]);

  const handleZoomLogin = async () => {
    setIsLoading(true);
    try {
      // Save current form data to localStorage
      localStorage.setItem('registrationFormData', JSON.stringify(form));
      
      const response = await axios.get("http://127.0.0.1:8000/api/accounts/zoom/login/");
      if (response.data.auth_url) {
        // Redirect to Zoom OAuth
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setMessage("Failed to initiate Zoom authentication. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Show Zoom verification when user enters a Gmail address
    if (name === "email" && value.includes("@gmail.com") && !zoomVerified) {
      setShowZoomButton(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // Check if this is a student registration (has student profile data)
    const hasStudentProfile = form.nicNo || form.yearOfAL || form.schoolName;

    // Validate Gmail requirement for students
    if (hasStudentProfile && !form.email.endsWith('@gmail.com')) {
      setMessage("Students must register with a valid Gmail address.");
      setIsSuccess(false);
      return;
    }

    // Check Zoom verification for students
    if (hasStudentProfile && !zoomVerified) {
      setMessage("Students must verify their Zoom account before registration. Please click 'Sign in with Zoom' first.");
      setIsSuccess(false);
      setShowZoomButton(true);
      return;
    }

    // Check email matches verified Zoom email
    if (hasStudentProfile && zoomVerified && form.email !== verifiedEmail) {
      setMessage(`Email mismatch. You verified ${verifiedEmail} with Zoom, but trying to register with ${form.email}.`);
      setIsSuccess(false);
      return;
    }

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
        // Clear localStorage on successful registration
        localStorage.removeItem('registrationFormData');
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(res.data.detail || "Registration failed!");
        setIsSuccess(false);
      }
    } catch (err) {
      let errorMessage = "Registration failed. ";
      
      if (err.response && err.response.data) {
        if (err.response.data.zoom_verification_required) {
          errorMessage = err.response.data.error || "Students must verify their Zoom account.";
          setShowZoomButton(true);
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else {
          errorMessage = JSON.stringify(err.response.data);
        }
      } else {
        errorMessage = "Server error. Try again later.";
      }
      
      setMessage(errorMessage);
      setIsSuccess(false);
    }
  };

  return (
    <>
    <MainNavbar />
    <div className="font-sans max-w-4xl mb-12 mx-auto mt-24 min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
       
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
          <div className="flex flex-col items-center mb-6">
            <p className="text-primary dark:text-gray-300 mb-2 text-2xl font-semibold"> Welcome! Let&apos;s get you started</p>
              <Image src="/logo.png" alt="EduConnect Logo" width={100} height={80} className="mb-3"/>
              
              {/* Registration Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center max-w-2xl">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Registration Requirements</h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <p>• <strong>All Users:</strong> Valid email address and secure password</p>
                  <p>• <strong>Students:</strong> Must use Gmail address and verify Zoom account</p>
                  <p>• <strong>Instructors:</strong> Can use any email address</p>
                </div>
              </div>
          </div>

          {/* Zoom Verification Section */}
          {zoomVerified && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-800 border border-green-400 text-green-700 dark:text-green-100 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">✅ Zoom account verified: {verifiedEmail}</span>
              </div>
              <p className="text-sm mt-1">You can now complete your student registration.</p>
            </div>
          )}

          {(showZoomButton && !zoomVerified) && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="text-center">
                <p className="text-blue-800 dark:text-blue-200 mb-3 font-medium">
                  📧 Gmail address detected! Students must verify their Zoom account.
                </p>
                <button
                  type="button"
                  onClick={handleZoomLogin}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>
                      🎥 Sign in with Zoom
                    </>
                  )}
                </button>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                  Required for student registration with Gmail addresses
                </p>
              </div>
            </div>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Email {zoomVerified && <span className="text-green-600 text-sm">(✅ Zoom Verified)</span>}
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={zoomVerified}
                className={`w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  zoomVerified ? 'bg-gray-100 dark:bg-gray-500 cursor-not-allowed' : ''
                }`}
                placeholder="Enter Gmail address (required for students)"
                required
              />
              {form.email.includes('@') && !form.email.endsWith('@gmail.com') && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Students must use Gmail addresses
                </p>
              )}
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

            {/* Student Profile Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Student Information 
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                    (Fill this section if you're registering as a student)
                  </span>
                </h3>
                {!zoomVerified && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                    📝 Note: Students with Gmail addresses must verify their Zoom account first
                  </p>
                )}
              </div>
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