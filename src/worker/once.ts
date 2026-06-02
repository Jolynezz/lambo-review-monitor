import { runPipeline } from './pipeline';
import { logger } from '@/lib/logger';

/**
 * 单次运行入口
 * 用于手动触发或测试
 */
async function main() {
  logger.info('=== Single Run Started ===');

  try {
    const result = await runPipeline();
    logger.info(`Result: ${result.scraped} reviews scraped, ${result.alerts} alerts created`);
    if (result.errors.length > 0) {
      logger.warn(`Errors: ${result.errors.join('; ')}`);
    }
  } catch (err) {
    logger.error('Single run failed:', err);
    process.exit(1);
  }

  logger.info('=== Single Run Completed ===');
  process.exit(0);
}

main();
