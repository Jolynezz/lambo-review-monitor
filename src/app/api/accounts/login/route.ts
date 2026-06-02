import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

// 存储正在进行的登录会话
const activeLogins = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, action } = body;

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 启动真实浏览器登录
    if (action === 'start') {
      // 检查是否已有进行中的登录
      if (activeLogins.has(accountId)) {
        return NextResponse.json({ error: '登录已在进行中，请完成或取消' }, { status: 400 });
      }

      logger.info(`[RealLogin] Starting browser login for: ${account.label} (${account.platform})`);

      // 动态导入 playwright
      const { chromium } = await import('playwright');

      // 启动浏览器（有界面模式）
      const browser = await chromium.launch({
        headless: false, // 显示浏览器窗口
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1280,800',
        ],
      });

      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        locale: 'zh-CN',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      const page = await context.newPage();

      // 根据平台打开不同的登录页面
      let loginUrl = '';
      switch (account.platform) {
        case 'ctrip':
          loginUrl = 'https://passport.ctrip.com/user/login?BackUrl=https://e.ctrip.com/';
          break;
        case 'fliggy':
          loginUrl = 'https://login.taobao.com/member/login.jhtml';
          break;
        case 'qunar':
          loginUrl = 'https://user.qunar.com/passport/login.jsp';
          break;
        default:
          loginUrl = 'https://passport.ctrip.com/user/login';
      }

      await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

      // 存储登录会话
      activeLogins.set(accountId, {
        browser,
        context,
        page,
        startTime: Date.now(),
      });

      return NextResponse.json({
        message: '浏览器已弹出，请在浏览器中完成登录',
        status: 'waiting',
      });
    }

    // 检查登录状态并保存 cookies
    if (action === 'complete') {
      const session = activeLogins.get(accountId);
      if (!session) {
        return NextResponse.json({ error: '没有找到进行中的登录会话' }, { status: 400 });
      }

      const { browser, context, page } = session;

      try {
        // 获取当前页面 URL，判断是否已登录
        const url = page.url();
        const title = await page.title();

        logger.info(`[RealLogin] Checking login status - URL: ${url}, Title: ${title}`);

        // 获取所有 cookies
        const cookies = await context.cookies();

        if (cookies.length === 0) {
          return NextResponse.json({
            message: '尚未获取到登录信息，请完成登录后重试',
            status: 'waiting',
          });
        }

        // 保存 cookies 到文件
        const cookiesDir = path.join(process.cwd(), 'data', 'cookies', account.platform);
        fs.mkdirSync(cookiesDir, { recursive: true });
        const cookiesPath = path.join(cookiesDir, `${accountId}.json`);
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));

        logger.info(`[RealLogin] Saved ${cookies.length} cookies for ${account.label}`);

        // 更新账号状态
        await prisma.account.update({
          where: { id: accountId },
          data: {
            sessionStatus: 'logged_in',
            lastLoginAt: new Date(),
          },
        });

        // 关闭浏览器
        await browser.close();
        activeLogins.delete(accountId);

        return NextResponse.json({
          message: `账号 ${account.label} 登录成功！已保存 ${cookies.length} 个 cookies`,
          status: 'success',
          cookiesCount: cookies.length,
        });
      } catch (err) {
        logger.error('[RealLogin] Error completing login:', err);
        return NextResponse.json({ error: '保存登录信息失败' }, { status: 500 });
      }
    }

    // 取消登录
    if (action === 'cancel') {
      const session = activeLogins.get(accountId);
      if (session) {
        await session.browser.close();
        activeLogins.delete(accountId);
        logger.info(`[RealLogin] Login cancelled for ${account.label}`);
      }
      return NextResponse.json({ message: '登录已取消' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    logger.error('Login API error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
