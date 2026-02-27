import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { sanitizeConfig } from '../../../../lib/templateSanitizer';

const TEMPLATES_FILE = path.join(os.homedir(), '.openclaw', '.status', 'shared-templates.json');

interface Template {
  id: string;
  name: string;
  description: string;
  config: any;
  author: string;
  createdAt: number;
  downloads: number;
  tags: string[];
}

interface TemplatesData {
  templates: Template[];
}

async function ensureTemplatesFile(): Promise<void> {
  try {
    await fs.access(TEMPLATES_FILE);
  } catch {
    // File doesn't exist, create it
    const dir = path.dirname(TEMPLATES_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify({ templates: [] }, null, 2));
  }
}

async function loadTemplates(): Promise<TemplatesData> {
  await ensureTemplatesFile();
  const content = await fs.readFile(TEMPLATES_FILE, 'utf-8');
  return JSON.parse(content);
}

async function saveTemplates(data: TemplatesData): Promise<void> {
  await fs.writeFile(TEMPLATES_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description = '', config } = body;

    if (!name || !config) {
      return NextResponse.json(
        { error: 'Missing required fields: name, config' },
        { status: 400 }
      );
    }

    // Sanitize config (remove personal data)
    const sanitized = sanitizeConfig(config);

    // Generate template ID
    const id = generateId();

    // Load existing templates
    const data = await loadTemplates();

    // Create new template
    const template: Template = {
      id,
      name,
      description,
      config: sanitized,
      author: process.env.USER || 'anonymous',
      createdAt: Date.now(),
      downloads: 0,
      tags: [], // TODO: Auto-generate tags from config
    };

    // Add to templates
    data.templates.push(template);

    // Save
    await saveTemplates(data);

    // Return share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://openclawfice.com';
    const shareUrl = `${baseUrl}/templates/${id}`;
    const importCommand = `npx openclawfice import ${id}`;

    return NextResponse.json({
      id,
      url: shareUrl,
      importCommand,
      template,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const data = await loadTemplates();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error loading templates:', error);
    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    );
  }
}
