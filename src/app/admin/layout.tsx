import AdminRoute from '@/components/auth/AdminRoute';
import AdminSidenav from '@/components/admin/AdminSidenav';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="flex pt-24 min-h-screen bg-bg-primary">
        <AdminSidenav />
        <div className="flex-1 p-6 lg:p-8 overflow-auto lg:ml-64">
          {children}
        </div>
      </div>
    </AdminRoute>
  );
}
