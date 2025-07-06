
import { NextResponse } from 'next/server';
import { readTemplates, writeTemplates } from '@/lib/template-db';
import { logError, logInfo } from '@/lib/logger';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const templates = await readTemplates();
        const template = templates.find(t => t.id === params.id);
        if (template) {
            return NextResponse.json(template);
        } else {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }
    } catch (error) {
        await logError(`Failed to read template with id: ${params.id}`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id:string } }
) {
    try {
        const updatedData = await request.json();
        let templates = await readTemplates();
        const templateIndex = templates.findIndex(t => t.id === params.id);

        if (templateIndex === -1) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        const updatedTemplate = { ...templates[templateIndex], ...updatedData };
        templates[templateIndex] = updatedTemplate;
        
        await writeTemplates(templates);
        await logInfo(`Template updated: ${updatedTemplate.id}`);
        return NextResponse.json(updatedTemplate);
    } catch (error) {
        await logError(`Failed to update template with id: ${params.id}`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const serverPassword = process.env.DELETE_PASSWORD;
        if (!serverPassword) {
            await logError('DELETE_PASSWORD environment variable is not set.');
            return NextResponse.json({ message: 'Server configuration error.' }, { status: 500 });
        }

        const authHeader = request.headers.get('Authorization');
        const userPassword = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

        if (userPassword !== serverPassword) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        let templates = await readTemplates();
        const initialLength = templates.length;
        templates = templates.filter(t => t.id !== params.id);

        if (templates.length === initialLength) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }

        await writeTemplates(templates);
        await logInfo(`Template deleted: ${params.id}`);
        return NextResponse.json({ message: 'Template deleted' }, { status: 200 });

    } catch (error) {
        await logError(`Failed to delete template with id: ${params.id}`, error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
