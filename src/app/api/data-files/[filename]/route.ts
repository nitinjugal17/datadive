
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import mime from 'mime-types';
import { logError } from '@/lib/logger';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function GET(
    request: Request,
    { params }: { params: { filename: string } }
) {
    try {
        const filePath = path.join(UPLOADS_DIR, params.filename);
        
        // Security check: ensure the path is within the uploads directory and doesn't contain path traversal characters
        if (path.dirname(filePath) !== UPLOADS_DIR || params.filename.includes('..')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const fileBuffer = await fs.readFile(filePath);
        const mimeType = mime.lookup(params.filename) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${params.filename}"`,
            },
        });
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return NextResponse.json({ message: 'File not found' }, { status: 404 });
        }
        await logError('Failed to read file:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
