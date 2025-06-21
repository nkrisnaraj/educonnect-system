"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Download,
  DollarSign,
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
    method: "Credit Card",
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
    method: "Bank Transfer",
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
    method: "Online Payment",
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
    method: "Credit Card",
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
    status: "overdue",
    method: "Bank Transfer",
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
    case "overdue":
      return <AlertCircle className="h-4 w-4 text-red-500" />
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
    case "overdue":
      return "text-red-600 bg-red-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState(null)

  const filteredPayments = paymentsData.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === "all" || payment.status === selectedStatus
    const matchesType = selectedType === "all" || payment.type === selectedType
    return matchesSearch && matchesStatus && matchesType
  })

  // Calculate statistics
  const totalAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0)
  const completedAmount = paymentsData
    .filter((p) => p.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = paymentsData
    .filter((p) => p.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0)
  const overdueAmount = paymentsData
    .filter((p) => p.status === "overdue")
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments Management</h1>
          <p className="text-gray-600">Track and manage student payments, fees, and financial transactions</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">${completedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">${pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">${overdueAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, ID, or payment type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="Tuition Fee">Tuition Fee</option>
            <option value="Lab Fee">Lab Fee</option>
            <option value="Library Fee">Library Fee</option>
            <option value="Activity Fee">Activity Fee</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Student</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Payment Details</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Method</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Dates</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.studentName}</p>
                      <p className="text-sm text-gray-500">{payment.studentId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{payment.type}</p>
                      <p className="text-sm text-gray-500">{payment.description}</p>
                      {payment.transactionId && <p className="text-xs text-gray-400">ID: {payment.transactionId}</p>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{payment.semester}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600">{payment.method}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-600">Due: {new Date(payment.dueDate).toLocaleDateString()}</p>
                      {payment.date && (
                        <p className="text-gray-600">Paid: {new Date(payment.date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="p-1 text-gray-400 hover:text-primary"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Payment Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(selectedPayment.status)}
                    <div>
                      <p className="font-semibold text-gray-900">Payment Status</p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPayment.status)}`}
                      >
                        {selectedPayment.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${selectedPayment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.type}</p>
                  </div>
                </div>

                {/* Student Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Student Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Student Name</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.studentName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Student ID</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.studentId}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Type</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Semester</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-semibold text-gray-900">${selectedPayment.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(selectedPayment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPayment.date ? new Date(selectedPayment.date).toLocaleDateString() : "Not paid"}
                      </p>
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Transaction ID</p>
                        <p className="font-semibold text-gray-900">{selectedPayment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                  <p className="text-gray-600">{selectedPayment.description}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedPayment.status === "pending" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Mark as Paid
                  </button>
                )}
                {selectedPayment.status === "failed" && (
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Retry Payment
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
