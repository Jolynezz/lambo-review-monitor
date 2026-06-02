import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    let body: { alertId?: string; status?: string };
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = {
        alertId: formData.get('alertId') as string,
        status: formData.get('status') as string,
      };
    }

    const { alertId, status } = body;

    if (!alertId || !status) {
      return NextResponse.json(
        { error: 'alertId and status are required' },
        { status: 400 }
      );
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status,
        handledAt: status === 'handled' ? new Date() : undefined,
      },
    });

    logger.info(`Alert ${alertId} marked as ${status}`);

    return NextResponse.json({ message: `已标记为${status === 'handled' ? '已处理' : status === 'dismissed' ? '已忽略' : status}` });
  } catch (err) {
    logger.error('Mark failed:', err);
    return NextResponse.json({ error: 'Mark failed' }, { status: 500 });
  }
}
