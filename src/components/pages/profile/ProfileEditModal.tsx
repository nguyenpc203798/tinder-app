//src/components/pages/profile/ProfileEditModal.tsx
import { useState, useEffect } from 'react';
import type { UserProfile, ProfileFormData } from "@/types/profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileValidator } from '@/untils/profileValidation';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  loading?: boolean;
  onSave: (profile: ProfileFormData) => Promise<boolean>;
}

export const ProfileEditModal = ({ isOpen, onClose, profile, loading = false, onSave }: ProfileEditModalProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: profile.name || '',
    gender: profile.gender || '',
    age: profile.age || 18,
    bio: profile.bio || '',
    job_title: profile.job_title || '',
    education: profile.education || '',
    location: profile.location || '',
    interests: profile.interests || [],
    height_cm: profile.height_cm || 170,
    weight_kg: profile.weight_kg || 70,
    age_range: profile.age_range || [18, 35],
    distance: profile.distance || 50,
  });

  const [newInterest, setNewInterest] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      name: profile.name || '',
      gender: profile.gender || '',
      age: profile.age || 18,
      bio: profile.bio || '',
      job_title: profile.job_title || '',
      education: profile.education || '',
      location: profile.location || '',
      interests: profile.interests || [],
      height_cm: profile.height_cm || 170,
      weight_kg: profile.weight_kg || 70,
      age_range: profile.age_range || [18, 35],
      distance: profile.distance || 50,
    });
    setValidationErrors({});
  }, [profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string | number | [number, number]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddInterest = () => {
    const trimmedInterest = newInterest.trim();
    if (trimmedInterest && !formData.interests.includes(trimmedInterest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, trimmedInterest]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSave = async () => {
    // Validate form data
    const validation = ProfileValidator.validateProfile(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    await onSave(formData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell people about yourself..."
              className="min-h-[80px]"
            />
          </div>

          {/* job_title */}
          <div>
            <Label htmlFor="job_title">Job_title</Label>
            <Input
              id="job_title"
              value={formData.job_title}
              onChange={(e) => handleInputChange('job_title', e.target.value)}
            />
          </div>

          {/* Education */}
          <div>
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
            />
          </div>

          {/* Interests */}
          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-subtle border border-border/30 pr-1"
                >
                  {interest}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 hover:bg-destructive/20"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add an interest..."
              />
              <Button onClick={handleAddInterest} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                value={formData.height_cm}
                onChange={e => handleInputChange('height_cm', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                value={formData.weight_kg}
                onChange={e => handleInputChange('weight_kg', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          {/* Age Range & Distance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Age Range</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={18}
                  value={formData.age_range[0]}
                  onChange={e => setFormData(prev => ({ ...prev, age_range: [parseInt(e.target.value) || 18, prev.age_range[1]] }))}
                  className="w-20"
                />
                <span>-</span>
                <Input
                  type="number"
                  min={formData.age_range[0]}
                  value={formData.age_range[1]}
                  onChange={e => setFormData(prev => ({ ...prev, age_range: [prev.age_range[0], parseInt(e.target.value) || prev.age_range[0]] }))}
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="distance">Distance (miles)</Label>
              <Input
                id="distance"
                type="number"
                value={formData.distance}
                onChange={e => handleInputChange('distance', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-gradient-primary hover:opacity-90 flex items-center"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            )}
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};