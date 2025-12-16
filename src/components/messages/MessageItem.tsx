import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, ThumbsUp, Laugh, Frown, Brain, Flame, Pin, Trash2, MoreVertical, Image as ImageIcon, Bookmark } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UserBioPopover } from './UserBioPopover';

export interface Reaction {
  id: string;
  reaction_type: string;
  user_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  is_anonymous: boolean;
  is_pinned: boolean;
  topic: string | null;
  mentions: string[];
  created_at: string;
  updated_at: string;
  edited_at: string | null;
  image_url?: string | null;
  users?: {
    full_name: string;
    email: string;
  };
  user_roles?: Array<{ role: string }>;
  reactions?: Reaction[];
  reply_count?: number;
}

interface MessageItemProps {
  message: Message;
  currentUserId?: string;
  currentUserRoles?: string[];
  onReply: (messageId: string) => void;
  onReact: (messageId: string, reactionType: string) => void;
  onDelete: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onBookmark?: (messageId: string) => void;
  isBookmarked?: boolean;
  showReplies?: boolean;
}

const REACTION_ICONS: Record<string, React.ReactNode> = {
  like: <ThumbsUp className="h-3 w-3" />,
  heart: <Heart className="h-3 w-3" />,
  fire: <Flame className="h-3 w-3" />,
  laugh: <Laugh className="h-3 w-3" />,
  sad: <Frown className="h-3 w-3" />,
  thinking: <Brain className="h-3 w-3" />,
};

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  currentUserRoles = [],
  onReply,
  onReact,
  onDelete,
  onPin,
  onBookmark,
  isBookmarked = false,
  showReplies = true,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [imageExpanded, setImageExpanded] = useState(false);
  
  // Double-click handler for quick reactions
  const handleDoubleClick = () => {
    if (!currentUserId) return;
    
    // Trigger heart reaction on double-click
    onReact(message.id, 'heart');
    
    // Show visual feedback
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 800);
  };
  
  const isOwnMessage = message.user_id === currentUserId;
  const isAdmin = currentUserRoles.includes('admin');
  const isModerator = currentUserRoles.includes('moderator');
  const canPin = isAdmin || isModerator;
  const canDelete = isOwnMessage || isAdmin;

  const userRole = message.user_roles?.[0]?.role || 'student';
  const userName = message.is_anonymous 
    ? 'Anonymous Student' 
    : message.users?.full_name || 'Unknown User';

  const getRoleBadge = () => {
    const roleColors: Record<string, string> = {
      admin: 'bg-primary text-primary-foreground',
      moderator: 'bg-secondary text-secondary-foreground',
      course_rep: 'bg-accent text-accent-foreground',
      student: 'bg-muted text-muted-foreground',
    };

    if (message.is_anonymous) {
      return (
        <Badge variant="outline" className="text-xs">
          Anonymous
        </Badge>
      );
    }

    return (
      <Badge className={cn('text-xs', roleColors[userRole] || roleColors.student)}>
        {userRole === 'course_rep' ? 'Course Rep' : userRole.charAt(0).toUpperCase() + userRole.slice(1)}
      </Badge>
    );
  };

  const reactionCounts = message.reactions?.reduce((acc, r) => {
    acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const userReactions = message.reactions?.filter(r => r.user_id === currentUserId).map(r => r.reaction_type) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onDoubleClick={handleDoubleClick}
      className={cn(
        'group relative p-3 md:p-4 rounded-xl bg-white shadow-sm border border-border/40 transition-all hover:shadow-md cursor-pointer select-none',
        message.is_pinned && 'bg-accent/10 border-l-4 border-l-primary'
      )}
    >
      {/* Double-click heart animation */}
      <AnimatePresence>
        {showHeartAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <Heart className="h-16 w-16 text-red-500 fill-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
      {message.is_pinned && (
        <div className="absolute top-2 right-2">
          <Pin className="h-4 w-4 text-primary fill-primary" />
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar with Bio Popover for non-anonymous users */}
        {!message.is_anonymous && message.user_id ? (
          <UserBioPopover
            userId={message.user_id}
            userName={userName}
            userRole={userRole}
          >
            <button className="shrink-0">
              <Avatar className="h-10 w-10 md:h-11 md:w-11 ring-2 ring-transparent hover:ring-primary/30 transition-all cursor-pointer">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-medium">
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </button>
          </UserBioPopover>
        ) : (
          <Avatar className="h-10 w-10 md:h-11 md:w-11 shrink-0">
            <AvatarFallback className="bg-muted text-muted-foreground">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 flex-wrap">
            {/* Name with Bio Popover for non-anonymous users */}
            {!message.is_anonymous && message.user_id ? (
              <UserBioPopover
                userId={message.user_id}
                userName={userName}
                userRole={userRole}
              >
                <button className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
                  {userName}
                </button>
              </UserBioPopover>
            ) : (
              <span className="font-medium text-sm text-muted-foreground">
                {userName}
              </span>
            )}
            {getRoleBadge()}
            {message.topic && (
              <Badge variant="outline" className="text-xs font-normal">
                #{message.topic}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.edited_at && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">{message.content}</p>

          {/* Image Display */}
          {message.image_url && (
            <div className="mb-3">
              <img
                src={message.image_url}
                alt="Message attachment"
                className={cn(
                  "rounded-lg cursor-pointer transition-all border border-border/50",
                  imageExpanded ? "max-w-full" : "max-w-xs max-h-48 object-cover hover:opacity-90"
                )}
                onClick={() => setImageExpanded(!imageExpanded)}
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {/* Reaction Buttons */}
            <div className="flex items-center gap-1">
              {Object.entries(reactionCounts).map(([type, count]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-7 gap-1 text-xs',
                    userReactions.includes(type) && 'bg-primary/10 text-primary'
                  )}
                  onClick={() => onReact(message.id, type)}
                >
                  {REACTION_ICONS[type]}
                  <span>{count}</span>
                </Button>
              ))}
              
              <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <Smile className="h-3 w-3" />
                    React
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {Object.entries(REACTION_ICONS).map(([type, icon]) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => {
                        onReact(message.id, type);
                        setShowReactions(false);
                      }}
                    >
                      {icon}
                      <span className="ml-2 capitalize">{type}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Reply Button */}
            {showReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={() => onReply(message.id)}
              >
                <MessageSquare className="h-3 w-3" />
                {message.reply_count ? `View ${message.reply_count} ${message.reply_count === 1 ? 'Reply' : 'Replies'}` : 'Reply'}
              </Button>
            )}

            {/* Bookmark Button */}
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                className={cn('h-7 gap-1 text-xs', isBookmarked && 'text-primary')}
                onClick={() => onBookmark(message.id)}
              >
                <Bookmark className={cn('h-3 w-3', isBookmarked && 'fill-current')} />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
            )}

            {/* Actions Menu */}
            {(canDelete || canPin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 ml-auto opacity-0 group-hover:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canPin && onPin && (
                    <DropdownMenuItem onClick={() => onPin(message.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {message.is_pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper import for emoji
import { Smile } from 'lucide-react';
