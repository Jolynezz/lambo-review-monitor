import { BaseScraper } from './base';
import { ScraperResult, Review } from './types';
import { logger } from '@/lib/logger';

export class CtripScraper extends BaseScraper {
  platform = 'ctrip';
  private hotelId = '133340392'; // 成都托尼洛兰博基尼酒店

  async scrape(accountId: string): Promise<ScraperResult> {
    logger.info(`[CtripScraper] Starting scrape for account: ${accountId}, hotel: ${this.hotelId}`);

    const reviews: Review[] = [];

    try {
      const context = await this.launchWithContext(accountId);
      const page = context.pages()[0] || await context.newPage();

      // 导航到酒店评论页面
      const reviewsUrl = `https://hotels.ctrip.com/hotels/detail/?hotelId=${this.hotelId}`;
      logger.info(`[CtripScraper] Navigating to: ${reviewsUrl}`);

      await page.goto(reviewsUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      // 等待页面加载
      await page.waitForTimeout(5000);

      // 检查是否被重定向到登录页
      const url = page.url();
      const title = await page.title();
      logger.info(`[CtripScraper] Page loaded - Title: "${title}", URL: ${url}`);

      if (url.includes('login') || url.includes('passport')) {
        logger.warn('[CtripScraper] Redirected to login page - cookies may be invalid');
        await this.closeContext(context);
        return {
          platform: 'ctrip',
          reviews: [],
          success: false,
          error: '被重定向到登录页面，Cookies可能已失效，请重新导入',
        };
      }

      // 点击"点评"标签切换到评论区域
      try {
        const reviewTab = await page.$('[data-testid="hotel-detail-review-tab"]');
        if (reviewTab) {
          await reviewTab.click();
          await page.waitForTimeout(3000);
        }
      } catch {}

      // 尝试多种选择器获取评论
      const reviewSelectors = [
        '.review-item',
        '[data-testid="review-item"]',
        '.comment-item',
        '.hotel-review-item',
        '.review-list .item',
      ];

      let reviewElements: any[] = [];
      for (const selector of reviewSelectors) {
        reviewElements = await page.$$(selector);
        if (reviewElements.length > 0) {
          logger.info(`[CtripScraper] Found ${reviewElements.length} reviews with selector: ${selector}`);
          break;
        }
      }

      // 如果找不到评论元素，尝试滚动加载
      if (reviewElements.length === 0) {
        logger.info('[CtripScraper] No reviews found initially, trying to scroll...');
        for (let i = 0; i < 3; i++) {
          await page.evaluate(() => window.scrollBy(0, 800));
          await page.waitForTimeout(2000);
        }

        // 再次尝试获取评论
        for (const selector of reviewSelectors) {
          reviewElements = await page.$$(selector);
          if (reviewElements.length > 0) {
            logger.info(`[CtripScraper] Found ${reviewElements.length} reviews after scroll`);
            break;
          }
        }
      }

      // 解析评论数据
      for (let i = 0; i < Math.min(reviewElements.length, 20); i++) {
        try {
          const el = reviewElements[i];
          const review = await this.parseReviewElement(el, page);
          if (review) {
            reviews.push(review);
          }
        } catch (err) {
          logger.warn(`[CtripScraper] Failed to parse review ${i}:`, err);
        }
      }

      // 如果没有解析到评论，尝试通过 API 获取
      if (reviews.length === 0) {
        logger.info('[CtripScraper] Trying to fetch reviews via API...');
        const apiReviews = await this.fetchReviewsViaAPI(page);
        reviews.push(...apiReviews);
      }

      logger.info(`[CtripScraper] Scraped ${reviews.length} reviews`);

      await this.closeContext(context);

      return {
        platform: 'ctrip',
        reviews,
        success: true,
      };
    } catch (err) {
      logger.error('[CtripScraper] Scrape failed:', err);
      return {
        platform: 'ctrip',
        reviews: [],
        success: false,
        error: (err as Error).message,
      };
    }
  }

  private async parseReviewElement(el: any, page: any): Promise<Review | null> {
    try {
      // 尝试多种方式提取数据
      const result = await el.evaluate((element: any) => {
        // 评分
        const ratingEl = element.querySelector('.score, .rating, [data-testid="review-score"]');
        const ratingText = ratingEl?.textContent || '';
        const rating = parseFloat(ratingText.match(/(\d+\.?\d*)/)?.[1] || '0');

        // 评论内容
        const contentEl = element.querySelector('.review-content, .comment-content, .content, [data-testid="review-content"]');
        const content = contentEl?.textContent?.trim() || '';

        // 评论者
        const userEl = element.querySelector('.user-name, .username, .reviewer, [data-testid="review-user"]');
        const userName = userEl?.textContent?.trim() || '匿名用户';

        // 日期
        const dateEl = element.querySelector('.review-date, .date, .time, [data-testid="review-date"]');
        const dateText = dateEl?.textContent?.trim() || '';

        // 房型
        const roomEl = element.querySelector('.room-type, .roomname, [data-testid="review-room"]');
        const roomType = roomEl?.textContent?.trim() || '';

        return {
          rating,
          content,
          userName,
          dateText,
          roomType,
        };
      });

      if (!result.content) {
        return null;
      }

      // 解析日期
      let reviewDate = new Date();
      if (result.dateText) {
        const dateMatch = result.dateText.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (dateMatch) {
          reviewDate = new Date(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
        }
      }

      // 只保留 2026年2月之后的评论
      const cutoffDate = new Date('2026-02-01');
      if (reviewDate < cutoffDate) {
        return null;
      }

      return {
        id: `ctrip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        platform: 'ctrip',
        externalId: '',
        userName: result.userName,
        rating: result.rating,
        content: result.content,
        reviewDate: reviewDate,
        roomType: result.roomType,
        rawData: JSON.stringify(result),
      };
    } catch (err) {
      return null;
    }
  }

  private async fetchReviewsViaAPI(page: any): Promise<Review[]> {
    const reviews: Review[] = [];

    try {
      // 监听网络请求获取评论 API
      const response = await page.waitForResponse(
        (response: any) => response.url().includes('review') || response.url().includes('comment'),
        { timeout: 10000 }
      );

      const data = await response.json();
      logger.info(`[CtripScraper] Got API response: ${JSON.stringify(data).substring(0, 500)}`);

      // 解析 API 数据（根据实际结构调整）
      const reviewList = data?.reviewList || data?.comments || data?.data?.list || [];

      for (const item of reviewList) {
        const reviewDate = new Date(item.reviewDate || item.createTime || item.date);
        const cutoffDate = new Date('2026-02-01');

        if (reviewDate >= cutoffDate) {
          reviews.push({
            id: `ctrip_${item.id || Date.now()}`,
            platform: 'ctrip',
            externalId: String(item.id || ''),
            userName: item.userName || item.nickName || '匿名用户',
            rating: parseFloat(item.rating || item.score || 0),
            content: item.content || item.reviewContent || '',
            reviewDate: reviewDate,
            roomType: item.roomType || item.roomName || '',
            rawData: JSON.stringify(item),
          });
        }
      }
    } catch (err) {
      logger.warn('[CtripScraper] API fetch failed:', err);
    }

    return reviews;
  }
}
