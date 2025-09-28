"use client";
import { useAuth } from "@/context/AuthContext";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import {Line} from "react-chartjs-2";
import {Chart as ChartJS,LineElement,PointElement,CategoryScale,LinearScale,Tooltip,Legend,} from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Result() {
  const [marks, setMarks] = useState([])
  const { user, accessToken, api, loading } = useAuth();

  const fetchMarks = async () => {
    if (!accessToken) {
      console.warn("No access token yet, skipping fetchMarks");
      return;
    }
    
    console.log("accessToken", accessToken);
    try {
      const res = await api.get("/students/marks/", {
        headers: { 
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

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Set up the document
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 30;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Report', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    
    // Student Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student Name: ${user?.first_name} ${user?.last_name}`, margin, yPosition);
    
    yPosition += 10;
    doc.text(`Student ID: ${user?.username}`, margin, yPosition);
    
    yPosition += 10;
    doc.text(`Email: ${user?.email}`, margin, yPosition);
    
    yPosition += 10;
    doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, margin, yPosition);
    
    yPosition += 20;

    // Results Summary
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Exam Results Summary', margin, yPosition);
    
    yPosition += 10;

    if (marks.length === 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No exam results available.', margin, yPosition);
    } else {
      // Create table data
      const tableData = [];
      marks.forEach((cls) => {
        cls.marks.forEach((mark) => {
          tableData.push([
            mark.month,
            cls.class_name,
            mark.marks.toString()
          ]);
        });
      });

      // Add table
      doc.autoTable({
        startY: yPosition,
        head: [['Date', 'Course', 'Marks']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontSize: 12,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 11
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: margin, right: margin }
      });

      // Performance Analysis
      yPosition = doc.lastAutoTable.finalY + 20;
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Analysis', margin, yPosition);
      
      yPosition += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      marks.forEach((cls) => {
        if (cls.marks.length > 0) {
          const classMarks = cls.marks.map(m => parseFloat(m.marks));
          const average = (classMarks.reduce((sum, mark) => sum + mark, 0) / classMarks.length).toFixed(2);
          const highest = Math.max(...classMarks);
          const lowest = Math.min(...classMarks);
          
          doc.text(`${cls.class_name}:`, margin, yPosition);
          yPosition += 8;
          doc.text(`  • Average Score: ${average}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Highest Score: ${highest}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Lowest Score: ${lowest}`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Total Exams: ${cls.marks.length}`, margin + 10, yPosition);
          yPosition += 12;
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        'EduConnect - Student Management System',
        margin,
        doc.internal.pageSize.height - 10
      );
    }

    // Generate filename with student name and date
    const fileName = `Exam_Report_${user?.first_name}_${user?.last_name}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the PDF
    doc.save(fileName);
  };

  function PerformanceChart({ marks }) {
    if (!marks.length) return <p>No marks yet.</p>;

    return marks.map((cls) => (
      <ClassLineChart key={cls.class_name} data={cls} />
    ));
  }

  return (
    <div className="bg-gray-50 p-6">
      <div className="max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold">Student Result</h1>
          <button 
            onClick={downloadPDF}
            className="flex items-center bg-primary hover:bg-blue-700 gap-2 transition-colors text-white px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance</h2>
          <div className="relative h-64">
            <PerformanceChart marks={marks} />
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
                ) : (
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
  const labels = data.marks.map((m) => m.month);
  const scores = data.marks.map((m) => m.marks);

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
