import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Send, Paperclip, Smile, Hash } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessageInputProps {
  onSend: (content: string, isAnonymous: boolean, topic?: string, parentId?: string) => void;
  parentId?: string;
  placeholder?: string;
}

const TOPICS = ['General', 'Academics', 'Events', 'Campus Life', 'Tech Support'];

const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🔥', '🎉', '🤔', '😢'];

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSend, 
  parentId,
  placeholder = 'Type your message...' 
}) => {
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [topic, setTopic] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (content.trim()) {
      onSend(content, isAnonymous, topic || undefined, parentId);
      setContent('');
      setTopic('');
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
    <div className="border rounded-lg bg-card p-3 md:p-4 space-y-3 shadow-sm">
      {!parentId && (
        <div className="flex items-center gap-2">
          <Hash className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          <Input
            placeholder="Topic (optional)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            list="topics-list"
            className="max-w-xs h-8 md:h-9 text-xs md:text-sm"
          />
          <datalist id="topics-list">
            {TOPICS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      )}
      
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[60px] md:min-h-[80px] pr-20 md:pr-24 resize-none text-xs md:text-sm"
          maxLength={1000}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8">
                <Smile className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {EMOJI_LIST.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => insertEmoji(emoji)}
                    className="h-7 w-7 md:h-8 md:w-8 p-0 text-base md:text-lg"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-0">
        <div className="flex items-center gap-2">
          <Switch
            id="anonymous-mode"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            className="scale-90 md:scale-100"
          />
          <Label htmlFor="anonymous-mode" className="text-xs md:text-sm cursor-pointer">
            Post anonymously
          </Label>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
            {content.length}/1000
          </span>
          <Button
            onClick={handleSend}
            disabled={!content.trim()}
            className="gap-1 md:gap-2 h-8 md:h-9 text-xs md:text-sm"
          >
            <Send className="h-3 w-3 md:h-4 md:w-4" />
            {parentId ? 'Reply' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
};
