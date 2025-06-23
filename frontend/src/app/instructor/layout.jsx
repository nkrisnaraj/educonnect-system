import { InstructorSidebar } from "@/components/instructorsidebar/InstructorSidebar";

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 to-indigo-100">
      <InstructorSidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

