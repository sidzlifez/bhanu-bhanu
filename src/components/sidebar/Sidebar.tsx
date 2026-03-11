import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Calendar, 
  Newspaper, 
  Wallet, 
  UserCog, 
  Bell,
  Settings,
  BookOpen,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { ViewType } from '@/App';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

// ============================================
// CONFIGURATION: Change your school name here!
// ============================================
const SCHOOL_CONFIG = {
  name: 'Bhanu Bhakta Nepali Pro. Sec. School',
  logo: BookOpen,
  tagline: 'School Management',
};

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'finance', label: 'Finance', icon: Wallet },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ 
  currentView, 
  onViewChange, 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const { user, logout } = useAuth();

  const LogoIcon = SCHOOL_CONFIG.logo;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
      );

      gsap.fromTo(logoRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' }
      );

      if (navRef.current) {
        gsap.fromTo(navRef.current.children,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.3, ease: 'power2.out' }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleNavClick = (view: ViewType) => {
    onViewChange(view);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] z-50',
          'transform transition-all duration-300 ease-in-out',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: collapsed or expanded
          isCollapsed ? 'lg:w-[80px]' : 'lg:w-[260px]'
        )}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#2E5BFF] text-white items-center justify-center shadow-lg hover:bg-[#1E4BEF] transition-colors z-50',
            isCollapsed && 'rotate-180'
          )}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div 
          ref={logoRef} 
          className={cn(
            'h-[72px] flex items-center border-b border-[#E5E7EB] overflow-hidden',
            isCollapsed ? 'px-4 justify-center' : 'px-6'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E5BFF] flex items-center justify-center flex-shrink-0">
              <LogoIcon className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="transition-opacity duration-300">
                <span className="text-xl font-semibold text-[#111827] whitespace-nowrap">{SCHOOL_CONFIG.name}</span>
                {SCHOOL_CONFIG.tagline && (
                  <p className="text-[10px] text-[#6B7280] -mt-1 whitespace-nowrap">{SCHOOL_CONFIG.tagline}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {!isCollapsed && (
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-4 px-3">
              Menu
            </p>
          )}
          <ul ref={navRef} className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[#2E5BFF]/10 text-[#2E5BFF] border-l-2 border-[#2E5BFF]'
                        : 'text-[#6B7280] hover:bg-[#F4F6FA] hover:text-[#111827]',
                      isCollapsed && 'justify-center px-2'
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-[#2E5BFF]')} />
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-4 border-t border-[#E5E7EB]',
          isCollapsed && 'px-2'
        )}>
          <div className={cn(
            'flex items-center gap-3',
            isCollapsed ? 'justify-center py-3' : 'px-3 py-3'
          )}>
            <div className="w-10 h-10 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center flex-shrink-0">
              <UserCog className="w-5 h-5 text-[#2E5BFF]" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium text-[#111827] truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email || 'admin@school.com'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 mt-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors',
              isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'
            )}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export { SCHOOL_CONFIG };
