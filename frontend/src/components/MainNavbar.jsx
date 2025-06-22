"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";

export default function MainNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "courses", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "courses", label: "Courses" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 shadow-md bg-blue-600 text-white dark:bg-blue-700 transition-colors duration-300">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/logos/logo.png"
          alt="EduConnect Logo"
          width={40}
          height={40}
          className="rounded"
        />
        <div className="text-xl font-bold">EduConnect</div>
      </div>
      
      <nav className="space-x-4 flex items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`hover:text-blue-200 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded ${
              activeSection === item.id
                ? "text-blue-200 dark:text-blue-300 font-semibold"
                : ""
            }`}
          >
            {item.label}
          </button>
        ))}
        
        <Link href="/login">
          <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition-colors">
            Login
          </button>
        </Link>
        
        <button
          onClick={toggleTheme}
          className="ml-4 text-xl focus:outline-none hover:scale-110 transition-transform"
          title="Toggle theme"
        >
          {isDarkMode ? "🌙" : "☀️"}
        </button>
      </nav>
    </header>
  );
}