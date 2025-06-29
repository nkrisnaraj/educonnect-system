"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import PayButton from "@/components/paybutton";
import { useAuth } from "@/context/AuthContext";

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

  const [selectedCourse, setSelectedCourse] = useState([]);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState([]);
  const [showPaidClassModal, setShowPaidClassModal] = useState(false);
  const [showUnPaidClassModal, setShowUnPaidClassModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { id } = useParams();
  const router = useRouter();
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
        // setAccessToken(storedToken);
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

  const toggleCourseSelection = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handlePaidClass = (course) => {
    setSelectedCourse(course);
    setShowPaidClassModal(true);
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
      const selectedCourseDetails = allCourses.filter((course) =>
        selectedCourses.includes(course.id)
      );
      const totalAmount = selectedCourseDetails.reduce(
        (sum, course) => sum + course.amount,
        0
      );
      const formData = new FormData();
      formData.append("image", file);
      formData.append("course_ids", JSON.stringify(selectedCourses)); // Send array of course IDs
      formData.append("amount", totalAmount);

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
      console.error(error);
      alert("❌ Upload failed. Try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { accessToken } = useAuth();
  const handlePayment = async () => {

    if (!selectedCourse || !user) {
      alert("Missing data");
    }
    else {
      console.log("Selected Course:", selectedCourse);
    }


    const paymentDetails = {
      order_id: `order_${Date.now()}`,
      amount: totalAmount.toFixed(2),
      currency: 'LKR',
      items: selectedCourseDetails.map(c => c.title).join(", "),
      course_ids: selectedCourseDetails.map(c => c.id),  
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      phone: user?.student_profile?.mobile,
      address: user?.student_profile?.address || 'No Address Provided',
      city: 'Colombo',
      country: 'Sri Lanka',
    };

    try {
      // Request hash from Django backend
      if (!accessToken) {
        alert("You're not logged in. Please login first.");
        return;
      }

      const res = await fetch('http://127.0.0.1:8000/students/api/initiate-payment/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },

        body: JSON.stringify(paymentDetails),
      });
      console.log("paymentdetails: ", paymentDetails)
      const { merchant_id, hash } = await res.json();
      console.log("merchantid: ", merchant_id)

      const payment = {
        sandbox: true,
        merchant_id,
        return_url: `${window.location.origin}/students/payment/success`,
        cancel_url: `${window.location.origin}/students/payment/cancel`,
        notify_url: `https://francisco-saving-roots-suggests.trycloudflare.com/students/api/payment/notify/`,
        order_id: paymentDetails.order_id,
        items: 'Class Fees',
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        ...paymentDetails,
        hash,
      };
      if (!merchant_id || !hash || !paymentDetails.order_id || !paymentDetails.amount) {
        console.error("Invalid PayHere payload:", payment);
        alert("Invalid payment data. Please try again.");
        return;
      }


      if (window.payhere) {
        console.log("PayHere payload:", payment);
        window.payhere.startPayment(payment);
      } else {
        alert("PayHere SDK not loaded");
      }
    } catch (err) {
      console.error('Payment error', err);
      alert("Payment failed");
    }
  };

  // const selectedCourseDetails = allCourses.filter((course) =>
  //   selectedCourses.includes(course.id)
  // );

  // const totalSelectedAmount = selectedCourseDetails.reduce(
  //   (sum, course) => sum + course.amount,
  //   0
  // );

  const proceedpay = (e) => {
    e.preventDefault();
    if (selectedCourses.length === 0) {
      alert("Please select at least one course to pay.");
      return;
    }

    //Calculate selected course details
    const selectedCourseDetails = allCourses.filter((course) =>
      selectedCourses.includes(course.id)
    );

    //Calculate total amount
    const total = selectedCourseDetails.reduce(
      (sum, course) => sum + course.amount,
      0
    );

    // Save both to state
    setSelectedCourseDetails(selectedCourseDetails); 
    console.log("Selected Course Details:", selectedCourseDetails);
    setSelectedCourse(selectedCourseDetails);  
    setTotalAmount(total);                     // Save total amount to state
    setShowPayModal(true);

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (selectedCourses.length === 0) {
                alert("Please select at least one course to pay.");
                return;
              }
              setShowPayModal(true);
            }}
          >
            <ul className="space-y-4 max-w-3xl">
              {allCourses.map((course) => (
                <li
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl shadow border"
                >

                  {/* Left: Course Info */}
                  <div>
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <p className="text-primary font-bold">LKR {course.amount}</p>
                  </div>

                  {/* Right: Checkbox */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => toggleCourseSelection(course.id)}
                  />
                </li>
              ))}
            </ul>

            <button
              type="submit"
              className="mt-4 bg-primary text-white px-6 py-2 rounded"
              onClick={proceedpay}
            >
              Proceed to Pay
            </button>
          </form>
        </section>

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


        {/* Payment Modal */}
        {showPayModal && (
          <Modal title="Payment Summary" onClose={closeAllModals}>

            {/*  List Selected Courses */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Selected Courses:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {selectedCourse.map((course) => (
                  <li key={course.id}>
                    {course.title} - LKR {course.amount}
                  </li>
                ))}
              </ul>
            </div>

            {/* Total Amount */}
            <p className="text-center text-primary font-bold mb-4">
              Total Amount: LKR {totalAmount}
            </p>

            {/* Payment Options */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setSelectedPayment("card")}
                className={`px-4 py-2 rounded ${selectedPayment === "card" ? "bg-primary text-white" : "bg-gray-200"
                  }`}
              >
                💳 Online
              </button>
              <button
                onClick={() => setSelectedPayment("receipt")}
                className={`px-4 py-2 rounded ${selectedPayment === "receipt" ? "bg-primary text-white" : "bg-gray-200"
                  }`}
              >
                📄 Receipt
              </button>
            </div>

            {/*  Card Payment */}
            {selectedPayment === "card" && (
              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white px-4 py-3 rounded"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Pay with PayHere"}
              </button>

              // <div className="max-w-md mx-auto mt-20 p-6 bg-slate-700 rounded-lg shadow-md">
              //   <h1 className="text-2xl font-bold text-center mb-6">Checkout</h1>
              //   <div className="space-y-4">
              //     <div className="p-4 border rounded-lg">
              //       <h2 className="font-semibold">Pay Class Fees</h2>
              //       <p>LKR 2500.00</p>
              //     </div>
              //     <PayButton />
              //   </div>
              // </div>
            )}

            {/* Receipt Upload */}
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

// Modal component (reuse for all)
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
