import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GraduationCap, Users, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useDatabase } from '@/context/DatabaseContext';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

interface DashboardProps {
  onViewChange: (view: 'students' | 'teachers' | 'events' | 'finance') => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const { getStats } = useDatabase();

  const stats = getStats();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline animation
      gsap.fromTo(headlineRef.current?.children || [],
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }
      );

      // Stats cards animation
      if (statsRef.current) {
        gsap.fromTo(statsRef.current.children,
          { y: 24, scale: 0.98, opacity: 0 },
          { 
            y: 0, 
            scale: 1, 
            opacity: 1, 
            duration: 0.5, 
            stagger: 0.08, 
            delay: 0.2,
            ease: 'power2.out' 
          }
        );
      }

      // Modules scroll animation
      if (modulesRef.current) {
        const cards = modulesRef.current.querySelectorAll('.module-card');
        gsap.fromTo(cards,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: modulesRef.current,
              start: 'top 85%',
              end: 'top 55%',
              scrub: 0.6,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const statCards = [
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      trend: '+5%',
      trendUp: true,
      color: 'bg-blue-500',
      onClick: () => onViewChange('students'),
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: Users,
      trend: '+2%',
      trendUp: true,
      color: 'bg-green-500',
      onClick: () => onViewChange('teachers'),
    },
    {
      title: 'Events',
      value: stats.totalEvents,
      icon: Calendar,
      trend: '0%',
      trendUp: true,
      color: 'bg-purple-500',
      onClick: () => onViewChange('events'),
    },
  ];

  const modules = [
    {
      title: 'Students',
      description: 'Manage enrollment, attendance, and records.',
      icon: GraduationCap,
      color: 'bg-blue-500',
      onClick: () => onViewChange('students'),
    },
    {
      title: 'Teachers',
      description: 'Assign classes and view schedules.',
      icon: Users,
      color: 'bg-green-500',
      onClick: () => onViewChange('teachers'),
    },
    {
      title: 'Finance',
      description: 'Track fees, payments, and reports.',
      icon: DollarSign,
      color: 'bg-amber-500',
      onClick: () => onViewChange('finance'),
    },
  ];

  const recentActivity = [
    { action: 'New student enrolled', detail: 'James Brown - Class 9C', time: '2 hours ago' },
    { action: 'Fee payment received', detail: 'Emma Johnson - $2,500', time: '4 hours ago' },
    { action: 'Event created', detail: 'Parent-Teacher Meeting', time: '1 day ago' },
    { action: 'Teacher added', detail: 'Amanda White - History', time: '2 days ago' },
  ];

  return (
    <div ref={sectionRef} className="space-y-8">
      {/* Headline */}
      <div ref={headlineRef}>
        <h1 className="text-3xl font-bold text-[#111827]">Dashboard</h1>
        <p className="text-[#6B7280] mt-1">Overview of your school today.</p>
      </div>

      {/* Stats Cards */}
      <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;

          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">{card.title}</p>
                    <p className="text-3xl font-bold text-[#111827] mt-2">{card.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={cn('w-4 h-4', card.trendUp ? 'text-green-500' : 'text-red-500')} />
                      <span className={cn('text-sm font-medium', card.trendUp ? 'text-green-500' : 'text-red-500')}>
                        {card.trend}
                      </span>
                      <span className="text-sm text-[#6B7280]">vs last month</span>
                    </div>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', card.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modules Section */}
      <div>
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-4">
          Modules
        </p>
        <div ref={modulesRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.title}
                className="module-card cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group"
                onClick={module.onClick}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', module.color)}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#111827] group-hover:text-[#2E5BFF] transition-colors">
                        {module.title}
                      </h3>
                      <p className="text-sm text-[#6B7280] mt-1">{module.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-[#111827]">{activity.action}</p>
                  <p className="text-sm text-[#6B7280]">{activity.detail}</p>
                </div>
                <span className="text-xs text-[#6B7280]">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
