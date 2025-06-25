"use client";
import { useAuth } from "@/context/AuthContext";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"
import { useParams } from "next/navigation";
//import {useAxios} from "@utils/axiosClient";

export default function Payment() {
  const {user, accessToken, refreshToken, refreshAccessToken, logout} = useAuth();
  //const axiosInstance = useAxios();
  const [showModal, setShowModal] = useState(false); 
  const [selectedPayment, setSelectedPayment] = useState(null);
  const[payments, setPayments] = useState(null)
  const {id} = useParams();
  
  const transactions = [
    {
      id: 1,
      date: "2025-06-01",
      amount: 150.0,
      coursename: "Math 101",
      method: "Credit Card",
    },
    {
      id: 2,
      date: "2025-06-01",
      amount: 200.0,
      coursename: "Science 201",
      method: "PayPal",
    },
  ];

console.log(accessToken);


 
  const fetchPayments = async()=>{
    try {
       const response = await axios.get("http://127.0.0.1:8000/students/payment-info/",{
        headers : {
          Authorization: `Bearer ${accessToken}`
        }
       });
       
       if(response.status === 200){
        console.log(response.data);
        setPayments(response.data.payments);
        
    }
    } catch (error) {
      console.log(error);
      // If token expired
      if(error.response?.status === 401) {
        try {
          const newAccess = await refreshAccessToken()
          // Retry original request
          const retryResponse = await axios.get("http://127.0.0.1:8000/students/payment-info/",{
            headers:{
              Authorization:`Bearer ${newAccess}`,
            },
          });
          setPayments(retryResponse.data.payments);

        } catch (refreshErr) {
          logout();
        }
      }else{
        console.error("Other error:", error);
      }
    }
  }
  


  useEffect(() => {
      if (user && accessToken) {
        fetchPayments();
      }
    }, [user]);

  const handleView = async(payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          Payment Information
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full text-sm sm:text-base">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 sm:px-6 font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-semibold text-gray-700">
                  Class
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-semibold text-gray-700">
                  Payout Option
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-semibold text-gray-700">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {!payments ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ): (payments && payments.map((p, index) => (
                <tr
                  key={p.payid}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === transactions.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-3 px-4 sm:px-6 text-gray-900">
                    {p.date}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-900 font-medium">
                    ${p.amount}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {p.coursename}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {p.method}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    <Eye
                      className="text-primary cursor-pointer"
                      onClick={() => handleView(p)}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}  
        >
          <div
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl space-y-2 ring-1 ring-black ring-opacity-5"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-2xl text-center font-semibold mb-6 text-primary">
              Payment Details
            </h2>
            <p className="text-lg"><strong>Payment ID:</strong> {selectedPayment?.payid}</p>
            <p className="text-lg"><strong>Date:</strong> {selectedPayment?.date}</p>
            <p className="text-lg"><strong>Amount:</strong> ${selectedPayment?.amount}</p>
            <p className="text-lg"><strong>Class:</strong> {selectedPayment?.class}</p>
            <p className="text-lg"><strong>Payment Method:</strong> {selectedPayment?.method}</p>
            <p className="text-lg"><strong>Payment Status:</strong> {selectedPayment?.status}</p>

            <button
              className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
