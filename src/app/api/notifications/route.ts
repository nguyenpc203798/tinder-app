// API Routes for Notification operations
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { notificationService } from '@/services/notificationService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'like' | 'match' | 'message' | null;
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      const count = await notificationService.getUnreadCount();
      return NextResponse.json({ data: { count } });
    }

    let notifications;
    if (type) {
      notifications = await notificationService.getNotificationsByType(type);
    } else {
      notifications = await notificationService.getNotifications();
    }

    return NextResponse.json({ data: notifications });
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
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

    const { notification_id, mark_all } = await request.json();

    if (mark_all) {
      await notificationService.markAllAsRead();
      return NextResponse.json({ message: 'All notifications marked as read' });
    }

    if (!notification_id) {
      return NextResponse.json({ error: 'notification_id is required' }, { status: 400 });
    }

    await notificationService.markAsRead(notification_id);
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error in PATCH /api/notifications:', error);
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

    const { notification_id } = await request.json();

    if (!notification_id) {
      return NextResponse.json({ error: 'notification_id is required' }, { status: 400 });
    }

    await notificationService.deleteNotification(notification_id);
    return NextResponse.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/notifications:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
