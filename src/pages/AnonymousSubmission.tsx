import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, Share2, Copy, Clock, MessageSquare, Shield, Heart, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const AnonymousSubmission = () => {
  const { link } = useParams();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageDetails, setPageDetails] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchPageDetails = async () => {
      if (!link) return;

      try {
        const { data, error } = await supabase
          .from("anonymous_pages")
          .select("*")
          .eq("public_link", link)
          .gt("expires_at", new Date().toISOString())
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          console.error("Page not found or expired");
          return;
        }

        setPageDetails(data);

        // Track page view analytics
        await supabase.from("anonymous_page_analytics").insert({
          page_id: data.id,
          event_type: "view"
        });

      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageDetails();
  }, [link]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    if (!pageDetails) {
      toast({
        title: "Error",
        description: "Page details not available",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("anonymous_submissions")
        .insert({
          page_id: pageDetails.id,
          content: message,
        });

      if (error) throw error;

      // Track analytics
      await supabase.from("anonymous_page_analytics").insert({
        page_id: pageDetails.id,
        event_type: "message_sent"
      });

      setSubmitted(true);
      setMessage("");
      toast({
        title: "Success",
        description: "Your anonymous message has been sent!",
      });
    } catch (error) {
      console.error("Error submitting message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeLeft = () => {
    if (!pageDetails?.expires_at) return "";

    const expiresAt = new Date(pageDetails.expires_at);
    const now = new Date();
    const timeLeft = expiresAt.getTime() - now.getTime();

    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleShare = async (platform?: string) => {
    const currentUrl = window.location.href;
    const shareText = `Send me an anonymous message!`;

    // Social media sharing URLs
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
    };

    if (platform && shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
      
      // Track share analytics
      await supabase.from("anonymous_page_analytics").insert({
        page_id: pageDetails?.id,
        event_type: "share"
      });
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: pageDetails?.page_name || 'Anonymous Messages',
          text: shareText,
          url: currentUrl,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(currentUrl);
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        });
      }
    } else {
      // Copy to clipboard
      navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading anonymous page...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!pageDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This anonymous message page doesn't exist or has expired.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/anonymous-message'}>
                Create Your Own Page
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            <Card className="border-2 border-purple-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{pageDetails.page_name}</CardTitle>
                    <CardDescription className="text-purple-100">
                      Send an anonymous message
                    </CardDescription>
                  </div>
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatTimeLeft()} left
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('whatsapp')}
                      className="text-purple-100 hover:text-white hover:bg-purple-700"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="text-purple-100 hover:text-white hover:bg-purple-700"
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare()}
                      className="text-purple-100 hover:text-white hover:bg-purple-700"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {!submitted ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Type your anonymous message here... Be kind and respectful."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[120px] border-2 border-purple-200 focus:border-purple-400"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {message.length}/1000 characters
                      </span>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || !message.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Alert className="border-success bg-success/10">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="space-y-3">
                      <div>
                        <strong>Message sent successfully!</strong>
                        <br />
                        Your anonymous message has been delivered.
                      </div>
                      <Button
                        onClick={() => {
                          setSubmitted(false);
                          setMessage("");
                        }}
                        variant="outline"
                        size="sm"
                        className="border-success text-success hover:bg-success/10"
                      >
                        Send Another Message
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Privacy & Safety</h3>
                    <div className="space-y-1 text-sm text-blue-800">
                      <p>• Your identity is completely anonymous</p>
                      <p>• No personal information is collected</p>
                      <p>• Messages are only visible to the page owner</p>
                      <p>• Be respectful and kind in your messages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnonymousSubmission;