import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ProfileProvider } from "@/context/ProfileContext";
import { PublicDataProvider } from "@/context/PublicDataContext";
import { DashboardsProvider } from "@/context/DashboardsContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ProfileProvider>
        <PublicDataProvider>
          <DashboardsProvider>
            <div className="flex h-screen bg-slate-50 overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <TopNav />
                <main className="flex-1 overflow-y-auto p-3">{children}</main>
              </div>
            </div>
          </DashboardsProvider>
        </PublicDataProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
