
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { handleAdminError } from '@/utils/adminErrorHandler';

interface CommunityLink {
  id: string;
  name: string;
  url: string;
  description?: string;
  type?: string;
  platform: string;
  is_active: boolean;
  created_at: string;
}

const CommunityManagement = () => {
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState<CommunityLink | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    platform: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface, handling missing fields
      const mappedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        description: item.description || '',
        type: item.type || '',
        platform: item.type || 'other', // Use type as platform since that's what the DB has
        is_active: true, // Default to true since the DB schema doesn't have this field
        created_at: item.created_at
      }));
      
      setLinks(mappedData);
    } catch (error: any) {
      handleAdminError(error, 'Failed to fetch community links');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = {
        name: formData.name,
        url: formData.url,
        description: formData.description,
        type: formData.platform, // Map platform to type for DB
      };

      if (editingLink) {
        const { error } = await supabase
          .from('community_links')
          .update(submitData)
          .eq('id', editingLink.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Community link updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('community_links')
          .insert([submitData]);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Community link created successfully',
        });
      }
      
      setFormData({
        name: '',
        url: '',
        description: '',
        platform: '',
        is_active: true
      });
      setEditingLink(null);
      setShowForm(false);
      fetchLinks();
    } catch (error: any) {
      handleAdminError(error, editingLink ? 'Failed to update link' : 'Failed to create link');
    }
  };

  const handleEdit = (link: CommunityLink) => {
    setFormData({
      name: link.name,
      url: link.url,
      description: link.description || '',
      platform: link.platform,
      is_active: link.is_active
    });
    setEditingLink(link);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this community link?')) return;
    
    try {
      const { error } = await supabase
        .from('community_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Community link deleted successfully',
      });
      fetchLinks();
    } catch (error: any) {
      handleAdminError(error, 'Failed to delete community link');
    }
  };

  if (loading) {
    return <div className="p-6">Loading community links...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Community Management</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingLink ? 'Edit Community Link' : 'Add New Community Link'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="platform">Platform</Label>
                <select
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({...formData, platform: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Select Platform</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="facebook">Facebook</option>
                  <option value="website">Website</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingLink ? 'Update' : 'Create'} Link
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingLink(null);
                    setFormData({
                      name: '',
                      url: '',
                      description: '',
                      platform: '',
                      is_active: true
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <Card key={link.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{link.name}</h3>
                <Badge variant={link.is_active ? 'default' : 'secondary'}>
                  {link.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              {link.description && (
                <p className="text-gray-600 text-sm mb-2">{link.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge variant="outline">{link.platform}</Badge>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(link)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunityManagement;
