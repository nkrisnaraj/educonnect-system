"use client"

export function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function PerformanceChart() {
  const performanceData = [
    { week: "Week 1", students: 45, classes: 38 },
    { week: "Week 2", students: 52, classes: 42 },
    { week: "Week 3", students: 48, classes: 40 },
    { week: "Week 4", students: 61, classes: 55 },
    { week: "Week 5", students: 55, classes: 48 },
    { week: "Week 6", students: 67, classes: 58 },
    { week: "Week 7", students: 59, classes: 52 },
    { week: "Week 8", students: 72, classes: 65 },
    { week: "Week 9", students: 64, classes: 58 },
    { week: "Week 10", students: 78, classes: 70 },
  ]

  const maxValue = Math.max(...performanceData.flatMap((d) => [d.students, d.classes]))

  return (
    <div className="h-64">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-sm text-gray-600">Students</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-sm text-gray-600">Classes</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">Weekly Performance</div>
      </div>

      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={200 - y * 2} x2="400" y2={200 - y * 2} stroke="#f3f4f6" strokeWidth="1" />
          ))}

          {/* Students line */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={performanceData.map((d, i) => `${i * 40 + 20},${200 - (d.students / maxValue) * 180}`).join(" ")}
          />

          {/* Classes line */}
          <polyline
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={performanceData.map((d, i) => `${i * 40 + 20},${200 - (d.classes / maxValue) * 180}`).join(" ")}
          />

          {/* Data points for students */}
          {performanceData.map((d, i) => (
            <circle
              key={`student-${i}`}
              cx={i * 40 + 20}
              cy={200 - (d.students / maxValue) * 180}
              r="4"
              fill="currentColor"
              className="text-primary"
            />
          ))}

          {/* Data points for classes */}
          {performanceData.map((d, i) => (
            <circle
              key={`class-${i}`}
              cx={i * 40 + 20}
              cy={200 - (d.classes / maxValue) * 180}
              r="4"
              fill="currentColor"
              className="text-accent"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {performanceData.map((d, i) => (
            <span key={i} className="text-center" style={{ width: "40px" }}>
              W{i + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
