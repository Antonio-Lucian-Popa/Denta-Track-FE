import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CalendarClock, ClipboardList, Users, Settings, Bluetooth as Tooth } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active: boolean;
}

interface SidebarProps {
  variant?: 'mobile' | 'desktop';
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ variant = 'desktop' }) => {
  const location = useLocation();
  const { activeClinic } = useClinic();
  const { user } = useAuth();

  const clinicId = activeClinic?.id;
  const isActive = (path: string) => location.pathname.includes(path);

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard',
      to: `/dashboard/${clinicId}`,
      active: location.pathname.includes('/dashboard/'),
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: 'Products',
      to: `/clinic/${clinicId}/products`,
      active: location.pathname.includes('/products'),
    },
    {
      icon: <CalendarClock className="h-5 w-5" />,
      label: 'Appointments',
      to: `/clinic/${clinicId}/appointments`,
      active: location.pathname.includes('/appointments'),
    },
    ...(user?.role !== 'ASSISTANT'
      ? [{
        icon: <ClipboardList className="h-5 w-5" />,
        label: 'Inventory Logs',
        to: `/clinic/${clinicId}/logs`,
        active: location.pathname.includes('/logs'),
      }]
      : []),
    // ✅ Include doar pentru non-Assistants:
    ...(user?.role !== 'ASSISTANT'
      ? [{
        icon: <Users className="h-5 w-5" />,
        label: 'Users',
        to: `/clinic/${clinicId}/users`,
        active: location.pathname.includes('/users'),
      }]
      : []),
    {
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings',
      to: `/settings`,
      active: location.pathname.includes('/settings'),
    },
  ];

  return (
    <aside className={cn(
      "h-full w-64 flex-col border-r border-border bg-card",
      variant === 'desktop' ? "hidden md:flex" : "flex"
    )}>
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Tooth className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">DentaTrack</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={item.active}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="text-xs text-muted-foreground">
          <p>© 2025 DentaTrack</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;