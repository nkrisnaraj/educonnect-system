"use client";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";

export default function Courses() {
  const enrolledCourses = [
    { id: 1, title: "Chemistry", description: "Introduction to Organic Chemistry", amount: 1000 },
    { id: 2, title: "Physics", description: "Fundamentals of Mechanics", amount: 3000 }
  ];

  const allCourses = [
    { id: 3, title: "Mathematics", description: "Calculus and Algebra", amount: 1000 },
    { id: 4, title: "Biology", description: "Cell Structure & Function", amount: 4000 },
    { id: 5, title: "Computer Science", description: "Introduction to Programming", amount: 2000 }
  ];

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaidClassModal, setShowPaidClassModal] = useState(false);
  const [showUnPaidClassModal, setShowUnPaidClassModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { id } = useParams();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (status === "success") {
      alert("✅ Payment Successful!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "cancel") {
      alert("❌ Payment Cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");
      console.log("Stored User:", storedUser);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));

        setAccessToken(storedToken);
      }
    } catch (e) {
      localStorage.clear();
    }
  }, []);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post(`${API_BASE_URL}/api/accounts/token/refresh/`, {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch {
      localStorage.clear();
      alert("Session expired. Please log in again.");
      return null;
    }
  };

  const getValidToken = async () => {
    let token = accessToken;
    if (!token || isTokenExpired(token)) {
      token = await refreshAccessToken();
      setAccessToken(token);
    }
    return token;
  };

  const handlePaidClass = (course) => {
    setSelectedCourse(course);
    setShowPaidClassModal(true);
  };

  const handleUnPaidClass = (course) => {
    setSelectedCourse(course);
    setShowUnPaidClassModal(true);
  };

  const handleJoin = (course) => {
    setSelectedCourse(course);
    setShowUnPaidClassModal(false);
    setShowPayModal(true);
    setSelectedPayment(null);
  };

  const closeAllModals = () => {
    setShowPaidClassModal(false);
    setShowUnPaidClassModal(false);
    setShowPayModal(false);
    setSelectedCourse(null);
    setSelectedPayment(null);
    setFile(null);
  };

  const handleReceiptUpload = async (e) => {
    e.preventDefault();
    if (!file || !file.type.includes("image")) {
      alert("Please upload a valid image.");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await getValidToken();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("course_id", selectedCourse.id);
      formData.append("amount", selectedCourse.amount);

      const response = await axios.post(
        `${API_BASE_URL}/students/payments/upload-receipt/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(response.data.message || "Receipt uploaded successfully!");
      closeAllModals();
    } catch (error) {
      alert("❌ Upload failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayNow = async () => {
    if (!selectedCourse || !user) {
      alert("Missing data");
      return;
    }

    setIsProcessing(true);
    try {
      const token = await getValidToken();
      console.log("Access Token:", token);
      console.log("Token Expired:", isTokenExpired(token));
      // alert("Selected Course:", selectedCourse.amount);

      const response = await axios.post(
        `${API_BASE_URL}/students/payments/create-payhere-url/`,
        {
          course_id: selectedCourse.id,
          amount: selectedCourse.amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { url, params } = response.data;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      console.log("Payment initiation response:", response.data);
    } catch (err) {
      console.log("❌ Payment initiation failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Enrolled courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Enrolled Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-5 rounded-xl shadow border"
              >
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <button
                  onClick={() => handlePaidClass(course)}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  View More
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Other courses */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Other Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {allCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white p-5 rounded-xl shadow border"
              >
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                <p className="font-bold text-primary mb-4">LKR {course.amount}</p>
                <button
                  onClick={() => handleUnPaidClass(course)}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  View More
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* All modals (same as your existing modals) */}
        {/* Paid Modal */}
        {showPaidClassModal && (
          <Modal title={selectedCourse?.title} onClose={closeAllModals}>
            <p className="text-center">Zoom ID: 1234567890<br />Mr. Sivathiran<br />Mon–Sat</p>
            <div className="text-center mt-4">
              <button className="bg-primary text-white px-4 py-2 rounded">Notes</button>
              <button className="bg-primary text-white px-4 py-2 rounded ml-2">Exams</button>
            </div>
          </Modal>
        )}

        {/* Unpaid Modal */}
        {showUnPaidClassModal && (
          <Modal title={selectedCourse?.title} onClose={closeAllModals}>
            <p className="text-center">Fees: LKR {selectedCourse.amount}<br />Mr. Sivathiran</p>
            <div className="text-center mt-4">
              <button
                onClick={() => handleJoin(selectedCourse)}
                className="bg-primary text-white px-6 py-2 rounded"
              >
                Join Course
              </button>
            </div>
          </Modal>
        )}

        {/* Payment Modal */}
        {showPayModal && (
          <Modal title={`Payment for ${selectedCourse?.title}`} onClose={closeAllModals}>
            <p className="text-center text-primary font-bold mb-4">
              LKR {selectedCourse?.amount}
            </p>
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setSelectedPayment("card")}
                className={`px-4 py-2 rounded ${selectedPayment === "card"
                    ? "bg-primary text-white" : "bg-gray-200"}`}
              >
                💳 Online
              </button>
              <button
                onClick={() => setSelectedPayment("receipt")}
                className={`px-4 py-2 rounded ${selectedPayment === "receipt"
                    ? "bg-primary text-white" : "bg-gray-200"}`}
              >
                📄 Receipt
              </button>
            </div>

            {selectedPayment === "card" && (
              <button
                onClick={handlePayNow}
                className="w-full bg-green-600 text-white px-4 py-3 rounded"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay with PayHere"}
              </button>
            )}

            {selectedPayment === "receipt" && (
              <form onSubmit={handleReceiptUpload} className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded"
                  disabled={isProcessing || !file}
                >
                  {isProcessing ? "Uploading..." : "Upload Receipt"}
                </button>
              </form>
            )}
          </Modal>
        )}
      </div>
    </>
  );
}

// 🔁 Modal component (reuse for all)
function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-center mb-4">{title}</h2>
        {children}
        <div className="text-center mt-4">
          <button onClick={onClose} className="bg-red-600 text-white px-4 py-2 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
