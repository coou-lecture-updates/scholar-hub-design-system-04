import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  PenTool, 
  Eye, 
  Calendar, 
  Trash2, 
  Edit, 
  Plus, 
  Search,
  FileText,
  ImageIcon
} from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileUploadField } from '@/components/ui/FileUploadField';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const { toast } = useToast();
  
  const [blogForm, setBlogForm] = useState({
    id: '',
    title: '',
    content: '',
    summary: '',
    author: '',
    image_url: '',
    published: false,
  });
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setBlogs(data || []);
    } catch (error: any) {
      console.error('Error fetching blogs:', error.message);
      toast({
        title: "Error fetching blogs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBlogForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setBlogForm((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleImageUpload = (url: string) => {
    setBlogForm(prev => ({ ...prev, image_url: url }));
  };
  
  const handleOpenDialog = (blog?: any) => {
    if (blog) {
      // Edit mode
      setEditingBlog(blog);
      setBlogForm({
        id: blog.id,
        title: blog.title || '',
        content: blog.content || '',
        summary: blog.summary || '',
        author: blog.author || '',
        image_url: blog.image_url || '',
        published: blog.published || false,
      });
    } else {
      // Create mode
      setEditingBlog(null);
      setBlogForm({
        id: '',
        title: '',
        content: '',
        summary: '',
        author: '',
        image_url: '',
        published: false,
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingBlog) {
        // Update existing blog
        const { error } = await supabase
          .from('blog_posts')
          .update({
            title: blogForm.title,
            content: blogForm.content,
            summary: blogForm.summary,
            author: blogForm.author,
            image_url: blogForm.image_url,
            published: blogForm.published,
            updated_at: new Date().toISOString(),
          })
          .eq('id', blogForm.id);
        
        if (error) throw error;
        
        toast({
          title: "Blog updated",
          description: "The blog post has been updated successfully.",
        });
      } else {
        // Create new blog
        const { error } = await supabase
          .from('blog_posts')
          .insert([
            {
              title: blogForm.title,
              content: blogForm.content,
              summary: blogForm.summary,
              author: blogForm.author,
              image_url: blogForm.image_url,
              published: blogForm.published,
            },
          ]);
        
        if (error) throw error;
        
        toast({
          title: "Blog created",
          description: "The blog post has been created successfully.",
        });
      }
      
      setDialogOpen(false);
      fetchBlogs();
    } catch (error: any) {
      console.error('Error saving blog:', error.message);
      toast({
        title: "Error saving blog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteBlog = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);
      
      if (error) throw error;
      
      toast({
        title: "Blog deleted",
        description: "The blog post has been deleted successfully.",
      });
      
      fetchBlogs();
    } catch (error: any) {
      console.error('Error deleting blog:', error.message);
      toast({
        title: "Error deleting blog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePublish = async (blog: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('blog_posts')
        .update({ published: !blog.published })
        .eq('id', blog.id);
      
      if (error) throw error;
      
      toast({
        title: blog.published ? "Blog unpublished" : "Blog published",
        description: `The blog post has been ${blog.published ? 'unpublished' : 'published'}.`,
      });
      
      fetchBlogs();
    } catch (error: any) {
      console.error('Error toggling publish status:', error.message);
      toast({
        title: "Error updating blog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(blog => 
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-gray-600">Create and manage blog content for the portal</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800 flex items-center"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Blog
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                <DialogDescription>
                  {editingBlog 
                    ? 'Update the details for this blog post.' 
                    : 'Fill in the information for the new blog post.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSaveBlog} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={blogForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter blog title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      name="author"
                      value={blogForm.author}
                      onChange={handleInputChange}
                      placeholder="Author name"
                    />
                  </div>
                  
                  <div>
                    <FileUploadField
                      label="Featured Image"
                      onFileUploaded={handleImageUpload}
                      value={blogForm.image_url}
                      placeholder="Enter image URL or upload a file"
                      accept="image/*"
                      maxFileSize={5}
                      allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                      folder="blog-images"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    value={blogForm.summary}
                    onChange={handleInputChange}
                    placeholder="Brief summary of the blog post"
                    rows={2}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={blogForm.content}
                    onChange={handleInputChange}
                    placeholder="Write your blog content here..."
                    rows={10}
                    required
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={blogForm.published}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="published" className="ml-2">
                    Publish immediately
                  </Label>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingBlog ? "Update Blog" : "Create Blog"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Blog Posts</CardTitle>
            <CardDescription>Manage all your blog content in one place</CardDescription>
            
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search blogs by title, summary or author"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading && !blogs.length ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading blog posts...</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Blog Posts Found</h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? `No results match "${searchTerm}"` 
                    : "Get started by creating your first blog post."}
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBlogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                              {blog.image_url ? (
                                <img 
                                  src={blog.image_url} 
                                  alt={blog.title} 
                                  className="h-full w-full object-cover rounded" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                  }}
                                />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="truncate max-w-xs">
                              <div className="font-medium">{blog.title}</div>
                              <div className="text-xs text-gray-500 truncate">{blog.summary}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{blog.author || 'N/A'}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            blog.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1 opacity-70" />
                            {new Date(blog.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(`/blogs/${blog.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(blog)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleTogglePublish(blog)}
                            >
                              {blog.published ? (
                                <Eye className="h-4 w-4 text-amber-500" />
                              ) : (
                                <PenTool className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDeleteBlog(blog.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-gray-500">
            <div>
              Showing {filteredBlogs.length} of {blogs.length} blog posts
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BlogManagement;
