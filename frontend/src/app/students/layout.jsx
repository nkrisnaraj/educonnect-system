import StudentLayoutWrapper from "@/components/studentlayoutwrapper/StudentLayoutWrapper";
import "../globals.css";


export default function RootLayout({ children }) {
  return (
    
        <StudentLayoutWrapper>{children}</StudentLayoutWrapper>
    
  );
}
