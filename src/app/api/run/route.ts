import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { runPipeline } from '@/worker/pipeline';

export async function POST() {
  try {
    logger.info('Manual scrape triggered via API');
    const result = await runPipeline();
    return NextResponse.json({
      message: `抓取完成: ${result.scraped} 条评论, ${result.alerts} 条新告警`,
      ...result,
    });
  } catch (err) {
    logger.error('Manual scrape failed:', err);
    return NextResponse.json(
      { error: '抓取失败: ' + (err as Error).message },
      { status: 500 }
    );
  }
}
