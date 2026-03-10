import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Mail, Phone, BookOpen, Filter } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDatabase } from '@/context/DatabaseContext';
import { cn } from '@/lib/utils';
import type { Teacher } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science'];
const classes = ['9A', '9B', '9C', '10A', '10B', '11A', '11B', '12A', '12B'];

export function Teachers() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    classes: [] as string[],
    experience: 0,
    qualification: '',
    bio: '',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tbody tr');
        gsap.fromTo(rows,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tableRef.current,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.8,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [teachers]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || teacher.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleAdd = () => {
    addTeacher({
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedTeacher) {
      updateTeacher(selectedTeacher.id, formData);
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
    }
  };

  const handleDelete = () => {
    if (selectedTeacher) {
      deleteTeacher(selectedTeacher.id);
      setIsDeleteDialogOpen(false);
      setSelectedTeacher(null);
    }
  };

  const openViewDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      classes: teacher.classes,
      experience: teacher.experience,
      qualification: teacher.qualification,
      bio: teacher.bio,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      classes: [],
      experience: 0,
      qualification: '',
      bio: '',
    });
  };

  const toggleClass = (cls: string) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(cls)
        ? prev.classes.filter(c => c !== cls)
        : [...prev.classes, cls]
    }));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-700 hover:bg-green-100',
      inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
      on_leave: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
    };
    return styles[status as keyof typeof styles] || styles.inactive;
  };

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Teachers</h1>
          <p className="text-[#6B7280] mt-1">Manage teacher profiles and assignments</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6B7280]" />
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full">
              <thead className="bg-[#F4F6FA] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Subject</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Classes</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Experience</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-[#E5E7EB] hover:bg-[#F4F6FA]">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-[#2E5BFF]">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{teacher.name}</p>
                          <p className="text-xs text-[#6B7280]">{teacher.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#111827]">{teacher.subject}</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.slice(0, 3).map(cls => (
                          <Badge key={cls} variant="secondary" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                        {teacher.classes.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{teacher.classes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-[#6B7280]">{teacher.experience} years</td>
                    <td className="py-4 px-6">
                      <Badge className={cn('text-xs', getStatusBadge(teacher.status))}>
                        {teacher.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openViewDialog(teacher)}>
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(teacher)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(teacher)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredTeachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#6B7280]">
                      No teachers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., M.Sc. Mathematics"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Classes</Label>
              <div className="flex flex-wrap gap-2">
                {classes.map(cls => (
                  <Badge
                    key={cls}
                    variant={formData.classes.includes(cls) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleClass(cls)}
                  >
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Enter teacher bio"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Teacher Profile</DialogTitle>
          </DialogHeader>
          {selectedTeacher && (
            <div className="py-4">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-[#2E5BFF]/10 flex items-center justify-center text-2xl font-bold text-[#2E5BFF]">
                  {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#111827]">{selectedTeacher.name}</h3>
                  <p className="text-[#6B7280]">{selectedTeacher.subject} Teacher</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Mail className="w-4 h-4" />
                      {selectedTeacher.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Phone className="w-4 h-4" />
                      {selectedTeacher.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">About</h4>
                  <p className="text-sm text-[#6B7280]">{selectedTeacher.bio}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#F4F6FA] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedTeacher.classes.length}</p>
                    <p className="text-xs text-[#6B7280]">Classes</p>
                  </div>
                  <div className="bg-[#F4F6FA] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedTeacher.experience}</p>
                    <p className="text-xs text-[#6B7280]">Years Experience</p>
                  </div>
                  <div className="bg-[#F4F6FA] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#111827]">{selectedTeacher.qualification}</p>
                    <p className="text-xs text-[#6B7280]">Qualification</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111827] mb-2">Assigned Classes</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.classes.map(cls => (
                      <Badge key={cls} variant="secondary">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {cls}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={formData.subject} onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Qualification</Label>
              <Input
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Classes</Label>
              <div className="flex flex-wrap gap-2">
                {classes.map(cls => (
                  <Badge
                    key={cls}
                    variant={formData.classes.includes(cls) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleClass(cls)}
                  >
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
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
            <DialogTitle>Delete Teacher</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{selectedTeacher?.name}</strong>? This action cannot be undone.
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
