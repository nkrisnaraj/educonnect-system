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
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (status === "success") {
      alert(" Payment Successful!");
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "cancel") {
      alert(" Payment Cancelled.");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [status]);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("accessToken");
      console.log("Stored User:", storedUser);
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      }
    } catch (e) {
      sessionStorage.clear();
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

  // const refreshAccessToken = async () => {
  //   try {
  //     const refreshToken = sessionStorage.getItem("refreshToken");
  //     const response = await axios.post(`${API_BASE_URL}/api/accounts/token/refresh/`, {
  //       refresh: refreshToken,
  //     });
  //     const newAccessToken = response.data.access;
  //     sessionStorage.setItem("accessToken", newAccessToken);
  //     return newAccessToken;
  //   } catch {
  //     sessionStorage.clear();
  //     alert("Session expired. Please log in again.");
  //     return null;
  //   }
  // };

  const getValidToken = async () => {
    let token = accessToken;
    if (!token || isTokenExpired(token)) {
      token = await refreshAccessToken();
      setAccessToken(token);
    }
    return token;
  };

  const toggleClassSelection = (classId) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  useEffect(() => {
      const fetchAllClasses = async () => {
        try {
          if (!accessToken || !refreshToken) {
            console.log("Tokens not ready yet");
            return;
          }
          const token = accessToken;
          const response = await api.get("/students/classes/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Fetched Classes:", response.data);
          setClasses(response.data.others);
          setEnrolledClasses(response.data.enrolled);
        } catch (error) {
          console.error("Error fetching classes:", error);
          alert("Failed to fetch classes. Please try again later.");
        }
      };

      fetchAllClasses();
    }, [accessToken]);


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
      const token = await getValidToken();
      const selectedClassDetails = allClasses.filter((Class) =>
        selectedClasses.includes(Class.id)
      );
      const totalAmount = selectedClassDetails.reduce(
        (sum, Class) => sum + Class.amount,
        0
      );
      const formData = new FormData();
      formData.append("image", file);
      formData.append("class_ids", JSON.stringify(selectedClasses)); // Send array of course IDs
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
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Enrolled courses */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Enrolled Classes</h2>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {enrolledClasses.map((clz) => (
              <div
                key={clz.classid}
                className="bg-white p-5 rounded-xl shadow border"
              >
                <h3 className="text-lg font-semibold mb-2 ">{clz.title}</h3>
                
                <p className="text-primary font-bold mb-2">LKR {clz.fee}</p>
                <button
                  onClick={() => handlePaidClass(clz)}
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
          <h2 className="text-2xl font-bold mb-6">Other Classes</h2>
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
            <ul className="space-y-4 max-w-3xl">
              {classes.map((clz) => (
                <li
                  key={clz.classid}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-xl shadow border"
                >

                  {/* Left: Course Info */}
                  <div>
                    <h3 className="font-semibold">{clz.title}</h3>
                    <p className="text-sm text-gray-600">{clz.description}</p>
                    <p className="text-primary font-bold">LKR {clz.fee}</p>
                  </div>

                  {/* Right: Checkbox */}
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={selectedClasses.includes(clz.classid)}
                    onChange={() => toggleClassSelection(clz.classid)}
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

