// API Routes for Pass operations
import { NextRequest, NextResponse } from 'next/server';
import { passService } from '@/services/passService';

export async function GET() {
  try {
    const passes = await passService.getPassesSent();
    return NextResponse.json({ 
      success: true, 
      data: passes 
    });
  } catch (error) {
    console.error('Error fetching passes:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch passes' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { receiver_id } = await request.json();
    
    if (!receiver_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Receiver ID is required' 
        },
        { status: 400 }
      );
    }

    const pass = await passService.sendPass(receiver_id);
    return NextResponse.json({ 
      success: true, 
      data: pass 
    });
  } catch (error) {
    console.error('Error sending pass:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send pass' 
      },
      { status: 500 }
    );
  }
}
