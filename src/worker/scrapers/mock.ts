import { Scraper, ScraperResult, ScrapedReview } from './types';
import { logger } from '@/lib/logger';

export class MockScraper implements Scraper {
  platform = 'mock';

  async scrape(accountId: string): Promise<ScraperResult> {
    logger.info(`[MockScraper] Scraping for account: ${accountId}`);

    // 生成随机评论用于测试
    const mockReviews: ScrapedReview[] = [
      {
        externalId: `mock-${Date.now()}-001`,
        rating: 2.0,
        ratingScale: 5,
        reviewerName: '测试用户A',
        content: '房间隔音很差，设施老旧，和描述完全不符。前台态度也不好。',
        roomType: '豪华大床房',
        stayDate: '2024-05-25',
        replyStatus: 'none',
      },
      {
        externalId: `mock-${Date.now()}-002`,
        rating: 4.5,
        ratingScale: 5,
        reviewerName: '测试用户B',
        content: '整体还不错，位置好，服务态度也好。早餐种类丰富。',
        roomType: '行政大床房',
        stayDate: '2024-05-26',
        replyStatus: 'replied',
      },
      {
        externalId: `mock-${Date.now()}-003`,
        rating: 1.5,
        ratingScale: 5,
        reviewerName: '测试用户C',
        content: '最差体验！空调坏了报修没人来，卫生间有异味，床单上有污渍。完全不值这个价格，强烈不推荐。',
        roomType: '标准双床房',
        stayDate: '2024-05-27',
        replyStatus: 'none',
      },
    ];

    return {
      platform: 'mock',
      reviews: mockReviews,
      success: true,
    };
  }
}
