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
    <div className="space-y-3">
      {!parentId && (
        <div className="flex items-center gap-2 bg-accent/20 p-2 rounded-lg border border-border/30">
          <Hash className="h-4 w-4 text-primary ml-1" />
          <Input
            placeholder="Add a topic (e.g., Academics, Events, Campus Life)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            list="topics-list"
            className="flex-1 h-9 text-sm border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <datalist id="topics-list">
            {TOPICS.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      )}
      
      <div className="relative bg-card border border-border/50 rounded-xl overflow-hidden focus-within:border-primary/50 transition-all">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          className="min-h-[70px] md:min-h-[90px] pr-12 resize-none text-sm md:text-base border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent p-4"
          maxLength={1000}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/50">
                <Smile className="h-4 w-4" />
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-accent/10 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Switch
            id="anonymous-mode"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
          />
          <Label htmlFor="anonymous-mode" className="text-sm cursor-pointer font-medium">
            Post anonymously
          </Label>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-muted-foreground ml-auto sm:ml-0">
            {content.length}/1000
          </span>
          <Button
            onClick={handleSend}
            disabled={!content.trim()}
            className="gap-2 h-10 px-5 shadow-sm font-medium"
          >
            <Send className="h-4 w-4" />
            {parentId ? 'Reply' : 'Post Message'}
          </Button>
        </div>
      </div>
    </div>
  );
};
