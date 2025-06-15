import Footer from "@/components/Footer";
import "./globals.css";
import MainNavbar from "@/components/mainnavbar";


export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MainNavbar />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
