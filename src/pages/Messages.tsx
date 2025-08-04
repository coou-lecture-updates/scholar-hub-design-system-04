import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Clock,
  File,
  Mail,
  MessageCircle,
  Plus,
  Send,
  Trash,
  User,
  MessageSquare,
  AlertTriangle,
  Clock4
} from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender_name?: string;
  recipient_name?: string;
  read: boolean;
}

interface AnonymousMessage {
  id: string;
  sender_email: string;
  content: string;
  created_at: string;
  expires_at: string;
}

const Messages = () => {
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [anonymousMessages, setAnonymousMessages] = useState<AnonymousMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewMessageDialog, setOpenNewMessageDialog] = useState(false);
  const [openAnonymousDialog, setOpenAnonymousDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedTab, setSelectedTab] = useState('inbox');
  const { toast } = useToast();

  const [newMessageForm, setNewMessageForm] = useState({
    recipientEmail: '',
    subject: '',
    content: ''
  });

  const [anonymousForm, setAnonymousForm] = useState({
    senderEmail: '',
    content: ''
  });

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch received messages
        const { data: receivedData, error: receivedError } = await supabase
          .from('messages')
          .select(`
            id, subject, content, created_at, sender_id, recipient_id, read,
            sender:sender_id(full_name)
          `)
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });

        if (receivedError) throw receivedError;
        
        // Fetch sent messages
        const { data: sentData, error: sentError } = await supabase
          .from('messages')
          .select(`
            id, subject, content, created_at, sender_id, recipient_id, read,
            recipient:recipient_id(full_name)
          `)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });

        if (sentError) throw sentError;

        // Combine and format messages
        const receivedMessages = (receivedData || []).map((msg: any) => ({
          ...msg,
          sender_name: msg.sender?.full_name || 'Unknown',
        }));
        
        const sentMessages = (sentData || []).map((msg: any) => ({
          ...msg,
          recipient_name: msg.recipient?.full_name || 'Unknown',
        }));
        
        setMessages([...receivedMessages, ...sentMessages]);
        
        // Fetch anonymous messages
        const { data: anonData, error: anonError } = await supabase
          .from('anonymous_messages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (anonError) throw anonError;
        
        setAnonymousMessages(anonData || []);
      } catch (error: any) {
        console.error('Error fetching messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load messages',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      // Find recipient ID from email
      const { data: recipientData, error: recipientError } = await supabase
        .from('users')
        .select('id')
        .eq('email', newMessageForm.recipientEmail)
        .single();

      if (recipientError || !recipientData) {
        toast({
          title: 'Error',
          description: 'Recipient not found',
          variant: 'destructive',
        });
        return;
      }

      // Send message
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            recipient_id: recipientData.id,
            subject: newMessageForm.subject,
            content: newMessageForm.content,
            read: false,
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });

      // Reset form and close dialog
      setNewMessageForm({ recipientEmail: '', subject: '', content: '' });
      setOpenNewMessageDialog(false);
      
      // Refresh messages
      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id, subject, content, created_at, sender_id, recipient_id, read,
          sender:sender_id(full_name),
          recipient:recipient_id(full_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const formattedMessages = data.map((msg: any) => ({
        ...msg,
        sender_name: msg.sender?.full_name || 'Unknown',
        recipient_name: msg.recipient?.full_name || 'Unknown',
      }));
      
      setMessages(formattedMessages);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Send anonymous message
  const handleSendAnonymousMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('anonymous_messages')
        .insert([
          {
            sender_email: anonymousForm.senderEmail,
            content: anonymousForm.content,
            // expires_at is set by default to 24 hours from now
          }
        ]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Anonymous message sent successfully. It will expire after 24 hours.',
      });

      // Reset form and close dialog
      setAnonymousForm({ senderEmail: '', content: '' });
      setOpenAnonymousDialog(false);
      
      // Refresh anonymous messages
      const { data, error: fetchError } = await supabase
        .from('anonymous_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAnonymousMessages(data || []);
    } catch (error: any) {
      console.error('Error sending anonymous message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send anonymous message',
        variant: 'destructive',
      });
    }
  };

  // Delete a message
  const handleDeleteMessage = async (id: string, isAnonymous = false) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const table = isAnonymous ? 'anonymous_messages' : 'messages';
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Message deleted successfully',
        });

        // Update state
        if (isAnonymous) {
          setAnonymousMessages(anonymousMessages.filter(msg => msg.id !== id));
        } else {
          setMessages(messages.filter(msg => msg.id !== id));
          if (selectedMessage?.id === id) {
            setSelectedMessage(null);
          }
        }
      } catch (error: any) {
        console.error('Error deleting message:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete message',
          variant: 'destructive',
        });
      }
    }
  };

  // Mark a message as read
  const handleReadMessage = async (message: Message) => {
    if (message.recipient_id === user?.id && !message.read) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', message.id);

        if (error) throw error;
        
        // Update in local state
        setMessages(messages.map(msg => 
          msg.id === message.id ? { ...msg, read: true } : msg
        ));
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    
    // Set selected message
    setSelectedMessage(message);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  // Calculate time remaining for anonymous messages
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours <= 0 && minutes <= 0) return 'Expiring soon';
    
    return `${hours}h ${minutes}m remaining`;
  };

  // Filter messages by tab
  const filteredMessages = messages.filter(message => {
    if (selectedTab === 'inbox') {
      return message.recipient_id === user?.id;
    } else {
      return message.sender_id === user?.id;
    }
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-gray-500">Manage your personal communications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="bg-blue-600" onClick={() => setOpenNewMessageDialog(true)}>
              <MessageCircle className="mr-2 h-4 w-4" />
              New Message
            </Button>
            <Button variant="outline" onClick={() => setOpenAnonymousDialog(true)}>
              <File className="mr-2 h-4 w-4" />
              Anonymous Message
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Your Messages</CardTitle>
              <Tabs
                value={selectedTab}
                onValueChange={setSelectedTab}
                className="space-y-4 md:space-y-0"
              >
                <TabsList className="grid grid-cols-2 w-full md:w-auto">
                  <TabsTrigger value="inbox" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    Sent
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6">
                {/* Messages List */}
                <div className="md:w-1/3 lg:w-1/4 border rounded-md overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-medium text-sm">
                      {selectedTab === 'inbox' ? 'Inbox Messages' : 'Sent Messages'} ({filteredMessages.length})
                    </h3>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[400px]">
                    {filteredMessages.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        {selectedTab === 'inbox' 
                          ? 'Your inbox is empty'
                          : 'You haven\'t sent any messages'}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredMessages.map(message => (
                          <div
                            key={message.id}
                            onClick={() => handleReadMessage(message)}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                              selectedMessage?.id === message.id
                                ? 'bg-blue-50'
                                : message.recipient_id === user?.id && !message.read
                                ? 'bg-blue-50/30'
                                : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-1">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                {selectedTab === 'inbox'
                                  ? message.sender_name?.charAt(0) || 'U'
                                  : message.recipient_name?.charAt(0) || 'U'}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm truncate">
                                    {selectedTab === 'inbox'
                                      ? message.sender_name || 'Unknown'
                                      : message.recipient_name || 'Unknown'}
                                  </p>
                                  {message.recipient_id === user?.id && !message.read && (
                                    <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm font-medium truncate">{message.subject}</p>
                            <p className="text-xs text-gray-500 truncate">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Message View */}
                <div className="md:flex-1 border rounded-md flex flex-col overflow-hidden">
                  {selectedMessage ? (
                    <>
                      <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{selectedMessage.subject}</h3>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(selectedMessage.created_at)}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                      <div className="flex-grow p-6 overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            {selectedTab === 'inbox'
                              ? selectedMessage.sender_name?.charAt(0) || 'U'
                              : selectedMessage.recipient_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-medium">
                              {selectedTab === 'inbox'
                                ? `From: ${selectedMessage.sender_name || 'Unknown'}`
                                : `To: ${selectedMessage.recipient_name || 'Unknown'}`}
                            </div>
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap">{selectedMessage.content}</div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-6">
                      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-500 mb-2">No message selected</h3>
                      <p className="text-gray-400">
                        {filteredMessages.length > 0
                          ? 'Select a message from the list to view its contents'
                          : selectedTab === 'inbox'
                          ? 'Your inbox is empty'
                          : 'You haven\'t sent any messages yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Anonymous Messages */}
            {anonymousMessages.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-medium">Anonymous Messages</h3>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                    Expire after 24 hours
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {anonymousMessages.map(message => (
                    <div key={message.id} className="border rounded-md p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <span className="text-sm font-medium">{message.sender_email}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteMessage(message.id, true)}
                          className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash size={14} />
                        </Button>
                      </div>
                      <p className="text-sm mb-3">{message.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(message.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock4 size={12} />
                          <span>{getTimeRemaining(message.expires_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Message Dialog */}
      <Dialog open={openNewMessageDialog} onOpenChange={setOpenNewMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendMessage}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="recipientEmail" className="text-sm font-medium">
                  Recipient Email
                </label>
                <Input
                  id="recipientEmail"
                  value={newMessageForm.recipientEmail}
                  onChange={(e) => setNewMessageForm({...newMessageForm, recipientEmail: e.target.value})}
                  placeholder="Enter recipient's email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <Input
                  id="subject"
                  value={newMessageForm.subject}
                  onChange={(e) => setNewMessageForm({...newMessageForm, subject: e.target.value})}
                  placeholder="Enter message subject"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="content"
                  rows={5}
                  value={newMessageForm.content}
                  onChange={(e) => setNewMessageForm({...newMessageForm, content: e.target.value})}
                  placeholder="Write your message here..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenNewMessageDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600">
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Anonymous Message Dialog */}
      <Dialog open={openAnonymousDialog} onOpenChange={setOpenAnonymousDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Anonymous Message</DialogTitle>
          </DialogHeader>
          <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mb-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> Anonymous messages are accessible to anyone with the link and will automatically expire after 24 hours.
            </div>
          </div>
          <form onSubmit={handleSendAnonymousMessage}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="senderEmail" className="text-sm font-medium">
                  Your Email (Optional)
                </label>
                <Input
                  id="senderEmail"
                  type="email"
                  value={anonymousForm.senderEmail}
                  onChange={(e) => setAnonymousForm({...anonymousForm, senderEmail: e.target.value})}
                  placeholder="Enter your email (optional)"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="anonymousContent" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="anonymousContent"
                  rows={5}
                  value={anonymousForm.content}
                  onChange={(e) => setAnonymousForm({...anonymousForm, content: e.target.value})}
                  placeholder="Write your anonymous message here..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenAnonymousDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Send Anonymous Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Messages;
