// Custom hook for Match operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithProfiles, UseMatchReturn } from '@/types/tinder';

export function useMatch(): UseMatchReturn {
  const [matches, setMatches] = useState<MatchWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch matches data
  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/matches');
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const { data } = await response.json();
      setMatches(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi khi tải danh sách match';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get match by ID
  const getMatchById = useCallback((matchId: string): MatchWithProfiles | null => {
    return matches.find(match => match.id === matchId) || null;
  }, [matches]);

  // Handle new match notification
  const handleNewMatch = useCallback((newMatch: MatchWithProfiles) => {
    setMatches(prev => [newMatch, ...prev]);
    toast.success('🎉 Bạn có match mới!', {
      description: 'Hãy bắt đầu cuộc trò chuyện nhé!',
      duration: 5000,
    });
  }, []);

  // Refresh matches data
  const refreshMatches = useCallback(async () => {
    await fetchMatches();
  }, [fetchMatches]);

  // Subscribe to new matches (realtime)
  const subscribeToMatches = useCallback(() => {
    const supabase = createClient();
    
    // Get current user first
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return () => {};

      const subscription = supabase
        .channel('matches-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'matches',
            filter: `user1_id=eq.${user.id},user2_id=eq.${user.id}`
          },
          () => {
            // Khi có match mới, chỉ fetch lại danh sách match từ server
            fetchMatches();
            // Không gọi handleNewMatch ở đây để tránh trùng dữ liệu
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
  }, [fetchMatches]);

  // Load data on mount
  useEffect(() => {
    fetchMatches();
    const unsubscribe = subscribeToMatches();
    return unsubscribe;
  }, [fetchMatches, subscribeToMatches]);

  return {
    matches,
    isLoading,
    error,
    refreshMatches,
    getMatchById,
    handleNewMatch,
  };
}
