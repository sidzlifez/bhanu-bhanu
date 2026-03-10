import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Student, Teacher, Event, News, User, FinanceRecord, Notification } from '@/types';

interface DatabaseContextType {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  
  // Teachers
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  getTeacherById: (id: string) => Teacher | undefined;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventById: (id: string) => Event | undefined;
  
  // News
  news: News[];
  addNews: (news: Omit<News, 'id'>) => void;
  updateNews: (id: string, news: Partial<News>) => void;
  deleteNews: (id: string) => void;
  getNewsById: (id: string) => News | undefined;
  
  // Finance
  financeRecords: FinanceRecord[];
  addFinanceRecord: (record: Omit<FinanceRecord, 'id'>) => void;
  updateFinanceRecord: (id: string, record: Partial<FinanceRecord>) => void;
  deleteFinanceRecord: (id: string) => void;
  
  // User
  currentUser: User;
  updateUser: (user: Partial<User>) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  
  // Stats
  getStats: () => {
    totalStudents: number;
    totalTeachers: number;
    totalEvents: number;
    totalRevenue: number;
    outstandingFees: number;
    pendingPayments: number;
  };
}

const defaultUser: User = {
  id: 'admin-1',
  name: 'Alex Morgan',
  email: 'admin@educore.com',
  role: 'admin',
  preferences: {
    notifications: true,
    emailAlerts: true,
    darkMode: false,
  },
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Sample data generators
const generateSampleStudents = (): Student[] => [
  {
    id: 'stu-1',
    name: 'Emma Johnson',
    email: 'emma.j@school.edu',
    phone: '+1 555-0101',
    class: '10A',
    dateOfBirth: '2008-05-15',
    address: '123 Maple Street',
    parentName: 'John Johnson',
    parentPhone: '+1 555-0102',
    enrollmentDate: '2022-09-01',
    status: 'active',
  },
  {
    id: 'stu-2',
    name: 'Michael Chen',
    email: 'michael.c@school.edu',
    phone: '+1 555-0103',
    class: '10A',
    dateOfBirth: '2008-03-22',
    address: '456 Oak Avenue',
    parentName: 'Lisa Chen',
    parentPhone: '+1 555-0104',
    enrollmentDate: '2022-09-01',
    status: 'active',
  },
  {
    id: 'stu-3',
    name: 'Sophia Williams',
    email: 'sophia.w@school.edu',
    phone: '+1 555-0105',
    class: '11B',
    dateOfBirth: '2007-11-08',
    address: '789 Pine Road',
    parentName: 'David Williams',
    parentPhone: '+1 555-0106',
    enrollmentDate: '2021-09-01',
    status: 'active',
  },
  {
    id: 'stu-4',
    name: 'James Brown',
    email: 'james.b@school.edu',
    phone: '+1 555-0107',
    class: '9C',
    dateOfBirth: '2009-07-30',
    address: '321 Elm Street',
    parentName: 'Sarah Brown',
    parentPhone: '+1 555-0108',
    enrollmentDate: '2023-09-01',
    status: 'active',
  },
  {
    id: 'stu-5',
    name: 'Olivia Davis',
    email: 'olivia.d@school.edu',
    phone: '+1 555-0109',
    class: '12A',
    dateOfBirth: '2006-12-12',
    address: '654 Birch Lane',
    parentName: 'Robert Davis',
    parentPhone: '+1 555-0110',
    enrollmentDate: '2020-09-01',
    status: 'active',
  },
  {
    id: 'stu-6',
    name: 'William Martinez',
    email: 'william.m@school.edu',
    phone: '+1 555-0111',
    class: '11A',
    dateOfBirth: '2007-09-05',
    address: '987 Cedar Court',
    parentName: 'Maria Martinez',
    parentPhone: '+1 555-0112',
    enrollmentDate: '2021-09-01',
    status: 'inactive',
  },
];

const generateSampleTeachers = (): Teacher[] => [
  {
    id: 'tch-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@educore.com',
    phone: '+1 555-0201',
    subject: 'Mathematics',
    classes: ['10A', '10B', '11A'],
    experience: 6,
    qualification: 'M.Sc. Mathematics',
    joinDate: '2018-08-15',
    bio: 'Sarah builds strong foundations in algebra and problem-solving. She is passionate about making math accessible to all students.',
    status: 'active',
  },
  {
    id: 'tch-2',
    name: 'Robert Taylor',
    email: 'robert.t@educore.com',
    phone: '+1 555-0202',
    subject: 'Physics',
    classes: ['11A', '11B', '12A'],
    experience: 10,
    qualification: 'Ph.D. Physics',
    joinDate: '2014-06-01',
    bio: 'Robert specializes in experimental physics and loves conducting hands-on demonstrations in class.',
    status: 'active',
  },
  {
    id: 'tch-3',
    name: 'Emily Parker',
    email: 'emily.p@educore.com',
    phone: '+1 555-0203',
    subject: 'English Literature',
    classes: ['9A', '9B', '10A'],
    experience: 4,
    qualification: 'M.A. English',
    joinDate: '2020-01-10',
    bio: 'Emily brings classic literature to life with creative teaching methods and interactive discussions.',
    status: 'active',
  },
  {
    id: 'tch-4',
    name: 'David Lee',
    email: 'david.l@educore.com',
    phone: '+1 555-0204',
    subject: 'Chemistry',
    classes: ['10B', '11A', '12B'],
    experience: 8,
    qualification: 'M.Sc. Chemistry',
    joinDate: '2016-03-20',
    bio: 'David focuses on practical chemistry applications and laboratory safety.',
    status: 'on_leave',
  },
  {
    id: 'tch-5',
    name: 'Amanda White',
    email: 'amanda.w@educore.com',
    phone: '+1 555-0205',
    subject: 'History',
    classes: ['9C', '10A', '11B'],
    experience: 12,
    qualification: 'M.A. History',
    joinDate: '2012-08-01',
    bio: 'Amanda makes history engaging through storytelling and connections to current events.',
    status: 'active',
  },
];

const generateSampleEvents = (): Event[] => [
  {
    id: 'evt-1',
    title: 'Parent-Teacher Meeting',
    description: 'Discuss student progress and set goals for the term.',
    date: '2024-09-12',
    time: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Main Hall',
    type: 'meeting',
    attendees: ['tch-1', 'tch-2', 'tch-3'],
    createdBy: 'admin-1',
    createdAt: '2024-09-01T10:00:00Z',
  },
  {
    id: 'evt-2',
    title: 'Sports Day',
    description: 'Annual inter-house sports competition with track and field events.',
    date: '2024-09-20',
    time: '08:00 AM',
    endTime: '04:00 PM',
    location: 'School Grounds',
    type: 'sports',
    attendees: [],
    createdBy: 'admin-1',
    createdAt: '2024-09-02T09:00:00Z',
  },
  {
    id: 'evt-3',
    title: 'Science Fair',
    description: 'Students showcase their science projects and innovations.',
    date: '2024-10-05',
    time: '09:00 AM',
    endTime: '03:00 PM',
    location: 'Science Block',
    type: 'academic',
    attendees: ['tch-2', 'tch-4'],
    createdBy: 'admin-1',
    createdAt: '2024-09-03T11:00:00Z',
  },
  {
    id: 'evt-4',
    title: 'Cultural Festival',
    description: 'Celebrate diversity with performances, food, and art from different cultures.',
    date: '2024-10-15',
    time: '05:00 PM',
    endTime: '09:00 PM',
    location: 'Auditorium',
    type: 'cultural',
    attendees: [],
    createdBy: 'admin-1',
    createdAt: '2024-09-04T14:00:00Z',
  },
  {
    id: 'evt-5',
    title: 'Mid-term Examinations',
    description: 'Semester mid-term assessments for all classes.',
    date: '2024-10-25',
    time: '09:00 AM',
    endTime: '01:00 PM',
    location: 'All Classrooms',
    type: 'academic',
    attendees: [],
    createdBy: 'admin-1',
    createdAt: '2024-09-05T08:00:00Z',
  },
];

const generateSampleNews = (): News[] => [
  {
    id: 'news-1',
    title: 'New Science Lab Opening',
    content: 'We are excited to announce the opening of our state-of-the-art science laboratory. The new facility includes modern equipment for physics, chemistry, and biology experiments. Students will have hands-on learning experiences starting next semester.',
    summary: 'State-of-the-art science laboratory opening with modern equipment.',
    author: 'Admin',
    publishDate: '2024-09-01',
    category: 'announcement',
    isPublished: true,
  },
  {
    id: 'news-2',
    title: 'Student Wins National Math Competition',
    content: 'Congratulations to Michael Chen from Class 10A for winning first place in the National Mathematics Olympiad. His exceptional problem-solving skills and dedication have brought pride to our school.',
    summary: 'Michael Chen wins first place in National Mathematics Olympiad.',
    author: 'Sarah Jenkins',
    publishDate: '2024-09-03',
    category: 'achievement',
    isPublished: true,
  },
  {
    id: 'news-3',
    title: 'Important: School Closure Notice',
    content: 'The school will remain closed on September 10th due to scheduled maintenance work. Online classes will be conducted as usual. Please check your email for the virtual class schedule.',
    summary: 'School closed on Sept 10th for maintenance. Online classes continue.',
    author: 'Admin',
    publishDate: '2024-09-05',
    category: 'urgent',
    isPublished: true,
  },
  {
    id: 'news-4',
    title: 'New Library Books Arrived',
    content: 'Over 500 new books have been added to our library collection. The new arrivals include fiction, non-fiction, reference materials, and digital resources. Visit the library to explore!',
    summary: '500+ new books added to the school library collection.',
    author: 'Library Team',
    publishDate: '2024-09-07',
    category: 'general',
    isPublished: true,
  },
];

const generateSampleFinanceRecords = (): FinanceRecord[] => [
  {
    id: 'fin-1',
    studentId: 'stu-1',
    studentName: 'Emma Johnson',
    type: 'tuition',
    amount: 2500,
    status: 'paid',
    dueDate: '2024-09-01',
    paidDate: '2024-08-28',
    description: 'Fall Semester Tuition',
  },
  {
    id: 'fin-2',
    studentId: 'stu-2',
    studentName: 'Michael Chen',
    type: 'tuition',
    amount: 2500,
    status: 'paid',
    dueDate: '2024-09-01',
    paidDate: '2024-09-02',
    description: 'Fall Semester Tuition',
  },
  {
    id: 'fin-3',
    studentId: 'stu-3',
    studentName: 'Sophia Williams',
    type: 'tuition',
    amount: 2500,
    status: 'pending',
    dueDate: '2024-09-01',
    description: 'Fall Semester Tuition',
  },
  {
    id: 'fin-4',
    studentId: 'stu-4',
    studentName: 'James Brown',
    type: 'fee',
    amount: 150,
    status: 'overdue',
    dueDate: '2024-08-15',
    description: 'Laboratory Fee',
  },
  {
    id: 'fin-5',
    studentId: 'stu-5',
    studentName: 'Olivia Davis',
    type: 'tuition',
    amount: 2500,
    status: 'paid',
    dueDate: '2024-09-01',
    paidDate: '2024-08-25',
    description: 'Fall Semester Tuition',
  },
  {
    id: 'fin-6',
    studentId: 'stu-6',
    studentName: 'William Martinez',
    type: 'fine',
    amount: 50,
    status: 'pending',
    dueDate: '2024-09-10',
    description: 'Library Late Return Fee',
  },
];

const generateSampleNotifications = (): Notification[] => [
  {
    id: 'notif-1',
    title: 'New student enrolled',
    message: 'James Brown has been enrolled in Class 9C.',
    type: 'success',
    read: false,
    createdAt: '2024-09-06T10:30:00Z',
  },
  {
    id: 'notif-2',
    title: 'Fee payment received',
    message: 'Payment of $2,500 received from Emma Johnson.',
    type: 'success',
    read: false,
    createdAt: '2024-09-05T14:20:00Z',
  },
  {
    id: 'notif-3',
    title: 'Event reminder: Sports Day',
    message: 'Sports Day is scheduled for September 20th.',
    type: 'info',
    read: true,
    createdAt: '2024-09-04T09:00:00Z',
  },
  {
    id: 'notif-4',
    title: 'Overdue payment alert',
    message: 'James Brown has an overdue laboratory fee of $150.',
    type: 'warning',
    read: false,
    createdAt: '2024-09-03T16:45:00Z',
  },
];

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      const savedStudents = localStorage.getItem('educore_students');
      const savedTeachers = localStorage.getItem('educore_teachers');
      const savedEvents = localStorage.getItem('educore_events');
      const savedNews = localStorage.getItem('educore_news');
      const savedFinance = localStorage.getItem('educore_finance');
      const savedNotifications = localStorage.getItem('educore_notifications');
      const savedUser = localStorage.getItem('educore_user');

      setStudents(savedStudents ? JSON.parse(savedStudents) : generateSampleStudents());
      setTeachers(savedTeachers ? JSON.parse(savedTeachers) : generateSampleTeachers());
      setEvents(savedEvents ? JSON.parse(savedEvents) : generateSampleEvents());
      setNews(savedNews ? JSON.parse(savedNews) : generateSampleNews());
      setFinanceRecords(savedFinance ? JSON.parse(savedFinance) : generateSampleFinanceRecords());
      setNotifications(savedNotifications ? JSON.parse(savedNotifications) : generateSampleNotifications());
      
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
      
      setIsInitialized(true);
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_students', JSON.stringify(students));
    }
  }, [students, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_teachers', JSON.stringify(teachers));
    }
  }, [teachers, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_events', JSON.stringify(events));
    }
  }, [events, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_news', JSON.stringify(news));
    }
  }, [news, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_finance', JSON.stringify(financeRecords));
    }
  }, [financeRecords, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('educore_user', JSON.stringify(currentUser));
    }
  }, [currentUser, isInitialized]);

  // Student operations
  const addStudent = useCallback((student: Omit<Student, 'id'>) => {
    const newStudent = { ...student, id: `stu-${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
    addNotification({
      title: 'New student enrolled',
      message: `${newStudent.name} has been enrolled in Class ${newStudent.class}.`,
      type: 'success',
      read: false,
    });
  }, []);

  const updateStudent = useCallback((id: string, studentData: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  }, []);

  const getStudentById = useCallback((id: string) => {
    return students.find(s => s.id === id);
  }, [students]);

  // Teacher operations
  const addTeacher = useCallback((teacher: Omit<Teacher, 'id'>) => {
    const newTeacher = { ...teacher, id: `tch-${Date.now()}` };
    setTeachers(prev => [...prev, newTeacher]);
    addNotification({
      title: 'New teacher added',
      message: `${newTeacher.name} has joined as ${newTeacher.subject} teacher.`,
      type: 'success',
      read: false,
    });
  }, []);

  const updateTeacher = useCallback((id: string, teacherData: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacherData } : t));
  }, []);

  const deleteTeacher = useCallback((id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  }, []);

  const getTeacherById = useCallback((id: string) => {
    return teachers.find(t => t.id === id);
  }, [teachers]);

  // Event operations
  const addEvent = useCallback((event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: `evt-${Date.now()}` };
    setEvents(prev => [...prev, newEvent]);
    addNotification({
      title: 'New event created',
      message: `${newEvent.title} has been scheduled for ${newEvent.date}.`,
      type: 'info',
      read: false,
    });
  }, []);

  const updateEvent = useCallback((id: string, eventData: Partial<Event>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...eventData } : e));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEventById = useCallback((id: string) => {
    return events.find(e => e.id === id);
  }, [events]);

  // News operations
  const addNews = useCallback((newsItem: Omit<News, 'id'>) => {
    const newNews = { ...newsItem, id: `news-${Date.now()}` };
    setNews(prev => [newNews, ...prev]);
  }, []);

  const updateNews = useCallback((id: string, newsData: Partial<News>) => {
    setNews(prev => prev.map(n => n.id === id ? { ...n, ...newsData } : n));
  }, []);

  const deleteNews = useCallback((id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  }, []);

  const getNewsById = useCallback((id: string) => {
    return news.find(n => n.id === id);
  }, [news]);

  // Finance operations
  const addFinanceRecord = useCallback((record: Omit<FinanceRecord, 'id'>) => {
    const newRecord = { ...record, id: `fin-${Date.now()}` };
    setFinanceRecords(prev => [...prev, newRecord]);
    if (record.status === 'paid') {
      addNotification({
        title: 'Fee payment received',
        message: `Payment of $${record.amount} received from ${record.studentName}.`,
        type: 'success',
        read: false,
      });
    }
  }, []);

  const updateFinanceRecord = useCallback((id: string, recordData: Partial<FinanceRecord>) => {
    setFinanceRecords(prev => prev.map(r => r.id === id ? { ...r, ...recordData } : r));
  }, []);

  const deleteFinanceRecord = useCallback((id: string) => {
    setFinanceRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  // User operations
  const updateUser = useCallback((userData: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  }, []);

  // Notification operations
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification = { 
      ...notification, 
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Stats
  const getStats = useCallback(() => {
    const totalRevenue = financeRecords
      .filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + r.amount, 0);
    const outstandingFees = financeRecords
      .filter(r => r.status === 'pending' || r.status === 'overdue')
      .reduce((sum, r) => sum + r.amount, 0);
    const pendingPayments = financeRecords.filter(r => r.status === 'pending').length;

    return {
      totalStudents: students.filter(s => s.status === 'active').length,
      totalTeachers: teachers.filter(t => t.status === 'active').length,
      totalEvents: events.length,
      totalRevenue,
      outstandingFees,
      pendingPayments,
    };
  }, [students, teachers, events, financeRecords]);

  return (
    <DatabaseContext.Provider value={{
      students,
      addStudent,
      updateStudent,
      deleteStudent,
      getStudentById,
      teachers,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      getTeacherById,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      getEventById,
      news,
      addNews,
      updateNews,
      deleteNews,
      getNewsById,
      financeRecords,
      addFinanceRecord,
      updateFinanceRecord,
      deleteFinanceRecord,
      currentUser,
      updateUser,
      notifications,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      getStats,
    }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
