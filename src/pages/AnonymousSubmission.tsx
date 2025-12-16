import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import { Send, Share2, Copy, Clock, MessageSquare, Shield, Heart, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type ErrorType = 'not_found' | 'expired' | 'network' | 'unknown' | null;

const AnonymousSubmission = () => {
  const { linkId } = useParams();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageDetails, setPageDetails] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<ErrorType>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchPageDetails = async () => {
      if (!linkId) {
        setError('not_found');
        setPageLoading(false);
        return;
      }

      console.log(`🔍 Fetching page for link: ${linkId}`);
      setError(null);

      try {
        // First, check if the page exists at all (regardless of expiry)
        const { data: pageData, error: pageError } = await supabase
          .from("anonymous_pages")
          .select("*")
          .eq("public_link", linkId)
          .maybeSingle();

        console.log(`📊 Query result:`, { data: pageData, error: pageError });

        if (pageError) {
          console.error("❌ Database error:", pageError);
          throw new Error(`Database error: ${pageError.message}`);
        }

        if (!pageData) {
          console.log("❌ Page not found");
          setError('not_found');
          return;
        }

        // Check if expired using consistent timezone handling
        const now = new Date();
        const expiresAt = new Date(pageData.expires_at);
        const isExpired = expiresAt <= now;
        
        console.log(`⏰ Time check:`, {
          now: now.toISOString(),
          expires: pageData.expires_at,
          expiresAt: expiresAt.toISOString(),
          isExpired,
          timeLeft: Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        });

        if (isExpired) {
          console.log("⏰ Page has expired");
          setError('expired');
          return;
        }

        console.log("✅ Page found and valid");
        setPageDetails(pageData);

        // Track page view analytics
        try {
          await supabase.from("anonymous_page_analytics").insert({
            page_id: pageData.id,
            event_type: "view"
          });
          console.log("📈 Analytics tracked");
        } catch (analyticsError) {
          console.warn("⚠️ Analytics tracking failed:", analyticsError);
        }

      } catch (error) {
        console.error("❌ Error fetching page:", error);
        setError('network');
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageDetails();
  }, [linkId, retryCount]);

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
          // Ensure visibility under RLS: expired_at > now()
          expires_at: pageDetails.expires_at || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading anonymous page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setPageLoading(true);
    setError(null);
  };

  const getErrorContent = () => {
    switch (error) {
      case 'expired':
        return {
          icon: <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />,
          title: "Page Expired",
          description: "This anonymous message page has expired. Pages are only active for 48 hours after creation.",
          showRetry: false
        };
      case 'not_found':
        return {
          icon: <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />,
          title: "Page Not Found", 
          description: `The link "${linkId}" doesn't exist. Please check if you copied the link correctly.`,
          showRetry: false
        };
      case 'network':
        return {
          icon: <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />,
          title: "Connection Error",
          description: "Unable to load the page. Please check your internet connection and try again.",
          showRetry: true
        };
      default:
        return {
          icon: <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />,
          title: "Something went wrong",
          description: "An unexpected error occurred while loading the page.",
          showRetry: true
        };
    }
  };

  if (error) {
    const errorContent = getErrorContent();
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              {errorContent.icon}
              <h2 className="text-xl font-semibold mb-2">{errorContent.title}</h2>
              <p className="text-muted-foreground mb-4">
                {errorContent.description}
              </p>
              <div className="flex flex-col gap-3">
                {errorContent.showRetry && (
                  <Button onClick={handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/anonymous-message'}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Create Your Own Page
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-muted rounded text-xs text-left">
                  <strong>Debug Info:</strong><br />
                  Link: {linkId}<br />
                  Error: {error}<br />
                  Retry count: {retryCount}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-3 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-secondary mb-4">
                <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {pageDetails.page_name}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground">
                Send an anonymous message safely and securely
              </p>
            </div>

            {/* Time and Share Section */}
            <Card className="border-2 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time Remaining</p>
                      <p className="font-semibold text-lg">{formatTimeLeft()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('whatsapp')}
                      className="gap-2"
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="gap-2"
                    >
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare()}
                      className="gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Input Section */}
            <Card className="border-2 shadow-xl">
              <CardContent className="p-6 md:p-8">
                {!submitted ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Your Anonymous Message
                      </label>
                      <Textarea
                        placeholder="Type your message here... Remember to be kind and respectful."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="min-h-[180px] text-base resize-none"
                        maxLength={1000}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {message.length}/1000 characters
                      </span>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitting || !message.trim()}
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Anonymous Message
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Message sent successfully!</h3>
                      <p className="text-muted-foreground">
                        Your anonymous message has been delivered.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setSubmitted(false);
                        setMessage("");
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy & Safety Section */}
            <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Privacy & Safety</h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <Heart className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <p>Your identity is completely anonymous and protected</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <p>No personal information is collected or stored</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <p>Messages are only visible to the page owner</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                        <p>Please be respectful and kind in your messages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnonymousSubmission;