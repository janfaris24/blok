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
  Bell,
  Settings,
  User,
  HelpCircle,
  BookOpen,
  UserCog,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase-client';
import { NotificationsPanel } from './notifications-panel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/language-context';

interface DashboardNavProps {
  buildingName: string;
  userEmail: string;
  buildingId: string;
  userName?: string;
}


export function DashboardNav({ buildingName, buildingId, userEmail, userName }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDesktopOpen, setIsDesktopOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setSidebarCollapsed(savedState === 'true');
    }
  }, []);

  // Toggle sidebar and save to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));

    // Dispatch custom event for layout to listen to
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: newState } }));
  };

  const navSections: Array<{ label: string; items: Array<{ title: string; href: string; icon: any }> }> = [
    {
      label: t.nav.general,
      items: [
        {
          title: t.nav.dashboard,
          href: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: t.nav.conversations,
          href: '/dashboard/conversations',
          icon: MessageSquare,
        },
      ],
    },
    {
      label: t.nav.tools,
      items: [
        {
          title: 'Cuotas',
          href: '/dashboard/fees',
          icon: DollarSign,
        },
        {
          title: t.nav.maintenance,
          href: '/dashboard/maintenance',
          icon: Wrench,
        },
        {
          title: t.nav.providers,
          href: '/dashboard/service-providers',
          icon: UserCog,
        },
        {
          title: t.nav.broadcasts,
          href: '/dashboard/broadcasts',
          icon: Megaphone,
        },
        {
          title: t.nav.residents,
          href: '/dashboard/residents',
          icon: Users,
        },
        {
          title: t.nav.building,
          href: '/dashboard/building',
          icon: Building2,
        },
        {
          title: t.nav.knowledge,
          href: '/dashboard/knowledge',
          icon: BookOpen,
        },
      ],
    },
  ];

  const navItems = navSections.flatMap(section => section.items) as Array<{ title: string; href: string; icon: any }>;

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
      {/* Top Navigation Bar - Desktop (Minimal Nexus Style) */}
      <div
        className={cn(
          "hidden lg:block fixed top-0 right-0 h-16 bg-background border-b border-border/40 z-40 transition-all duration-300",
          sidebarCollapsed ? "left-16" : "left-64"
        )}
      >
        <div className="h-full flex items-center justify-end px-6">
          {/* Right Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard/help"
              className="w-9 h-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
              title={t.nav.help}
            >
              <HelpCircle className="w-[18px] h-[18px] text-muted-foreground" />
            </Link>

            <Popover open={isDesktopOpen} onOpenChange={setIsDesktopOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="relative w-9 h-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                  title="Notificaciones"
                >
                  <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
                <NotificationsPanel buildingId={buildingId} onClose={() => setIsDesktopOpen(false)} />
              </PopoverContent>
            </Popover>

            <Link
              href="/dashboard/settings"
              className="w-9 h-9 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
              title={t.nav.settings}
            >
              <Settings className="w-[18px] h-[18px] text-muted-foreground" />
            </Link>

            {/* User Menu */}
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2.5 ml-2 pl-1.5 pr-3 h-9 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none truncate max-w-[120px]">
                  {userName || userEmail?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{t.nav.administrator}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img
            src="/favicon.svg"
            alt="Blok"
            className="w-9 h-9"
          />
          <div>
            <p className="font-semibold text-sm">Blok</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Popover open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0" align="end">
              <NotificationsPanel buildingId={buildingId} onClose={() => setIsMobileOpen(false)} />
            </PopoverContent>
          </Popover>
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 bottom-0 bg-background border-r border-border/40 hidden lg:flex flex-col z-50 transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-border/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/favicon.svg"
              alt="Blok"
              className="w-10 h-10 flex-shrink-0"
            />
            {!sidebarCollapsed && (
              <span className="font-bold text-base whitespace-nowrap">Blok</span>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded hover:bg-accent transition-colors flex items-center justify-center",
              sidebarCollapsed && "mx-auto"
            )}
            title={sidebarCollapsed ? t.nav.expand : t.nav.collapse}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 overflow-y-auto">
          {navSections.map((section, sectionIdx) => (
            <div key={section.label} className={sectionIdx > 0 ? 'mt-6' : ''}>
              {!sidebarCollapsed && (
                <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/60 tracking-wider">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href));

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={sidebarCollapsed ? item.title : undefined}
                      className={cn(
                        'flex items-center h-9 rounded-lg text-sm font-medium transition-all',
                        sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!sidebarCollapsed && <span>{item.title}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* SUPPORT Section */}
          <div className="mt-6">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground/60 tracking-wider">
                {t.nav.support}
              </p>
            )}
            <div className="space-y-0.5">
              <Link
                href="/dashboard/settings"
                title={sidebarCollapsed ? t.nav.settings : undefined}
                className={cn(
                  'w-full flex items-center h-9 rounded-lg text-sm font-medium transition-all',
                  sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  pathname === '/dashboard/settings'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <Settings className="w-[18px] h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span>{t.nav.settings}</span>}
              </Link>
              <Link
                href="/dashboard/help"
                title={sidebarCollapsed ? t.nav.help : undefined}
                className={cn(
                  'w-full flex items-center h-9 rounded-lg text-sm font-medium transition-all',
                  sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
                  pathname === '/dashboard/help'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" />
                {!sidebarCollapsed && <span>{t.nav.help}</span>}
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-border/40 space-y-3">
          {/* Building Info */}
          {!sidebarCollapsed && (
            <div className="w-full p-3 rounded-lg bg-secondary/10">
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-[11px] truncate">{buildingName}</p>
                <p className="text-[10px] text-muted-foreground">{t.nav.administration}</p>
              </div>
            </div>
          )}

          {/* Theme Toggle & Logout */}
          <div className={cn(
            "flex items-center gap-2",
            sidebarCollapsed && "flex-col"
          )}>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              title={sidebarCollapsed ? t.nav.logout : undefined}
              className={cn(
                "flex items-center justify-center h-9 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all",
                sidebarCollapsed ? "w-9" : "flex-1 gap-2 px-3"
              )}
            >
              <LogOut className="w-[18px] h-[18px]" />
              {!sidebarCollapsed && <span className="text-xs">{t.nav.logout}</span>}
            </button>
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
