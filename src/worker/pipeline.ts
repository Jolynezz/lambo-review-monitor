import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getScraper } from './scrapers';
import { detectNegativeReview } from './detect/rules';
import { sendAlertEmail } from './notify/email';

export interface PipelineResult {
  scraped: number;
  alerts: number;
  errors: string[];
}

export async function runPipeline(): Promise<PipelineResult> {
  const result: PipelineResult = { scraped: 0, alerts: 0, errors: [] };

  try {
    // 获取所有已登录的账号
    const accounts = await prisma.account.findMany({
      where: { sessionStatus: 'logged_in' },
    });

    if (accounts.length === 0) {
      logger.info('No logged-in accounts found, skipping pipeline');
      return result;
    }

    for (const account of accounts) {
      try {
        logger.info(`Processing account: ${account.label} (${account.platform})`);

        // 1. 抓取评论
        const scraper = getScraper(account.platform);
        const scraperResult = await scraper.scrape(account.id);

        if (!scraperResult.success) {
          result.errors.push(`${account.label}: ${scraperResult.error || 'Unknown error'}`);
          continue;
        }

        // 2. 保存评论并检测差评
        for (const reviewData of scraperResult.reviews) {
          // 检查是否已存在
          const existing = await prisma.review.findUnique({
            where: { externalId: reviewData.externalId },
          });

          if (existing) {
            logger.debug(`Review already exists: ${reviewData.externalId}`);
            continue;
          }

          // 保存评论
          const review = await prisma.review.create({
            data: {
              platform: scraperResult.platform,
              externalId: reviewData.externalId,
              rating: reviewData.rating,
              ratingScale: reviewData.ratingScale,
              reviewerName: reviewData.reviewerName,
              content: reviewData.content,
              roomType: reviewData.roomType,
              province: reviewData.province || '',
              stayDate: reviewData.stayDate,
              replyStatus: reviewData.replyStatus,
              accountId: account.id,
            },
          });

          result.scraped++;

          // 3. 差评检测
          const detection = await detectNegativeReview(reviewData);

          if (detection.isNegative) {
            // 创建告警
            const alert = await prisma.alert.create({
              data: {
                status: 'pending',
                reasons: JSON.stringify(detection.reasons),
                matchedKeywords: JSON.stringify(detection.matchedKeywords),
                reviewId: review.id,
              },
            });

            result.alerts++;

            // 4. 发送通知
            try {
              await sendAlertEmail({
                reviewId: review.id,
                platform: review.platform,
                rating: review.rating,
                reviewerName: review.reviewerName,
                content: review.content,
                reasons: detection.reasons,
                matchedKeywords: detection.matchedKeywords,
              });

              await prisma.alert.update({
                where: { id: alert.id },
                data: { notifiedAt: new Date() },
              });
            } catch (notifyErr) {
              logger.error('Failed to send notification:', notifyErr);
            }
          }
        }

        // 更新账号最后抓取时间
        await prisma.account.update({
          where: { id: account.id },
          data: { lastScrapeAt: new Date() },
        });

      } catch (err) {
        const errorMsg = `${account.label}: ${(err as Error).message}`;
        logger.error(`Pipeline error for ${account.label}:`, err);
        result.errors.push(errorMsg);
      }
    }
  } catch (err) {
    logger.error('Pipeline failed:', err);
    result.errors.push((err as Error).message);
  }

  logger.info(`Pipeline completed: ${result.scraped} scraped, ${result.alerts} alerts`);
  return result;
}
