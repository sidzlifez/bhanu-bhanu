import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Trash2, Bell, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/context/DatabaseContext';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100' };
    case 'error':
      return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' };
    default:
      return { icon: Info, color: 'text-blue-500', bg: 'bg-blue-100' };
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
};

export function Notifications() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useDatabase();
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (listRef.current) {
        const items = listRef.current.querySelectorAll('.notification-item');
        gsap.fromTo(items,
          { x: -18, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: listRef.current,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.8,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Notifications</h1>
          <p className="text-[#6B7280] mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'No new notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            variant="outline"
            onClick={markAllNotificationsAsRead}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <div ref={listRef} className="divide-y divide-[#E5E7EB]">
            {notifications.map((notification) => {
              const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    'notification-item flex items-start gap-4 p-4 hover:bg-[#F4F6FA] transition-colors',
                    !notification.read && 'bg-[#2E5BFF]/5'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', bg)}>
                    <Icon className={cn('w-5 h-5', color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm', !notification.read ? 'font-semibold text-[#111827]' : 'text-[#111827]')}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-[#6B7280] flex-shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] mt-1">{notification.message}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markNotificationAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-[#2E5BFF]" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#F4F6FA] flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-[#6B7280]" />
                </div>
                <p className="text-[#6B7280]">No notifications yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
