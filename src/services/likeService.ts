// Like Service - Handles like operations following Clean Architecture
import { createClientForServer } from '@/lib/supabase/server';
import type { Like, ILikeService } from '@/types/tinder';

export class LikeService implements ILikeService {

  async sendLike(receiverId: string): Promise<Like> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('likes')
      .insert({ sender_id: user.id, receiver_id: receiverId })
      .select()
      .single();
    if (error) throw new Error(`Failed to send like: ${error.message}`);
    return data;
  }

  async getLikesReceived(): Promise<Like[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to get likes received: ${error.message}`);
    return data || [];
  }

  async getLikesSent(): Promise<Like[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw new Error(`Failed to get likes sent: ${error.message}`);
    return data || [];
  }

  async removeLike(receiverId: string): Promise<void> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId);
    if (error) throw new Error(`Failed to remove like: ${error.message}`);
  }

  async hasLiked(receiverId: string): Promise<boolean> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check like status: ${error.message}`);
    }
    return !!data;
  }

  // Get users who liked current user (for priority display)
  async getUsersWhoLikedMe(): Promise<string[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase
      .from('likes')
      .select('sender_id')
      .eq('receiver_id', user.id);
    if (error) throw new Error(`Failed to get users who liked me: ${error.message}`);
    return data?.map((like: { sender_id: string }) => like.sender_id) || [];
  }

  // Check if two users have mutual likes (for match detection)
  async checkMutualLike(userId1: string, userId2: string): Promise<boolean> {
    const supabase = await createClientForServer();
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`);
    if (error) throw new Error(`Failed to check mutual like: ${error.message}`);
    return data?.length === 2;
  }
}

// Singleton instance
export const likeService = new LikeService();
