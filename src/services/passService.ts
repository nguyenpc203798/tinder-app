// Pass Service - Handles pass operations following Clean Architecture
import { createClientForServer } from '@/lib/supabase/server';
import type { Pass, IPassService } from '@/types/tinder';

export class PassService implements IPassService {

  async sendPass(receiverId: string): Promise<Pass> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Kiểm tra đã pass chưa
    const alreadyPassed = await this.hasPassedUser(receiverId);
    if (alreadyPassed) {
      throw new Error('You have already passed this user');
    }

    const { data, error } = await supabase
      .from('passes')
      .insert({ sender_id: user.id, receiver_id: receiverId })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to send pass: ${error.message}`);
    return data;
  }

  async getPassesSent(): Promise<Pass[]> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('passes')
      .select('*')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get passes sent: ${error.message}`);
    return data || [];
  }

  async getPassedUserIds(): Promise<string[]> {
    const passes = await this.getPassesSent();
    return passes.map(pass => pass.receiver_id);
  }

  async hasPassedUser(receiverId: string): Promise<boolean> {
    const supabase = await createClientForServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('passes')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', receiverId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to check pass status: ${error.message}`);
    }

    return !!data;
  }
}

// Singleton instance
export const passService = new PassService();
