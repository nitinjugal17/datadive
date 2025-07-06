import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const serverPassword = process.env.DELETE_PASSWORD;

    if (!serverPassword) {
      // If the password is not set on the server, deny all attempts for security.
      await logError('DELETE_PASSWORD environment variable is not set.');
      return NextResponse.json({ success: false, error: 'Server configuration error.' }, { status: 500 });
    }

    if (password === serverPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    await logError('Error verifying delete password', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
