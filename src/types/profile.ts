// Profile-specific types following Single Responsibility Principle
export interface UserProfile {
  id?: string;
  name: string;
  gender: string;
  age: number;
  bio: string;
  job_title: string;
  education: string;
  location: string;
  photos: string[];
  interests: string[];
  age_range: [number, number];
  distance: number;
  is_verified: boolean;
  height_cm: number;
  weight_kg: number;
}

export interface ProfileFormData {
  name: string;
  gender: string;
  age: number;
  bio: string;
  job_title: string;
  education: string;
  location: string;
  interests: string[];
  height_cm: number;
  weight_kg: number;
  age_range: [number, number];
  distance: number;
}

export interface ProfileUpdateRequest extends Partial<UserProfile> {
  id: string;
  is_verified: boolean;
}

export interface PhotoUploadResult {
  success: boolean;
  urls?: string[];
  error?: string;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Constants for validation and UI
// AI Compatibility types
export interface CompatibilityResult {
  userId: string;
  score: number;
  reasons: string[];
  matchPercentage: number;
}

export interface RankedUser extends UserProfile {
  compatibilityScore: number;
  matchPercentage: number;
  reasons: string[];
}

export interface UserMatchingData {
  currentUser: UserProfile;
  candidateUsers: UserProfile[];
  rankedUsers: RankedUser[];
}

export const PROFILE_CONSTANTS = {
  MAX_INTERESTS: 10,
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_HEIGHT: 100,
  MAX_HEIGHT: 250,
  MIN_WEIGHT: 30,
  MAX_WEIGHT: 300,
  MAX_BIO_LENGTH: 500,
  MAX_PHOTOS: 6,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
} as const;
