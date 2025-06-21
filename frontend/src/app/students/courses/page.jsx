"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";


export default function Courses() {

  const enrolledCourses = [
    { id: 1, title: "Chemistry", description: "Introduction to Organic Chemistry",amount:1000 },
    { id: 2, title: "Physics", description: "Fundamentals of Mechanics",amount:3000 }
  ];

  const allCourses = [
    { id: 3, title: "Mathematics", description: "Calculus and Algebra",amount:1000 },
    { id: 4, title: "Biology", description: "Cell Structure & Function" ,amount:4000},
    { id: 5, title: "Computer Science", description: "Introduction to Programming",amount:2000 }
  ];

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaidClassModal, setShowPaidClassModal] = useState(false);
  const [showUnPaidClassModal, setShowUnPaidClassModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(false)
  const [isPayHereLoaded, setIsPayHereLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [file, setFile] = useState(false);

  const searchParams = useSearchParams();
  const status = searchParams.get("status");

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
    if (storedUser && storedToken) 
    {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);

      console.log("Student Mobile:", parsedUser.student_profile?.mobile);
      console.log("Student Address:", parsedUser.student_profile?.address);
    }
    
  }, []);
 
  //  console.log(user);
  //  console.log(accessToken);

    useEffect(()=>{
      const fetchStudentProfile = async ()=> {
        // try {
        //   const res = await axios.get("http://127.0.0.1:8000/api/accounts/student/",
        //     {
        //       headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //     });
        //   if(res.status==200){
        //     console.log(res);
            
        //     setStudentProfile(res.data.student_profile);
        //     //console.log("Mobile:", studentProfile?.mobile);
        //     //console.log("Address:", studentProfile?.address);
        //     // console.log(res.data);
        //     // const student = res.data;
        //     // const mobile = student.student_profile.mobile || "";
        //     // const address = student.student_profile.address || "";
        //     // console.log("Mobile:", mobile);
        //     // console.log("Address:", address);
        //   }
        // } catch (error) {
        //     console.log("Failed to fetch student profile", error);
        //   }
      };
      if (user && accessToken) {
        fetchStudentProfile();
      }
    },[user, accessToken])
   

   useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.onload = () => setIsPayHereLoaded(true);
      document.body.appendChild(script);
    }, []);

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
    setShowPayModal(true);
    setShowUnPaidClassModal(false);
  }

  //OCR Part
  const handleReceipt = async() =>{
    // setShowPayModal(false);
    // if(!file){
    //   return alert("Please select a file");
    // }
    // const formData = new FormData();
    // formData.append('image',file);
    
    // try {
    //   const res = await axios.post('http://localhost.0.0.1:8000/students/payment/upload-receipt',formData,{
    //     headers:{
    //       'Content-Type': 'multipart/form-data',
    //     }
    //   });
    //   const data = res.data;
    //   alert(data.message);
    // } catch (error) {
    //   console.error(error);
    //   alert('something went wrong');
    // }
  }


  
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
        localStorage.setItem("accessToken", newAccessToken); // update local
        return newAccessToken;
      } catch (error) {
        console.error("Failed to refresh access token", error);
        return null;
      }
  };


  const createOnlinePayment = async () => {

      let token = accessToken;
      console.log("Sending token:", accessToken);

      // If expired, try refresh
      if (!token || isTokenExpired(token)) {
        token = await refreshAccessToken();
        setAccessToken(token); // update React state
      }

      if (!token) {
        console.error("No valid access token available.");
        return;
      }

      // const response = await axios.post("http://127.0.0.1:8000/students/payments/online/",
       
      //   {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // return response.data; // includes payid, invoice_no, amount
  };

  const handlePayNow = async() => {
    setShowPayModal(false);
  
    try {
      //const data = await createOnlinePayment();
      const payId = `CLASS-${selectedCourse?.id}-${user?.id}`;

      const payment = {
        sandbox: true,
        merchant_id: 1230925,
        return_url: "http://localhost:3000/students/courses?status=success",
        cancel_url: "http://localhost:3000/students/courses?status=cancel",
        notify_url: "http://localhost:8000/students/payhere-notify",

        order_id: payId,
        items: selectedCourse.title||"Course Payment",
        amount: selectedCourse.amount,
        currency: "LKR",
        first_name: user?.first_name,
        last_name: user?.last_name,
        address: user?.student_profile?.address || "N/A",
        city: user?.student_profile?.address || "Colombo",
        email: user?.email,
        phone: user?.student_profile?.mobile || "0770000000",
        country: "Sri Lanka",
      };

      console.log("Payment Object:", payment);

      if (window.payhere) {
          window.payhere.startPayment(payment);
      } else {
          console.error("PayHere not loaded");
      }

    } catch (err) {
      console.error("Payment initiation failed:", err);
    }  
};

return (
    
  <div className="bg-gray-50 min-h-screen p-6">

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
              onClick={handlePayNow} disabled={!isPayHereLoaded}
              className="w-full bg-green-600 text-white py-2 rounded"
            >
              Pay with Card via PayHere
            </button>
          </div>
        )}

        {/* Show receipt upload option */}
        {selectedPayment === "receipt" && (
          <form className="space-y-4 mb-4" onSubmit={handleReceipt} name="image">
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
