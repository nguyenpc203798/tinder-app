import { CompatibilityResult, UserProfile } from "@/types/profile";

// Hàm gọi Gemini API để phân tích tương thích giữa users
// Hàm chia mảng thành các batch nhỏ
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function generateCompatibilityScores(
  currentUser: UserProfile,
  candidateUsers: UserProfile[]
): Promise<CompatibilityResult[]> {
  try {
    const batchSize = 2;
    const batches = chunkArray(candidateUsers, batchSize);
    let allResults: CompatibilityResult[] = [];

    for (const batch of batches) {
      const prompt = generateBatchCompatibilityPrompt(currentUser, batch);
      // DEBUG: Log ra GEMINI_API_KEY
      // console.log("prompt", prompt)

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
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
      // console.log("datagemini", data)
      if (!response.ok) {
        console.error("Gemini API error:", data);
        throw new Error("Failed to generate compatibility scores");
      }
      // Đảm bảo có candidates và text
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error("Gemini API response format unexpected:", JSON.stringify(data));
        continue;
      }
      const text = data.candidates[0].content.parts[0].text;
      // Parse JSON từ response text
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      if (jsonStart === -1 || jsonEnd === 0) {
        console.error("Không tìm thấy JSON array trong Gemini response:", text);
        continue;
      }
      const jsonStr = text.substring(jsonStart, jsonEnd);
      let results: CompatibilityResult[] = [];
      try {
        results = JSON.parse(jsonStr) as CompatibilityResult[];
      } catch (e) {
        console.error("Lỗi parse JSON từ Gemini:", e, jsonStr);
        continue;
      }
      allResults = allResults.concat(results);
      // console.log("allResults", allResults)
    }
    return allResults;
  } catch (error) {
    console.error("Error generating compatibility scores:", error);
    // Fallback: Tạo điểm số ngẫu nhiên nếu API lỗi
    return candidateUsers.map((user) => ({
      userId: user.id || '',
      score: Math.floor(Math.random() * 100),
      reasons: ["Generated fallback score due to API error"],
      matchPercentage: Math.floor(Math.random() * 100),
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
  - Học vấn: ${currentUser.education || "Không có thông tin"}
  - Nghề nghiệp: ${currentUser.job_title || "Không có thông tin"}
  - Chiều cao (cm): ${currentUser.height_cm || "Không có thông tin"}
  - Cân nặng (kg): ${currentUser.weight_kg || "Không có thông tin"}
  - Khoảng tuổi mong muốn: ${currentUser.age_range ? `${currentUser.age_range[0]}-${currentUser.age_range[1]}` : "Không có thông tin"}
  - Khoảng cách tối đa (km): ${currentUser.distance || "Không có thông tin"}
  - Đã xác thực: ${typeof currentUser.is_verified === "boolean" ? (currentUser.is_verified ? "Có" : "Không") : "Không có thông tin"}

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
  - Học vấn: ${user.education || "Không có thông tin"}
  - Nghề nghiệp: ${user.job_title || "Không có thông tin"}
  - Chiều cao (cm): ${user.height_cm || "Không có thông tin"}
  - Cân nặng (kg): ${user.weight_kg || "Không có thông tin"}
  - Khoảng tuổi mong muốn: ${user.age_range ? `${user.age_range[0]}-${user.age_range[1]}` : "Không có thông tin"}
  - Khoảng cách tối đa (km): ${user.distance || "Không có thông tin"}
  - Đã xác thực: ${typeof user.is_verified === "boolean" ? (user.is_verified ? "Có" : "Không") : "Không có thông tin"}
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
    {
      "userId": "uuid", 
      "score": 85, 
      "reasons": ["High location proximity", "60% interest overlap", "Similar lifestyle"], 
      "matchPercentage": 85
    },
    {
      "userId": "uuid", 
      "score": 72, 
      "reasons": ["Good lifestyle match", "Similar education level"], 
      "matchPercentage": 72
    },
    ...
  ]
  
  Sắp xếp từ cao đến thấp theo compatibility score (0-100).
  `;
} 