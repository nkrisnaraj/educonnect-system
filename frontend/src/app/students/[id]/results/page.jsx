"use client";
import { useAuth } from "@/context/AuthContext";
import { Download } from "lucide-react";
import { useState, useEffect } from "react";
import {Line} from "react-chartjs-2";
import {Chart as ChartJS,LineElement,PointElement,CategoryScale,LinearScale,Tooltip,Legend,} from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function Result() {
  const [examResults, setExamResults] = useState([])
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
        setExamResults(res.data.results);
      }
    } catch (err) {
      console.error("Failed to fetch exam results:", err);
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

    if (examResults.length === 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('No exam results available.', margin, yPosition);
    } else {
      // Create table data
      const tableData = [];
      examResults.forEach((cls) => {
        cls.exams.forEach((exam) => {
          tableData.push([
            exam.exam_date,
            cls.class_name,
            exam.exam_name,
            `${exam.marks_obtained}/${exam.total_marks}`,
            `${exam.percentage.toFixed(1)}%`
          ]);
        });
      });

      // Add table
      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Course', 'Exam Name', 'Marks', 'Percentage']],
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

      examResults.forEach((cls) => {
        if (cls.exams.length > 0) {
          const examScores = cls.exams.map(exam => exam.percentage);
          const average = (examScores.reduce((sum, score) => sum + score, 0) / examScores.length).toFixed(2);
          const highest = Math.max(...examScores).toFixed(1);
          const lowest = Math.min(...examScores).toFixed(1);
          
          doc.text(`${cls.class_name}:`, margin, yPosition);
          yPosition += 8;
          doc.text(`  • Average Score: ${average}%`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Highest Score: ${highest}%`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Lowest Score: ${lowest}%`, margin + 10, yPosition);
          yPosition += 6;
          doc.text(`  • Total Exams: ${cls.exams.length}`, margin + 10, yPosition);
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

  function PerformanceChart({ examResults }) {
    if (!examResults.length) return <p>No exam results yet.</p>;

    // Create a combined chart with all classes
    const colors = [
      'rgb(59, 130, 246)',   // Blue
      'rgb(239, 68, 68)',    // Red
      'rgb(34, 197, 94)',    // Green
      'rgb(168, 85, 247)',   // Purple
      'rgb(245, 158, 11)',   // Amber
      'rgb(236, 72, 153)',   // Pink
      'rgb(20, 184, 166)',   // Teal
      'rgb(249, 115, 22)',   // Orange
    ];

    // Get all unique exams across all classes with their dates
    const allExamsMap = new Map();
    examResults.forEach(cls => {
      cls.exams.forEach(exam => {
        if (!allExamsMap.has(exam.exam_name)) {
          allExamsMap.set(exam.exam_name, {
            name: exam.exam_name,
            date: exam.exam_date
          });
        }
      });
    });
    
    // Sort exams by date (chronologically)
    const sortedExams = Array.from(allExamsMap.values()).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    
    const examLabels = sortedExams.map(exam => exam.name);

    // Create datasets for each class
    const datasets = examResults.map((cls, index) => {
      const data = examLabels.map(examName => {
        const exam = cls.exams.find(e => e.exam_name === examName);
        return exam ? exam.percentage : null;
      });

      return {
        label: cls.class_name,
        data: data,
        fill: false,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        borderWidth: 3,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4, // Smooth curved lines
        spanGaps: true, // This will connect points even if there are null values
      };
    });

    const chartData = {
      labels: examLabels,
      datasets: datasets,
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#ddd',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              if (context.parsed.y === null) return null;
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: false,
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            },
            font: {
              size: 12
            }
          }
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 12
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      elements: {
        line: {
          borderJoinStyle: 'round'
        },
        point: {
          hoverBorderWidth: 3
        }
      }
    };

    return (
      <div className="h-full">
        <Line data={chartData} options={options} />
      </div>
    );
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
          <div className="relative h-80">
            <PerformanceChart examResults={examResults} />
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
                  <th className="text-left py-2 text-gray-600 font-medium">Exam Name</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Marks</th>
                  <th className="text-left py-2 text-gray-600 font-medium">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {examResults.length === 0 ? (
                  <tr>
                    <td colSpan='5' className="text-center text-gray-500">No Results</td>
                  </tr>
                ) : (
                  examResults.flatMap((cls) => 
                    cls.exams.map((exam, idx) => ( 
                      <tr key={`${cls.class_name}-${idx}`} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{exam.exam_date}</td>
                        <td className="py-3 text-gray-900">{cls.class_name}</td>
                        <td className="py-3 text-gray-900">{exam.exam_name}</td>
                        <td className="py-3 font-medium text-gray-900">{exam.marks_obtained}/{exam.total_marks}</td>
                        <td className="py-3 font-medium text-gray-900">{exam.percentage.toFixed(1)}%</td>
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
