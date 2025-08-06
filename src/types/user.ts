export interface UserProfile {
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
