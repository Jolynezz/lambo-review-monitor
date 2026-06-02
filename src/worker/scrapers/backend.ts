import { BaseScraper } from './base';
import { ScraperResult, ScrapedReview } from './types';
import { PlatformConfig, isCalibrated } from './configs';
import { logger } from '@/lib/logger';

/**
 * 通用 OTA 商家后台抓取器：复用登录态，打开后台点评页，
 * 用配置好的选择器解析点评；选择器未校准时返回空并提示。
 */
export class BackendScraper extends BaseScraper {
  platform: string;
  private config: PlatformConfig;

  constructor(config: PlatformConfig) {
    super();
    this.config = config;
    this.platform = config.platform;
  }

  async scrape(accountId: string): Promise<ScraperResult> {
    const cfg = this.config;
    logger.info(`[${cfg.platform}] 开始抓取 account=${accountId}`);

    if (!isCalibrated(cfg)) {
      const msg = `${cfg.platform} 选择器未校准：请先运行 "npm run capture ${cfg.platform}" 抓取真实后台点评页，再填写 configs.ts 中的选择器`;
      logger.warn(`[${cfg.platform}] ${msg}`);
      return { platform: cfg.platform, reviews: [], success: false, error: msg };
    }

    const url = cfg.reviewUrl.replace('{hotelId}', cfg.hotelId);
    const capturedJson: unknown[] = [];

    try {
      const context = await this.launchWithContext(accountId);
      const page = context.pages()[0] || (await context.newPage());

      // 兜底：收集疑似点评接口的 JSON 响应
      page.on('response', async (res: { url: () => string; json: () => Promise<unknown> }) => {
        const u = res.url();
        if (cfg.apiUrlHints.some((h) => u.includes(h))) {
          try { capturedJson.push(await res.json()); } catch { /* 非 JSON */ }
        }
      });

      logger.info(`[${cfg.platform}] 导航至 ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);

      const cur = page.url();
      if (/login|passport|member\/login/.test(cur)) {
        await this.closeContext(context);
        return {
          platform: cfg.platform,
          reviews: [],
          success: false,
          error: '被重定向到登录页，登录态已失效，请重新登录或导入 Cookies',
        };
      }

      // 滚动触发懒加载
      for (let i = 0; i < 4; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1200);
      }

      const raw = await page.$$eval(
        cfg.selectors.reviewItem,
        (nodes: Element[], sel: PlatformConfig['selectors']) =>
          nodes.slice(0, 50).map((n) => {
            const pick = (s: string) => (s ? n.querySelector(s)?.textContent?.trim() || '' : '');
            return {
              ratingText: pick(sel.rating),
              content: pick(sel.content),
              reviewer: pick(sel.reviewer),
              dateText: pick(sel.date),
              roomType: pick(sel.roomType),
              replied: sel.replied ? Boolean(n.querySelector(sel.replied)) : false,
            };
          }),
        cfg.selectors,
      ).catch(() => [] as never[]);

      const reviews: ScrapedReview[] = raw
        .filter((r) => r.content)
        .map((r, i) => ({
          externalId: `${cfg.platform}-${this.hash(r.reviewer + r.content + r.dateText)}`,
          rating: this.parseRating(r.ratingText),
          ratingScale: 5,
          reviewerName: r.reviewer || '匿名用户',
          content: r.content,
          roomType: r.roomType,
          stayDate: this.parseDate(r.dateText),
          replyStatus: r.replied ? 'replied' : 'none',
        }));

      await this.closeContext(context);

      if (reviews.length === 0 && capturedJson.length > 0) {
        logger.warn(`[${cfg.platform}] DOM 未解析到点评，但捕获到 ${capturedJson.length} 个疑似接口响应——可据此改用接口解析（见 data/capture）`);
      }

      logger.info(`[${cfg.platform}] 解析到 ${reviews.length} 条点评`);
      return { platform: cfg.platform, reviews, success: true };
    } catch (err) {
      logger.error(`[${cfg.platform}] 抓取失败:`, err);
      return { platform: cfg.platform, reviews: [], success: false, error: (err as Error).message };
    }
  }

  private parseRating(text: string): number {
    const m = text.match(/(\d+(\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  private parseDate(text: string): string | null {
    const m = text.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null;
  }

  private hash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return Math.abs(h).toString(36);
  }
}
