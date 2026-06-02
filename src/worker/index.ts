import cron from 'node-cron';
import { runPipeline } from './pipeline';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

/**
 * 定时 Worker 入口
 * 使用 node-cron 定时执行抓取管道
 */
async function main() {
  logger.info('=== Worker Started ===');
  logger.info(`Scraper type: ${config.scraper}`);
  logger.info(`Cron schedule: ${config.scrapeCron}`);

  // 验证 cron 表达式
  if (!cron.validate(config.scrapeCron)) {
    logger.error(`Invalid cron expression: ${config.scrapeCron}`);
    process.exit(1);
  }

  // 启动时立即执行一次
  logger.info('Running initial pipeline...');
  try {
    const result = await runPipeline();
    logger.info(`Initial run: ${result.scraped} reviews, ${result.alerts} alerts`);
  } catch (err) {
    logger.error('Initial run failed:', err);
  }

  // 定时执行
  cron.schedule(config.scrapeCron, async () => {
    logger.info('Scheduled pipeline triggered');
    try {
      const result = await runPipeline();
      logger.info(`Scheduled run: ${result.scraped} reviews, ${result.alerts} alerts`);
    } catch (err) {
      logger.error('Scheduled run failed:', err);
    }
  });

  logger.info('Worker is running. Press Ctrl+C to stop.');

  // 保持进程运行
  process.on('SIGINT', () => {
    logger.info('Worker shutting down...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Worker shutting down...');
    process.exit(0);
  });
}

main().catch((err) => {
  logger.error('Worker failed to start:', err);
  process.exit(1);
});
