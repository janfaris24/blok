'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Wrench,
  Users,
  Megaphone,
  LogOut,
  Building2,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';
import { NotificationsPanel } from './notifications-panel';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DashboardNavProps {
  buildingName: string;
  userEmail: string;
  buildingId: string;
}

const navItems = [
  {
    title: 'Resumen',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Conversaciones',
    href: '/dashboard/conversations',
    icon: MessageSquare,
  },
  {
    title: 'Mantenimiento',
    href: '/dashboard/maintenance',
    icon: Wrench,
  },
  {
    title: 'Residentes',
    href: '/dashboard/residents',
    icon: Users,
  },
  {
    title: 'Edificio',
    href: '/dashboard/building',
    icon: Building2,
  },
  {
    title: 'Anuncios',
    href: '/dashboard/broadcasts',
    icon: Megaphone,
  },
];

export function DashboardNav({ buildingName, userEmail, buildingId }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // Load unread count
  useEffect(() => {
    loadUnreadCount();
  }, [buildingId]);

  // Real-time subscription for notification updates
  useEffect(() => {
    const channel = supabase
      .channel('notifications_count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `building_id=eq.${buildingId}`,
        },
        () => {
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  async function loadUnreadCount() {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', buildingId)
      .eq('read', false);

    setUnreadCount(count || 0);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">{buildingName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[420px] p-0">
              <SheetTitle className="sr-only">Notificaciones</SheetTitle>
              <NotificationsPanel buildingId={buildingId} />
            </SheetContent>
          </Sheet>
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-64 bg-background border-r border-border/40 hidden lg:flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border/40">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{buildingName}</p>
            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/40 space-y-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-start h-9 text-sm font-medium" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[420px] p-0">
              <SheetTitle className="sr-only">Notificaciones</SheetTitle>
              <NotificationsPanel buildingId={buildingId} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center justify-between gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              className="flex-1 justify-start h-9 text-sm font-medium text-muted-foreground hover:text-foreground"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 z-50 flex items-center justify-around px-1">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-lg min-w-[3.5rem] transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium truncate max-w-full">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
