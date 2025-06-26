"use client";
import { useEffect, useState } from "react";
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
  const [selectedPayment, setSelectedPayment] = useState(false);
  const [isPayHereLoaded, setIsPayHereLoaded] = useState(false);
  const [payHereLoadError, setPayHereLoadError] = useState(null);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [file, setFile] = useState(false);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { id } = useParams();


  useEffect(() => {
    if (status === "success") {
      alert("✅ Payment Successful! Thank you for your purchase.");
    } else if (status === "cancel") {
      alert("❌ Payment Cancelled. You can try again later.");
    }
  }, [status]);

  
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  // Improved PayHere script loading
  useEffect(() => {
    const loadPayHereScript = () => {
      return new Promise((resolve, reject) => {
        // Check if PayHere is already available
        if (window.payhere) {
          console.log("✅ PayHere already available");
          resolve();
          return;
        }

        // Check if script already exists
        const existingScript = document.querySelector('script[src*="payhere"]');
        if (existingScript) {
          // Script exists, wait for it to load
          const checkPayHere = setInterval(() => {
            if (window.payhere) {
              console.log("✅ PayHere loaded from existing script");
              clearInterval(checkPayHere);
              resolve();
            }
          }, 100);
          
          // Timeout after 10 seconds
          setTimeout(() => {
            clearInterval(checkPayHere);
            if (!window.payhere) {
              reject(new Error("PayHere script timeout"));
            }
          }, 10000);
          return;
        }

        // Create new script
        const script = document.createElement('script');
        script.src = 'https://sandbox.payhere.lk/lib/payhere.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log("📦 PayHere script loaded successfully");
          
          // Wait for PayHere to initialize
          const checkPayHere = setInterval(() => {
            if (window.payhere) {
              console.log("✅ PayHere object is now available");
              clearInterval(checkPayHere);
              resolve();
            }
          }, 50);
          
          // Timeout after 5 seconds
          setTimeout(() => {
            clearInterval(checkPayHere);
            if (!window.payhere) {
              reject(new Error("PayHere object not available after script load"));
            }
          }, 5000);
        };

        script.onerror = (error) => {
          console.error("❌ Failed to load PayHere script:", error);
          reject(new Error("Failed to load PayHere script"));
        };

        document.head.appendChild(script);
        console.log("📦 PayHere script added to document head");
      });
    };

    // Load the script
    loadPayHereScript()
      .then(() => {
        setIsPayHereLoaded(true);
        setPayHereLoadError(null);
        console.log("🎉 PayHere integration ready!");
      })
      .catch((error) => {
        console.error("❌ PayHere loading failed:", error);
        setPayHereLoadError(error.message);
        setIsPayHereLoaded(false);
      });
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("📦 isPayHereLoaded:", isPayHereLoaded);
    console.log("🌐 window.payhere:", window.payhere);
    console.log("❌ payHereLoadError:", payHereLoadError);
  }, [isPayHereLoaded, payHereLoadError]);

  const handlePaidClass = (paidclass) => {
    setSelectedCourse(paidclass);
    setShowPaidClassModal(true);
  };

  const handleUnPaidClass = (unpaidclass) => {
    setSelectedCourse(unpaidclass);
    setShowUnPaidClassModal(true);
  };

  const handleJoin = (course) => {
    setSelectedCourse(course);
    console.log("course:", course.id);
    setShowPayModal(true);
    setShowUnPaidClassModal(false);
  };

  const handleReceipt = async () => {
    setShowPayModal(false);
    let token = accessToken;
    if (!token || isTokenExpired(token)) {
      token = await refreshAccessToken();
      setAccessToken(token);
    }

    if (!accessToken) {
      alert("You are not authenticated. Please log in again.");
      return;
    }

    if (!file || !file.type.includes("image")) {
      return alert("Please select a file (jpg, png)");
    }
    const formData = new FormData();
    formData.append('image', file);
    console.log(accessToken);
    try {
      const res = await axios.post('http://127.0.0.1:8000/students/payments/upload-receipt/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = res.data;
      alert(data.message);
    } catch (error) {
      console.error(error);
      alert('Something went wrong while uploading the receipt');
    }
  };

  function isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  }

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/token/refresh/", {
        refresh: refreshToken,
      });
      const newAccessToken = response.data.access;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh access token", error);
      return null;
    }
  };

  const handlePayNow = async () => {
    console.log("handlePayNow clicked");

    // Validate PayHere availability
    if (!isPayHereLoaded || !window.payhere) {
      alert("PayHere is not ready yet. Please wait a moment and try again.");
      return;
    }

    if (typeof window.payhere.startPayment !== "function") {
      alert("PayHere startPayment function is not available. Please refresh the page.");
      return;
    }

    setShowPayModal(false);

    let token = accessToken;
    if (!token || isTokenExpired(token)) {
      token = await refreshAccessToken();
      setAccessToken(token);
    }
    if (!token) {
      console.error("No valid access token available.");
      return;
    }

    try {
      const payId = `CLASS-${selectedCourse?.id}-${user?.id}-${Date.now()}`;

      const payment = {
        sandbox: true,
        merchant_id: 1230925,
        return_url: "https://a448-103-77-64-145.ngrok-free.app/students/courses?status=success",
        cancel_url: "https://a448-103-77-64-145.ngrok-free.app/students/courses?status=cancel",
        notify_url: "https://a448-103-77-64-145.ngrok-free.app/students/payhere-notify",
        order_id: payId,
        items: selectedCourse.title || "Course Payment",
        amount: selectedCourse.amount,
        currency: "LKR",
        first_name: user?.first_name || "Student",
        last_name: user?.last_name || "Name",
        address: user?.student_profile?.address || "N/A",
        city: "Colombo",
        email: user?.email || "student@example.com",
        phone: user?.student_profile?.mobile || "0770000000",
        country: "Sri Lanka",
      };

      console.log("💳 Starting payment with:", payment);

      // Start payment
      window.payhere.startPayment(payment);

    } catch (err) {
      console.error("❌ Payment initiation failed:", err);
      alert("Payment failed to start. Please try again.");
    }
  };

  // Show loading state while PayHere is loading
  if (!isPayHereLoaded && !payHereLoadError) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Show PayHere error if any */}
        {payHereLoadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Payment System Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>Unable to load PayHere: {payHereLoadError}</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 text-red-800 underline hover:text-red-900"
                  >
                    Reload page
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enrolled Courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Enrolled Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {enrolledCourses.map(course => (
              <div
                key={course.id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition duration-300 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <button 
                  onClick={() => handlePaidClass(course)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
                >
                  View More
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Other Courses */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Other Courses</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {allCourses.map(course => (
              <div
                key={course.id}
                className="bg-white p-5 rounded-xl shadow hover:shadow-md transition duration-300 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                <button 
                  onClick={() => handleUnPaidClass(course)}
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition"
                >
                  View More
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Modals remain the same */}
        {showPaidClassModal && (
          <div
            className="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowPaidClassModal(false)}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl ring-1 ring-black ring-opacity-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl text-center font-semibold mb-6 text-gray-900">2024 A/L Day</h2>
              <div className="flex gap-12 mb-6 justify-center">
                <button className="bg-primary text-white px-6 py-2 rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition">
                  Notes
                </button>
                <button className="bg-primary text-white px-6 py-2 rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition">
                  Exams
                </button>
              </div>
              <h3 className="text-lg text-center font-bold mb-2 text-gray-800">Mr.Sivathiran</h3>
              <p className="mb-1 text-center text-gray-600">Mon, Tue, Wed, Sat</p>
              <p className="mb-1 text-center text-gray-600">8:00 a.m to 9:00 a.m</p>
              <p className="mb-6 text-center text-gray-600">Zoom ID: 1234567890</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPaidClassModal(false)}
                  className="text-sm bg-red-600 px-6 py-2 items-center text-white rounded-md shadow hover:text-red-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showUnPaidClassModal && (
          <div
            className="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowUnPaidClassModal(false)}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl ring-1 ring-black ring-opacity-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl text-center font-semibold mb-6 text-gray-900">2024 A/L Day</h2>
              <div className="flex gap-12 mb-6 justify-center">
                <button onClick={() => handleJoin(selectedCourse)} className="bg-primary text-white px-6 py-2 rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition">
                  Join
                </button>
              </div>
              <h3 className="text-lg text-center font-bold mb-2 text-gray-800">Mr.Sivathiran</h3>
              <p className="mb-1 text-center text-gray-600">Mon, Tue, Wed, Sat</p>
              <p className="mb-1 text-center text-gray-600">8:00 a.m to 9:00 a.m</p>
              <p className="mb-6 text-center text-gray-600">Monthly Fees: LKR 1500</p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowUnPaidClassModal(false)}
                  className="text-sm bg-red-600 px-6 py-2 items-center text-white rounded-md shadow hover:text-red-100 focus:outline-none focus:ring-1 focus:ring-red-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showPayModal && (
          <div
            className="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowPayModal(false);
              setSelectedCourse(null);
              setSelectedPayment(null);
            }}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl ring-1 ring-black ring-opacity-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl text-center font-bold mb-6 text-gray-800">Choose Payment Option</h2>
              <div className="flex justify-center gap-6 mb-6">
                <button
                  onClick={() => setSelectedPayment("card")}
                  className={`px-4 py-2 rounded transition ${
                    selectedPayment === "card" ? "bg-primary text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Credit Card
                </button>
                <button
                  onClick={() => setSelectedPayment("receipt")}
                  className={`px-4 py-2 rounded transition ${
                    selectedPayment === "receipt" ? "bg-primary text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  Receipt Upload
                </button>
              </div>

              {selectedPayment === "card" && (
                <div className="mb-4">
                  <button
                    onClick={handlePayNow}
                    disabled={!isPayHereLoaded || payHereLoadError}
                    className={`w-full py-2 rounded ${
                      isPayHereLoaded && !payHereLoadError 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isPayHereLoaded && !payHereLoadError 
                      ? "Pay with Card via PayHere" 
                      : payHereLoadError 
                        ? "PayHere Error - Reload Page" 
                        : "Loading PayHere..."}
                  </button>
                </div>
              )}

              {selectedPayment === "receipt" && (
                <form className="space-y-4 mb-4" onSubmit={handleReceipt}>
                  <input 
                    type="file" 
                    className="w-full border rounded px-4 py-2" 
                    name="image" 
                    onChange={(e) => setFile(e.target.files[0])} 
                  />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
                    Upload Receipt
                  </button>
                </form>
              )}

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setShowPayModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-sm bg-red-600 px-6 py-2 text-white rounded-md shadow hover:text-red-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}