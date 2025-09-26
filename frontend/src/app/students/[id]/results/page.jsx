"use client";
import { useAuth } from "@/context/AuthContext";
import { Download } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import {Line} from "react-chartjs-2";
import {Chart as ChartJS,LineElement,PointElement,CategoryScale,LinearScale,Tooltip,Legend,} from 'chart.js';


ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Result() {

const [marks,setMarks ] = useState([])
const {user,token,accessToken,refreshToken,refreshAccessToken,api,loading}  = useAuth();

const fetchMarks = async () => {
  if (!accessToken) {
    console.warn("No access token yet, skipping fetchMarks");
    return;
  }
  // Debug logging
  console.log("accessToken", accessToken);
  console.log("api.defaults.headers", api.defaults.headers);
  try {
    const res = await api.get("/students/marks/",{
      headers:{ 
        Authorization: `Bearer ${accessToken}`
       }
    });
    if (res.status === 200) {
      setMarks(res.data.marks);
    }
  } catch (err) {
    console.error("Failed to fetch marks:", err);
  }
};


useEffect(() => {
  if (!loading && accessToken) {
    fetchMarks();
  }
}, [loading, accessToken]);


function PerformanceChart({ marks }) {
  if (!marks.length) return <p>No marks yet.</p>;

  return marks.map((cls) => (
    <ClassLineChart key={cls.class_name} data={cls} />
  ));
}

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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Performance</h2>
            <div className="relative h-64">
              <PerformanceChart marks = {marks} />
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
                  {marks.length === 0 ? (
                    <tr>
                      <td colSpan='3' className="text-center text-gray-500">No Results</td>
                    </tr>
                  ):(
                      marks.flatMap((cls) => 
                      cls.marks.map((mark, idx) => ( 
                      <tr key={`${cls.class_name}-${idx}`} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{mark.month}</td>
                        <td className="py-3 text-gray-900">{cls.class_name}</td>
                        <td className="py-3 font-medium text-gray-900">{mark.marks}</td>
                      </tr>
                      ))
                    
                  )
                  )}
                  
                </tbody>
              </table>
            </div>
          </div>
        </div>
        </div>
    )
}

function ClassLineChart({data}) {
  const labels = data.marks.map((m)=> m.month);
  const scores = data.marks.map((m)=> m.marks);

  const chartData = {
    labels,
    datasets: [
      {
        label: data.class_name,
        data: scores,
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="my-4">
      <h3 className="text-lg font-semibold">{data.class_name}</h3>
      <Line data={chartData} />
    </div>
  );

}
