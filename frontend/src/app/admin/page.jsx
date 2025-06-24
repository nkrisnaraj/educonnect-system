"use client"

import AdminDashboard from "../../components/admin/AdminDashboard"
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminPage() {

  const {user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (!user || !role || role !== 'admin') {
      router.replace("/login");
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return null; // or a loading spinner
  }
  return <AdminDashboard />
}
