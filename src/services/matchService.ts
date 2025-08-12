// Match Service - Handles match operations following Clean Architecture
import { createClientForServer } from "@/lib/supabase/server";
import type { Match, MatchWithProfiles, IMatchService } from "@/types/tinder";

export class MatchService implements IMatchService {
  async getMatches(): Promise<MatchWithProfiles[]> {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from("matches")
      .select(
        `*, user1_profile:user_profile!matches_user1_id_fkey(id, name, photos, age), user2_profile:user_profile!matches_user2_id_fkey(id, name, photos, age)`
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("matched_at", { ascending: false });
    if (error) throw new Error(`Failed to get matches: ${error.message}`);
    return data || [];
  }

  async getMatchById(matchId: string): Promise<MatchWithProfiles | null> {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from("matches")
      .select(
        `*, user1_profile:user_profile!matches_user1_id_fkey(id, name, photos, age), user2_profile:user_profile!matches_user2_id_fkey(id, name, photos, age)`
      )
      .eq("id", matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to get match: ${error.message}`);
    }
    return data;
  }

  async checkMatch(userId1: string, userId2: string): Promise<Match | null> {
    const supabase = await createClientForServer();
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .or(
        `and(user1_id.eq.${userId1},user2_id.eq.${userId2}),and(user1_id.eq.${userId2},user2_id.eq.${userId1})`
      )
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Failed to check match: ${error.message}`);
    }
    return data;
  }

  // Get match partner info
  async getMatchPartner(
    matchId: string
  ): Promise<{ id: string; name: string; photos: string[]; age: number } | null> {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const match = await this.getMatchById(matchId);
    if (!match) return null;

    // Return the other user's profile
    if (match.user1_id === user.id) {
      return match.user2_profile || null;
    } else {
      return match.user1_profile || null;
    }
  }

  // Get recent matches for notifications
  async getRecentMatches(limit: number = 10): Promise<MatchWithProfiles[]> {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    const { data, error } = await supabase
      .from("matches")
      .select(
        `*, user1_profile:user_profile!matches_user1_id_fkey(id, name, photos, age), user2_profile:user_profile!matches_user2_id_fkey(id, name, photos, age)`
      )
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("matched_at", { ascending: false })
      .limit(limit);
    if (error)
      throw new Error(`Failed to get recent matches: ${error.message}`);
    return data || [];
  }

  // Get list of user IDs that current user has already matched with
  async getMatchedUserIds(): Promise<string[]> {
    const supabase = await createClientForServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("matches")
      .select("user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (error) throw new Error(`Failed to get matched user IDs: ${error.message}`);
    
    // Extract the other user's ID from each match
    const matchedUserIds = (data || []).map((match: { user1_id: string; user2_id: string }) => {
      return match.user1_id === user.id ? match.user2_id : match.user1_id;
    });

    return matchedUserIds;
  }

  // Subscribe to new matches (realtime)
  subscribeToMatches(callback: (match: Match) => void): () => void {
    (async () => {
      const supabase = await createClientForServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const subscription = supabase
        .channel("matches")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "matches",
            filter: `user1_id=eq.${user?.id},user2_id=eq.${user?.id}`,
          },
          (payload) => {
            callback(payload.new as Match);
          }
        )
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    })();
    return () => {};
  }
}

// Singleton instance
export const matchService = new MatchService();
