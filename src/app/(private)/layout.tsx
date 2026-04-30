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
            <div className="flex h-screen bg-white overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col min-w-0">
                <TopNav />
                {/* pt-12 on mobile to clear the floating hamburger + topnav buttons */}
                <main className="flex-1 overflow-y-auto p-3 pt-12 md:pt-2">{children}</main>
              </div>
            </div>
          </DashboardsProvider>
        </PublicDataProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
