import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { config } from '@/lib/config';

/**
 * 辅助登录逻辑
 * 在实际环境中会启动 Playwright 打开浏览器，让用户手动登录
 */
export async function initiateLogin(accountId: string): Promise<boolean> {
  try {
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      logger.error(`Account not found: ${accountId}`);
      return false;
    }

    if (config.scraper === 'mock') {
      // Mock 模式直接标记为已登录
      await prisma.account.update({
        where: { id: accountId },
        data: {
          sessionStatus: 'logged_in',
          lastLoginAt: new Date(),
        },
      });
      logger.info(`[Mock] Account ${account.label} logged in`);
      return true;
    }

    // Playwright 模式
    // TODO: 启动浏览器，导航到登录页面，等待用户完成登录
    // const { chromium } = await import('playwright');
    // const browser = await chromium.launch({ headless: false });
    // const context = await browser.newContext();
    // const page = await context.newPage();
    // ... 导航到对应平台登录页 ...

    logger.info(`Login flow initiated for ${account.label} (${account.platform})`);
    return true;
  } catch (err) {
    logger.error('Login failed:', err);
    return false;
  }
}
