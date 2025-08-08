// API Route for ranked users following Clean Architecture
import { NextResponse } from "next/server";
import { createClientForServer } from "@/lib/supabase/server";
import { userMatchingService } from "@/services/userMatchingService";

export async function GET() {
  try {
    // Authenticate user
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get ranked users using service
    const rankedUsers = await userMatchingService.getRankedUsers(user.id);

    return NextResponse.json({
      success: true,
      data: rankedUsers,
      count: rankedUsers.length,
    });
  } catch (error) {
    console.error("Error in GET /api/users/ranked:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Authenticate user
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get full matching data including current user, candidates, and ranked users
    const matchingData = await userMatchingService.getUserMatchingData(user.id);

    return NextResponse.json({
      success: true,
      data: matchingData,
    });
  } catch (error) {
    console.error("Error in POST /api/users/ranked:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
