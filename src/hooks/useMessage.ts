// Custom hook for Message operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Message, UseMessageReturn } from '@/types/tinder';

export function useMessage(matchId: string): UseMessageReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages for a match
  const fetchMessages = useCallback(async () => {
    if (!matchId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/messages?match_id=${matchId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const { data } = await response.json();
      setMessages(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải tin nhắn';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [matchId]);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'emoji' = 'text') => {
    if (!matchId || !content.trim()) return;

    try {
      setError(null);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: matchId,
          content: content.trim(),
          message_type: messageType,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to send message');
      }

      const { data: newMessage } = await response.json();
      
      // Update local state
      setMessages(prev => [...prev, newMessage]);
      
      toast.success('Tin nhắn đã được gửi! 💬');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi gửi tin nhắn';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, [matchId]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message_id: messageId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to mark message as read');
      }

      // Update local state
      setMessages(prev =>
        prev.map(message =>
          message.id === messageId
            ? { ...message, is_read: true }
            : message
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đánh dấu đã đọc';
      setError(errorMessage);
      console.error(errorMessage);
    }
  }, []);

  // Mark all messages in match as read
  const markAllAsRead = useCallback(async () => {
    if (!matchId) return;

    try {
      setError(null);

      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: matchId,
          mark_all_read: true,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to mark all messages as read');
      }

      // Update local state
      setMessages(prev =>
        prev.map(message => ({ ...message, is_read: true }))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đánh dấu tất cả tin nhắn đã đọc';
      setError(errorMessage);
      console.error(errorMessage);
    }
  }, [matchId]);

  // Refresh messages data
  const refreshMessages = useCallback(async () => {
    await fetchMessages();
  }, [fetchMessages]);

  // Handle new message (realtime)
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Subscribe to new messages (realtime)
  const subscribeToMessages = useCallback(() => {
    if (!matchId) return () => {};

    // This will be implemented with Supabase realtime
    // For now, we'll use polling as fallback
    const interval = setInterval(() => {
      fetchMessages();
    }, 5000); // Poll every 5 seconds for messages

    return () => clearInterval(interval);
  }, [matchId, fetchMessages]);

  // Load data on mount and when matchId changes
  useEffect(() => {
    if (matchId) {
      fetchMessages();
      const unsubscribe = subscribeToMessages();
      return unsubscribe;
    }
  }, [matchId, fetchMessages, subscribeToMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    markAllAsRead,
    refreshMessages,
    handleNewMessage,
  };
}
