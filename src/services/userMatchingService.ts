// User Matching Service following Clean Architecture and SOLID principles
import { createClientForServer } from "@/lib/supabase/server";
import { generateCompatibilityScores } from "@/lib/ai/gemini";
import type {
  UserProfile,
  RankedUser,
  UserMatchingData,
  CompatibilityResult,
} from "@/types/profile";

export interface IUserMatchingService {
  getCurrentUser(): Promise<UserProfile | null>;
  getAllCandidateUsers(currentUserId: string): Promise<UserProfile[]>;
  getRankedUsers(currentUserId: string): Promise<RankedUser[]>;
  getUserMatchingData(currentUserId: string): Promise<UserMatchingData>;
}

export class UserMatchingService implements IUserMatchingService {
  /**
   * Lấy thông tin user hiện tại từ Supabase
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const supabase = await createClientForServer();
      
      // Lấy user hiện tại từ auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error("Error getting current user:", authError);
        return null;
      }

      // Lấy profile từ database
      const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching current user profile:", profileError);
        return null;
      }

      return profile as UserProfile;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return null;
    }
  }

  /**
   * Lấy tất cả user khác (trừ user hiện tại) từ bảng user_profile
   * Lọc ngay tại database: loại bỏ user đã match, đã like, đã pass
   * Ưu tiên người đã like mình trước
   */
  async getAllCandidateUsers(currentUserId: string): Promise<UserProfile[]> {
    try {
      const supabase = await createClientForServer();
      
      // Lấy tất cả user trước, sau đó lọc ở application level để tránh lỗi Supabase
      const { data: allUsers, error } = await supabase
        .from("user_profile")
        .select("*")
        .neq("id", currentUserId) // Loại trừ user hiện tại
        .order("created_at", { ascending: false })
        .limit(50); // Lấy nhiều hơn để có đủ sau khi lọc

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      // Lấy danh sách user đã like, match, pass để lọc
      const [likedUsers, matchedUsers, passedUsers, usersLikedMe, usersPassedMe] = await Promise.all([
        supabase
          .from("likes")
          .select("receiver_id")
          .eq("sender_id", currentUserId),
        supabase
          .from("matches")
          .select("user1_id, user2_id")
          .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`),
        supabase
          .from("passes")
          .select("receiver_id")
          .eq("sender_id", currentUserId),
        supabase
          .from("likes")
          .select("sender_id")
          .eq("receiver_id", currentUserId),
        supabase
          .from("passes")
          .select("sender_id")
          .eq("receiver_id", currentUserId),
      ]);

      // Tạo Set để lọc nhanh
      const likedUserIds = new Set(likedUsers.data?.map(l => l.receiver_id) || []);
      const matchedUserIds = new Set();
      matchedUsers.data?.forEach(m => {
        if (m.user1_id === currentUserId) matchedUserIds.add(m.user2_id);
        if (m.user2_id === currentUserId) matchedUserIds.add(m.user1_id);
      });
      const passedUserIds = new Set(passedUsers.data?.map(p => p.receiver_id) || []);
      const usersLikedMeIds = new Set(usersLikedMe.data?.map(l => l.sender_id) || []);
      const usersPassedMeIds = new Set(usersPassedMe.data?.map(l => l.sender_id) || []);

      // Lọc user chưa like, match, pass và chưa pass mình, thêm trường hasLikedMe
      const filteredUsers = allUsers?.filter(user => 
        !likedUserIds.has(user.id) && 
        !matchedUserIds.has(user.id) && 
        !passedUserIds.has(user.id) &&
        !usersPassedMeIds.has(user.id)
      ).map(user => ({
        ...user,
        hasLikedMe: usersLikedMeIds.has(user.id)
      })).slice(0, 50) || []; // Giới hạn 50 user cuối cùng

      return filteredUsers as UserProfile[];
    } catch (error) {
      console.error("Error in getAllCandidateUsers:", error);
      return [];
    }
  }

  /**
   * Lấy danh sách user đã được xếp hạng bởi AI
   */
  async getRankedUsers(currentUserId: string): Promise<RankedUser[]> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error("Current user not found.");
      }
      
      const candidateUsers = await this.getAllCandidateUsers(currentUserId);

      if (candidateUsers.length === 0) {
        return [];
      }

      // Gọi AI để xếp hạng
      const compatibilityResults = await generateCompatibilityScores(
        currentUser,
        candidateUsers
      );

      // Kết hợp thông tin user với điểm tương thích
      const rankedUsers: RankedUser[] = compatibilityResults
        .map((result: CompatibilityResult) => {
          const user = candidateUsers.find(u => u.id === result.userId);
          if (!user) return null;

          return {
            ...user,
            compatibilityScore: result.score,
            matchPercentage: result.matchPercentage,
            reasons: result.reasons,
          } as RankedUser;
        })
        .filter((user): user is RankedUser => user !== null)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore); // Sắp xếp theo điểm giảm dần

      return rankedUsers;
    } catch (error) {
      console.error("Error in getRankedUsers:", error);
      return [];
    }
  }

  /**
   * Lấy toàn bộ dữ liệu matching (user hiện tại + candidates + ranked)
   */
  async getUserMatchingData(currentUserId: string): Promise<UserMatchingData> {
    try {
      const currentUser = await this.getCurrentUser();
    if (!currentUser) {
      throw new Error("Không tìm thấy người dùng hiện tại.");
    }

    // Kiểm tra xem người dùng đã xác thực thông tin chưa
    if (currentUser.is_verified !== true) {
      throw new Error("Vui lòng cập nhật và xác thực thông tin cá nhân của bạn để sử dụng tính năng này.");
    }

    const [candidateUsers, rankedUsers] = await Promise.all([
        
        this.getAllCandidateUsers(currentUserId),
        this.getRankedUsers(currentUserId),
      ]);

      return {
        currentUser,
        candidateUsers,
        rankedUsers,
      };
    } catch (error) {
      console.error("Error in getUserMatchingData:", error);
      throw error;
    }
  }
}

// Singleton instance
export const userMatchingService = new UserMatchingService();
