"use client";
import { useAuth } from "@/context/AuthContext";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios"

export default function Payment() {
  
  const [showModal, setShowModal] = useState(false); 
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const transactions = [
    {
      id: 1,
      date: "2025-06-01",
      amount: 150.0,
      class: "Math 101",
      payoutOption: "Credit Card",
    },
    {
      id: 2,
      date: "2025-06-01",
      amount: 200.0,
      class: "Science 201",
      payoutOption: "PayPal",
    },
  ];



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
              {transactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    index === transactions.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="py-3 px-4 sm:px-6 text-gray-900">
                    {transaction.date}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-900 font-medium">
                    ${transaction.amount}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {transaction.class}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    {transaction.payoutOption}
                  </td>
                  <td className="py-3 px-4 sm:px-6 text-gray-700">
                    <Eye
                      className="text-primary cursor-pointer"
                      onClick={() => handleView(transaction)}
                    />
                  </td>
                </tr>
              ))}
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
            className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl ring-1 ring-black ring-opacity-5"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className="text-2xl text-center font-semibold mb-6 text-gray-900">
              Payment Details
            </h2>
            <p className="text-lg">Date: {selectedPayment?.date}</p>
            <p className="text-lg">Amount: ${selectedPayment?.amount}</p>
            <p className="text-lg">Class: {selectedPayment?.class}</p>
            <p className="text-lg">Payout Option: {selectedPayment?.payoutOption}</p>

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
