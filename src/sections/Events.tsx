import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Users, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDatabase } from '@/context/DatabaseContext';
import { cn } from '@/lib/utils';
import type { Event } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const eventTypes = [
  { value: 'meeting', label: 'Meeting', color: 'bg-blue-500' },
  { value: 'sports', label: 'Sports', color: 'bg-green-500' },
  { value: 'academic', label: 'Academic', color: 'bg-purple-500' },
  { value: 'cultural', label: 'Cultural', color: 'bg-pink-500' },
  { value: 'holiday', label: 'Holiday', color: 'bg-red-500' },
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Events() {
  const { events, teachers, addEvent, updateEvent, deleteEvent } = useDatabase();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    type: 'meeting' as Event['type'],
    attendees: [] as string[],
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (calendarRef.current) {
        const cells = calendarRef.current.querySelectorAll('.calendar-cell');
        gsap.fromTo(cells,
          { scale: 0.95, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.3,
            stagger: 0.02,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: calendarRef.current,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.8,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [events, currentDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const getEventTypeColor = (type: string) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType?.color || 'bg-gray-500';
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAdd = () => {
    addEvent({
      ...formData,
      createdBy: 'admin-1',
      createdAt: new Date().toISOString(),
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, formData);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  const openAddDialog = (date?: number) => {
    if (date) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
    setIsAddDialogOpen(true);
  };

  const openViewDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      endTime: event.endTime || '',
      location: event.location,
      type: event.type,
      attendees: event.attendees,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      type: 'meeting',
      attendees: [],
    });
  };

  const toggleAttendee = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(teacherId)
        ? prev.attendees.filter(id => id !== teacherId)
        : [...prev.attendees, teacherId]
    }));
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const today = new Date();

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Events</h1>
          <p className="text-[#6B7280] mt-1">Manage school events and calendar</p>
        </div>
        <Button 
          onClick={() => openAddDialog()}
          className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-[#111827]">{monthName}</h2>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {eventTypes.map(type => (
                <div key={type.value} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', type.color)} />
                  <span className="text-xs text-[#6B7280]">{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div ref={calendarRef} className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="text-center py-2 text-sm font-semibold text-[#6B7280]">
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-24 bg-[#F4F6FA]/50 rounded-lg" />;
              }

              const dayEvents = getEventsForDate(day);
              const isToday = today.getDate() === day && 
                             today.getMonth() === currentDate.getMonth() && 
                             today.getFullYear() === currentDate.getFullYear();

              return (
                <div
                  key={day}
                  className={cn(
                    'calendar-cell h-24 p-2 rounded-lg border border-[#E5E7EB] cursor-pointer hover:border-[#2E5BFF] transition-colors',
                    isToday && 'bg-[#2E5BFF]/5 border-[#2E5BFF]'
                  )}
                  onClick={() => openAddDialog(day)}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isToday ? 'text-[#2E5BFF]' : 'text-[#111827]'
                  )}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded text-white truncate',
                          getEventTypeColor(event.type)
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          openViewDialog(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-[#6B7280] pl-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events
              .filter(e => new Date(e.date) >= new Date())
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-[#F4F6FA] rounded-xl hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                  onClick={() => openViewDialog(event)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', getEventTypeColor(event.type))}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-[#111827]">{event.title}</p>
                      <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {event.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getEventTypeColor(event.type)}>
                    {eventTypes.find(t => t.value === event.type)?.label}
                  </Badge>
                </div>
              ))}
            {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
              <p className="text-center text-[#6B7280] py-4">No upcoming events</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Event['type'] })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter event description"
                rows={3}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Attendees</Label>
              <div className="flex flex-wrap gap-2">
                {teachers.map(teacher => (
                  <Badge
                    key={teacher.id}
                    variant={formData.attendees.includes(teacher.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAttendee(teacher.id)}
                  >
                    {teacher.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="py-4">
              <div className={cn('h-2 rounded-full mb-4', getEventTypeColor(selectedEvent.type))} />
              <h3 className="text-xl font-semibold text-[#111827]">{selectedEvent.title}</h3>
              <Badge className={cn('mt-2', getEventTypeColor(selectedEvent.type))}>
                {eventTypes.find(t => t.value === selectedEvent.type)?.label}
              </Badge>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-[#6B7280]">
                  <Calendar className="w-5 h-5" />
                  <span>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B7280]">
                  <Clock className="w-5 h-5" />
                  <span>{selectedEvent.time} {selectedEvent.endTime && `- ${selectedEvent.endTime}`}</span>
                </div>
                <div className="flex items-center gap-3 text-[#6B7280]">
                  <MapPin className="w-5 h-5" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="pt-2">
                  <p className="text-sm text-[#111827]">{selectedEvent.description}</p>
                </div>
                {selectedEvent.attendees.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-[#111827] mb-2">Attendees</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.attendees.map(attendeeId => {
                        const teacher = teachers.find(t => t.id === attendeeId);
                        return teacher ? (
                          <Badge key={attendeeId} variant="secondary">
                            <Users className="w-3 h-3 mr-1" />
                            {teacher.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(selectedEvent);
                  }}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openDeleteDialog(selectedEvent);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Event Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Event['type'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Attendees</Label>
              <div className="flex flex-wrap gap-2">
                {teachers.map(teacher => (
                  <Badge
                    key={teacher.id}
                    variant={formData.attendees.includes(teacher.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAttendee(teacher.id)}
                  >
                    {teacher.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} className="bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{selectedEvent?.title}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
