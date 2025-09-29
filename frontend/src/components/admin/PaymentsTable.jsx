"use client"

import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAdminData } from "@/context/AdminDataContext"

function getStatusIcon(status) {
  switch (status) {
    case "completed":
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function getStatusColor(status) {
  switch (status) {
    case "completed":
    case "success":
      return "text-green-600 bg-green-50"
    case "pending":
      return "text-yellow-600 bg-yellow-50"
    case "failed":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export default function PaymentsTable() {
  const { payments, loading } = useAdminData();

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
        </div>
        <button className="text-sm hover:underline text-primary hover:text-primary/80">View All</button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Student</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments && payments.length > 0 ? payments.slice(0, 6).map((payment) => (
                <tr key={payment.payid || payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.studentName || 'Unknown Student'}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-sm font-semibold text-gray-900">
                      LKR {payment.amount ? parseFloat(payment.amount).toLocaleString() : '0'}
                    </p>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-sm text-gray-600">{payment.method || 'Class Payment'}</p>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status || 'pending'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-sm text-gray-500">
                      {payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown'}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <DollarSign className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm">No payments found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}