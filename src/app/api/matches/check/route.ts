// API Route to check if a like resulted in a match
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();
    
    if (!user_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User ID is required' 
        },
        { status: 400 }
      );
    }

    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not authenticated' 
        },
        { status: 401 }
      );
    }

    // Check if the other user has already liked us
    const { data: existingLike, error: likeError } = await supabase
      .from('likes')
      .select('*')
      .eq('sender_id', user_id)
      .eq('receiver_id', user.id)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check match status' 
        },
        { status: 500 }
      );
    }

    if (existingLike) {
      // It's a match! Create match record
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: user_id,
          matched_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (matchError) {
        console.error('Error creating match:', matchError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create match' 
          },
          { status: 500 }
        );
      }

      // Create notifications for both users
      const notifications = [
        {
          user_id: user.id,
          type: 'match',
          data: { with: user_id, match_id: match.id },
          created_at: new Date().toISOString(),
        },
        {
          user_id: user_id,
          type: 'match',
          data: { with: user.id, match_id: match.id },
          created_at: new Date().toISOString(),
        }
      ];

      await supabase.from('notifications').insert(notifications);

      return NextResponse.json({ 
        success: true, 
        data: {
          isMatch: true,
          match: match
        }
      });
    } else {
      // Not a match, just a like
      return NextResponse.json({ 
        success: true, 
        data: {
          isMatch: false
        }
      });
    }
  } catch (error) {
    console.error('Error checking match:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check match' 
      },
      { status: 500 }
    );
  }
}
