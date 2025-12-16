import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoUploadProps {
  open: boolean;
  onClose: () => void;
  onVideoUploaded: (videoUrl: string, thumbnailUrl?: string) => void;
}

export const VideoUpload = ({ open, onClose, onVideoUploaded }: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        
        // Check duration (30 seconds max)
        if (video.duration > 30) {
          toast({
            title: "Video too long",
            description: "Please select a video under 30 seconds",
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        // Check size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: "Please select a video under 50MB",
            variant: "destructive",
          });
          resolve(false);
          return;
        }

        resolve(true);
      };

      video.onerror = () => {
        toast({
          title: "Invalid video",
          description: "Please select a valid video file",
          variant: "destructive",
        });
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate format
    const validFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!validFormats.includes(file.type)) {
      toast({
        title: "Invalid format",
        description: "Please select MP4, WebM, or MOV format",
        variant: "destructive",
      });
      return;
    }

    // Validate duration and size
    const isValid = await validateVideo(file);
    if (!isValid) return;

    setSelectedFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setProgress(0);

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload video
      const { data, error } = await supabase.storage
        .from('message-videos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('message-videos')
        .getPublicUrl(fileName);

      setProgress(100);
      onVideoUploaded(publicUrl);

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      // Reset and close
      handleReset();
      onClose();
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedFile(null);
    setProgress(0);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload a video (max 30 seconds, 50MB)
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!videoPreview ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Upload a video (max 30 seconds, 50MB)
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Select Video
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={videoPreview}
                controls
                className="w-full h-full"
              />
              {!uploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {progress}%
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? "Uploading..." : "Upload Video"}
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
