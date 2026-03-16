import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

const DashboardLayout = () => (
  <div className="min-h-screen flex w-full bg-background">
    <DashboardSidebar />
    <main className="flex-1 p-6 md:p-12 pb-24 md:pb-12 max-w-5xl">
      <Outlet />
    </main>
  </div>
);

export default DashboardLayout;
