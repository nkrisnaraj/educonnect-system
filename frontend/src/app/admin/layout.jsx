import { AdminDataProvider } from "@/context/AdminDataContext";

export default function AdminLayout({ children }) {
  return (
    <AdminDataProvider>
      <div className="admin-layout">{children}</div>
    </AdminDataProvider>
  );
}
