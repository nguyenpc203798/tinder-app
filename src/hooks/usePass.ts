// Custom hook for Pass operations following Clean Architecture
'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { Pass, UsePassReturn } from '@/types/tinder';

export function usePass(): UsePassReturn {
  const [passesSent, setPassesSent] = useState<Pass[]>([]);
  const [passedUserIds, setPassedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch passes data
  const fetchPasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/passes');
      if (!response.ok) {
        throw new Error('Failed to fetch passes');
      }

      const { data } = await response.json();
      setPassesSent(data || []);
      setPassedUserIds((data || []).map((pass: Pass) => pass.receiver_id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error fetching passes';
      setError(errorMessage);
      console.error('Error fetching passes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send pass
  const sendPass = useCallback(async (receiverId: string) => {
    try {
      setError(null);

      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiver_id: receiverId }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to send pass');
      }

      const { data } = await response.json();
      
      // Update local state
      setPassesSent(prev => [data, ...prev]);
      setPassedUserIds(prev => [...prev, receiverId]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error sending pass';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  // Check if user has been passed
  const hasPassedUser = useCallback((receiverId: string): boolean => {
    return passedUserIds.includes(receiverId);
  }, [passedUserIds]);

  // Refresh passes data
  const refreshPasses = useCallback(async () => {
    await fetchPasses();
  }, [fetchPasses]);

  // Load data on mount
  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  return {
    sendPass,
    hasPassedUser,
    passesSent,
    passedUserIds,
    isLoading,
    error,
    refreshPasses,
  };
}
