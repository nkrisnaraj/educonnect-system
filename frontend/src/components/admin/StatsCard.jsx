export default function StatsCard({ title, value, change, changeType, icon: Icon }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm h-24">
      <div className="flex items-center justify-between h-full">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm font-medium ${changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
            {change}
          </p>
        </div>
        <div className="rounded-lg p-2 bg-blue-50">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  )
}
