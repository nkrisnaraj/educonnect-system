<<<<<<< HEAD
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
=======

// import StudentLayoutWrapper from "@/components/studentlayoutwrapper/StudentLayoutWrapper";
import Footer from "@/components/Footer";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext"; // or "../../" depending on your structure

>>>>>>> 13da922dcedb5896a2db254e9f91c3e732ee8842


export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
<<<<<<< HEAD
        <AuthProvider>{children}</AuthProvider>
=======
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
>>>>>>> 13da922dcedb5896a2db254e9f91c3e732ee8842
      </body>
    </html>
  );
}

