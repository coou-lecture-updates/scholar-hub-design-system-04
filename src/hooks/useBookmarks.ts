import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useBookmarks = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch bookmarks from Supabase
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) {
        setBookmarkedIds(new Set());
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('message_bookmarks')
          .select('message_id')
          .eq('user_id', user.id);

        if (error) throw error;

        setBookmarkedIds(new Set(data?.map(b => b.message_id) || []));
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user]);

  const toggleBookmark = useCallback(async (messageId: string) => {
    if (!user) {
      toast.error('Please login to bookmark messages');
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIds.has(messageId);

    // Optimistic update
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });

    try {
      if (isCurrentlyBookmarked) {
        const { error } = await supabase
          .from('message_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('message_id', messageId);

        if (error) throw error;
        toast.success('Bookmark removed');
      } else {
        const { error } = await supabase
          .from('message_bookmarks')
          .insert({ user_id: user.id, message_id: messageId });

        if (error) throw error;
        toast.success('Message bookmarked');
      }
    } catch (error) {
      // Revert optimistic update on error
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyBookmarked) {
          newSet.add(messageId);
        } else {
          newSet.delete(messageId);
        }
        return newSet;
      });
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  }, [user, bookmarkedIds]);

  const isBookmarked = useCallback((messageId: string) => {
    return bookmarkedIds.has(messageId);
  }, [bookmarkedIds]);

  return { bookmarkedIds, toggleBookmark, isBookmarked, loading };
};
