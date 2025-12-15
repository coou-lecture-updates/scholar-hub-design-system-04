import { useState, useEffect, useCallback } from 'react';

const BOOKMARKS_KEY = 'message_bookmarks';

export const useBookmarks = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      try {
        setBookmarkedIds(new Set(JSON.parse(stored)));
      } catch {
        setBookmarkedIds(new Set());
      }
    }
  }, []);

  const toggleBookmark = useCallback((messageId: string) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...newSet]));
      return newSet;
    });
  }, []);

  const isBookmarked = useCallback((messageId: string) => {
    return bookmarkedIds.has(messageId);
  }, [bookmarkedIds]);

  return { bookmarkedIds, toggleBookmark, isBookmarked };
};
