import "./globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; // ✅ Add this import

export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ThemeProvider> {/* ✅ Wrap children with ThemeProvider */}
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
