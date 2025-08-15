import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function usePassRealtime(userId: string, onPass: (senderId: string) => void) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-pass-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'passes',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          if (payload?.new?.sender_id) {
            onPass(payload.new.sender_id);
          }
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [userId, onPass]);
}

export function useLikeRealtime(userId: string, onLike: (senderId: string) => void) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-like-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'likes',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          if (payload?.new?.sender_id) {
            onLike(payload.new.sender_id);
          }
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [userId, onLike]);
}
