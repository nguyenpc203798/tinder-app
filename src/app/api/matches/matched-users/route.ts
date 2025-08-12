// API Route to get matched user IDs
import { NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { matchService } from '@/services/matchService';

export async function GET() {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const matchedUserIds = await matchService.getMatchedUserIds();
    return NextResponse.json({ data: matchedUserIds });
  } catch (error) {
    console.error('Error in GET /api/matches/matched-users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
