'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface DashboardMainWrapperProps {
  children: React.ReactNode;
}

export function DashboardMainWrapper({ children }: DashboardMainWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }

    // Listen for sidebar toggle events
    const handleSidebarToggle = (event: CustomEvent<{ collapsed: boolean }>) => {
      setSidebarCollapsed(event.detail.collapsed);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);

    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  return (
    <main
      className={cn(
        'pt-14 lg:pt-16 pb-16 lg:pb-0 transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      )}
    >
      <div className="p-4 lg:p-6 max-w-[1800px] mx-auto">
        {children}
      </div>
    </main>
  );
}
