"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";

export default function StudentsPage() {
  const { user, accessToken, refreshAccessToken, logout } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedBatch, setSelectedBatch] = useState(currentYear.toString());
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStudents = async (token) => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://127.0.0.1:8000/instructor/students/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        throw new Error("Unauthorized");
      }

      const data = await response.json();

      if (Array.isArray(data.students)) {
        const mapped = data.students.map((student) => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          phone: student.student_profile?.phone || "N/A",
          school: student.student_profile?.school || "N/A",
          address: student.student_profile?.address || "N/A",
          batch: student.student_profile?.year_of_al || "N/A",
        }));
        setStudents(mapped);
      } else {
        console.error("Unexpected data format:", data);
      }
    } catch (error) {
      if (error.message === "Unauthorized") {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            fetchStudents(newToken);
          } else {
            logout();
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          logout();
        }
      } else {
        console.error("Error fetching students:", error);
      }
       } finally {
      setLoading(false);
    }
    };

  useEffect(() => {
    if (user && accessToken) {
      fetchStudents(accessToken);
    }
  }, [user]);

  const filteredStudents = students.filter((student) => {
    const batchMatch = selectedBatch === "all" || student.batch === selectedBatch;
    const searchMatch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.address.toLowerCase().includes(searchQuery.toLowerCase());
    return batchMatch && searchMatch;
  });

  const years = Array.from({ length: 7 }, (_, i) => currentYear + 3 - i);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            A/L Students Management
          </h1>
        </div>

      {/* Filters and Search */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Year Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="batch" className="text-m font-medium text-gray-700">
              Filter by Year:
            </label>
            <select
              id="batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
               <option value="all">All</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white/60 backdrop-blur-sm border border-purple-200 rounded-lg">
        <div className="p-6 border-b border-purple-200">
          <h3 className="text-lg font-semibold">A/L Student Directory</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Phone Number
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    School
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Address
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Year of A/L
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-gray-100 hover:bg-white/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.email}</td>
                    <td className="py-3 px-4 text-gray-600">{student.phone}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {student.school}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {student.address}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{student.batch}</td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-4 px-4 text-center text-gray-500"
                    >
                      No matching students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

