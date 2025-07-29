import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserProfile } from "@/src/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

// Tính khoảng cách giữa hai điểm dựa trên tọa độ (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format date string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// Kiểm tra xem profile có đầy đủ thông tin cần thiết không
export function isProfileComplete(profile: Partial<UserProfile>): boolean {
  const requiredFields = [
    "full_name",
    "age",
    "gender",
    "bio",
    "location",
    "latitude",
    "longitude",
  ];
  
  return requiredFields.every((field) => !!profile?.[field as keyof UserProfile]);
}

// Random ID generator
export function generateId(length = 12): string {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Validate image file (type and size)
export function validateImageFile(file: File, maxSizeMB = 5): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  return validTypes.includes(file.type) && file.size <= maxSizeBytes;
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
