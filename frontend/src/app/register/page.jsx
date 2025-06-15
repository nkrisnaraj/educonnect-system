
// ✅ src/app/register/page.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <header className="w-full bg-blue-600 p-4 text-white text-xl font-bold text-center">
        EduConnect – Register
      </header>

      <form onSubmit={handleRegister} className="bg-gray-900 p-6 rounded shadow-md w-full max-w-md mt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>

        {error && <p className="bg-red-500 text-white text-sm p-2 rounded mb-3">{error}</p>}

        <label className="block mb-2">
          Full Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Enter full name" />
        </label>

        <label className="block mb-2 mt-4">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Enter email" />
        </label>

        <label className="block mb-2 mt-4">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mt-1 rounded bg-gray-800 border border-gray-700 text-white" placeholder="Enter password" />
        </label>

        <button type="submit" className="mt-6 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Register
        </button>

        <p className="text-sm mt-4 text-center">
          Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </form>

      <footer className="mt-10 w-full bg-blue-600 text-white py-2 text-center text-sm">
        © {new Date().getFullYear()} EduConnect
      </footer>
    </div>
  );
}


// ✅ src/app/dashboard/page.jsx
// "use client";

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function Dashboard() {
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       router.push("/login");
//     }
//   }, []);

//   return (
//     <div className="text-white bg-black min-h-screen p-6">
//       <h1 className="text-3xl font-bold text-blue-500">Welcome to Dashboard</h1>
//       <p className="text-gray-400 mt-2">You are successfully logged in.</p>
//     </div>
//   );
// }

// 
// // ✅ Django (views.py)
// from django.contrib.auth.models import User
// from django.contrib.auth import authenticate
// from rest_framework.decorators import api_view
// from rest_framework.response import Response
// from rest_framework import status

// @api_view(['POST'])
// def register_user(request):
//     name = request.data.get('name')
//     email = request.data.get('email')
//     password = request.data.get('password')

//     if User.objects.filter(username=email).exists():
//         return Response({"detail": "User already exists"}, status=400)

//     user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
//     return Response({"detail": "User registered successfully"})

// @api_view(['POST'])
// def login_user(request):
//     email = request.data.get('email')
//     password = request.data.get('password')
//     user = authenticate(username=email, password=password)
//     if user is not None:
//         # Replace with real JWT token in production
//         return Response({"token": "sample-jwt-token", "user": {"name": user.first_name, "email": user.email}})
//     return Response({"detail": "Invalid credentials"}, status=401)


// // ✅ Django (urls.py)
// from django.urls import path
// from . import views

// urlpatterns = [
//     path('api/register/', views.register_user),
//     path('api/login/', views.login_user),
// ]
