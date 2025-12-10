import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { ImagePlus, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ImageUploadDialog } from './ImageUploadDialog';

interface AdCreationDialogProps {
  open: boolean;
  onClose: () => void;
  messageContent?: string;
  messageId?: string;
  onAdCreated?: () => void;
}

export const AdCreationDialog: React.FC<AdCreationDialogProps> = ({
  open,
  onClose,
  messageContent = '',
  messageId,
  onAdCreated
}) => {
  const { user } = useAuth();
  const [adType, setAdType] = useState<'native' | 'banner' | 'slider'>('native');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [creating, setCreating] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [adCost, setAdCost] = useState(1000);

  const DURATION_OPTIONS = [
    { days: 1, label: '1 Day', multiplier: 0.2 },
    { days: 3, label: '3 Days', multiplier: 0.5 },
    { days: 7, label: '1 Week', multiplier: 1 },
    { days: 14, label: '2 Weeks', multiplier: 1.8 },
    { days: 30, label: '1 Month', multiplier: 3 },
  ];

  useEffect(() => {
    const fetchAdSettings = async () => {
      const { data } = await supabase
        .from('ad_settings')
        .select('*')
        .single();
      
      if (data) {
        const basePrice = 
          adType === 'native' ? Number(data.ad_cost_native) :
          adType === 'banner' ? Number(data.ad_cost_banner) :
          Number(data.ad_cost_slider);
        
        // Apply duration multiplier
        const durationOption = DURATION_OPTIONS.find(d => d.days === durationDays);
        const multiplier = durationOption?.multiplier || 1;
        setAdCost(Math.round(basePrice * multiplier));
      }
    };

    if (open) {
      fetchAdSettings();
      // Extract link from message content if available
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = messageContent.match(urlRegex);
      if (match) {
        setLinkUrl(match[0]);
      }
    }
  }, [open, adType, durationDays, messageContent]);

  const handleCreate = async () => {
    if (!user) {
      toast.error('Please log in to create an ad');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title for your ad');
      return;
    }
    
    if (!linkUrl.trim()) {
      toast.error('Please enter a link URL for your ad');
      return;
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      toast.error('Wallet not found. Please fund your wallet first.');
      return;
    }
    
    if (wallet.balance < adCost) {
      toast.error(`Insufficient balance! You need ₦${adCost.toLocaleString()} but have ₦${wallet.balance.toLocaleString()}. Please fund your wallet.`);
      return;
    }

    setCreating(true);
    try {
      // Calculate expiry date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      // Create ad
      const { data: ad, error: adError } = await supabase
        .from('message_ads')
        .insert({
          message_id: messageId || null,
          user_id: user.id,
          ad_type: adType,
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl || null,
          link_url: linkUrl.trim(),
          cost: adCost,
          duration_days: durationDays,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (adError) throw adError;

      // Deduct from wallet
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: user.id,
          amount: -adCost,
          type: 'debit',
          description: `Ad creation: ${title}`,
          reference: `AD_${ad.id}`
        });

      if (transactionError) throw transactionError;

      toast.success('🎉 Ad created successfully! Your ad is now live and will appear in the message feed.');
      
      // Reset form
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setImageUrl('');
      
      onAdCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Ad creation error:', error);
      toast.error(error?.message || 'Failed to create ad. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Create Advertisement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Ad Type - Compact for mobile */}
            <div>
              <Label className="text-sm font-medium">Ad Type</Label>
              <RadioGroup 
                value={adType} 
                onValueChange={(v: any) => setAdType(v)} 
                className="grid grid-cols-3 gap-2 mt-2"
              >
                <div className="flex items-center">
                  <RadioGroupItem value="native" id="native" className="sr-only peer" />
                  <Label 
                    htmlFor="native" 
                    className="flex-1 cursor-pointer text-center py-2 px-2 text-xs sm:text-sm border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    Native
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="banner" id="banner" className="sr-only peer" />
                  <Label 
                    htmlFor="banner" 
                    className="flex-1 cursor-pointer text-center py-2 px-2 text-xs sm:text-sm border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    Banner
                  </Label>
                </div>
                <div className="flex items-center">
                  <RadioGroupItem value="slider" id="slider" className="sr-only peer" />
                  <Label 
                    htmlFor="slider" 
                    className="flex-1 cursor-pointer text-center py-2 px-2 text-xs sm:text-sm border rounded-lg peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                  >
                    Slider
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Duration Selection - Scrollable on mobile */}
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
                {DURATION_OPTIONS.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    variant={durationDays === option.days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDurationDays(option.days)}
                    className="text-xs whitespace-nowrap flex-shrink-0 h-8 px-2.5"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ad title"
                maxLength={100}
                className="mt-1 h-10"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description (optional)"
                maxLength={500}
                rows={2}
                className="mt-1 resize-none"
              />
            </div>

            <div>
              <Label htmlFor="link" className="text-sm font-medium">Link URL *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                  className="flex-1 h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(linkUrl, '_blank')}
                  disabled={!linkUrl}
                  className="h-10 w-10 flex-shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Image (Optional)</Label>
              <div className="mt-1">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="Ad" className="w-full rounded-lg max-h-32 object-cover" />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-7 text-xs"
                      onClick={() => setImageUrl('')}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => setShowImageUpload(true)}
                  >
                    <ImagePlus className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                )}
              </div>
            </div>

            {/* Compact Preview for mobile */}
            {(title.trim() || linkUrl.trim()) && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Preview
                  <Badge variant="outline" className="text-[10px] font-normal">Live</Badge>
                </Label>
                <div className="border rounded-lg p-3 bg-card">
                  <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30 mb-2">
                    Sponsored
                  </Badge>
                  <div className="flex gap-2">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-1">
                        {title || 'Your ad title'}
                      </h3>
                      {description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {description}
                        </p>
                      )}
                      {linkUrl && (
                        <span className="text-xs text-primary truncate block mt-1">
                          {linkUrl.replace(/^https?:\/\//, '').slice(0, 25)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Summary */}
            <div className="bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="font-semibold text-lg">₦{adCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCreate}
                disabled={creating || !title.trim() || !linkUrl.trim()}
                className="flex-1 h-11"
              >
                {creating ? 'Creating...' : 'Create Ad'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                disabled={creating}
                className="h-11 px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageUploadDialog
        open={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelected={setImageUrl}
        bucket="ad-images"
      />
    </>
  );
};
