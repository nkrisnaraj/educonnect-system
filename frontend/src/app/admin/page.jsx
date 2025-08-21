"use client"

import AdminDashboard from "../../components/admin/AdminDashboard"
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for auth context to load
    const checkAuth = () => {
      const role = sessionStorage.getItem("userRole");
      const token = sessionStorage.getItem("accessToken");
      
      console.log("Admin page auth check:", { user, role, hasToken: !!token });
      
      // If we have no user and no stored auth data, redirect to login
      if (!user && !role && !token) {
        console.log("No auth data found, redirecting to login");
        router.replace("/login");
        return;
      }
      
      // If user is loaded and role doesn't match, redirect
      if (user && user.role !== 'admin') {
        console.log("User role mismatch, redirecting to login");
        router.replace("/login");
        return;
      }
      
      // If stored role doesn't match, redirect
      if (role && role !== 'admin') {
        console.log("Stored role mismatch, redirecting to login");
        router.replace("/login");
        return;
      }
      
      setIsLoading(false);
    };

    // Give context time to load
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  // Show loading while determining auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Final check before rendering dashboard
  const role = sessionStorage.getItem("userRole");
  if ((!user || user.role !== 'admin') && role !== 'admin') {
    return null;
  }

  return <AdminDashboard />
}
