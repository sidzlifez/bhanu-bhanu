export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentPhone: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'suspended';
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  classes: string[];
  experience: number;
  qualification: string;
  joinDate: string;
  bio: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  type: 'meeting' | 'sports' | 'academic' | 'cultural' | 'holiday';
  attendees: string[];
  createdBy: string;
  createdAt: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: string;
  publishDate: string;
  category: 'announcement' | 'achievement' | 'general' | 'urgent';
  image?: string;
  isPublished: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  preferences: {
    notifications: boolean;
    emailAlerts: boolean;
    darkMode: boolean;
  };
}

export interface FinanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'tuition' | 'fee' | 'fine' | 'other';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'students' 
  | 'teachers' 
  | 'events' 
  | 'news' 
  | 'finance' 
  | 'settings' 
  | 'notifications';
