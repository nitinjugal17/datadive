
import { NextResponse } from 'next/server';
import { readTemplates, writeTemplates } from '@/lib/template-db';
import type { Template } from '@/lib/types';
import { logError, logInfo } from '@/lib/logger';

export async function GET() {
  try {
    const templates = await readTemplates();
    return NextResponse.json(templates);
  } catch (error) {
    await logError('Failed to read templates', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newTemplate: Template = await request.json();
    if (!newTemplate.name || !newTemplate.id) {
        return NextResponse.json({ message: 'Bad Request: Missing name or id' }, { status: 400 });
    }
    
    const templates = await readTemplates();
    
    if (templates.some(t => t.id === newTemplate.id)) {
        newTemplate.id = `template-${Date.now()}`;
    }

    templates.push(newTemplate);
    await writeTemplates(templates);
    
    await logInfo(`Template created: ${newTemplate.id} - ${newTemplate.name}`);
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    await logError('Failed to create template', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
