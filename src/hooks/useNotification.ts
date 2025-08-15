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
      duration: 3000,
    });
  }, []);

  // Subscribe to new notifications (realtime)
  const subscribeToNotifications = useCallback(() => {
    const supabase = createClient();
    let subscription: ReturnType<typeof supabase.channel> | null = null;
    let isCleanedUp = false;
    
    // Get current user and setup subscription
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || isCleanedUp) {
          console.warn('No user found or component cleaned up');
          return;
        }

        subscription = supabase
          .channel(`notifications-realtime-${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            async (payload: { new: Notification }) => {
              if (isCleanedUp) return;
              console.log('New notification received:', payload.new);
              try {
                await fetchNotifications();
                await fetchUnreadCount();
              } catch (error) {
                console.error('Error handling new notification:', error);
              }
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
              if (isCleanedUp) return;
              console.log('Notification updated:', payload.new);
              try {
                await fetchNotifications();
                await fetchUnreadCount();
              } catch (error) {
                console.error('Error handling notification update:', error);
              }
            }
          )
          .subscribe((status) => {
            console.log('Subscription status:', status);
            if (status === 'CLOSED' && !isCleanedUp) {
              console.warn('Subscription closed unexpectedly, attempting to reconnect...');
              setTimeout(() => {
                if (!isCleanedUp) {
                  setupSubscription();
                }
              }, 5000);
            }
          });
      } catch (error) {
        console.error('Error setting up notification subscription:', error);
        // Retry after 10 seconds if not cleaned up
        if (!isCleanedUp) {
          setTimeout(() => {
            if (!isCleanedUp) {
              setupSubscription();
            }
          }, 10000);
        }
      }
    };

    setupSubscription();

    // Return cleanup function
    return () => {
      isCleanedUp = true;
      if (subscription) {
        console.log('Unsubscribing from notifications');
        subscription.unsubscribe();
        subscription = null;
      }
    };
  }, [fetchNotifications, fetchUnreadCount]);

  // Load data on mount
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Setup realtime subscription (separate effect to avoid re-subscription)
  useEffect(() => {
    const unsubscribe = subscribeToNotifications();
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once - intentionally ignoring subscribeToNotifications to prevent re-subscription loops

  // Helper function to get notification message
  function getNotificationMessage(notification: NotificationWithProfile) {
    const senderName = notification.from_profile?.name || 'Someone';
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
