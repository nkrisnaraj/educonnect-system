"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useSearchParams } from "next/navigation";
import PayButton from "@/components/paybutton";
import { useAuth } from "@/context/AuthContext";

export default function Classes() {
  const [selectedClass, setSelectedClass] = useState([]);
  const [selectedClassDetails, setSelectedClassDetails] = useState([]);
  const [showPaidClassModal, setShowPaidClassModal] = useState(false);
  const [showUnPaidClassModal, setShowUnPaidClassModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  //const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  //const [accessToken, setAccessToken] = useState(null);
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const { id } = useParams();
  const router = useRouter();
  const {user,accessToken,refreshToken,refreshAccessToken,api,loading} = useAuth()
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  // Debug logging
  useEffect(() => {
    console.log('📊 Classes page auth state:', {
      hasUser: !!user,
      username: user?.username,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      authLoading: loading,
      pageLoading: isLoading
    });
  }, [user, accessToken, refreshToken, loading, isLoading]);

  // Helper function to categorize classes based on dates
  const categorizeClass = (classItem) => {
    const currentDate = new Date();
    const startDate = new Date(classItem.start_date);
    const endDate = new Date(classItem.end_date);
    
    if (currentDate < startDate) {
      return 'pending';
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return 'active';
    } else {
      return 'completed';
    }
  };

  // Helper function to categorize classes into groups
  const categorizeClasses = (classList) => {
    return classList.reduce((acc, classItem) => {
      const category = categorizeClass(classItem);
      if (!acc[category]) acc[category] = [];
      acc[category].push(classItem);
      return acc;
    }, {});
  };

  useEffect(() => {
    if (status === "success") {
      alert(" Payment Successful!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "cancel") {
      alert(" Payment Cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status]);

  // Token handling is now managed by AuthContext - removed deprecated code

  // Token expiration checking is now handled by AuthContext

  // Token validation is now handled by AuthContext and api interceptors

  // Token validation is now handled by AuthContext and api interceptors

  const toggleClassSelection = (classId) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  useEffect(() => {
      const fetchAllClasses = async () => {
        // Don't start loading if auth context is still loading
        if (loading) {
          console.log("Auth context still loading, waiting...");
          return;
        }
        
        // Check if we have tokens but no user data - this might be a refresh scenario
        if (!user && (accessToken || refreshToken)) {
          console.log("Tokens exist but user not loaded yet, waiting...");
          return;
        }
        
        // If no tokens at all, stop loading but don't fetch
        if (!accessToken || !refreshToken) {
          console.log("No tokens available, stopping fetch");
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        try {
          const response = await api.get("/students/classes/", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          console.log("Fetched Classes:", response.data);
          setClasses(response.data.others);
          setEnrolledClasses(response.data.enrolled);
        } catch (error) {
          console.error("Error fetching classes:", error);
          if (error.response?.status === 401) {
            console.log("Token expired, attempting refresh...");
            try {
              await refreshAccessToken();
              // Retry the request after token refresh
              const retryResponse = await api.get("/students/classes/");
              setClasses(retryResponse.data.others);
              setEnrolledClasses(retryResponse.data.enrolled);
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              alert("Session expired. Please login again.");
            }
          } else {
            alert("Failed to fetch classes. Please try again later.");
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllClasses();
    }, [accessToken, refreshToken, loading, user, api, refreshAccessToken]);


  const handlePaidClass = (Class) => {
    setSelectedClass(Class);
    setShowPaidClassModal(true);
  };

  const closeAllModals = () => {
    setShowPaidClassModal(false);
    setShowUnPaidClassModal(false);
    setShowPayModal(false);
    setSelectedClass(null);
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
      const selectedClassDetails = classes.filter((Class) =>
        selectedClasses.includes(Class.classid)
      );
      const totalAmount = selectedClassDetails.reduce(
        (sum, Class) => sum + parseFloat(Class.fee),
        0
      );
      const formData = new FormData();
      formData.append("image", file);
      formData.append("class_ids", JSON.stringify(selectedClasses)); // Send array of course IDs
      formData.append("amount", totalAmount);

      const response = await api.post(
        "/students/payments/upload-receipt/",
        formData,
        {
          headers: {
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

  console.log("Sending class IDs:", selectedClassDetails.map(c => c.classid));

  const handlePayment = async () => {
    if (!selectedClass || !user) {
      alert("Missing data");
    }
    else {
      console.log("Selected Class:", selectedClass);
    }
    const paymentDetails = {
      order_id: `order_${Date.now()}`,
      amount: totalAmount.toFixed(2),
      currency: 'LKR',
      items: selectedClassDetails.map(c => c.title).join(", "),
      class_ids: selectedClassDetails.map(c => c.classid),  
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      phone: user?.student_profile?.mobile,
      address: user?.student_profile?.address || 'No Address Provided',
      city: 'Colombo',
      country: 'Sri Lanka',
    };

    console.log("Payment Details:", paymentDetails);

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
      if (!res.ok) {
        const text = await res.text();
        console.error("Server error response:", text);
        alert("Server error: " + text);
        return;
    }
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
    if (selectedClasses.length === 0) {
      alert("Please select at least one class to pay.");
      return;
    }

    //Calculate selected course details
    const selectedClassDetails = classes.filter((clz) =>
      selectedClasses.includes(clz.classid)
    );

    //Calculate total amount
    const total = selectedClassDetails.reduce(
      (sum, clz) => sum + parseFloat(clz.fee),
      0
    );

    // Save both to state
    setSelectedClassDetails(selectedClassDetails); 
    console.log("Selected Class Details:", selectedClassDetails);
    setSelectedClass(selectedClassDetails);  
    setTotalAmount(total);                     // Save total amount to state
    setShowPayModal(true);

  };


  return (
    <>
      {/* Header Section - Outside main div */}
      <div className="mb-8 px-6 pt-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          My Classes
        </h1>
        {/* <p className="text-gray-600">Manage your enrolled classes and explore new courses</p> */}
      </div>

      <div className="bg-white min-h-screen p-6 pt-0">
        {/* Loading State within page */}
        {(loading || isLoading) && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
              <p className="text-gray-600 font-medium text-lg">Loading classes...</p>
            </div>
          </div>
        )}

        {/* Show content only when not loading */}
        {!(loading || isLoading) && (
          <>
            {/* Enrolled courses */}
            <section className="mb-12 p-4">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Enrolled Classes</h2>
          </div>
          
          {(() => {
            const categorizedEnrolled = categorizeClasses(enrolledClasses);
            return (
              <div>
                {/* <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-800">Total Enrolled: {enrolledClasses.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-green-700">{categorizedEnrolled.active?.length || 0} Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-700">{categorizedEnrolled.pending?.length || 0} Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-700">{categorizedEnrolled.completed?.length || 0} Completed</span>
                    </div>
                  </div>
                </div> */}
                
                {/* Three column layout with scroll */}
                <div className="grid gap-6 lg:grid-cols-3 max-h-96 overflow-hidden">
                  
                  {/* Active Classes Column */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-lg">
                    <div className="flex items-center mb-4 sticky top-0 bg-gradient-to-br from-green-50 to-emerald-50 pb-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-3"></div>
                      <h3 className="text-lg font-semibold text-green-700">
                        Active Classes ({categorizedEnrolled.active?.length || 0})
                      </h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-2">
                      <div className="space-y-3">
                        {(categorizedEnrolled.active || []).map((clz) => (
                          <div
                            key={clz.classid}
                            className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg border border-green-200 hover:border-green-300 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm text-gray-800 group-hover:text-green-700 transition-colors">{clz.title}</h4>
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-primary font-bold text-sm mb-2 flex items-center">
                              <span className="text-green-600 mr-1">₨</span>{clz.fee}
                            </p>
                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              {new Date(clz.start_date).toLocaleDateString()} - {new Date(clz.end_date).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => handlePaidClass(clz)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                        {(!categorizedEnrolled.active || categorizedEnrolled.active.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-8">No active classes</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pending Classes Column */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 shadow-lg">
                    <div className="flex items-center mb-4 sticky top-0 bg-gradient-to-br from-yellow-50 to-orange-50 pb-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-3"></div>
                      <h3 className="text-lg font-semibold text-yellow-700">
                        Pending Classes ({categorizedEnrolled.pending?.length || 0})
                      </h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-2">
                      <div className="space-y-3">
                        {(categorizedEnrolled.pending || []).map((clz) => (
                          <div
                            key={clz.classid}
                            className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg border border-yellow-200 hover:border-yellow-300 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm text-gray-800 group-hover:text-yellow-700 transition-colors">{clz.title}</h4>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            </div>
                            <p className="text-primary font-bold text-sm mb-2 flex items-center">
                              <span className="text-yellow-600 mr-1">₨</span>{clz.fee}
                            </p>
                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              Starts: {new Date(clz.start_date).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => handlePaidClass(clz)}
                              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                        {(!categorizedEnrolled.pending || categorizedEnrolled.pending.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-8">No pending classes</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Completed Classes Column */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-xl border border-gray-200 shadow-lg">
                    <div className="flex items-center mb-4 sticky top-0 bg-gradient-to-br from-gray-50 to-slate-100 pb-2">
                      <div className="w-2 h-6 bg-gradient-to-b from-gray-500 to-slate-600 rounded-full mr-3"></div>
                      <h3 className="text-lg font-semibold text-gray-700">
                        Completed Classes ({categorizedEnrolled.completed?.length || 0})
                      </h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-2">
                      <div className="space-y-3">
                        {(categorizedEnrolled.completed || []).map((clz) => (
                          <div
                            key={clz.classid}
                            className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-sm text-gray-800 group-hover:text-gray-700 transition-colors">{clz.title}</h4>
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <p className="text-primary font-bold text-sm mb-2 flex items-center">
                              <span className="text-gray-600 mr-1">₨</span>{clz.fee}
                            </p>
                            <p className="text-xs text-gray-500 mb-3 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Completed: {new Date(clz.end_date).toLocaleDateString()}
                            </p>
                            <button
                              onClick={() => handlePaidClass(clz)}
                              className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 w-full shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                        {(!categorizedEnrolled.completed || categorizedEnrolled.completed.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-8">No completed classes</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {enrolledClasses.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No enrolled classes found</p>
                )}
              </div>
            );
          })()}
        </section>

        {/* Other courses */}
        <section>
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Explore New Classes</h2>
          </div>
          
          {(() => {
            const categorizedOthers = categorizeClasses(classes);
            
            return (
              <div>
                {/* <div className="mb-4 text-sm text-gray-600">
                  Available Classes: {(categorizedOthers.active?.length || 0) + (categorizedOthers.pending?.length || 0)} 
                  ({categorizedOthers.active?.length || 0} Active, {categorizedOthers.pending?.length || 0} Pending)
                </div> */}
                
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (selectedClasses.length === 0) {
                      alert("Please select at least one class to pay.");
                      return;
                    }
                    setShowPayModal(true);
                  }}
                >
                  {/* Two column layout with scroll */}
                  <div className="grid gap-6 lg:grid-cols-2 max-h-96 overflow-hidden">
                    
                    {/* Active Classes Column */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-green-700 sticky top-0 bg-gray-50 pb-2">
                        Active Classes ({categorizedOthers.active?.length || 0})
                      </h3>
                      <div className="max-h-72 overflow-y-auto pr-2">
                        <ul className="space-y-3">
                          {(categorizedOthers.active || []).map((clz) => (
                            <li
                              key={clz.classid}
                              className="bg-white p-3 rounded-lg shadow border border-green-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{clz.title}</h4>
                                  <p className="text-xs text-gray-600 mb-1">{clz.description}</p>
                                  <p className="text-primary font-bold text-sm mb-1">LKR {clz.fee}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(clz.start_date).toLocaleDateString()} - {new Date(clz.end_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ml-2 mt-1"
                                  checked={selectedClasses.includes(clz.classid)}
                                  onChange={() => toggleClassSelection(clz.classid)}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                        {(!categorizedOthers.active || categorizedOthers.active.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-8">No active classes available</p>
                        )}
                      </div>
                    </div>

                    {/* Pending Classes Column */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-yellow-700 sticky top-0 bg-gray-50 pb-2">
                        Pending Classes ({categorizedOthers.pending?.length || 0})
                      </h3>
                      <div className="max-h-72 overflow-y-auto pr-2">
                        <ul className="space-y-3">
                          {(categorizedOthers.pending || []).map((clz) => (
                            <li
                              key={clz.classid}
                              className="bg-white p-3 rounded-lg shadow border border-yellow-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-sm mb-1">{clz.title}</h4>
                                  <p className="text-xs text-gray-600 mb-1">{clz.description}</p>
                                  <p className="text-primary font-bold text-sm mb-1">LKR {clz.fee}</p>
                                  <p className="text-xs text-gray-500">
                                    Starts: {new Date(clz.start_date).toLocaleDateString()}
                                  </p>
                                </div>
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ml-2 mt-1"
                                  checked={selectedClasses.includes(clz.classid)}
                                  onChange={() => toggleClassSelection(clz.classid)}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                        {(!categorizedOthers.pending || categorizedOthers.pending.length === 0) && (
                          <p className="text-gray-500 text-sm text-center py-8">No pending classes available</p>
                        )}
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Payment Button */}
                  {((categorizedOthers.active?.length || 0) + (categorizedOthers.pending?.length || 0)) > 0 && (
                    <button
                      type="submit"
                      className="mt-6 bg-primary text-white px-6 py-3 rounded hover:bg-primary/90 transition-colors w-full"
                      onClick={proceedpay}
                    >
                      Proceed to Pay ({selectedClasses.length} selected)
                    </button>
                  )}
                  
                  {((categorizedOthers.active?.length || 0) + (categorizedOthers.pending?.length || 0)) === 0 && (
                    <p className="text-gray-500 text-center py-8">No classes available for enrollment</p>
                  )}
                </form>
              </div>
            );
          })()}
        </section>
        
        </>
        )}

        {/* Modals - Always show regardless of loading state */}
        {/* Paid Modal */}
        {showPaidClassModal && (
          <Modal title={selectedClass?.title} onClose={closeAllModals} className="space-y-4 gap-4">
            <p className="text-center text-gray-600">Webinar ID: {selectedClass.webinar_id}<br />Mr. Sivathiran</p>
            <p className="text-md text-center text-gray-600"style={{ whiteSpace: "pre-line" }}>{selectedClass.schedule}</p>
            <p className="text-center text-gray-600">{selectedClass.description}</p>
            <p className="text-center text-gray-600">LKR {selectedClass.fee}</p>
            <div className="text-center mt-4 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button 
                  onClick={()=>{router.push(`/students/${id}/classes/${selectedClass.classid}/notes`)}} 
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                >
                  📚 Notes
                </button>
                <button 
                  onClick={() => {
                    if (selectedClass.webinar_id) {
                      window.open(`https://zoom.us/j/${selectedClass.webinar_id}`, '_blank');
                    } else {
                      alert('No webinar link available for this class');
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  🎥 Join Webinar
                </button>
                <button 
                  onClick={()=>{router.push(`/students/${id}/exams`)}} 
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  📝 Exams
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Payment Modal */}
        {showPayModal && (
          <Modal title="Payment Summary" onClose={closeAllModals}>

            {/*  List Selected Courses */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Selected Classes:</h3>
              <ul className="list-disc list-inside text-gray-700">
                {selectedClass.map((Class) => (
                  <li key={Class.classid}>
                    {Class.title} - LKR {Class.fee}
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

