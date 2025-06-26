"use client"

import { useEffect, useState } from "react"
import { Search, Eye, RefreshCw, CalendarClock, Video } from "lucide-react"
import axios from "axios"

export default function WebinarsPage() {
    const [webinars, setWebinars] = useState([])
    const [filtered, setFiltered] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)

    useEffect(() => {
        fetchWebinars()
    }, [])

    const fetchWebinars = async () => {
        try {
            setLoading(true)
            const res = await axios.get("http://localhost:8000/edu_admin/webinars-list/") // 🔁 Adjust if needed
            setWebinars(res.data)
            setFiltered(res.data)
        } catch (error) {
            console.error("Failed to fetch webinars", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const results = webinars.filter(
            (webinar) =>
                webinar.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                webinar.webinar_id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFiltered(results)
    }, [searchTerm, webinars])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webinars Management</h1>
                    <p className="text-gray-600">Manage and view Zoom webinars</p>
                </div>
                <button
                    onClick={fetchWebinars}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search webinars by topic or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-3 px-4">Topic</th>
                            <th className="text-left py-3 px-4">Webinar ID</th>
                            <th className="text-left py-3 px-4">Start Time</th>
                            <th className="text-left py-3 px-4">Duration</th>
                            <th className="text-left py-3 px-4">Recurring</th>
                            <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6">Loading webinars...</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-6">No webinars found.</td>
                            </tr>
                        ) : (
                            filtered.map((webinar) => {
                                const date = new Date(webinar.start_time);
                                const day = date.toLocaleDateString(undefined, { weekday: 'long' }); // Monday
                                const formattedDate = date.toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }); // Jun 23, 2025
                                const formattedTime = date.toLocaleTimeString(undefined, {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                }); // 08:00 PM

                                return (
                                    <tr key={webinar.webinar_id} className="border-b hover:bg-gray-50">
                                        <td className="py-4 px-4 font-medium text-gray-900">{webinar.topic}</td>
                                        <td className="py-4 px-4">{webinar.webinar_id}</td>
                                        <td className="py-4 px-4">
                                            {day}, {formattedDate} {formattedTime}
                                        </td>
                                        <td className="py-4 px-4">{webinar.duration} mins</td>
                                        <td className="py-4 px-4">
                                            {webinar.is_recurring ? "Yes" : "No"}
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => setSelected(webinar)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}

                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
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


        </div>
    )
}
