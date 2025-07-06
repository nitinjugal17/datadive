
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { logError, logInfo } from '@/lib/logger';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

async function ensureUploadsDirExists() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    await ensureUploadsDirExists();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    // Create a unique filename to avoid collisions
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);

    await fs.writeFile(filePath, fileBuffer);

    await logInfo(`File uploaded successfully: ${uniqueFilename}`);
    return NextResponse.json({ success: true, filePath: uniqueFilename }, { status: 201 });
  } catch (error) {
    await logError('File upload error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
