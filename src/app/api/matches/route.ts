// API Routes for Match operations
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { matchService } from '@/services/matchService';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');

    if (matchId) {
      // Get specific match
      const match = await matchService.getMatchById(matchId);
      if (!match) {
        return NextResponse.json({ error: 'Match not found' }, { status: 404 });
      }
      return NextResponse.json({ data: match });
    } else {
      // Get all matches
      const matches = await matchService.getMatches();
      return NextResponse.json({ data: matches });
    }
  } catch (error) {
    console.error('Error in GET /api/matches:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
