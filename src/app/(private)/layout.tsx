import { ProfileProvider } from "@/context/ProfileContext";
import { PublicDataProvider } from "@/context/PublicDataContext";
import { DashboardsProvider } from "@/context/DashboardsContext";
import { ActiveDashboardProvider } from "@/context/ActiveDashboardContext";
import { ContactsProvider } from "@/context/ContactsContext";
import { InstrucoesProvider } from "@/context/InstrucoesContext";
import { InstrucoesModals } from "@/components/layout/TopNav";
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
                <InstrucoesProvider>
                  <MobileLayout>{children}</MobileLayout>
                  <InstrucoesModals />
                </InstrucoesProvider>
              </ActiveDashboardProvider>
            </ContactsProvider>
          </DashboardsProvider>
        </PublicDataProvider>
      </ProfileProvider>
    </AuthGuard>
  );
}
