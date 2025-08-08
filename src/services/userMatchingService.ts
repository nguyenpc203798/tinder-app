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
   */
  async getAllCandidateUsers(currentUserId: string): Promise<UserProfile[]> {
    try {
      const supabase = await createClientForServer();
      
      const { data: users, error } = await supabase
        .from("user_profile")
        .select("*")
        .neq("id", currentUserId) // Loại trừ user hiện tại
        .limit(50); // Giới hạn số lượng để tránh quá tải

      if (error) {
        console.error("Error fetching candidate users:", error);
        return [];
      }

      return users as UserProfile[];
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
        throw new Error("Current user not found");
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
      const [currentUser, candidateUsers, rankedUsers] = await Promise.all([
        this.getCurrentUser(),
        this.getAllCandidateUsers(currentUserId),
        this.getRankedUsers(currentUserId),
      ]);

      return {
        currentUser: currentUser!,
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
