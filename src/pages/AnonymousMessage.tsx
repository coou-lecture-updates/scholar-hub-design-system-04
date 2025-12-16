import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Copy, Share2, Clock, CheckCircle, QrCode, AlertCircle, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toPng } from "html-to-image";

const AnonymousMessage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pageName, setPageName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageDetails, setPageDetails] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [showCreated, setShowCreated] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const generateRandomToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateQRCode = async (url: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleGeneratePage = async () => {
    if (!name || !email || !pageName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("anonymous_pages")
        .insert({
          email: email,
          page_name: pageName,
          page_token: generateRandomToken(),
        })
        .select()
        .single();

      if (error) throw error;

      const link = `${window.location.origin}/anonymous/${data.public_link}`;
      setGeneratedLink(link);
      setAccessToken(data.page_token);
      setShowCreated(true);
      
      // Generate QR code
      await generateQRCode(link);

      // Track analytics
      await supabase.from("anonymous_page_analytics").insert({
        page_id: data.id,
        event_type: "created"
      });

      toast({
        title: "Success",
        description: "Anonymous message page created successfully!",
      });
    } catch (error) {
      console.error("Error creating page:", error);
      toast({
        title: "Error",
        description: "Failed to create anonymous message page",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const shareLink = async (platform?: string) => {
    if (!generatedLink) return;

    if (navigator.share && !platform) {
      try {
        await navigator.share({
          title: `Anonymous Messages for ${pageName}`,
          text: `Send me anonymous messages!`,
          url: generatedLink,
        });
        
        // Track share analytics
        await supabase.from("anonymous_page_analytics").insert({
          page_id: pageDetails?.id,
          event_type: "share"
        });
        
        return;
      } catch (error) {
        console.log('Native sharing failed, falling back to clipboard');
      }
    }

    // Social media sharing URLs
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=Send me anonymous messages!&url=${encodeURIComponent(generatedLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(generatedLink)}`,
      whatsapp: `https://wa.me/?text=Send me anonymous messages! ${encodeURIComponent(generatedLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(generatedLink)}&text=Send me anonymous messages!`,
    };

    if (platform && shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
      
      // Track specific platform share
      await supabase.from("anonymous_page_analytics").insert({
        page_id: pageDetails?.id,
        event_type: "share"
      });
    } else {
      copyToClipboard(generatedLink, "Link");
    }
  };

  const handleViewMessages = async (retry = false) => {
    if (!accessToken) {
      toast({
        title: "Error",
        description: "Please enter your access token",
        variant: "destructive",
      });
      return;
    }

    setViewLoading(true);
    if (retry) setRetryCount(prev => prev + 1);

    try {
      const { data: pageData, error: pageError } = await supabase
        .from("anonymous_pages")
        .select("*")
        .eq("page_token", accessToken)
        .maybeSingle();

      if (pageError) throw pageError;
      
      if (!pageData) {
        toast({
          title: "Error",
          description: "Invalid access token or page has expired",
          variant: "destructive",
        });
        return;
      }

      // Check if page has expired
      if (new Date(pageData.expires_at) < new Date()) {
        toast({
          title: "Error",
          description: "This anonymous page has expired",
          variant: "destructive",
        });
        return;
      }

      setPageDetails(pageData);

      const { data: messagesData, error: messagesError } = await supabase
        .from("anonymous_submissions")
        .select("*")
        .eq("page_id", pageData.id)
        .order("created_at", { ascending: false });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);

      toast({
        title: "Success",
        description: `Loaded ${messagesData?.length || 0} messages successfully!`,
      });
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please check your access token.",
        variant: "destructive",
      });
    } finally {
      setViewLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShareMessageCard = async (messageId: string) => {
    const node = messageRefs.current[messageId];
    if (!node) return;

    try {
      const dataUrl = await toPng(node, { quality: 1, cacheBust: true });
      const fileName = `anonymous-message-${messageId}.png`;

      // Try Web Share with files (if supported)
      if (navigator.canShare && navigator.canShare()) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Anonymous message",
            text: "Shared from my anonymous inbox on CoouConnect Online",
          });
          return;
        }
      }

      // Fallback: trigger download
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      console.error("Error sharing message card:", error);
      toast({
        title: "Share failed",
        description: "Unable to capture message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Anonymous Messages</h1>
            <p className="text-xl text-gray-600">
              Create your anonymous message box or view received messages
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Message Box</TabsTrigger>
              <TabsTrigger value="view">View My Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create Your Anonymous Message Box</CardTitle>
                  <CardDescription>
                    Generate a unique link where others can send you anonymous messages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showCreated ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pageName">Page Name</Label>
                        <Input
                          id="pageName"
                          placeholder="e.g., My Anonymous Messages"
                          value={pageName}
                          onChange={(e) => setPageName(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleGeneratePage} 
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? "Creating..." : "Create Anonymous Page"}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <Alert className="border-success bg-success/10">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-success-foreground">
                          Your anonymous message page has been created successfully! Share the link below to start receiving messages.
                        </AlertDescription>
                      </Alert>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Anonymous Link</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input 
                                value={generatedLink} 
                                readOnly 
                                className="bg-muted"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(generatedLink, "Link")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Access Token (Keep Safe!)</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input 
                                value={accessToken} 
                                readOnly 
                                className="bg-muted"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(accessToken, "Access Token")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Use this token to view your messages
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareLink('whatsapp')}
                              className="flex-1"
                            >
                              WhatsApp
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareLink('twitter')}
                              className="flex-1"
                            >
                              Twitter
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareLink('facebook')}
                              className="flex-1"
                            >
                              Facebook
                            </Button>
                          </div>
                        </div>

                        {qrCodeUrl && (
                          <div className="flex flex-col items-center space-y-2">
                            <Label className="text-sm font-medium">QR Code</Label>
                            <div className="bg-white p-4 rounded-lg border">
                              <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              Scan to access your anonymous page
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setName("");
                            setEmail("");
                            setPageName("");
                            setGeneratedLink("");
                            setAccessToken("");
                            setShowCreated(false);
                            setQrCodeUrl("");
                          }}
                          className="flex-1"
                        >
                          Create Another
                        </Button>
                        <Button
                          onClick={() => setActiveTab("view")}
                          className="flex-1"
                        >
                          View Messages
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="view">
              <Card>
                <CardHeader>
                  <CardTitle>View My Messages</CardTitle>
                  <CardDescription>
                    Enter your access token to view messages sent to your anonymous page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessToken">Access Token</Label>
                    <Input
                      id="accessToken"
                      placeholder="Enter your access token"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleViewMessages(false)} 
                      disabled={viewLoading}
                      className="flex-1"
                    >
                      {viewLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load Messages"
                      )}
                    </Button>
                    {pageDetails && (
                      <Button 
                        variant="outline"
                        onClick={() => handleViewMessages(true)} 
                        disabled={viewLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {pageDetails && (
                    <div className="space-y-4">
                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          <strong>{pageDetails.page_name}</strong> • Created {formatDate(pageDetails.created_at)}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            Expires: {formatDate(pageDetails.expires_at)}
                          </span>
                        </AlertDescription>
                      </Alert>

                      <div className="p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-medium">Your Anonymous Link</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input 
                            value={`${window.location.origin}/anonymous/${pageDetails.public_link}`} 
                            readOnly 
                            className="bg-background"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(`${window.location.origin}/anonymous/${pageDetails.public_link}`, "Link")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => shareLink()}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Messages ({messages.length})</h3>
                        {retryCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Refreshed {retryCount} time{retryCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            ref={(el) => {
                              messageRefs.current[message.id] = el;
                            }}
                            className="p-4 bg-card border rounded-lg relative"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-primary">Anonymous</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(message.created_at)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleShareMessageCard(message.id)}
                                  title="Share as image"
                                >
                                  <Share2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-foreground whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {pageDetails && messages.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No messages yet. Share your link to start receiving anonymous messages!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-12 pt-8 border-t">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">How It Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-primary/10 text-primary">1</Badge>
                    <div>
                      <h4 className="font-medium">Create Your Page</h4>
                      <p className="text-sm text-muted-foreground">Enter your details and generate a unique anonymous message link</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-primary/10 text-primary">2</Badge>
                    <div>
                      <h4 className="font-medium">Share With Others</h4>
                      <p className="text-sm text-muted-foreground">Share your link on social media or with friends</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-primary/10 text-primary">3</Badge>
                    <div>
                      <h4 className="font-medium">Receive Messages</h4>
                      <p className="text-sm text-muted-foreground">Get anonymous feedback and messages from others</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Safety Tips</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Keep your access token private and secure</p>
                  <p>• Anonymous pages expire after 48 hours</p>
                  <p>• Report any inappropriate messages</p>
                  <p>• Your identity remains completely private</p>
                  <p>• No personal information is collected from senders</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnonymousMessage;