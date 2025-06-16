"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    schoolName: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/api/accounts/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Registration failed!");
        setIsSuccess(false);
      } else {
        setMessage("Registered successfully!");
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      setMessage("Server error. Try again later.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 py-6 bg-gray-100">
      {message && (
        <div
          className={`fixed top-5 right-5 w-[380px] px-6 py-4 rounded-xl shadow-2xl border-l-8 z-50 text-sm font-semibold transition-all duration-500 ease-in-out animate-fadeIn ${
            isSuccess
              ? 'bg-green-100 text-green-900 border-green-700'
              : 'bg-red-100 text-red-900 border-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl"
      >
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
          Create an Account
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Enter Username"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Enter Email"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="First Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Last Name"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="0771234567"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">NIC No</label>
            <input
              type="text"
              name="nicNo"
              value={form.nicNo}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="200012345678"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Year of A/L</label>
            <input
              type="text"
              name="yearOfAL"
              value={form.yearOfAL}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="2021"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">School Name</label>
            <input
              type="text"
              name="schoolName"
              value={form.schoolName}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="School Name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Address"
              rows={2}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 rounded border border-gray-300"
              placeholder="Enter password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold transition duration-300"
        >
          Register
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
