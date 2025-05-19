import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown,
  LogOut,
  Settings,
  Menu,
  BellRing,
  X,
  Clock,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Sidebar from './Sidebar';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { format } from 'date-fns';
import { useNotificationsWS } from '@/hooks/useNotificationsWS';
import { Notification } from '../../types/notification';

const mockNotifications = [
  {
    id: '1',
    title: 'Low Stock Alert',
    message: 'Lidocain 2% is running low on stock',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'warning',
    read: false
  },
  {
    id: '2',
    title: 'Appointment Reminder',
    message: 'Upcoming appointment with Maria Dinu at 2:30 PM',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    type: 'info',
    read: false
  },
  {
    id: '3',
    title: 'Product Expiring Soon',
    message: 'Mănuși nitril will expire in 30 days',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    type: 'warning',
    read: false
  }
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { activeClinic, clinics, setActiveClinic } = useClinic();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  useNotificationsWS(activeClinic?.id, (notification: Notification) => {
    setNotifications(prev => [
      { ...notification, id: crypto.randomUUID(), read: false },
      ...prev
    ]);
  });
  

  // const unreadCount = notifications.filter(n => !n.read).length;

  // const markAsRead = (id: string) => {
  //   setNotifications(notifications.map(n => 
  //     n.id === id ? { ...n, read: true } : n
  //   ));
  // };

  // const markAllAsRead = () => {
  //   setNotifications(notifications.map(n => ({ ...n, read: true })));
  // };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <X className="h-4 w-4 text-amber-500" />;
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <BellRing className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <header className="border-b border-border bg-card px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Mobile menu trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <Sidebar variant="mobile" />
          </SheetContent>
        </Sheet>

        {/* Clinic Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="max-w-[150px] truncate font-medium">
                {activeClinic?.name || 'Select Clinic'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {clinics.map(clinic => (
              <DropdownMenuItem 
                key={clinic.id}
                onClick={() => setActiveClinic(clinic)}
                className={`${activeClinic?.id === clinic.id ? 'bg-accent' : ''}`}
              >
                <span className="truncate">{clinic.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Right side: notifications, user menu */}
        <div className="flex items-center space-x-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <BellRing className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator />
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 px-4 py-2 hover:bg-muted/50 ${
                        !notification.read ? 'bg-muted/20' : ''
                      }`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(notification.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.firstName ? getInitials(user.firstName) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden font-medium md:inline-block">{user?.firstName}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;