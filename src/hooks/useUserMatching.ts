// Custom hook for user matching following Clean Architecture
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { RankedUser, UserMatchingData } from '@/types/profile';

interface UseUserMatchingReturn {
  rankedUsers: RankedUser[];
  matchingData: UserMatchingData | null;
  isLoading: boolean;
  error: string | null;
  fetchRankedUsers: () => Promise<void>;
  fetchMatchingData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useUserMatching(): UseUserMatchingReturn {
  const [rankedUsers, setRankedUsers] = useState<RankedUser[]>([]);
  const [matchingData, setMatchingData] = useState<UserMatchingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Fetch ranked users only
   */
  const fetchRankedUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/ranked', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch ranked users');
      }

      if (result.success) {
        setRankedUsers(result.data);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching ranked users:', err);
      
      toast({
        title: "Lỗi",
        description: `Không thể tải danh sách người dùng: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Fetch full matching data (current user + candidates + ranked)
   */
  const fetchMatchingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/ranked', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch matching data');
      }

      if (result.success) {
        setMatchingData(result.data);
        setRankedUsers(result.data.rankedUsers);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching matching data:', err);
      
      toast({
        title: "Lỗi",
        description: `Không thể tải dữ liệu matching: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await fetchMatchingData();
  }, [fetchMatchingData]);

  /**
   * Auto-fetch on mount
   */
  useEffect(() => {
    fetchRankedUsers();
  }, [fetchRankedUsers]);

  return {
    rankedUsers,
    matchingData,
    isLoading,
    error,
    fetchRankedUsers,
    fetchMatchingData,
    refreshData,
  };
}
