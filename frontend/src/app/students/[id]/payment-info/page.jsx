"use client";
import { useAuth } from "@/context/AuthContext";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"
import { useParams } from "next/navigation";
//import {useAxios} from "@utils/axiosClient";

export default function PaymentInfo() {
  const {user, accessToken, refreshToken, refreshAccessToken, logout, loading} = useAuth();
  const [showModal, setShowModal] = useState(false); 
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const {id} = useParams();
  
  console.log(accessToken);

  const fetchPayments = async() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Don't fetch if auth is still loading
      if (loading || !accessToken) {
        console.log("Auth not ready for payments fetch");
        return;
      }
      
      const response = await axios.get("http://127.0.0.1:8000/students/payment-info/", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.status === 200) {
        console.log("📊 Payment Info Response:", response.data);
        console.log("📋 Payments with class info:", response.data.payments?.map(p => ({
          payid: p.payid,
          method: p.method,
          class: p.class,
          amount: p.amount
        })));
        
        // Sort payments by date (most recent first)
        const sortedPayments = (response.data.payments || []).sort((a, b) => {
          // Parse dates and compare (assuming date format is consistent)
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB - dateA; // Descending order (newest first)
        });
        
        console.log("📅 Sorted payments (newest first):", sortedPayments.map(p => ({ date: p.date, payid: p.payid })));
        setPayments(sortedPayments);
      }
    } catch (error) {
      console.error("Payment fetch error:", error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        try {
          const newAccess = await refreshAccessToken();
          // Retry original request
          const retryResponse = await axios.get("http://127.0.0.1:8000/students/payment-info/", {
            headers: {
              Authorization: `Bearer ${newAccess}`,
            },
          });
          setPayments(retryResponse.data.payments || []);
        } catch (refreshErr) {
          console.error("Refresh token failed:", refreshErr);
          setError("Session expired. Please login again.");
          logout();
        }
      } else if (error.response?.status === 500) {
        setError("Server error occurred. Please try again later.");
      } else {
        setError("Failed to fetch payment information.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!loading && accessToken) {
      fetchPayments();
    }
  }, [loading, accessToken]); // Add loading dependency

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
          {error && (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={fetchPayments}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          )}
          
          {!error && (
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
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                        Loading payments...
                      </div>
                    </td>
                  </tr>
                ) : !payments || payments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No payment records found
                    </td>
                  </tr>
                ) : (
                  payments.map((p, index) => (
                    <tr
                      key={p.payid}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        index === payments.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                  <td className="py-3 px-4 sm:px-6 text-gray-900">
                    {p.date}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-900 font-medium">
                    Rs.{p.amount}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {p.class}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {p.method}
                  </td>
                  <td className="py-3 px-4 sm:px-6">
                    <Eye
                      className="text-primary cursor-pointer"
                      onClick={() => handleView(p)}
                    />
                  </td>
                </tr>
              ))
                )}
              </tbody>
            </table>
          )}
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
            <p className="text-lg"><strong>Amount:</strong> Rs.{selectedPayment?.amount}</p>
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
