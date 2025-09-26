// Example frontend integration for Zoom OAuth registration
// This shows how to modify your existing registration flow

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterWithZoom() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [zoomVerified, setZoomVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [showZoomButton, setShowZoomButton] = useState(false);

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
    city: "",
    district: ""
  });

  // Check if user came back from Zoom OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('zoom_verified') === 'true') {
      const email = urlParams.get('email');
      if (email) {
        setZoomVerified(true);
        setVerifiedEmail(email);
        setForm(prev => ({ ...prev, email: email }));
        setMessage("Zoom account verified successfully! You can now complete registration.");
        setIsSuccess(true);
      }
    }
  }, []);

  const handleZoomLogin = async () => {
    try {
      const response = await axios.get("/api/accounts/zoom/login/");
      if (response.data.auth_url) {
        // Redirect to Zoom OAuth
        window.location.href = response.data.auth_url;
      }
    } catch (error) {
      setMessage("Failed to initiate Zoom authentication");
      setIsSuccess(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Show Zoom verification when user starts typing email for student registration
    if (name === "email" && value.includes("@")) {
      setShowZoomButton(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Check if this is a student registration (has student profile data)
    const hasStudentProfile = form.nicNo || form.yearOfAL || form.schoolName;

    if (hasStudentProfile && !zoomVerified) {
      setMessage("Students must verify their Zoom account before registration. Please click 'Sign in with Zoom' first.");
      setIsSuccess(false);
      return;
    }

    if (hasStudentProfile && form.email !== verifiedEmail) {
      setMessage(`Email mismatch. You verified ${verifiedEmail} with Zoom, but trying to register with ${form.email}.`);
      setIsSuccess(false);
      return;
    }

    try {
      const payload = {
        username: form.username,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        password: form.password,
        student_profile: hasStudentProfile ? {
          mobile: form.mobile,
          nic_no: form.nicNo,
          address: form.address,
          year_of_al: form.yearOfAL,
          school_name: form.schoolName,
          city: form.city,
          district: form.district,
        } : null,
      };

      const response = await axios.post("/api/accounts/register/", payload);

      if (response.status === 201) {
        setMessage("Registration successful! Please login.");
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registration failed";
      
      if (error.response?.data?.zoom_verification_required) {
        setMessage(errorMsg + " Please use 'Sign in with Zoom' button below.");
        setShowZoomButton(true);
      } else {
        setMessage(errorMsg);
      }
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <MainNavbar />

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Student Registration
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Students must have a Zoom account with Gmail to register
            </p>
          </div>

          {/* Zoom Verification Status */}
          {zoomVerified && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              ✅ Zoom account verified: {verifiedEmail}
            </div>
          )}

          {/* Zoom Sign In Button */}
          {(showZoomButton || !zoomVerified) && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleZoomLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🎥 Sign in with Zoom to Verify Account
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Required for student registration
              </p>
            </div>
          )}

          {/* Registration Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address (must be Gmail for students)"
                disabled={zoomVerified}
              />
            </div>

            {/* Other form fields... */}
            <div>
              <label htmlFor="firstName" className="sr-only">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="First Name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="sr-only">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={form.lastName}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Last Name"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </div>

            {/* Student Profile Fields */}
            <div>
              <label htmlFor="nicNo" className="sr-only">NIC Number</label>
              <input
                id="nicNo"
                name="nicNo"
                type="text"
                value={form.nicNo}
                onChange={handleChange}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="NIC Number (for students)"
              />
            </div>

            {/* Message Display */}
            {message && (
              <div className={`text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
