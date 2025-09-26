"use client";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react"; // icons for toggle

export default function MainNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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
      scrollToSection(sectionId);
    } else {
      router.push(`/#${sectionId}`);
    }
    setIsMenuOpen(false); // close menu after click (mobile)
  };

  // Scroll to section after navigation (cross-page nav)
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const timer = setTimeout(() => {
        scrollToSection(hash);
        window.history.replaceState(null, null, "/");
      }, 100);
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
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Add shadow/background when scrolled
  useEffect(() => {
    const handlescroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handlescroll);
    return () => window.removeEventListener("scroll", handlescroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "courses", label: "Courses" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 shadow-xl transition-all duration-300 ${
        isScrolled
          ? "bg-white/30 backdrop-blur-md dark:bg-blue-900/70"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Image
          src="/images/logos/logo.png"
          alt="EduConnect Logo"
          width={50}
          height={50}
          className="rounded"
        />
        <Link
          href="/"
          className="text-xl text-primary font-semibold hover:text-blue-200 transition-colors font-lora"
        >
          EduConnect
        </Link>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:flex space-x-4 items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`text-primary hover:bg-blue-100 dark:hover:text-blue-300 font-bold transition-colors px-2 py-1 rounded ${
              isHomePage && activeSection === item.id
                ? "text-blue-500 dark:text-blue-300 font-semibold border-b-2 border-[#2064d4]"
                : ""
            }`}
          >
            {item.label}
          </button>
        ))}

        <Link href="/login">
          <button className="bg-white text-primary font-semibold px-4 py-2 rounded hover:bg-blue-100 transition-colors">
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

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-2xl focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full right-0 w-full bg-white dark:bg-blue-900 shadow-lg md:hidden flex flex-col items-center space-y-4 py-6 transition-all">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`hover:text-blue-500 dark:hover:text-blue-300 font-bold transition-colors ${
                isHomePage && activeSection === item.id
                  ? "text-blue-500 dark:text-blue-300 border-b-2 border-[#2064d4]"
                  : ""
              }`}
            >
              {item.label}
            </button>
          ))}

          <Link href="/login">
            <button className="bg-white text-primary font-semibold px-6 py-2 rounded hover:bg-blue-100 transition-colors">
              Login
            </button>
          </Link>

          <button
            onClick={toggleTheme}
            className="text-xl focus:outline-none hover:scale-110 transition-transform"
            title="Toggle theme"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>
      )}
    </header>
  );
}
