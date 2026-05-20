import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ProfileProvider } from "@/context/ProfileContext";
import { PublicDataProvider } from "@/context/PublicDataContext";
import { DashboardsProvider } from "@/context/DashboardsContext";
import { ActiveDashboardProvider } from "@/context/ActiveDashboardContext";
import { ContactsProvider } from "@/context/ContactsContext";
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
            <ContactsProvider>
              <ActiveDashboardProvider>
                <MobileLayout>{children}</MobileLayout>
              </ActiveDashboardProvider>
            </ContactsProvider>
          </DashboardsProvider>
        </PublicDataProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
