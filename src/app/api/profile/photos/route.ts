// API route for photo operations
import { NextRequest, NextResponse } from 'next/server';
import { createClientForServer } from '@/lib/supabase/server';
import { profileService } from '@/services/profileService';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('user', user);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('photos') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No photos provided' },
        { status: 400 }
      );
    }

    // Convert File[] to FileList-like object
    const fileList = {
      length: files.length,
      item: (index: number) => files[index],
      [Symbol.iterator]: function* () {
        for (let i = 0; i < files.length; i++) {
          yield files[i];
        }
      }
    } as FileList;

    const result = await profileService.uploadPhotos(user.id, fileList);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      urls: result.urls 
    });
  } catch (error) {
    console.error('Error in POST /api/profile/photos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClientForServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const photoUrl = searchParams.get('url');

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'Photo URL is required' },
        { status: 400 }
      );
    }

    const result = await profileService.deletePhoto(user.id, photoUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/profile/photos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
