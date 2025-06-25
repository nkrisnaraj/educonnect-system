import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext"; // ✅ Add this import

export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <head>
       
        <script
          src="https://www.payhere.lk/lib/payhere.js"
          type="text/javascript"
          defer
        />
      </head> */}

      <body>
        <AuthProvider>
          <ThemeProvider> {/* ✅ Wrap children with ThemeProvider */}
            {children}
            <div id="payhere-modal"></div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
