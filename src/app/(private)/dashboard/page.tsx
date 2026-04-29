'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboards } from '@/context/DashboardsContext';

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function DashboardRedirect() {
  const { dashboards, isLoading } = useDashboards();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const target = dashboards.find((d) => d.isDefault) ?? dashboards[0];
    if (target) {
      router.replace(`/dashboard/${target.id}`);
    }
  }, [dashboards, isLoading, router]);

  return <Spinner />;
}
