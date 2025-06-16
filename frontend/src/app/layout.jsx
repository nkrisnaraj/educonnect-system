// import StudentLayoutWrapper from "@/components/studentlayoutwrapper/StudentLayoutWrapper";
import "./globals.css";


export const metadata = {
  title: "EduConnect",
  description: "EduConnect System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
