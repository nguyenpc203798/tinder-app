import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UseUserResult {
  user: User | null;
  avatarUrl: string;
  fallback: string;
  handleLogout: () => Promise<void>;
  photos: string[];
}

export function useHeaderData(): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [fallback, setFallback] = useState('U');
  const [photos, setPhotos] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        setUser(data.user);
        setAvatarUrl(data.user.user_metadata?.avatar_url || '');
        setFallback(data.user.email?.[0]?.toUpperCase() || 'U');
        // Lấy photos từ bảng user_profile
        const { data: profile, error } = await supabase
          .from('user_profile')
          .select('photos',)
          .eq('id', data.user.id)
          .single();
        if (!error && profile && profile.photos) {
          setPhotos(profile.photos);
        } else {
          setPhotos([]);
        }
      } else {
        setUser(null);
        setAvatarUrl('');
        setFallback('U');
        setPhotos([]);
      }
    });
  }, []);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  }, [router]);

  return { user, avatarUrl, fallback, handleLogout, photos };
}
