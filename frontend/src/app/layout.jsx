import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";


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

