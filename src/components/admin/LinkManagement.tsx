import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash, Plus, ExternalLink, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CustomLink {
  id: string;
  name: string;
  url: string;
  category: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'navbar', label: 'Navigation Bar' },
  { value: 'other', label: 'Other' }
];

const LinkManagement = () => {
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const { toast } = useToast();
  
  const [linkForm, setLinkForm] = useState({
    id: '',
    name: '',
    url: '',
    category: 'hero',
    description: '',
    is_active: true
  });
  
  useEffect(() => {
    fetchLinks();
  }, []);
  
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setLinks(data || []);
    } catch (error: any) {
      console.error('Error fetching links:', error.message);
      toast({
        title: "Error fetching links",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLinkForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setLinkForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (checked: boolean) => {
    setLinkForm((prev) => ({ ...prev, is_active: checked }));
  };
  
  const handleOpenDialog = (link?: CustomLink) => {
    if (link) {
      // Edit mode
      setEditingLink(link);
      setLinkForm({
        id: link.id,
        name: link.name,
        url: link.url,
        category: link.category,
        description: link.description || '',
        is_active: link.is_active
      });
    } else {
      // Create mode
      setEditingLink(null);
      setLinkForm({
        id: '',
        name: '',
        url: '',
        category: 'hero',
        description: '',
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate inputs
      if (!linkForm.name.trim()) {
        throw new Error("Link name is required");
      }
      
      if (!linkForm.url.trim()) {
        throw new Error("URL is required");
      }
      
      // Add http:// if not present
      let url = linkForm.url;
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      
      const linkData = {
        name: linkForm.name.trim(),
        url: url,
        category: linkForm.category,
        description: linkForm.description.trim() || null,
        is_active: linkForm.is_active
      };
      
      if (editingLink) {
        // Update existing link
        const { data, error } = await supabase
          .from('custom_links')
          .update({
            ...linkData,
            updated_at: new Date().toISOString()
          })
          .eq('id', linkForm.id);
        
        if (error) throw error;
        
        toast({
          title: "Link updated",
          description: "The link has been updated successfully.",
        });
      } else {
        // Create new link
        const { data, error } = await supabase
          .from('custom_links')
          .insert([linkData]);
        
        if (error) throw error;
        
        toast({
          title: "Link created",
          description: "The link has been created successfully.",
        });
      }
      
      setIsDialogOpen(false);
      fetchLinks();
    } catch (error: any) {
      console.error('Error saving link:', error.message);
      toast({
        title: "Error saving link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('custom_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Link deleted",
        description: "The link has been deleted successfully.",
      });
      
      fetchLinks();
    } catch (error: any) {
      console.error('Error deleting link:', error.message);
      toast({
        title: "Error deleting link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getCategoryLabel = (value: string) => {
    const category = categories.find(c => c.value === value);
    return category ? category.label : 'Unknown';
  };
  
  // Filter links based on search term
  const filteredLinks = links.filter(link => 
    link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryLabel(link.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Links Management</h1>
          <p className="text-gray-600">Manage links that appear on the website</p>
        </div>
        
        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Link
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search links..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Links</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !links.length ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading links...</p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="text-center py-10">
              <ExternalLink className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-1">No Links Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No links match "${searchTerm}"` 
                  : "No links have been created yet."}
              </p>
              {!searchTerm && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first link
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.name}</TableCell>
                      <TableCell>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center"
                        >
                          {link.url.length > 30 ? link.url.substring(0, 30) + '...' : link.url}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{getCategoryLabel(link.category)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          link.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(link)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteLink(link.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
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
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit Link' : 'Create New Link'}</DialogTitle>
            <DialogDescription>
              {editingLink 
                ? 'Update the details for this link.' 
                : 'Add a new link to be displayed on the website.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSaveLink} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Link Name
              </label>
              <Input
                id="name"
                name="name"
                value={linkForm.name}
                onChange={handleInputChange}
                placeholder="Enter link name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium">
                URL
              </label>
              <Input
                id="url"
                name="url"
                value={linkForm.url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL the link will direct to. "https://" will be added if not included.
              </p>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium">
                Category
              </label>
              <Select 
                value={linkForm.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                This determines where on the website the link will be displayed.
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description (Optional)
              </label>
              <Textarea
                id="description"
                name="description"
                value={linkForm.description}
                onChange={handleInputChange}
                placeholder="Enter a description for the link"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={linkForm.is_active}
                onCheckedChange={handleSwitchChange}
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Active
              </label>
              <span className="text-xs text-gray-500">
                (Only active links are displayed on the website)
              </span>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingLink ? 'Save Changes' : 'Create Link'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkManagement;
