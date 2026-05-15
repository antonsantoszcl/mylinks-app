'use client';

import { ActiveDashboardView } from '@/components/dashboard/ActiveDashboardView';

export default function DashboardRedirect() {
  // ActiveDashboardProvider initializes the default dashboard automatically
  return <ActiveDashboardView />;
}
