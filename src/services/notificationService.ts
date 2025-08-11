// Notification Service - Handles notification operations following Clean Architecture
import { createClientForServer } from '@/lib/supabase/server';
import type { Notification, NotificationWithProfile, INotificationService } from '@/types/tinder';

export class NotificationService implements INotificationService {
  async getNotifications(): Promise<NotificationWithProfile[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('notifications')
      .select(`*, from_profile:user_profile!notifications_data_from_fkey(id, name, image, age)`)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to get notifications: ${error.message}`);
    const notificationsWithProfiles = await Promise.all(
      (data || []).map(async (notification: Notification) => {
        let fromProfile = null;
        if (notification.data?.from) {
          const { data: profile } = await supabase
            .from('user_profile')
            .select('id, name, image, age')
            .eq('id', notification.data.from)
            .single();
          fromProfile = profile;
        }
        return {
          ...notification,
          from_profile: fromProfile
        } as NotificationWithProfile;
      })
    );
    return notificationsWithProfiles;
  }

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  async markAllAsRead(): Promise<void> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }

  async getUnreadCount(): Promise<number> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    if (error) throw new Error(`Failed to get unread count: ${error.message}`);
    return count || 0;
  }

  subscribeToNotifications(callback: (notification: Notification) => void): () => void {
    (async () => {
      const supabase = await createClientForServer();
      const { data: { user } } = await supabase.auth.getUser();
      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user?.id}`
          },
          (payload) => {
            callback(payload.new as Notification);
          }
        )
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    })();
    return () => {};
  }

  async getNotificationsByType(type: 'like' | 'match' | 'message'): Promise<NotificationWithProfile[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to get notifications by type: ${error.message}`);
    const notificationsWithProfiles = await Promise.all(
      (data || []).map(async (notification: Notification) => {
        let fromProfile = null;
        if (notification.data?.from) {
          const { data: profile } = await supabase
            .from('user_profile')
            .select('id, name, image, age')
            .eq('id', notification.data.from)
            .single();
          fromProfile = profile;
        }
        return {
          ...notification,
          from_profile: fromProfile
        } as NotificationWithProfile;
      })
    );
    return notificationsWithProfiles;
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    if (error) throw new Error(`Failed to delete notification: ${error.message}`);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
