"use client";

import { useEffect, useState } from "react";
import { useInstructorApi } from "@/hooks/useInstructorApi";
import { Search, Users, GraduationCap, BookOpen } from "lucide-react";

export default function StudentsPage() {
  const currentYear = new Date().getFullYear();
  const [selectedBatch, setSelectedBatch] = useState(currentYear.toString());
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const instructorApi = useInstructorApi();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await instructorApi.getStudents();
      
      if (data) {
        const rawStudents = data?.students || [];
        const mapped = rawStudents.map((student) => ({
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          email: student.email,
          phone: student.student_profile?.phone || "N/A",
          school: student.student_profile?.school || "N/A",
          address: student.student_profile?.address || "N/A",
          batch: student.student_profile?.year_of_al || "N/A",
          profile_image: student.student_profile?.profile_image,
          date_joined: student.date_joined,
        }));
        setStudents(mapped);
      } else {
        setError("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setError(error.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const batchMatch = selectedBatch === "all" || student.batch === selectedBatch;
    const searchMatch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.address.toLowerCase().includes(searchQuery.toLowerCase());
    return batchMatch && searchMatch;
  });

  const getStudentStats = () => {
    const totalStudents = students.length;
    const currentYearStudents = students.filter(s => s.batch === currentYear.toString()).length;
    const uniqueSchools = new Set(students.map(s => s.school).filter(s => s !== "N/A")).size;
    
    return { totalStudents, currentYearStudents, uniqueSchools };
  };

  const { totalStudents, currentYearStudents, uniqueSchools } = getStudentStats();
  const years = Array.from({ length: 7 }, (_, i) => currentYear + 3 - i);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchStudents}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-gray-600">Manage and monitor your students</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Year ({currentYear})</p>
              <p className="text-2xl font-bold text-gray-900">{currentYearStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Schools</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueSchools}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="batch" className="text-sm font-medium text-gray-700">
              Filter by Year:
            </label>
            <select
              id="batch"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Years</option>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Student Directory</h3>
            <span className="text-sm text-gray-500">
              {filteredStudents.length} of {totalStudents} students
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Student
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Contact
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  School
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Address
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  A/L Year
                </th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
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
                          <p className="text-sm text-gray-500">ID: {student.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm text-gray-900">{student.email}</p>
                        <p className="text-sm text-gray-500">{student.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-900">{student.school}</td>
                    <td className="py-4 px-6 text-gray-900">{student.address}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.batch === currentYear.toString()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.batch}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {student.date_joined ? new Date(student.date_joined).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center">
                    <div className="text-gray-500">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-sm font-medium text-gray-900 mb-1">No students found</h3>
                      <p className="text-sm">
                        {searchQuery 
                          ? `No students match "${searchQuery}"`
                          : selectedBatch !== "all"
                            ? `No students found for year ${selectedBatch}`
                            : "No students available"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

