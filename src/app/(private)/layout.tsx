import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ProfileProvider } from "@/context/ProfileContext";
import { PublicDataProvider } from "@/context/PublicDataContext";
import { DashboardsProvider } from "@/context/DashboardsContext";
import { ActiveDashboardProvider } from "@/context/ActiveDashboardContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { MobileLayout } from "@/components/layout/MobileLayout";

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
            <ActiveDashboardProvider>
              <MobileLayout>{children}</MobileLayout>
            </ActiveDashboardProvider>
          </DashboardsProvider>
        </PublicDataProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
