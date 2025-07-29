import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { generateCompatibilityScores } from "@/src/lib/ai/gemini";
import { UserProfile } from "@/src/types";

interface Candidate {
  id: string;
  distance_km: number;
  is_same_location: boolean;
}

export async function POST(request: Request) {
  try {
    // Lấy ID user từ request
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Thiếu ID người dùng" },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    
    // Kiểm tra phiên đăng nhập và quyền truy cập
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 401 }
      );
    }
    
    // Chỉ cho phép người dùng tạo ranking cho chính họ hoặc admin
    const { data: userProfile } = await supabase
      .from("user_profile")
      .select("role")
      .eq("id", session.session.user.id)
      .single();
      
    if (
      session.session.user.id !== userId &&
      userProfile?.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Không có quyền truy cập" },
        { status: 403 }
      );
    }
    
    // Kiểm tra xem đã có ranking gần đây chưa (24h)
    const { data: existingRankings, error: rankingError } = await supabase
      .from("user_rankings")
      .select("id, expires_at")
      .eq("user_id", userId)
      .gt("expires_at", new Date().toISOString())
      .limit(1);
      
    if (rankingError) {
      console.error("Error checking existing rankings:", rankingError);
      return NextResponse.json(
        { error: "Lỗi khi kiểm tra ranking hiện tại" },
        { status: 500 }
      );
    }
    
    // Nếu đã có ranking gần đây, trả về nó
    if (existingRankings && existingRankings.length > 0) {
      return NextResponse.json({
        message: "Đã có ranking gần đây",
        expiresAt: existingRankings[0].expires_at,
      });
    }
    
    // Gọi function PostgreSQL để lấy 50 users phù hợp nhất về vị trí
    const { data: candidates, error: candidatesError } = await supabase
      .rpc("get_location_based_candidates", { 
        p_user_id: userId, 
        p_limit: 50 
      });
    
    if (candidatesError) {
      console.error("Error selecting candidates:", candidatesError);
      return NextResponse.json(
        { error: "Lỗi khi chọn ứng viên dựa trên vị trí" },
        { status: 500 }
      );
    }
    
    if (!candidates || candidates.length === 0) {
      return NextResponse.json(
        { error: "Không tìm thấy ứng viên phù hợp" },
        { status: 404 }
      );
    }
    
    // Lấy thông tin chi tiết của người dùng hiện tại và các ứng viên
    const { data: currentUser } = await supabase
      .from("user_profile")
      .select("*")
      .eq("id", userId)
      .single();
      
    const candidateIds = candidates.map((c: Candidate) => c.id);
    
    const { data: candidateProfiles } = await supabase
      .from("user_profile")
      .select("*")
      .in("id", candidateIds);
      
    if (!currentUser || !candidateProfiles) {
      return NextResponse.json(
        { error: "Không thể lấy thông tin người dùng" },
        { status: 500 }
      );
    }
    
    // Gọi Gemini API để tính điểm compatibility
    const compatibilityResults = await generateCompatibilityScores(
      currentUser as UserProfile,
      candidateProfiles as UserProfile[]
    );
    
    // Kết hợp kết quả với thông tin khoảng cách
    const rankings = compatibilityResults.map((result, index) => {
      const candidateInfo = candidates.find((c: Candidate) => c.id === result.user_id);
      return {
        user_id: userId,
        target_user_id: result.user_id,
        compatibility_score: result.score,
        ranking_position: index + 1,
        distance_km: candidateInfo?.distance_km || 0,
        is_same_location: candidateInfo?.is_same_location || false,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 giờ từ bây giờ
      };
    });
    
    // Lưu kết quả vào database
    // 1. Xóa các ranking cũ
    await supabase.from("user_rankings").delete().eq("user_id", userId);
    
    // 2. Thêm các ranking mới
    const { error: insertError } = await supabase
      .from("user_rankings")
      .insert(rankings);
      
    if (insertError) {
      console.error("Error inserting rankings:", insertError);
      return NextResponse.json(
        { error: "Lỗi khi lưu ranking" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: "Tạo ranking thành công",
      count: rankings.length,
    });
  } catch (error) {
    console.error("Error generating rankings:", error);
    return NextResponse.json(
      { error: "Lỗi khi tạo ranking" },
      { status: 500 }
    );
  }
} 