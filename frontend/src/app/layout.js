import "./globals.css";



export const metadata = {
  title: "EduConnect",
  description: "Automated Payment Verification & Webinar Integration",
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
