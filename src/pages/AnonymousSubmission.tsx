import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AnonymousSubmission = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [pageDetails, setPageDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      loadPageDetails();
    }
  }, [token]);

  const loadPageDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('anonymous_pages')
        .select('*')
        .eq('page_token', token)
        .single();

      if (error) throw error;
      setPageDetails(data);
    } catch (error) {
      console.error('Error loading page:', error);
      toast({
        title: "Page not found",
        description: "This anonymous message page doesn't exist or has expired.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('anonymous_submissions')
        .insert({
          page_id: pageDetails.id,
          content: message.trim(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Message sent!",
        description: "Your anonymous message has been sent successfully.",
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading page...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!pageDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              This anonymous message page doesn't exist or may have expired.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="text-center">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-blue-700" />
              </div>
              <CardTitle className="text-2xl">{pageDetails.page_name}</CardTitle>
              <CardDescription>
                Send an anonymous message. Your identity will remain completely private.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Write your anonymous message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your message is completely anonymous and cannot be traced back to you.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Anonymous Message
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <h4 className="font-medium text-gray-700">Privacy Guarantee</h4>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your message is completely anonymous</li>
                  <li>• No personal information is collected or stored</li>
                  <li>• Messages cannot be traced back to you</li>
                  <li>• Your IP address is not logged</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnonymousSubmission;