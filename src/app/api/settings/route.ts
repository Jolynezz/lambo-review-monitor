import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json(settingsMap);
  } catch (err) {
    logger.error('Get settings failed:', err);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Upsert all settings
    const entries = Object.entries(body) as [string, string][];
    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    logger.info(`Settings updated: ${entries.map(([k]) => k).join(', ')}`);

    return NextResponse.json({ message: '设置已保存' });
  } catch (err) {
    logger.error('Save settings failed:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
