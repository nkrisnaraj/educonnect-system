"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isToday = (day) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const hasEvent = (day) => {
    return [3, 15, 22, 28].includes(day); // mock event days
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 sm:h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <div
          key={day}
          className={`h-10 sm:h-8 flex items-center justify-center text-[11px] sm:text-xs cursor-pointer rounded-md relative transition-all
            ${isToday(day)
              ? "bg-blue-600 text-white font-semibold"
              : "text-gray-700 hover:bg-gray-100"}`}
        >
          {day}
          {hasEvent(day) && !isToday(day) && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"></div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
        <div className="flex flex-wrap items-center justify-between gap-2 w-full md:flex-nowrap ">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          <div className="flex-1 text-center text-sm font-medium text-gray-900 truncate">
            {months[currentMonth]} {currentYear}
          </div>

          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring focus:ring-blue-300"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="h-8 flex items-center justify-center text-[11px] sm:text-xs font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Events</span>
          </div>
          <span>{today.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
