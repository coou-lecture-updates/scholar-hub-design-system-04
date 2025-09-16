
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Send, Lock, User, Mail, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AnonymousMessage = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');
  const [pageInfo, setPageInfo] = useState({
    name: '',
    email: '',
    pageName: 'My Anonymous Messages'
  });
  const [message, setMessage] = useState('');
  const [pageToken, setPageToken] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewToken, setViewToken] = useState('');
  const [messages, setMessages] = useState([]);
  const [pageDetails, setPageDetails] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  
  const { toast } = useToast();
  
  const generateRandomToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const [publicLink, setPublicLink] = useState('');
  
  const handleGeneratePage = async () => {
    if (!pageInfo.name || !pageInfo.email || !pageInfo.pageName) {
      toast({
        title: "Missing information",
        description: "Please provide your name, email, and a page name.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const newToken = generateRandomToken();
      
      // Create the anonymous page in the database
      const { data, error } = await supabase
        .from('anonymous_pages')
        .insert({
          page_name: pageInfo.pageName,
          page_token: newToken,
          email: pageInfo.email
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setPageToken(newToken);
      setPublicLink(data.public_link);
      setGeneratedLink(`${window.location.origin}/anonymous/${data.public_link}`);
      
      toast({
        title: "Success",
        description: "Your anonymous message page has been created!",
      });
    } catch (error) {
      console.error('Error creating anonymous page:', error);
      toast({
        title: "Error",
        description: "Failed to create anonymous page. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Link has been copied to your clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const handleViewMessages = async () => {
    if (!viewToken) {
      toast({
        title: "Missing token",
        description: "Please enter your anonymous page token.",
        variant: "destructive"
      });
      return;
    }
    
    setLoadingMessages(true);
    
    try {
      // Get page details
      const { data: pageData, error: pageError } = await supabase
        .from('anonymous_pages')
        .select('*')
        .eq('page_token', viewToken)
        .single();
      
      if (pageError) throw pageError;
      
      setPageDetails(pageData);
      
      // Get messages for this page
      const { data: messagesData, error: messagesError } = await supabase
        .from('anonymous_submissions')
        .select('*')
        .eq('page_id', pageData.id)
        .order('created_at', { ascending: false });
      
      if (messagesError) throw messagesError;
      
      setMessages(messagesData || []);
      
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Invalid token or no messages found.",
        variant: "destructive"
      });
      setPageDetails(null);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-blue-700" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Anonymous Messages</h1>
              <p className="text-gray-600 mt-2">
                Create an anonymous message box or view messages you've received
              </p>
            </div>
            
            <div className="flex border-b mb-6">
              <button
                className={`pb-2 px-4 ${activeTab === 'create' ? 'text-blue-700 border-b-2 border-blue-700 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('create')}
              >
                Create Message Box
              </button>
              <button
                className={`pb-2 px-4 ${activeTab === 'view' ? 'text-blue-700 border-b-2 border-blue-700 font-medium' : 'text-gray-500'}`}
                onClick={() => setActiveTab('view')}
              >
                View My Messages
              </button>
            </div>
            
            {activeTab === 'create' && (
              <div>
                {!generatedLink ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          className="pl-10"
                          value={pageInfo.name}
                          onChange={(e) => setPageInfo({ ...pageInfo, name: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={pageInfo.email}
                          onChange={(e) => setPageInfo({ ...pageInfo, email: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You'll need this to view messages later</p>
                    </div>
                    
                    <div>
                      <label htmlFor="pageName" className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                      <Input
                        id="pageName"
                        placeholder="E.g. My Anonymous Feedback"
                        value={pageInfo.pageName}
                        onChange={(e) => setPageInfo({ ...pageInfo, pageName: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      className="w-full bg-blue-700 hover:bg-blue-800"
                      onClick={handleGeneratePage}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Create Anonymous Message Box
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-100 rounded-md text-center">
                      <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-green-800">Your anonymous page has been created!</h3>
                      <p className="text-sm text-green-700 mt-1">Share this link to receive anonymous messages</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Anonymous Link</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={generatedLink}
                          readOnly
                          className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm bg-gray-50"
                        />
                        <Button
                          className="rounded-l-none bg-blue-700 hover:bg-blue-800"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Your Access Token (Save this!)</label>
                       <div className="flex">
                         <input
                           type="text"
                           value={pageToken}
                           readOnly
                           className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm bg-gray-50 font-mono"
                         />
                         <Button
                           className="rounded-l-none bg-gray-600 hover:bg-gray-700"
                           onClick={() => {
                             navigator.clipboard.writeText(pageToken);
                             toast({
                               title: "Copied to clipboard",
                               description: "Access token copied to clipboard",
                             });
                           }}
                         >
                           <Copy className="h-4 w-4" />
                         </Button>
                       </div>
                       <p className="text-xs text-gray-500 mt-1">You'll need this token to view messages later. Keep it safe!</p>
                     </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" onClick={() => setGeneratedLink('')}>
                        Create Another
                      </Button>
                      <Button 
                        className="bg-blue-700 hover:bg-blue-800"
                        onClick={() => {
                          setActiveTab('view');
                          setViewToken(pageToken);
                          handleViewMessages();
                        }}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Go To Messages
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="mt-10 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-blue-700 font-bold">1</span>
                      </div>
                      <h4 className="text-base font-medium mb-2">Create a Link</h4>
                      <p className="text-sm text-gray-600">Enter your details and get a unique anonymous message link</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-blue-700 font-bold">2</span>
                      </div>
                      <h4 className="text-base font-medium mb-2">Share With Others</h4>
                      <p className="text-sm text-gray-600">Share your link on social media, with friends, or in your bio</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <span className="text-blue-700 font-bold">3</span>
                      </div>
                      <h4 className="text-base font-medium mb-2">Receive Messages</h4>
                      <p className="text-sm text-gray-600">Get anonymous feedback, questions, or thoughts from others</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'view' && (
              <div>
                {!pageDetails ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">Your Access Token</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="token"
                          placeholder="Enter your access token"
                          className="pl-10"
                          value={viewToken}
                          onChange={(e) => setViewToken(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">This is the token you received when creating your anonymous page</p>
                    </div>
                    
                    <Button 
                      className="w-full bg-blue-700 hover:bg-blue-800"
                      onClick={handleViewMessages}
                      disabled={loadingMessages}
                    >
                      {loadingMessages ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : 'View Messages'}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{pageDetails.page_name}</h2>
                        <Button variant="outline" size="sm" onClick={() => {
                          setPageDetails(null);
                          setMessages([]);
                        }}>
                          View Another
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Created on {formatDate(pageDetails.created_at)}</p>
                    </div>
                    
                     <div className="mb-6">
                       <label className="block text-sm font-medium text-gray-700 mb-1">Your Anonymous Link</label>
                       <div className="flex">
                         <input
                           type="text"
                           value={`${window.location.origin}/anonymous/${pageDetails.public_link}`}
                           readOnly
                           className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm bg-gray-50"
                         />
                         <Button
                           className="rounded-l-none bg-blue-700 hover:bg-blue-800"
                           onClick={() => {
                             navigator.clipboard.writeText(`${window.location.origin}/anonymous/${pageDetails.public_link}`);
                             toast({
                               title: "Copied to clipboard",
                               description: "Link has been copied to your clipboard",
                             });
                           }}
                         >
                           <Copy className="h-4 w-4" />
                         </Button>
                       </div>
                       <p className="text-xs text-gray-500 mt-1">Share this link to receive more anonymous messages. Expires in 48 hours.</p>
                     </div>
                    
                    <h3 className="text-lg font-medium mb-4">Your Messages ({messages.length})</h3>
                    
                    {messages.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-700 mb-2">No messages yet</h4>
                        <p className="text-gray-600 max-w-md mx-auto">Share your anonymous link with others to start receiving messages.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center">
                                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                                  <User className="h-4 w-4 text-blue-700" />
                                </div>
                                <span className="text-sm font-medium">Anonymous</span>
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
                            {msg.media_url && (
                              <div className="mt-3">
                                <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-700 hover:underline text-sm">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Attached File
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Safety Tips</h3>
                  <ul className="list-disc ml-5 space-y-2 text-sm text-gray-600">
                    <li>Never share personal or sensitive information in anonymous messages</li>
                    <li>Report any inappropriate or harmful messages</li>
                    <li>Remember to save your access token somewhere secure</li>
                    <li>Block any users who send offensive content by clicking the block option</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnonymousMessage;
