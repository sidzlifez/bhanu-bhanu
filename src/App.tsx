import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { Header } from '@/components/header/Header';
import { Dashboard } from '@/sections/Dashboard';
import { Students } from '@/sections/Students';
import { Teachers } from '@/sections/Teachers';
import { Events } from '@/sections/Events';
import { News } from '@/sections/News';
import { Finance } from '@/sections/Finance';
import { Settings } from '@/sections/Settings';
import { Notifications } from '@/sections/Notifications';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

export type ViewType = 
  | 'dashboard' 
  | 'students' 
  | 'teachers' 
  | 'events' 
  | 'news' 
  | 'finance' 
  | 'settings' 
  | 'notifications';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('educore_sidebar_collapsed');
    if (saved) {
      setSidebarCollapsed(JSON.parse(saved));
    }
  }, []);

  // Save collapsed state to localStorage
  const handleToggleCollapse = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('educore_sidebar_collapsed', JSON.stringify(newState));
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={handleViewChange} />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'events':
        return <Events />;
      case 'news':
        return <News />;
      case 'finance':
        return <Finance />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <Notifications />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={cn(
      'min-h-screen bg-[#F4F6FA] transition-opacity duration-300',
      isLoaded ? 'opacity-100' : 'opacity-0'
    )}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <Header 
        onMenuClick={() => setSidebarOpen(true)}
      />

      {/* Main Content - adjusts margin based on sidebar state */}
      <main 
        className={cn(
          'pt-[72px] min-h-screen transition-all duration-300',
          // Desktop: adjust margin based on collapsed state
          sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[260px]'
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
