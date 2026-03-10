import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Search, Edit2, Trash2, DollarSign, TrendingUp, TrendingDown, AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import type { FinanceRecord } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const paymentTypes = [
  { value: 'tuition', label: 'Tuition Fee' },
  { value: 'fee', label: 'Additional Fee' },
  { value: 'fine', label: 'Fine' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-700' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-100 text-red-700' },
];

export function Finance() {
  const { financeRecords, students, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord, getStats } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FinanceRecord | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const stats = getStats();

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    type: 'tuition' as FinanceRecord['type'],
    amount: 0,
    status: 'pending' as FinanceRecord['status'],
    dueDate: '',
    description: '',
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll('tbody tr');
        gsap.fromTo(rows,
          { x: -16, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
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
  }, [financeRecords]);

  const filteredRecords = financeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => {
    addFinanceRecord(formData);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedRecord) {
      updateFinanceRecord(selectedRecord.id, formData);
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const handleDelete = () => {
    if (selectedRecord) {
      deleteFinanceRecord(selectedRecord.id);
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
    }
  };

  const openEditDialog = (record: FinanceRecord) => {
    setSelectedRecord(record);
    setFormData({
      studentId: record.studentId,
      studentName: record.studentName,
      type: record.type,
      amount: record.amount,
      status: record.status,
      dueDate: record.dueDate,
      description: record.description,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (record: FinanceRecord) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      type: 'tuition',
      amount: 0,
      status: 'pending',
      dueDate: '',
      description: '',
    });
  };

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData(prev => ({
        ...prev,
        studentId,
        studentName: student.name,
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const style = statusOptions.find(s => s.value === status);
    return style?.color || 'bg-gray-100 text-gray-700';
  };

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'bg-green-500',
    },
    {
      title: 'Outstanding Fees',
      value: `$${stats.outstandingFees.toLocaleString()}`,
      icon: AlertCircle,
      trend: '-5%',
      trendUp: true,
      color: 'bg-amber-500',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments.toString(),
      icon: TrendingDown,
      trend: '+3',
      trendUp: false,
      color: 'bg-red-500',
    },
  ];

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">Finance</h1>
          <p className="text-[#6B7280] mt-1">Manage fees, payments, and financial records</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendUp ? TrendingUp : TrendingDown;

          return (
            <Card key={card.title}>
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#6B7280]" />
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
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
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Student</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Description</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Amount</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Due Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#111827]">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#111827]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-[#E5E7EB] hover:bg-[#F4F6FA]">
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-[#111827]">{record.studentName}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#6B7280]">
                        {paymentTypes.find(t => t.value === record.type)?.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#6B7280]">{record.description}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-[#111827]">
                        ${record.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#6B7280]">{record.dueDate}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={cn('text-xs', getStatusBadge(record.status))}>
                        {statusOptions.find(s => s.value === record.status)?.label}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(record)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openDeleteDialog(record)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#6B7280]">
                      No records found
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Finance Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2 space-y-2">
              <Label>Student</Label>
              <Select value={formData.studentId} onValueChange={handleStudentChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as FinanceRecord['type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as FinanceRecord['status'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Fall Semester Tuition"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Finance Record</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Payment Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData({ ...formData, type: v as FinanceRecord['type'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: v as FinanceRecord['status'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete this record for <strong>{selectedRecord?.studentName}</strong>? This action cannot be undone.
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
