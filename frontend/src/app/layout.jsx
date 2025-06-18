
// import StudentLayoutWrapper from "@/components/studentlayoutwrapper/StudentLayoutWrapper";
import Footer from "@/components/Footer";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext"; // or "../../" depending on your structure



export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

