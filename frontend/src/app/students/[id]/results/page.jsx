import { Download } from "lucide-react";

export default function Result() {

    const subject = [
  { name: "Mathematics", grade: "B+",  },
  { name: "Biology", grade: "A",  },
  { name: "History", grade: "B",  },
  { name: "English", grade: "A-",  },
]

const resultsData = [
  { date: "April 20", course: "Mathematics", result: "B+" },
  { date: "April 18", course: "English", result: "A-" },
  { date: "April 15", course: "Biology", result: "A" },
  { date: "April 10", course: "History", result: "B" },
  { date: "March 28", course: "Mathematics", result: "B" },
]

    return(
        <div className="bg-gray-50 p-6">
            <div className="max-w-6xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold ">Student Result</h1>
                    <button className="flex items-center bg-primary hover:bg-blue-700 gap-2 transition-colors text-white px-4 py-2 items-center rounded-lg ">
                         <Download className="w-4 h-4" />Download PDF
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">

                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {subject.map((subject) => (
                    <div 
                        key={subject.name}
                        className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-300">
                        <h3 className="text-lg font-semibold text-blue-700">{subject.name}</h3>
                    
                    
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance</h2>
            <div className="relative h-64">
              <PerformanceChart />
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600 font-medium">Date</th>
                    <th className="text-left py-2 text-gray-600 font-medium">Course</th>
                    <th className="text-left py-2 text-gray-600 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {resultsData.map((result, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{result.date}</td>
                      <td className="py-3 text-gray-900">{result.course}</td>
                      <td className="py-3 font-medium text-gray-900">{result.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
    )
}

function PerformanceChart() {
  const grades = ["F", "D", "C", "B", "A", "A"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

  return (
    <div className="relative w-full h-full">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500">
        <span>A</span>
        <span>A</span>
        <span>B</span>
        <span>C</span>
        <span>D</span>
        <span>F</span>
      </div>

      {/* Chart area */}
      <div className="ml-8 mr-4 h-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-rows-5 border-l border-b border-gray-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-100" />
          ))}
        </div>

        {/* Performance line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points="0,85 20,70 40,55 60,40 80,25 100,15"
            vectorEffect="non-scaling-stroke"
          />
          {/* Data points */}
          <circle cx="0" cy="85" r="3" fill="#3b82f6" />
          <circle cx="20" cy="70" r="3" fill="#3b82f6" />
          <circle cx="40" cy="55" r="3" fill="#3b82f6" />
          <circle cx="60" cy="40" r="3" fill="#3b82f6" />
          <circle cx="80" cy="25" r="3" fill="#3b82f6" />
          <circle cx="100" cy="15" r="3" fill="#3b82f6" />
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-sm text-gray-500">
          {months.map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
