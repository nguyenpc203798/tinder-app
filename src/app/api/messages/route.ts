// API Routes for Message operations
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { messageService } from '@/services/messageService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('match_id');
    const countOnly = searchParams.get('count') === 'true';
    const latest = searchParams.get('latest') === 'true';

    if (latest) {
      // Get latest messages for all matches
      const latestMessages = await messageService.getLatestMessages();
      return NextResponse.json({ data: latestMessages });
    }

    if (countOnly) {
      if (matchId) {
        const count = await messageService.getUnreadMessageCount(matchId);
        return NextResponse.json({ data: { count } });
      } else {
        const count = await messageService.getTotalUnreadMessageCount();
        return NextResponse.json({ data: { count } });
      }
    }

    if (!matchId) {
      return NextResponse.json({ error: 'match_id is required' }, { status: 400 });
    }

    const messages = await messageService.getMessages(matchId);
    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('Error in GET /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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

    const { match_id, content, message_type = 'text' } = await request.json();

    if (!match_id || !content) {
      return NextResponse.json(
        { error: 'match_id and content are required' },
        { status: 400 }
      );
    }

    const message = await messageService.sendMessage(match_id, content, message_type);

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_id, match_id, mark_all_read } = await request.json();

    if (mark_all_read && match_id) {
      await messageService.markMatchMessagesAsRead(match_id);
      return NextResponse.json({ message: 'All messages in match marked as read' });
    }

    if (!message_id) {
      return NextResponse.json({ error: 'message_id is required' }, { status: 400 });
    }

    await messageService.markAsRead(message_id);
    return NextResponse.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error in PATCH /api/messages:', error);
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

    const { message_id } = await request.json();

    if (!message_id) {
      return NextResponse.json({ error: 'message_id is required' }, { status: 400 });
    }

    await messageService.deleteMessage(message_id);
    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/messages:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
