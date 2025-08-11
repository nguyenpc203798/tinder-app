// Custom hook for Notification operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { NotificationWithProfile, UseNotificationReturn } from '@/types/tinder';

export function useNotification(): UseNotificationReturn {
  const [notifications, setNotifications] = useState<NotificationWithProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications data
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/notifications');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const { data } = await response.json();
      setNotifications(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải thông báo';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?count=true');
      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const { data } = await response.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification_id: notificationId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to mark notification as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đánh dấu đã đọc';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mark_all: true }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to mark all notifications as read');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
      
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi đánh dấu tất cả đã đọc';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Refresh notifications data
  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Handle new notification (realtime)
  const handleNewNotification = useCallback((notification: NotificationWithProfile) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Show toast based on notification type
    const message = getNotificationMessage(notification);
    toast.success(message, {
      duration: 5000,
    });
  }, []);

  // Subscribe to new notifications (realtime)
  const subscribeToNotifications = useCallback(() => {
    // This will be implemented with Supabase realtime
    // For now, we'll use polling as fallback
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Load data on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [fetchNotifications, fetchUnreadCount, subscribeToNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    handleNewNotification,
  };
}

// Helper function to get notification message
function getNotificationMessage(notification: NotificationWithProfile): string {
  const fromName = notification.from_profile?.name || 'Ai đó';
  
  switch (notification.type) {
    case 'like':
      return `💖 ${fromName} đã like bạn!`;
    case 'match':
      return `🎉 Bạn có match mới với ${fromName}!`;
    case 'message':
      return `💬 ${fromName} đã gửi tin nhắn cho bạn`;
    default:
      return 'Bạn có thông báo mới';
  }
}
