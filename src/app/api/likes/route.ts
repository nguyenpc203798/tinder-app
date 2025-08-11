// API Routes for Like operations
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { likeService } from '@/services/likeService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'received' | 'sent' | 'who-liked-me'

    let result;
    switch (type) {
      case 'received':
        result = await likeService.getLikesReceived();
        break;
      case 'sent':
        result = await likeService.getLikesSent();
        break;
      case 'who-liked-me':
        result = await likeService.getUsersWhoLikedMe();
        break;
      default:
        // Get both received and sent
        const [received, sent] = await Promise.all([
          likeService.getLikesReceived(),
          likeService.getLikesSent()
        ]);
        result = { received, sent };
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in GET /api/likes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiver_id } = await request.json();

    if (!receiver_id) {
      return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 });
    }

    if (receiver_id === user.id) {
      return NextResponse.json({ error: 'Cannot like yourself' }, { status: 400 });
    }

    const like = await likeService.sendLike(receiver_id);

    return NextResponse.json({ data: like }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/likes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiver_id } = await request.json();

    if (!receiver_id) {
      return NextResponse.json({ error: 'receiver_id is required' }, { status: 400 });
    }

    await likeService.removeLike(receiver_id);

    return NextResponse.json({ message: 'Like removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/likes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
