
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { handleAdminError, handleAdminSuccess } from "@/utils/adminErrorHandler";
import { AlertCircle, Bell, Calendar, Info } from "lucide-react";
import type { AdminNotification } from "@/types/admin";

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { hasAccess, loading: accessLoading } = useAdminAccess('moderator');
  
  const defaultNotification: AdminNotification = {
    id: "",
    title: "",
    message: "",
    type: "info",
    is_active: true,
    target_audience: ["all"],
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const [currentNotification, setCurrentNotification] = useState<AdminNotification>(defaultNotification);
  
  useEffect(() => {
    if (!accessLoading && hasAccess) {
      fetchNotifications();
    }
  }, [hasAccess, accessLoading]);
  
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const typedNotifications: AdminNotification[] = data.map(notification => ({
          ...notification,
          type: ['info', 'warning', 'success', 'error'].includes(notification.type) 
            ? notification.type as 'info' | 'warning' | 'success' | 'error'
            : 'info'
        }));
        
        setNotifications(typedNotifications);
      }
    } catch (error) {
      handleAdminError(error, 'Fetch Notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreate = () => {
    setCurrentNotification(defaultNotification);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (notification: AdminNotification) => {
    setCurrentNotification(notification);
    setIsDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentNotification({ ...currentNotification, [name]: value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setCurrentNotification({ ...currentNotification, [name]: value });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setCurrentNotification({ ...currentNotification, [name]: checked });
  };
  
  const handleSave = async () => {
    try {
      if (!currentNotification.title.trim()) {
        toast({
          title: "Error",
          description: "Notification title is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!currentNotification.message.trim()) {
        toast({
          title: "Error",
          description: "Notification message is required",
          variant: "destructive",
        });
        return;
      }
      
      setIsLoading(true);
      
      if (currentNotification.id) {
        const { error } = await supabase
          .from('notifications')
          .update({
            title: currentNotification.title,
            message: currentNotification.message,
            type: currentNotification.type,
            is_active: currentNotification.is_active,
            start_date: currentNotification.start_date,
            end_date: currentNotification.end_date,
            link: currentNotification.link,
            target_audience: currentNotification.target_audience,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentNotification.id);
        
        if (error) throw error;
        handleAdminSuccess("Notification updated successfully", "Update Notification");
      } else {
        const { error } = await supabase
          .from('notifications')
          .insert([{
            title: currentNotification.title,
            message: currentNotification.message,
            type: currentNotification.type,
            is_active: currentNotification.is_active,
            start_date: currentNotification.start_date,
            end_date: currentNotification.end_date,
            link: currentNotification.link,
            target_audience: currentNotification.target_audience,
          }]);
        
        if (error) throw error;
        handleAdminSuccess("Notification created successfully", "Create Notification");
      }
      
      await fetchNotifications();
      setIsDialogOpen(false);
    } catch (error) {
      handleAdminError(error, 'Save Notification');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleActive = async (notification: AdminNotification) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_active: !notification.is_active })
        .eq('id', notification.id);
      
      if (error) throw error;
      
      handleAdminSuccess(
        `Notification ${notification.is_active ? 'deactivated' : 'activated'} successfully`,
        'Toggle Notification'
      );
      
      await fetchNotifications();
    } catch (error) {
      handleAdminError(error, 'Toggle Notification Status');
    }
  };
  
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return notification.is_active;
    if (activeTab === "inactive") return !notification.is_active;
    return notification.type === activeTab;
  });
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <Info className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleDeleteNotification = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      handleAdminSuccess("Notification deleted successfully", "Delete Notification");
      await fetchNotifications();
    } catch (error) {
      handleAdminError(error, 'Delete Notification');
    } finally {
      setIsLoading(false);
    }
  };

  if (accessLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-800 mb-1">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage notifications.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Notification Management</h2>
          <p className="text-gray-600">Create and manage system-wide notifications</p>
        </div>
        
        <Button onClick={handleCreate} className="mt-4 md:mt-0">
          Create New Notification
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 w-full overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="warning">Warning</TabsTrigger>
          <TabsTrigger value="success">Success</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              {activeTab === "all" ? "All notifications" : 
               activeTab === "active" ? "Currently active notifications" :
               activeTab === "inactive" ? "Inactive notifications" :
               `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} notifications`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && notifications.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No Notifications Found</h3>
                <p className="text-gray-600">
                  {activeTab === "all" 
                    ? "You haven't created any notifications yet." 
                    : `No ${activeTab} notifications found.`}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCreate}
                >
                  Create your first notification
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[50vh]">
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div key={notification.id} className="flex flex-col p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {getNotificationIcon(notification.type)}
                          <div className="ml-3">
                            <h4 className="text-base font-medium">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="mr-4 flex items-center">
                            <Switch
                              checked={notification.is_active}
                              onCheckedChange={() => toggleActive(notification)}
                              aria-label="Toggle active state"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {notification.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(notification)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Start: {formatDate(notification.start_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>End: {formatDate(notification.end_date)}</span>
                        </div>
                        {notification.link && (
                          <div>
                            <span>Link: </span>
                            <a 
                              href={notification.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-600 hover:underline"
                            >
                              {notification.link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <ScrollArea className="max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                {currentNotification.id ? "Edit Notification" : "Create New Notification"}
              </DialogTitle>
              <DialogDescription>
                {currentNotification.id 
                  ? "Update the notification details below" 
                  : "Fill in the details to create a new notification"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={currentNotification.title}
                  onChange={handleInputChange}
                  placeholder="Notification Title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={currentNotification.message}
                  onChange={handleInputChange}
                  placeholder="Notification message content"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={currentNotification.type}
                    onValueChange={(value: 'info' | 'warning' | 'success' | 'error') => {
                      handleSelectChange('type', value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select notification type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Information</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <div className="flex items-center pt-2">
                    <Switch
                      checked={currentNotification.is_active}
                      onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                      aria-label="Toggle active state"
                    />
                    <span className="ml-2">
                      {currentNotification.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  name="link"
                  value={currentNotification.link || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/more-info"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="datetime-local"
                    value={currentNotification.start_date ? new Date(currentNotification.start_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentNotification({
                      ...currentNotification, 
                      start_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                    })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="datetime-local"
                    value={currentNotification.end_date ? new Date(currentNotification.end_date).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentNotification({
                      ...currentNotification, 
                      end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                    })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManagement;
