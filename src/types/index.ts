// Type định nghĩa từ cơ sở dữ liệu
export type UserRole = 'customer' | 'admin';

export type UserHabits = {
  smoking?: 'never' | 'socially' | 'regularly';
  drinking?: 'never' | 'socially' | 'regularly';
  exercise?: 'never' | 'sometimes' | 'regularly' | 'daily';
  diet?: 'omnivore' | 'vegetarian' | 'vegan' | 'other';
  [key: string]: string | undefined;
};

export type UserProfile = {
  id: string;
  full_name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  height_cm?: number;
  weight_kg?: number;
  education_level?: string;
  job_title?: string;
  company?: string;
  income_range?: string;
  marital_status?: 'single' | 'divorced' | 'widowed' | 'married';
  children?: boolean;
  religion?: string;
  zodiac_sign?: string;
  lifestyle?: string;
  interests?: string[];
  personality_traits?: string[];
  habits?: UserHabits;
  photos?: string[];
  is_verified: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
};

export type UserPreferences = {
  id: string;
  user_id: string;
  age_min: number;
  age_max: number;
  max_distance_km: number;
  preferred_gender: string[];
  education_preference?: string[];
  religion_preference?: string[];
  lifestyle_preference?: string[];
  created_at: string;
  updated_at: string;
};

export type UserRanking = {
  id: string;
  user_id: string;
  target_user_id: string;
  compatibility_score: number;
  ranking_position: number;
  distance_km: number;
  is_same_location: boolean;
  created_at: string;
  expires_at: string;
};

export type RejectedUser = {
  id: string;
  user_id: string;
  rejected_user_id: string;
  created_at: string;
};

export type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type RankingQueue = {
  id: string;
  user_id: string;
  candidate_users: Array<{
    id: string;
    distance?: number;
    is_same_location?: boolean;
  }>;
  current_position: number;
  total_candidates: number;
  created_at: string;
  expires_at: string;
};

// AI Compatibility Result
export type CompatibilityResult = {
  user_id: string;
  score: number;
  reason: string;
}; 