"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function MainNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const router = useRouter();
  const pathname = usePathname();

  // Check if we're on the homepage
  const isHomePage = pathname === "/" || pathname === "/home";

  // Smooth scroll to section (for homepage)
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

  // Handle navigation click
  const handleNavClick = (sectionId) => {
    if (isHomePage) {
      // If on homepage, just scroll to section
      scrollToSection(sectionId);
    } else {
      // If on other pages (login/register), navigate to homepage with hash
      router.push(`/#${sectionId}`);
    }
  };

  // Handle scrolling to section after navigation (for cross-page navigation)
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      const timer = setTimeout(() => {
        scrollToSection(hash);
        // Clean up the hash from URL after scrolling
        window.history.replaceState(null, null, '/');
      }, 100); // Small delay to ensure page is loaded
      
      return () => clearTimeout(timer);
    }
  }, [isHomePage, pathname]);

  // Track active section on scroll (only on homepage)
  useEffect(() => {
    if (!isHomePage) return;

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
  }, [isHomePage]);

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
          width={60}
          height={60}
          className="rounded"
        />
        <Link href="/" className="text-xl font-bold hover:text-blue-200 transition-colors">
          EduConnect
        </Link>
      </div>
      
      <nav className="space-x-4 flex items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`hover:text-blue-200 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded ${
              isHomePage && activeSection === item.id
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