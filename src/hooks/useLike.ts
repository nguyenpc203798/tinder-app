// Custom hook for Like operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Like, UseLikeReturn } from '@/types/tinder';

export function useLike(): UseLikeReturn {
  const [likesReceived, setLikesReceived] = useState<Like[]>([]);
  const [likesSent, setLikesSent] = useState<Like[]>([]);
  const [likedUserIds, setLikedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch likes data
  const fetchLikes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/likes');
      if (!response.ok) {
        throw new Error('Failed to fetch likes');
      }

      const { data } = await response.json();
      setLikesReceived(data.received || []);
      setLikesSent(data.sent || []);
      
      // Create set of liked user IDs for quick lookup
      const likedIds = new Set(data.sent?.map((like: Like) => like.receiver_id) || []);
      setLikedUserIds(likedIds as Set<string>);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải danh sách like';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send like
  const sendLike = useCallback(async (receiverId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver_id: receiverId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to send like');
      }

      const { data: newLike } = await response.json();
      
      // Update local state
      setLikesSent(prev => [newLike, ...prev]);
      setLikedUserIds(prev => new Set([...prev, receiverId]));      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending like';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Remove like
  const removeLike = useCallback(async (receiverId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/likes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver_id: receiverId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to remove like');
      }

      // Update local state
      setLikesSent(prev => prev.filter(like => like.receiver_id !== receiverId));
      setLikedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(receiverId);
        return newSet;
      });
      
      toast.success('Đã hủy like thành công');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi hủy like';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Check if user has been liked
  const hasLiked = useCallback((receiverId: string): boolean => {
    return likedUserIds.has(receiverId);
  }, [likedUserIds]);

  // Refresh likes data
  const refreshLikes = useCallback(async () => {
    await fetchLikes();
  }, [fetchLikes]);

  // Get users who liked current user (for priority display)
  const getUsersWhoLikedMe = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/likes?type=who-liked-me');
      if (!response.ok) {
        throw new Error('Failed to fetch users who liked me');
      }
      const { data } = await response.json();
      return data || [];
    } catch (err) {
      console.error('Error fetching users who liked me:', err);
      return [];
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  return {
    sendLike,
    removeLike,
    hasLiked,
    likesReceived,
    likesSent,
    isLoading,
    error,
    refreshLikes,
    getUsersWhoLikedMe,
  };
}
