import StudentLayoutWrapper from "@/components/studentlayoutwrapper/StudentLayoutWrapper";
import "../globals.css";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StudentLayoutWrapper>{children}</StudentLayoutWrapper>
      </body>
    </html>
  );
}
