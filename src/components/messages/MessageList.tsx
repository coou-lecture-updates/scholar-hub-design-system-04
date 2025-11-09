import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageItem, Message } from './MessageItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  loading?: boolean;
  currentUserId?: string;
  currentUserRoles?: string[];
  onReply: (messageId: string) => void;
  onReact: (messageId: string, reactionType: string) => void;
  onDelete: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  autoScroll?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUserId,
  currentUserRoles,
  onReply,
  onReact,
  onDelete,
  onPin,
  autoScroll = true,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">No messages yet</p>
          <p className="text-sm">Be the first to start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-25rem)] md:h-[calc(100vh-20rem)]" ref={scrollRef}>
      <div className="space-y-2 pr-2 md:pr-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              currentUserRoles={currentUserRoles}
              onReply={onReply}
              onReact={onReact}
              onDelete={onDelete}
              onPin={onPin}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
