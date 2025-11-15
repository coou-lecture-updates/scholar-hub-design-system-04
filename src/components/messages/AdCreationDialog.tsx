import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  const [creating, setCreating] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [adCost, setAdCost] = useState(1000);

  useEffect(() => {
    const fetchAdSettings = async () => {
      const { data } = await supabase
        .from('ad_settings')
        .select('*')
        .single();
      
      if (data) {
        setAdCost(
          adType === 'native' ? Number(data.ad_cost_native) :
          adType === 'banner' ? Number(data.ad_cost_banner) :
          Number(data.ad_cost_slider)
        );
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
  }, [open, adType, messageContent]);

  const handleCreate = async () => {
    if (!user || !title.trim() || !linkUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < adCost) {
      toast.error(`Insufficient balance. You need ₦${adCost.toLocaleString()}`);
      return;
    }

    setCreating(true);
    try {
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
          cost: adCost
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

      toast.success('Ad created successfully!');
      onAdCreated?.();
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setLinkUrl('');
      setImageUrl('');
    } catch (error) {
      console.error('Ad creation error:', error);
      toast.error('Failed to create ad');
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
