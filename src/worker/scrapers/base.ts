import { Scraper, ScraperResult } from './types';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

export abstract class BaseScraper implements Scraper {
  abstract platform: string;

  abstract scrape(accountId: string): Promise<ScraperResult>;

  /**
   * 从 cookies.json 文件加载手动导入的 cookies
   */
  protected loadCookiesFromFile(accountId: string): { name: string; value: string; domain?: string; path?: string }[] {
    const cookiesDir = path.join(process.cwd(), 'data', 'cookies', this.platform);
    const cookiesPath = path.join(cookiesDir, `${accountId}.json`);

    if (!fs.existsSync(cookiesPath)) {
      logger.debug(`No cookies file found for ${this.platform}/${accountId}`);
      return [];
    }

    try {
      const content = fs.readFileSync(cookiesPath, 'utf-8');
      const cookies = JSON.parse(content);
      logger.info(`Loaded ${cookies.length} cookies from ${cookiesPath}`);
      return cookies;
    } catch (err) {
      logger.error(`Failed to load cookies from ${cookiesPath}:`, err);
      return [];
    }
  }

  /**
   * 使用 Playwright browser.newContext() 启动浏览器（headless 模式，避免 SingletonLock 问题）
   */
  protected async launchWithContext(accountId: string) {
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({
      headless: process.env.SCRAPER_HEADLESS !== 'false',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--single-process',
        '--no-zygote',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'zh-CN',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    // 加载手动导入的 cookies
    const cookies = this.loadCookiesFromFile(accountId);
    if (cookies.length > 0) {
      // 为每个 cookie 添加 domain 和 path（如果缺失）
      const formattedCookies = cookies.map((c) => {
        const domain = c.domain || (this.platform === 'ctrip' ? '.ctrip.com' : 
                                     this.platform === 'fliggy' ? '.taobao.com' : 
                                     this.platform === 'qunar' ? '.qunar.com' : '');
        return {
          name: c.name,
          value: c.value,
          domain: domain,
          path: c.path || '/',
        };
      }).filter(c => c.domain); // 过滤掉没有 domain 的 cookie
      
      if (formattedCookies.length > 0) {
        await context.addCookies(formattedCookies);
        logger.info(`Applied ${formattedCookies.length} cookies to browser context`);
      }
    }

    // 保存 browser 引用以便关闭
    (context as any)._browser = browser;

    return context;
  }

  /**
   * 关闭浏览器上下文
   */
  protected async closeContext(context: any) {
    try {
      const browser = context._browser;
      if (browser) await browser.close();
    } catch {}
  }
}
