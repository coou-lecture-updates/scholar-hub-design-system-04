import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageSquare, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const AnonymousSubmission = () => {
  const { link } = useParams();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageDetails, setPageDetails] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPageDetails = async () => {
      if (!link) return;
      
      try {
        const { data, error } = await supabase
          .from('anonymous_pages')
          .select('*')
          .eq('public_link', link)
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          toast({
            title: "Page not found",
            description: "This anonymous message page doesn't exist or has expired.",
            variant: "destructive"
          });
          return;
        }

        setPageDetails(data);
      } catch (error) {
        console.error('Error fetching page:', error);
        toast({
          title: "Error",
          description: "Failed to load the page. Please try again.",
          variant: "destructive"
        });
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageDetails();
  }, [link, toast]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Empty message",
        description: "Please enter a message before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!pageDetails) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('anonymous_submissions')
        .insert({
          page_id: pageDetails.id,
          content: message.trim(),
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      setSubmitted(true);
      setMessage('');
      
      toast({
        title: "Message sent!",
        description: "Your anonymous message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error submitting message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = () => {
    if (!pageDetails?.expires_at) return '';
    
    const expiresAt = new Date(pageDetails.expires_at);
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Expired';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-700" />
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
          <div className="text-center max-w-md mx-auto px-4">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">
              This anonymous message page doesn't exist or has expired.
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
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                <MessageSquare className="h-8 w-8 text-blue-700" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{pageDetails.page_name}</h1>
              <p className="text-gray-600 mt-2">
                Send an anonymous message
              </p>
              <div className="flex items-center justify-center mt-3 text-sm text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTimeLeft()}
              </div>
            </div>

            {!submitted ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Type your anonymous message here..."
                    className="min-h-[120px] resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={1000}
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      Your message will be completely anonymous
                    </p>
                    <p className="text-xs text-gray-400">
                      {message.length}/1000
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800"
                  onClick={handleSubmit}
                  disabled={loading || !message.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Anonymous Message
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                  <Send className="h-8 w-8 text-green-700" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h3>
                <p className="text-green-700 mb-6">
                  Your anonymous message has been delivered successfully.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="mr-3"
                >
                  Send Another
                </Button>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Notice</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Your identity is completely anonymous</li>
                  <li>• No personal information is collected or stored</li>
                  <li>• Messages are only visible to the page owner</li>
                  <li>• This page expires in {formatTimeLeft()}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnonymousSubmission;