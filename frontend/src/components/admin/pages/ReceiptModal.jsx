import { useState } from "react"
import { X, Check } from "lucide-react"

export default function ReceiptModal({ payment, onClose, onUpdate, token }) {
    const receipt = payment.receipt_payment

    const initialForm = {
        record_no: receipt.record_no || "",
        paid_date_time: receipt.paid_date_time || "",
        location: receipt.location || "",
        paid_amount: receipt.paid_amount || "",
        account_no: receipt.account_no || "",
        account_name: receipt.account_name || "",
    }

    const [form, setForm] = useState(initialForm)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    // 🧠 Helper to get only changed fields
    const getChangedFields = () => {
        const changes = {}
        Object.keys(form).forEach((key) => {
            if (form[key] !== initialForm[key]) {
                changes[key] = form[key]
            }
        })
        return changes
    }

    const verifyAndComplete = async () => {
        setSaving(true)
        setError(null)

        try {
            const changes = getChangedFields()

            // ✏️ Save changes before verification, if any
            if (Object.keys(changes).length > 0) {
                const resPatch = await fetch(
                    `http://localhost:8000/edu_admin/receipt-payments/${receipt.receiptid}/`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(changes),
                    }
                )
                if (!resPatch.ok) throw new Error("Failed to save receipt edits")
            }

            // ✅ Proceed to verify
            const res = await fetch(
                `http://localhost:8000/edu_admin/receipt-payments/${receipt.receiptid}/verify/`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (res.status === 409) {
                const data = await res.json()
                onUpdate({
                ...payment,
                id: payment.id ?? payment.payid,
                amount: parseFloat(form.paid_amount),
                // status: "completed"
            })
                throw new Error(data.detail || "Duplicate receipt detected")
            }

            if (!res.ok) throw new Error("Failed to verify payment")

            onUpdate({
                ...payment,
                id: payment.id ?? payment.payid,
                amount: parseFloat(form.paid_amount),
                status: "completed"
            })
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold">
                        Receipt Verification – {payment.studentName}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X />
                    </button>
                </div>

                {error && <p className="p-4 text-sm text-red-600 bg-red-50">{error}</p>}

                <div className="p-6 space-y-6">
                    <img
                        src={`http://localhost:8000${receipt.image_url}`}
                        alt="Receipt"
                        className="w-full max-h-[300px] object-contain border rounded"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            ["record_no", "Record No"],
                            ["paid_date_time", "Paid Date/Time (YYYY-MM-DDTHH:MM)"],
                            ["location", "Location"],
                            ["paid_amount", "Paid Amount"],
                            ["account_no", "Account No"],
                            ["account_name", "Account Holder Name"],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className="text-sm text-gray-600">{label}</label>
                                <input
                                    name={key}
                                    value={form[key]}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded px-2 py-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-6 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Close
                    </button>
                    {payment.status === "pending" && (
                        <button
                            onClick={verifyAndComplete}
                            disabled={saving}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            <Check className="inline h-4 w-4 mr-1" />
                            Verify & Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
