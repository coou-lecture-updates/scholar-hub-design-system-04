import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, Image, Smile, Hash, ChevronDown, ChevronUp, X, TrendingUp, Video } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ImageUploadDialog } from './ImageUploadDialog';
import { AdCreationDialog } from './AdCreationDialog';
import { VideoUpload } from './VideoUpload';

interface MessageInputProps {
  onSend: (content: string, isAnonymous: boolean, topic?: string, parentId?: string, imageUrl?: string, videoUrl?: string) => void;
  parentId?: string;
  placeholder?: string;
}

const TOPICS = ['General', 'Academics', 'Events', 'Campus Life', 'Tech Support'];

const EMOJI_CATEGORIES = {
  smileys: ['😊', '😂', '🤣', '😍', '🥰', '😘', '😎', '🤗', '🤔', '😳', '😢', '😭'],
  gestures: ['👍', '👎', '👏', '🙌', '👋', '🤝', '✌️', '🤞', '👌', '💪', '🙏', '✋'],
  hearts: ['❤️', '💕', '💖', '💗', '💓', '💞', '💘', '💝', '💟', '♥️', '💙', '💚'],
  celebration: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎯', '⭐', '✨', '🌟', '💫', '🔥']
};

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  parentId,
  placeholder = 'Type your message...' 
}) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [topic, setTopic] = useState<string>('');
  const [showTopic, setShowTopic] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect links in content
  const hasLink = /https?:\/\/[^\s]+/g.test(content);

  const handleSend = () => {
    if (content.trim()) {
      onSend(content, isAnonymous, topic || undefined, parentId, imageUrl || undefined, videoUrl || undefined);
      setContent('');
      setTopic('');
      setImageUrl('');
      setVideoUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  return (
    <>
      <div className="space-y-0 bg-card rounded-lg border border-border/50 overflow-hidden focus-within:border-primary/50 transition-all">
        {!parentId && showTopic && (
          <div className="flex items-center gap-2 p-2 border-b border-border/30">
            <Hash className="h-3.5 w-3.5 text-primary ml-1" />
            <Input
              placeholder="Add topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              list="topics-list"
              className="flex-1 h-8 text-xs border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <datalist id="topics-list">
              {TOPICS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
        )}
        
        {imageUrl && (
          <div className="relative p-2 border-b border-border/30">
            <img src={imageUrl} alt="Upload" className="max-h-32 rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 h-6 w-6"
              onClick={() => setImageUrl('')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        {videoUrl && (
          <div className="relative p-2 border-b border-border/30">
            <video src={videoUrl} controls className="max-h-48 rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 h-6 w-6"
              onClick={() => setVideoUrl('')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            className="min-h-[48px] md:min-h-[52px] pr-20 resize-none text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-3"
            maxLength={1000}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={() => setShowImageUpload(true)}
              title="Add image"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-accent/50"
              onClick={() => setShowVideoUpload(true)}
              title="Add video (30s max)"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-accent/50">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2">
                <div className="flex gap-1 mb-2 border-b pb-2">
                  {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                    <Button
                      key={cat}
                      variant={emojiCategory === cat ? 'default' : 'ghost'}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setEmojiCategory(cat as any)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-6 gap-1 max-h-40 overflow-y-auto">
                  {EMOJI_CATEGORIES[emojiCategory].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => insertEmoji(emoji)}
                      className="h-8 w-8 p-0 text-lg hover:bg-accent/50"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {hasLink && !parentId && (
          <div className="px-3 py-2 bg-accent/20 border-b border-border/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Link detected! Make it clickable as an ad for ₦1,000
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowAdDialog(true)}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Create Ad
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2 border-t border-border/30">
          <div className="flex items-center gap-3">
            {!parentId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTopic(!showTopic)}
                className="h-7 gap-1 text-xs px-2"
              >
                <Hash className="h-3 w-3" />
                {showTopic ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            )}
            <Switch
              id="anonymous-mode"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
              className="scale-90"
            />
            <Label htmlFor="anonymous-mode" className="text-xs cursor-pointer">
              Anonymous
            </Label>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
              {content.length}/1000
            </span>
            <Button
              onClick={handleSend}
              disabled={!content.trim()}
              size="sm"
              className="gap-1.5 h-8 px-4 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
              {parentId ? 'Reply' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
      
      <ImageUploadDialog
        open={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onImageSelected={setImageUrl}
      />
      
      <VideoUpload
        open={showVideoUpload}
        onClose={() => setShowVideoUpload(false)}
        onVideoUploaded={setVideoUrl}
      />
      
      <AdCreationDialog
        open={showAdDialog}
        onClose={() => setShowAdDialog(false)}
        messageContent={content}
      />
    </>
  );
};
