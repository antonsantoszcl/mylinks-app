'use client';

import { useEffect } from 'react';
import { useActiveDashboard } from '@/context/ActiveDashboardContext';
import { ActiveDashboardView } from '@/components/dashboard/ActiveDashboardView';

export default function DashboardPage({ params }: { params: { id: string } }) {
  const { activeDashboardId, setActiveDashboard } = useActiveDashboard();

  // On direct load / refresh, sync context with URL param
  useEffect(() => {
    if (params.id && params.id !== activeDashboardId) {
      setActiveDashboard(params.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  return <ActiveDashboardView />;
}
