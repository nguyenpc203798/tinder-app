// Profile validation utilities following Single Responsibility Principle
import { ProfileFormData, ProfileValidationResult, PROFILE_CONSTANTS } from '@/types/profile';

export class ProfileValidator {
  static validateProfile(data: ProfileFormData): ProfileValidationResult {
    const errors: Record<string, string> = {};

    // Name validation
    if (!data.name?.trim()) {
      errors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Age validation
    if (!data.age || data.age < PROFILE_CONSTANTS.MIN_AGE || data.age > PROFILE_CONSTANTS.MAX_AGE) {
      errors.age = `Age must be between ${PROFILE_CONSTANTS.MIN_AGE} and ${PROFILE_CONSTANTS.MAX_AGE}`;
    }

    // Gender validation
    if (!data.gender) {
      errors.gender = 'Gender is required';
    }

    // Bio validation
    if (data.bio && data.bio.length > PROFILE_CONSTANTS.MAX_BIO_LENGTH) {
      errors.bio = `Bio must be less than ${PROFILE_CONSTANTS.MAX_BIO_LENGTH} characters`;
    }

    // Height validation
    if (data.height_cm && (data.height_cm < PROFILE_CONSTANTS.MIN_HEIGHT || data.height_cm > PROFILE_CONSTANTS.MAX_HEIGHT)) {
      errors.height_cm = `Height must be between ${PROFILE_CONSTANTS.MIN_HEIGHT} and ${PROFILE_CONSTANTS.MAX_HEIGHT} cm`;
    }

    // Weight validation
    if (data.weight_kg && (data.weight_kg < PROFILE_CONSTANTS.MIN_WEIGHT || data.weight_kg > PROFILE_CONSTANTS.MAX_WEIGHT)) {
      errors.weight_kg = `Weight must be between ${PROFILE_CONSTANTS.MIN_WEIGHT} and ${PROFILE_CONSTANTS.MAX_WEIGHT} kg`;
    }

    // Interests validation
    if (data.interests && data.interests.length > PROFILE_CONSTANTS.MAX_INTERESTS) {
      errors.interests = `Maximum ${PROFILE_CONSTANTS.MAX_INTERESTS} interests allowed`;
    }

    // Age range validation
    if (data.age_range) {
      const [minAge, maxAge] = data.age_range;
      if (minAge >= maxAge) {
        errors.age_range = 'Minimum age must be less than maximum age';
      }
      if (minAge < PROFILE_CONSTANTS.MIN_AGE || maxAge > PROFILE_CONSTANTS.MAX_AGE) {
        errors.age_range = `Age range must be between ${PROFILE_CONSTANTS.MIN_AGE} and ${PROFILE_CONSTANTS.MAX_AGE}`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validatePhotos(files: FileList): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (files.length > PROFILE_CONSTANTS.MAX_PHOTOS) {
      errors.push(`Maximum ${PROFILE_CONSTANTS.MAX_PHOTOS} photos allowed`);
    }

    Array.from(files).forEach((file, index) => {
      if (!Array.from(PROFILE_CONSTANTS.ALLOWED_IMAGE_TYPES).some(type => type === file.type)) {
        errors.push(`Photo ${index + 1}: Only JPG, PNG, and WebP formats are allowed`);
      }
      
      if (file.size > PROFILE_CONSTANTS.MAX_IMAGE_SIZE) {
        errors.push(`Photo ${index + 1}: File size must be less than 5MB`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const formatProfileData = (data: ProfileFormData): ProfileFormData => {
  return {
    ...data,
    name: data.name?.trim() || '',
    bio: data.bio?.trim() || '',
    job_title: data.job_title?.trim() || '',
    education: data.education?.trim() || '',
    location: data.location?.trim() || '',
    interests: data.interests?.map(interest => interest.trim()).filter(Boolean) || [],
  };
};
