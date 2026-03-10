import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Search, Bell, Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch?: (query: string) => void;
}

export function Header({ onMenuClick, onSearch }: HeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const { currentUser, notifications, markAllNotificationsAsRead } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, delay: 0.1, ease: 'power2.out' }
    );
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleClearNotifications = () => {
    markAllNotificationsAsRead();
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 lg:left-[260px] h-[72px] bg-white border-b border-[#E5E7EB] z-40"
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-8">
        {/* Left side - Menu button (mobile) + Search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              className={cn(
                'w-[240px] lg:w-[320px] h-10 pl-10 pr-4 rounded-xl',
                'bg-[#F4F6FA] border-0',
                'text-sm text-[#111827] placeholder:text-[#6B7280]',
                'focus:outline-none focus:ring-2 focus:ring-[#2E5BFF]/20'
              )}
            />
          </div>
        </div>

        {/* Right side - Notifications + User */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-[#6B7280]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[320px]">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-xs text-[#2E5BFF] hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'px-3 py-3 border-b last:border-b-0 hover:bg-[#F4F6FA] cursor-pointer',
                      !notification.read && 'bg-[#2E5BFF]/5'
                    )}
                  >
                    <p className={cn('text-sm', !notification.read && 'font-medium')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-sm text-[#6B7280] text-center py-4">
                    No notifications
                  </p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 lg:px-3">
                <div className="w-8 h-8 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#2E5BFF]" />
                </div>
                <span className="hidden lg:block text-sm font-medium text-[#111827]">
                  {currentUser.name}
                </span>
                <ChevronDown className="hidden lg:block w-4 h-4 text-[#6B7280]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-[#6B7280]">{currentUser.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
