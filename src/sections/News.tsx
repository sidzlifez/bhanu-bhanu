import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Search, Edit2, Trash2, MoreHorizontal, Calendar, User, Eye, EyeOff } from 'lucide-react';
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
import type { News } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { value: 'announcement', label: 'Announcement', color: 'bg-blue-500' },
  { value: 'achievement', label: 'Achievement', color: 'bg-green-500' },
  { value: 'general', label: 'General', color: 'bg-gray-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

export function News() {
  const { news, addNews, updateNews, deleteNews } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'general' as News['category'],
    isPublished: true,
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.news-card');
        gsap.fromTo(cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 0.8,
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [news]);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    addNews({
      ...formData,
      author: 'Admin',
      publishDate: new Date().toISOString().split('T')[0],
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (selectedNews) {
      updateNews(selectedNews.id, formData);
      setIsEditDialogOpen(false);
      setSelectedNews(null);
    }
  };

  const handleDelete = () => {
    if (selectedNews) {
      deleteNews(selectedNews.id);
      setIsDeleteDialogOpen(false);
      setSelectedNews(null);
    }
  };

  const handleTogglePublish = (item: News) => {
    updateNews(item.id, { isPublished: !item.isPublished });
  };

  const openViewDialog = (item: News) => {
    setSelectedNews(item);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (item: News) => {
    setSelectedNews(item);
    setFormData({
      title: item.title,
      content: item.content,
      summary: item.summary,
      category: item.category,
      isPublished: item.isPublished,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: News) => {
    setSelectedNews(item);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'general',
      isPublished: true,
    });
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.value === category);
    return cat?.color || 'bg-gray-500';
  };

  return (
    <div ref={sectionRef} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#111827]">News</h1>
          <p className="text-[#6B7280] mt-1">Manage school announcements and updates</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-[#2E5BFF] hover:bg-[#1E4BEF]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add News
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <Input
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* News Grid */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNews.map((item) => (
          <Card key={item.id} className="news-card overflow-hidden hover:shadow-lg transition-shadow">
            <div className={cn('h-2', getCategoryColor(item.category))} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <Badge className={cn('text-xs', getCategoryColor(item.category))}>
                  {categories.find(c => c.value === item.category)?.label}
                </Badge>
                <div className="flex items-center gap-1">
                  {!item.isPublished && (
                    <Badge variant="outline" className="text-xs">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
              <h3 
                className="text-lg font-semibold text-[#111827] mb-2 line-clamp-2 cursor-pointer hover:text-[#2E5BFF]"
                onClick={() => openViewDialog(item)}
              >
                {item.title}
              </h3>
              <p className="text-sm text-[#6B7280] mb-4 line-clamp-3">
                {item.summary}
              </p>
              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.publishDate}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E7EB]">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleTogglePublish(item)}
                >
                  {item.isPublished ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openViewDialog(item)}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEditDialog(item)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => openDeleteDialog(item)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No news articles found</p>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add News Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as News['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Brief summary of the article"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full article content"
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPublished" className="cursor-pointer">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="bg-[#2E5BFF] hover:bg-[#1E4BEF]">
              Add News
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>News Article</DialogTitle>
          </DialogHeader>
          {selectedNews && (
            <div className="py-4">
              <div className={cn('h-2 rounded-full mb-4', getCategoryColor(selectedNews.category))} />
              <Badge className={cn('mb-3', getCategoryColor(selectedNews.category))}>
                {categories.find(c => c.value === selectedNews.category)?.label}
              </Badge>
              <h2 className="text-2xl font-bold text-[#111827] mb-4">{selectedNews.title}</h2>
              <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-6">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {selectedNews.author}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedNews.publishDate}
                </span>
                {!selectedNews.isPublished && (
                  <Badge variant="outline">
                    <EyeOff className="w-3 h-3 mr-1" />
                    Draft
                  </Badge>
                )}
              </div>
              <div className="bg-[#F4F6FA] rounded-xl p-4 mb-6">
                <p className="text-[#6B7280] italic">{selectedNews.summary}</p>
              </div>
              <div className="prose max-w-none">
                <p className="text-[#111827] whitespace-pre-wrap">{selectedNews.content}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit News Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({ ...formData, category: v as News['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="editIsPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="editIsPublished" className="cursor-pointer">Published</Label>
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
            <DialogTitle>Delete News Article</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete <strong>{selectedNews?.title}</strong>? This action cannot be undone.
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
