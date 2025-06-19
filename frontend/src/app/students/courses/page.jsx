"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function Courses() {
  const enrolledCourses = [
    { id: 1, title: "Chemistry", description: "Introduction to Organic Chemistry" },
    { id: 2, title: "Physics", description: "Fundamentals of Mechanics" }
  ];

  const allCourses = [
    { id: 3, title: "Mathematics", description: "Calculus and Algebra" },
    { id: 4, title: "Biology", description: "Cell Structure & Function" },
    { id: 5, title: "Computer Science", description: "Introduction to Programming" }
  ];

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaidClassModal, setShowPaidClassModal] = useState(false);
  const [showUnPaidClassModal, setShowUnPaidClassModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(false)
  const [isPayHereLoaded, setIsPayHereLoaded] = useState(false);

  


  // const {user, accessToken} = useAuth();

  
 

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedToken) {
      setAccessToken(storedToken);
    }
  }, []);

if (!user) {
    return <p className="text-center mt-10">Please log in to see courses.</p>;
  }
  
  console.log("User:", user);
  console.log("Access Token:", accessToken);

  const handlePaidClass = (paidclass) =>{
    setSelectedCourse(paidclass)
    setShowPaidClassModal(true);
  }

   const handleUnPaidClass = (unpaidclass) =>{
    setSelectedCourse(unpaidclass)
    setShowUnPaidClassModal(true);
  }


  const handleJoin = (course) =>{
    setSelectedCourse(course)
    console.log("course;",course.id);
    setShowPayModal(true);
    setShowUnPaidClassModal(false);
  }

  const handleReceipt = () =>{
    setShowPayModal(false);

  }

// lazy-load script just before payment
// const loadPayHereScript = () => {
//   return new Promise((resolve, reject) => {
//     if (window.payhere) return resolve(); // already loaded

//     const script = document.createElement("script");
//     script.src = "https://www.payhere.lk/lib/payhere.js";
//     script.onload = resolve;
//     script.onerror = reject;
//     document.body.appendChild(script);
//   });
// };


  const handlePayNow = async() => {

    setShowPayModal(false);

    if (!isPayHereLoaded || typeof window === "undefined" || !window.payhere) {
      console.error(" PayHere script not loaded.");
      return;
    }

    const payId = `CLASS-${selectedCourse?.id}-${user?.id}`;

    const payment = {
        sandbox: true, // remove this in production
        merchant_id: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID, // Replace with your Merchant ID
        return_url: "http://localhost:3000/payment-success", 
        cancel_url: "http://localhost:3000/payment-cancel",
        notify_url: "http://localhost:8000/api/payhere-notify", // backend webhook

        order_id: payId, // unique order ID
        items: selectedCourse?.title || "Course Payment",
        amount: selectedCourse?.amount ,
        currency: "LKR",
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        phone: user?.mobile,
        address: user?.address,
        city: user?.address,
        country: "Sri Lanka",
      };

      window.payhere.startPayment(payment);

    // try {
    
    //   const response = await axios.post(
    //     "http://localhost:8000/payments/online/",
    //     {
    //       amount: selectedCourse?.amount,
    //       course: selectedCourse?.id,
    //     },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${accessToken}`,
    //       },
    //     }
    //   );

    //   const { payid, invoice_no, amount } = response.data;
  
    // } catch (error) {
    //   console.error("Error creating payment or starting PayHere:", error);
    // }
 
};



  return (
    
    <div className="bg-gray-50 min-h-screen p-6">
      <Script 
          src="https://www.payhere.lk/lib/payhere.js" 
          strategy="beforeInteractive"
          onLoad={()=>{
            console.log("Payhere script loaded!");
            setIsPayHereLoaded(true);
          }} />

      {/* Enrolled Courses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 ">Enrolled Courses</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {enrolledCourses.map(course => (
            <div
              key={course.id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-md transition duration-300 border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              <button 
                onClick={()=>handlePaidClass(course)}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
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
                onClick = {() => handleUnPaidClass(course)}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">
                View More
              </button>
            </div>
          ))}
        </div>
      </section>
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
        <button onClick={()=>{handleJoin(selectedCourse)}} className="bg-primary text-white px-6 py-2 rounded-md shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 transition">
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

      {/* Show card pay option */}
      {selectedPayment === "card" && (
        <div className="mb-4">
          <button
            onClick={handlePayNow}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Pay with Card via PayHere
          </button>
        </div>
      )}

      {/* Show receipt upload option */}
      {selectedPayment === "receipt" && (
        <form className="space-y-4 mb-4" onSubmit={handleReceipt}>
          <input type="file" className="w-full border rounded px-4 py-2" />
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
);
}
