"use client"

import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react"

const paymentsData = [
  {
    id: 1,
    studentName: "John Smith",
    amount: "Rs 1,200",
    status: "completed",
    date: "Dec 15, 2024",
    type: "Tuition Fee",
  },
  {
    id: 2,
    studentName: "Sarah Johnson",
    amount: "Rs 800",
    status: "pending",
    date: "Dec 14, 2024",
    type: "Lab Fee",
  },
  {
    id: 3,
    studentName: "Mike Davis",
    amount: "Rs 1,500",
    status: "completed",
    date: "Dec 13, 2024",
    type: "Tuition Fee",
  },
  {
    id: 4,
    studentName: "Emily Brown",
    amount: "Rs 600",
    status: "failed",
    date: "Dec 12, 2024",
    type: "Library Fee",
  },
  {
    id: 5,
    studentName: "David Wilson",
    amount: "Rs 1,200",
    status: "pending",
    date: "Dec 11, 2024",
    type: "Tuition Fee",
  },
  {
    id: 6,
    studentName: "Lisa Anderson",
    amount: "Rs 950",
    status: "completed",
    date: "Dec 10, 2024",
    type: "Lab Fee",
  },
]

function getStatusIcon(status) {
  switch (status) {
    case "completed":
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
            {paymentsData.map((payment) => (
              <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <p className="text-sm font-medium text-gray-900">{payment.studentName}</p>
                </td>
                <td className="py-3 px-2">
                  <p className="text-sm font-semibold text-gray-900">{payment.amount}</p>
                </td>
                <td className="py-3 px-2">
                  <p className="text-sm text-gray-600">{payment.type}</p>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(payment.status)}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <p className="text-sm text-gray-500">{payment.date}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
