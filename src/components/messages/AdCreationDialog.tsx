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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Advertisement</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Ad Type</Label>
              <RadioGroup value={adType} onValueChange={(v: any) => setAdType(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="native" id="native" />
                  <Label htmlFor="native" className="cursor-pointer">Native Ad (In-feed)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="banner" id="banner" />
                  <Label htmlFor="banner" className="cursor-pointer">Banner Ad (Top)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slider" id="slider" />
                  <Label htmlFor="slider" className="cursor-pointer">Slider Ad (Side)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Duration Selection */}
            <div>
              <Label>Ad Duration</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {DURATION_OPTIONS.map((option) => (
                  <Button
                    key={option.days}
                    type="button"
                    variant={durationDays === option.days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDurationDays(option.days)}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Longer durations offer better value per day
              </p>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter ad title"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter ad description"
                maxLength={500}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="link">Link URL *</Label>
              <div className="flex gap-2">
                <Input
                  id="link"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(linkUrl, '_blank')}
                  disabled={!linkUrl}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Ad Image (Optional)</Label>
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Ad" className="w-full rounded-lg" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setImageUrl('')}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowImageUpload(true)}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              )}
            </div>

            {/* Live Ad Preview */}
            {(title.trim() || linkUrl.trim()) && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <span>Live Preview</span>
                  <Badge variant="outline" className="text-xs">How your ad will appear</Badge>
                </Label>
                <div className="border-2 border-primary/60 rounded-xl p-4 bg-white">
                  <div className="flex items-start gap-1 mb-2">
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
                      Sponsored
                    </Badge>
                  </div>
                  
                  <div className="flex gap-3">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt="Ad preview"
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground">
                        {title || 'Your ad title'}
                      </h3>
                      {description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {description}
                        </p>
                      )}
                      {linkUrl && (
                        <div className="flex items-center gap-1 mt-2 text-primary">
                          <ExternalLink className="h-3 w-3" />
                          <span className="text-xs truncate">
                            {linkUrl.replace(/^https?:\/\//, '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Cost: <span className="font-semibold text-foreground">₦{adCost.toLocaleString()}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This amount will be deducted from your wallet balance
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={creating || !title.trim() || !linkUrl.trim()}
                className="flex-1"
              >
                {creating ? 'Creating...' : 'Create Ad'}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={creating}>
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
