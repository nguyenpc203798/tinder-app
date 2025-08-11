// Message Service - Handles message operations following Clean Architecture
import { createClientForServer } from '@/lib/supabase/server';
import type { Message, IMessageService } from '@/types/tinder';

export class MessageService implements IMessageService {
  async getMessages(matchId: string): Promise<Message[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Verify user is part of this match
    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
      throw new Error('Unauthorized access to match messages');
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    return data || [];
  }

  async sendMessage(matchId: string, content: string, messageType: 'text' | 'image' | 'emoji' = 'text'): Promise<Message> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get match details to determine receiver
    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!match || (match.user1_id !== user.id && match.user2_id !== user.id)) {
      throw new Error('Unauthorized access to match');
    }

    const receiverId = match.user1_id === user.id ? match.user2_id : match.user1_id;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        match_id: matchId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
        message_type: messageType
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to send message: ${error.message}`);
    return data;
  }

  async markAsRead(messageId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)
      .eq('receiver_id', user.id); // Only receiver can mark as read

    if (error) throw new Error(`Failed to mark message as read: ${error.message}`);
  }

  async markMatchMessagesAsRead(matchId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('match_id', matchId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (error) throw new Error(`Failed to mark match messages as read: ${error.message}`);
  }

  // Subscribe to new messages in a match (realtime)
  subscribeToMessages(matchId: string, callback: (message: Message) => void): () => void {
    (async () => {
      const supabase = await createClientForServer();
      const subscription = supabase
        .channel(`messages:${matchId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `match_id=eq.${matchId}`
          },
          (payload) => {
            callback(payload.new as Message);
          }
        )
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    })();
    return () => {};
  }

  // Get unread message count for a match
  async getUnreadMessageCount(matchId: string): Promise<number> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('match_id', matchId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .eq('is_deleted', false);

    if (error) throw new Error(`Failed to get unread message count: ${error.message}`);
    return count || 0;
  }

  // Get total unread message count across all matches
  async getTotalUnreadMessageCount(): Promise<number> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false)
      .eq('is_deleted', false);

    if (error) throw new Error(`Failed to get total unread message count: ${error.message}`);
    return count || 0;
  }

  // Soft delete message
  async deleteMessage(messageId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('sender_id', user.id); // Only sender can delete

    if (error) throw new Error(`Failed to delete message: ${error.message}`);
  }

  // Get latest message for each match (for match list preview)
  async getLatestMessages(): Promise<{ [matchId: string]: Message }> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's matches first
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!matches) return {};

    const latestMessages: { [matchId: string]: Message } = {};

    // Get latest message for each match
    for (const match of matches) {
      const { data: message } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', match.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (message) {
        latestMessages[match.id] = message;
      }
    }

    return latestMessages;
  }
}

// Singleton instance
export const messageService = new MessageService();
