"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { Checkbox } from "@/src/components/ui/checkbox";
import { createClient } from "@/src/lib/supabase/client";
import { UserProfile } from "@/src/types";
import PhotoUpload from "@/src/components/pages/profile/PhotoUpload";

const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const EDUCATION_OPTIONS = [
  { value: "high_school", label: "Trung học" },
  { value: "college", label: "Cao đẳng" },
  { value: "university", label: "Đại học" },
  { value: "master", label: "Thạc sĩ" },
  { value: "phd", label: "Tiến sĩ" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "single", label: "Độc thân" },
  { value: "divorced", label: "Ly hôn" },
  { value: "widowed", label: "Góa" },
  { value: "married", label: "Đã kết hôn" },
];

interface ProfileFormProps {
  initialData?: Partial<UserProfile>;
  userId: string;
}

export default function ProfileForm({ initialData, userId }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>(
    initialData || {
      full_name: "",
      age: undefined,
      gender: undefined,
      bio: "",
      location: "",
      latitude: undefined,
      longitude: undefined,
      height_cm: undefined,
      weight_kg: undefined,
      education_level: "",
      job_title: "",
      company: "",
      marital_status: undefined,
      children: false,
      religion: "",
      zodiac_sign: "",
      lifestyle: "",
      interests: [],
      personality_traits: [],
      photos: [],
    }
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : undefined }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleArrayInputChange = (name: string, value: string) => {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, [name]: items }));
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData((prev) => ({ ...prev, photos }));
  };

  const handleLocationDetect = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          toast.success("Vị trí đã được cập nhật", {
            description: "Tọa độ của bạn đã được cập nhật thành công",
          });
        },
        (error) => {
          toast.error("Lỗi", {
            description: "Không thể lấy vị trí của bạn: " + error.message,
          });
        }
      );
    } else {
      toast.error("Không hỗ trợ", {
        description: "Trình duyệt của bạn không hỗ trợ xác định vị trí",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("user_profile")
        .update(formData)
        .eq("id", userId);

      if (error) throw error;

      toast.success("Thành công", {
        description: "Thông tin cá nhân đã được cập nhật",
      });

      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Không thể cập nhật thông tin cá nhân";
      toast.error("Lỗi", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Thông tin cơ bản */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ tên đầy đủ</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Tuổi</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  min={18}
                  max={100}
                  value={formData.age || ""}
                  onChange={handleNumberChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Giới tính</Label>
                <Select
                  value={formData.gender || ""}
                  onValueChange={(value: string) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Vị trí</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    placeholder="TP. Hồ Chí Minh"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationDetect}
                  >
                    Xác định
                  </Button>
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="text-xs text-muted-foreground">
                    Tọa độ: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Giới thiệu bản thân</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Hãy chia sẻ đôi điều về bản thân..."
                rows={4}
                required
              />
            </div>

            {/* Thông tin thể chất */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height_cm">Chiều cao (cm)</Label>
                <Input
                  id="height_cm"
                  name="height_cm"
                  type="number"
                  min={140}
                  max={220}
                  value={formData.height_cm || ""}
                  onChange={handleNumberChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight_kg">Cân nặng (kg)</Label>
                <Input
                  id="weight_kg"
                  name="weight_kg"
                  type="number"
                  min={40}
                  max={150}
                  value={formData.weight_kg || ""}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            {/* Thông tin học vấn và nghề nghiệp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education_level">Trình độ học vấn</Label>
                <Select
                  value={formData.education_level || ""}
                  onValueChange={(value: string) => handleSelectChange("education_level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trình độ học vấn" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_title">Nghề nghiệp</Label>
                <Input
                  id="job_title"
                  name="job_title"
                  value={formData.job_title || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Công ty/Tổ chức</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Thông tin cá nhân khác */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marital_status">Tình trạng hôn nhân</Label>
                <Select
                  value={formData.marital_status || ""}
                  onValueChange={(value: string) => handleSelectChange("marital_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tình trạng" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 h-full pt-8">
                <Checkbox
                  id="children"
                  checked={!!formData.children}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("children", !!checked)
                  }
                />
                <Label htmlFor="children" className="cursor-pointer">
                  Có con
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="religion">Tôn giáo</Label>
                <Input
                  id="religion"
                  name="religion"
                  value={formData.religion || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zodiac_sign">Cung hoàng đạo</Label>
                <Input
                  id="zodiac_sign"
                  name="zodiac_sign"
                  value={formData.zodiac_sign || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifestyle">Lối sống</Label>
              <Input
                id="lifestyle"
                name="lifestyle"
                value={formData.lifestyle || ""}
                onChange={handleInputChange}
                placeholder="Năng động, yêu thích khám phá, ưa mạo hiểm..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Sở thích (phân cách bằng dấu phẩy)</Label>
              <Input
                id="interests"
                name="interests"
                value={(formData.interests || []).join(", ")}
                onChange={(e) => handleArrayInputChange("interests", e.target.value)}
                placeholder="Du lịch, âm nhạc, đọc sách, nấu ăn..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personality_traits">
                Tính cách (phân cách bằng dấu phẩy)
              </Label>
              <Input
                id="personality_traits"
                name="personality_traits"
                value={(formData.personality_traits || []).join(", ")}
                onChange={(e) =>
                  handleArrayInputChange("personality_traits", e.target.value)
                }
                placeholder="Hướng ngoại, kiên nhẫn, tự tin, sáng tạo..."
              />
            </div>

            {/* Upload ảnh */}
            <div className="space-y-2">
              <Label>Ảnh đại diện (tối đa 5 ảnh)</Label>
              <PhotoUpload 
                userId={userId}
                existingPhotos={formData.photos || []}
                onPhotosChange={handlePhotosChange}
                maxPhotos={5}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 