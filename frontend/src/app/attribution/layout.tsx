import Sidebar from "@/components/Common/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: "360px" }}>
        {children}
      </div>
    </div>
  );
}
