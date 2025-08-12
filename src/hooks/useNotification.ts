// Custom hook for Notification operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { NotificationWithProfile, UseNotificationReturn, Notification } from '@/types/tinder';

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
      const errorMessage = err instanceof Error ? err.message : 'Error fetching notifications';
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
      const errorMessage = err instanceof Error ? err.message : 'Error marking notification as read';
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

      toast.success("Seen all notifications");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error marking all notifications as read";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

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
    const supabase = createClient();
    
    // Get current user first
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      const subscription = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload: { new: Notification }) => {
            // Fetch full notification data with profile
            await fetchNotifications();
            await fetchUnreadCount();
            console.log('New notification:', payload.new);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          async (payload: { new: Notification }) => {
            // Update notification in local state
            await fetchNotifications();
            await fetchUnreadCount();
            console.log('Updated notification:', payload.new);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    };

    let unsubscribe: (() => void) | null = null;
    setupSubscription().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Load data on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
  }, [fetchNotifications, fetchUnreadCount, subscribeToNotifications]);

  // Helper function to get notification message
  function getNotificationMessage(notification: NotificationWithProfile) {
    const senderName = notification.from_profile?.name || 'Ai đó';
    switch (notification.type) {
      case 'like':
        return `${senderName} liked you`;
      case 'match':
        return `You have a new match with ${senderName}!`;
      case "message":
        return `${senderName} sent you a message`;
      default:
        return "New notification";
    }
  }

  // Handler for notification click
  const handleNotificationClick = useCallback(async (notification: NotificationWithProfile) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // TODO: Navigate to appropriate page based on notification type
    console.log('Notification clicked:', notification);
  }, [markAsRead]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
    handleNewNotification,
    getNotificationMessage,
    handleNotificationClick,
  };
}
