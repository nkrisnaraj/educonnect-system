"use client"

import { useEffect, useState } from "react"
import { Search, Eye, RefreshCw, CalendarClock, PlusCircle, Pencil } from "lucide-react"
import { useAdminData } from "@/context/AdminDataContext"
import { adminApi } from "@/services/adminApi"

export default function WebinarsPage() {
    const [filtered, setFiltered] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [syncing, setSyncing] = useState(false)
    const [selected, setSelected] = useState(null)
    const [formData, setFormData] = useState({
        topic: "",
        start_time: "",
        duration: "",
        agenda: "",
    })
    const [showForm, setShowForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [syncStatus, setSyncStatus] = useState(null)

    // Use AdminDataContext for webinars data
    const { webinars, loading, error, fetchWebinars } = useAdminData()

    useEffect(() => {
        fetchWebinars();
        fetchSyncStatus();
    }, []); // Empty dependency array to run only once

    const fetchSyncStatus = async () => {
        try {
            const response = await adminApi.getSyncStatus()
            setSyncStatus(response.data)
        } catch (error) {
            console.error("Failed to fetch sync status", error)
        }
    }

    const handleComprehensiveSync = async () => {
        try {
            setSyncing(true)
            const response = await adminApi.comprehensiveSync()
            
            alert(`Sync completed! Created ${response.data.total_created_classes} new classes from Zoom webinars.`)
            
            // Refresh webinars list and sync status after sync
            fetchWebinars()
            fetchSyncStatus()
        } catch (error) {
            console.error("Failed to sync webinars", error)
            alert("Failed to sync webinars. Please try again.")
        } finally {
            setSyncing(false)
        }
    }

    const handleSearch = (e) => setSearchTerm(e.target.value)

    useEffect(() => {
        const results = webinars.filter(w =>
            w.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.webinar_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFiltered(results)
    }, [searchTerm, webinars])

    const openForm = (webinar = null) => {
        if (webinar) {
            setIsEditing(true)
            setFormData({ ...webinar })
        } else {
            setIsEditing(false)
            setFormData({ topic: "", start_time: "", duration: "", agenda: "" })
        }
        setShowForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const url = isEditing
                ? `http://localhost:8000/edu_admin/webinars/${formData.webinar_id}/update/`
                : "http://localhost:8000/edu_admin/webinars-create/"
            const method = isEditing ? "put" : "post"

            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` },
            })
            setShowForm(false)
            fetchWebinars()
        } catch (err) {
            console.error("Failed to submit", err)
        }
    }

    return (
        <div className="">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Webinars Management</h1>
                    <p className="text-gray-600">Create, edit and view Zoom webinars</p>
                </div>
                <div className="space-x-2">
                    <button
                        onClick={handleComprehensiveSync}
                        disabled={syncing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Syncing...' : 'Sync & Create Classes'}
                    </button>
                    <button
                        onClick={fetchWebinars}
                        className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>
                    <button
                        onClick={() => openForm()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <PlusCircle className="h-4 w-4" />
                        Create Webinar
                    </button>
                </div>
            </div>

            {/* Sync Status */}
            {syncStatus && (
                <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="font-medium">Total Webinars:</span> {syncStatus.total_webinars}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">With Classes:</span> {syncStatus.webinars_with_classes}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium">Need Classes:</span> 
                                <span className={`ml-1 ${syncStatus.webinars_without_classes > 0 ? 'text-orange-600 font-bold' : 'text-green-600'}`}>
                                    {syncStatus.webinars_without_classes}
                                </span>
                            </div>
                        </div>
                        {syncStatus.sync_needed && (
                            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                Sync Recommended
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search webinars..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Webinars Table */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 text-left">Topic</th>
                            <th className="py-3 px-4 text-left">Webinar ID</th>
                            <th className="py-3 px-4 text-left">Start Time</th>
                            <th className="py-3 px-4 text-left">Duration</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-6">Loading...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-6">No webinars found.</td></tr>
                        ) : (
                            filtered.map((w) => {
                                const date = new Date(w.start_time)
                                return (
                                    <tr key={w.webinar_id} className="hover:bg-gray-50 border-b">
                                        <td className="px-4 py-3 font-medium">{w.topic}</td>
                                        <td className="px-4 py-3">{w.webinar_id}</td>
                                        <td className="px-4 py-3">{date.toLocaleString()}</td>
                                        <td className="px-4 py-3">{w.duration} mins</td>
                                        <td className="px-4 py-3 flex gap-3">
                                            <button onClick={() => setSelected(w)} className="text-blue-600 hover:text-blue-800">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => openForm(w)} className="text-green-600 hover:text-green-800">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full max-w-2xl rounded-2xl shadow-xl p-6 sm:p-8 relative animate-fadeIn max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2">
                            <h2 className="text-2xl font-bold">Webinar Details</h2>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        {/* Content */}
                        <div className="grid gap-3 text-sm sm:text-base">
                            <p><strong>Topic:</strong> {selected.topic}</p>
                            <p><strong>Webinar ID:</strong> {selected.webinar_id}</p>
                            <p><strong>Start Time:</strong> {new Date(selected.start_time).toLocaleString()}</p>
                            <p><strong>Duration:</strong> {selected.duration} mins</p>
                            <p><strong>Recurring:</strong> {selected.is_recurring ? "Yes" : "No"}</p>
                            <p><strong>Agenda:</strong> {selected.agenda || "N/A"}</p>
                            <p>
                                <strong>Registration Link:</strong>{" "}
                                {selected.registration_url ? (
                                    <a
                                        href={selected.registration_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                                    >
                                        Join
                                    </a>
                                ) : (
                                    "N/A"
                                )}
                            </p>
                        </div>

                        {/* Occurrences */}
                        {selected.occurrences?.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-2">Occurrences</h3>
                                {/* {console.log("occurrences: ",selected.occurrences)} */}
                                <ul className="space-y-2 text-sm sm:text-base">
                                    {selected.occurrences.map((o) => {
                                        const date = new Date(o.start_time);
                                        const dayName = date.toLocaleDateString(undefined, { weekday: 'long' }); // Monday
                                        const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); // Jun 23, 2025
                                        const timeString = date.toLocaleTimeString(undefined, {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,  // AM/PM
                                        }); // 08:00 PM

                                        return (
                                            <li key={o.occurrence_id} className="bg-gray-100 dark:bg-gray-800 rounded px-3 py-2">
                                                <CalendarClock className="inline-block mr-2 h-4 w-4 text-gray-500" />
                                                {dayName}, {dateString} {timeString} ({o.duration} mins)
                                            </li>
                                        );
                                    })}

                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Create/Update Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative space-y-4">
                        <button className="absolute top-3 right-4 text-xl" onClick={() => setShowForm(false)}>×</button>
                        <h2 className="text-xl font-semibold mb-4">{isEditing ? "Update Webinar" : "Create Webinar"}</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Topic"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                required
                                className="w-full border px-3 py-2 rounded"
                            />
                            <input
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                                className="w-full border px-3 py-2 rounded"
                            />
                            <input
                                type="number"
                                placeholder="Duration (mins)"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                                className="w-full border px-3 py-2 rounded"
                            />
                            <textarea
                                placeholder="Agenda (optional)"
                                value={formData.agenda}
                                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />
                            <select
                                value={formData.repeat_type}
                                onChange={(e) => setFormData({ ...formData, repeat_type: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">-- Select Repeat Type --</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Repeat Interval"
                                value={formData.repeat_interval}
                                onChange={(e) => setFormData({ ...formData, repeat_interval: parseInt(e.target.value) || 1 })}
                                className="w-full border px-3 py-2 rounded"
                            />
                            <label className="block text-sm font-medium text-gray-700">Repeat End Date</label>
                            <input
                                type="datetime-local"
                                value={formData.end_date_time}
                                onChange={(e) => setFormData({ ...formData, end_date_time: e.target.value })}
                                className="w-full border px-3 py-2 rounded"
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                            >
                                {isEditing ? "Update" : "Create"}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    )
}
