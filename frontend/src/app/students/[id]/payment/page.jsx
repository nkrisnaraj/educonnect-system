// "use client";

// import { useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export default function PaymentPage() {
//   const searchParams = useSearchParams();
//   const courseIds = searchParams.get("courses")?.split(",").map(Number) || [];

//   const [selectedCourses, setSelectedCourses] = useState([]);
//   const allCourses = [
//     { id: 3, title: "Mathematics", amount: 1000 },
//     { id: 4, title: "Biology", amount: 4000 },
//     { id: 5, title: "Computer Science", amount: 2000 },
//   ];

//   useEffect(() => {
//     const details = allCourses.filter((course) => courseIds.includes(course.id));
//     setSelectedCourses(details);
//   }, [courseIds]);

//   const totalAmount = selectedCourses.reduce((sum, course) => sum + course.amount, 0);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white p-6 rounded-xl max-w-md w-full">
//         <h2 className="text-xl font-bold mb-4">Payment Summary</h2>

//         <ul className="mb-4">
//           {selectedCourses.map((course) => (
//             <li key={course.id}>
//               {course.title} - LKR {course.amount}
//             </li>
//           ))}
//         </ul>

//         <p className="font-bold text-center mb-4">Total: LKR {totalAmount}</p>

//         {/* ✅ Add your payment buttons here */}
//       </div>
//     </div>
//   );
// }
