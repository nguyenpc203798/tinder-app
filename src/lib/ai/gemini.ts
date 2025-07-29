import { CompatibilityResult, UserProfile } from "@/src/types";

// Hàm gọi Gemini API để phân tích tương thích giữa users
export async function generateCompatibilityScores(
  currentUser: UserProfile,
  candidateUsers: UserProfile[]
): Promise<CompatibilityResult[]> {
  try {
    const prompt = generateBatchCompatibilityPrompt(currentUser, candidateUsers);
    
    const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error("Failed to generate compatibility scores");
    }
    
    const text = data.candidates[0].content.parts[0].text;
    
    // Parse JSON từ response text
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    const jsonStr = text.substring(jsonStart, jsonEnd);
    
    const results = JSON.parse(jsonStr) as CompatibilityResult[];
    return results;
  } catch (error) {
    console.error("Error generating compatibility scores:", error);
    
    // Fallback: Tạo điểm số ngẫu nhiên nếu API lỗi
    return candidateUsers.map((user) => ({
      user_id: user.id,
      score: Math.floor(Math.random() * 100),
      reason: "Generated fallback score due to API error",
    }));
  }
}

// Tạo prompt cho Gemini dựa trên thông tin user và danh sách ứng viên
function generateBatchCompatibilityPrompt(
  currentUser: UserProfile,
  candidateUsers: UserProfile[]
): string {
  return `
  Phân tích độ tương thích của User A với ${candidateUsers.length} ứng viên tiềm năng:
  
  User A (người tìm kiếm):
  - ID: ${currentUser.id}
  - Tuổi: ${currentUser.age || "Không có thông tin"}
  - Giới tính: ${currentUser.gender || "Không có thông tin"}
  - Vị trí: ${currentUser.location || "Không có thông tin"}
  - Sở thích: ${currentUser.interests?.join(", ") || "Không có thông tin"}
  - Tính cách: ${currentUser.personality_traits?.join(", ") || "Không có thông tin"}
  - Học vấn: ${currentUser.education_level || "Không có thông tin"}
  - Nghề nghiệp: ${currentUser.job_title || "Không có thông tin"}
  - Tôn giáo: ${currentUser.religion || "Không có thông tin"}
  - Lối sống: ${currentUser.lifestyle || "Không có thông tin"}
  - Thói quen: ${JSON.stringify(currentUser.habits || {})}
  
  ${candidateUsers.length} Ứng viên:
  ${candidateUsers
    .map(
      (user, index) => `
  User ${index + 1}:
  - ID: ${user.id}
  - Tuổi: ${user.age || "Không có thông tin"}
  - Giới tính: ${user.gender || "Không có thông tin"}
  - Vị trí: ${user.location || "Không có thông tin"}
  - Sở thích: ${user.interests?.join(", ") || "Không có thông tin"}
  - Tính cách: ${user.personality_traits?.join(", ") || "Không có thông tin"}
  - Học vấn: ${user.education_level || "Không có thông tin"}
  - Nghề nghiệp: ${user.job_title || "Không có thông tin"}
  - Tôn giáo: ${user.religion || "Không có thông tin"}
  - Lối sống: ${user.lifestyle || "Không có thông tin"}
  `
    )
    .join("\n")}
  
  Tiêu chí đánh giá (theo thứ tự ưu tiên):
  1. **Location Bonus** (30%): Cùng khu vực +20 điểm, <10km +10 điểm
  2. **Interest Overlap** (25%): Số sở thích chung / tổng sở thích
  3. **Age Compatibility** (15%): Khoảng cách tuổi hợp lý
  4. **Lifestyle Match** (15%): Compatibility về lối sống
  5. **Education Level** (10%): Tương đương học vấn
  6. **Personality Traits** (5%): Tính cách bổ trợ/tương đồng
  
  Trả về JSON array với format:
  [
    {"user_id": "uuid", "score": 85, "reason": "High location proximity + 60% interest overlap"},
    {"user_id": "uuid", "score": 72, "reason": "Good lifestyle match + similar education"},
    ...
  ]
  
  Sắp xếp từ cao đến thấp theo compatibility score (0-100).
  `;
} 