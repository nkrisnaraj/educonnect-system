"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
} from "lucide-react"

const paymentsData = [
  {
    id: 1,
    studentName: "John Smith",
    studentId: "STU001",
    amount: 1200,
    type: "Tuition Fee",
    status: "completed",
    method: "Card Payment",
    date: "2024-12-15",
    dueDate: "2024-12-10",
    transactionId: "TXN001234567",
    semester: "Fall 2024",
    description: "Semester tuition payment",
  },
  {
    id: 2,
    studentName: "Sarah Johnson",
    studentId: "STU002",
    amount: 800,
    type: "Lab Fee",
    status: "pending",
    method: "Receipt Upload",
    date: "2024-12-14",
    dueDate: "2024-12-20",
    transactionId: "TXN001234568",
    semester: "Fall 2024",
    description: "Physics laboratory fee",
  },
  {
    id: 3,
    studentName: "Mike Davis",
    studentId: "STU003",
    amount: 1500,
    type: "Tuition Fee",
    status: "completed",
    method: "Card Payment",
    date: "2024-12-13",
    dueDate: "2024-12-10",
    transactionId: "TXN001234569",
    semester: "Fall 2024",
    description: "Semester tuition payment",
  },
  {
    id: 4,
    studentName: "Emily Brown",
    studentId: "STU004",
    amount: 600,
    type: "Library Fee",
    status: "failed",
    method: "Card Payment",
    date: "2024-12-12",
    dueDate: "2024-12-05",
    transactionId: "TXN001234570",
    semester: "Fall 2024",
    description: "Annual library access fee",
  },
  {
    id: 5,
    studentName: "David Wilson",
    studentId: "STU005",
    amount: 1200,
    type: "Tuition Fee",
    status: "pending",
    method: "Receipt Upload",
    date: null,
    dueDate: "2024-11-30",
    transactionId: null,
    semester: "Fall 2024",
    description: "Semester tuition payment",
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

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [payments, setPayments] = useState(paymentsData)

  const filteredPayments = payments.filter((payment) => {
    return (
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const receiptCount = payments.filter((p) => p.method === "Receipt Upload").length
  const cardCount = payments.filter((p) => p.method === "Card Payment").length
  const totalCount = payments.length

  const handleMarkAsPaid = (id) => {
    const updated = payments.map((p) =>
      p.id === id ? { ...p, status: "completed", date: new Date().toISOString().slice(0, 10) } : p
    )
    setPayments(updated)
    setSelectedPayment(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Track and manage student payments</p>
        </div>
        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Receipt Payments</p>
          <p className="text-2xl font-bold text-gray-900">{receiptCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Card Payments</p>
          <p className="text-2xl font-bold text-gray-900">{cardCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Payments</p>
          <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by student name, ID, or payment type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{p.studentName}</p>
                    <p className="text-sm text-gray-500">{p.studentId}</p>
                  </td>
                  <td className="py-3 px-4">{p.type}</td>
                  <td className="py-3 px-4">{p.method}</td>
                  <td className="py-3 px-4">${p.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(p.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    <button
                      onClick={() => setSelectedPayment(p)}
                      className="p-1 text-gray-400 hover:text-primary"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {p.status === "pending" && (
                      <button
                        onClick={() => handleMarkAsPaid(p.id)}
                        className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200"
                      >
                        Accept
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <p><strong>Student:</strong> {selectedPayment.studentName} ({selectedPayment.studentId})</p>
                <p><strong>Type:</strong> {selectedPayment.type}</p>
                <p><strong>Method:</strong> {selectedPayment.method}</p>
                <p><strong>Status:</strong> {selectedPayment.status}</p>
                <p><strong>Amount:</strong> Rs{selectedPayment.amount}</p>
                <p><strong>Description:</strong> {selectedPayment.description}</p>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayment.status === "pending" && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedPayment.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
