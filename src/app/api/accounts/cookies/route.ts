import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import fs from 'fs';
import path from 'path';

function parseCookiesText(text: string): { name: string; value: string; domain?: string; path?: string }[] {
  const trimmed = text.trim();

  // 尝试解析为 JSON 数组格式
  if (trimmed.startsWith('[')) {
    try {
      const jsonCookies = JSON.parse(trimmed);
      if (Array.isArray(jsonCookies)) {
        return jsonCookies.map((c: Record<string, unknown>) => ({
          name: String(c.name || ''),
          value: String(c.value || ''),
          domain: c.domain ? String(c.domain) : undefined,
          path: c.path ? String(c.path) : undefined,
        }));
      }
    } catch {
      // 不是 JSON，继续尝试其他格式
    }
  }

  // 解析 document.cookie 纯文本格式: name1=value1; name2=value2
  const cookies: { name: string; value: string }[] = [];
  const pairs = trimmed.split(';').map((s) => s.trim()).filter(Boolean);
  for (const pair of pairs) {
    const eqIndex = pair.indexOf('=');
    if (eqIndex > 0) {
      cookies.push({
        name: pair.substring(0, eqIndex).trim(),
        value: pair.substring(eqIndex + 1).trim(),
      });
    }
  }

  return cookies;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, cookies } = body;

    if (!accountId || !cookies) {
      return NextResponse.json(
        { error: 'accountId and cookies are required' },
        { status: 400 }
      );
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // 解析 cookies
    const parsedCookies = parseCookiesText(cookies);
    if (parsedCookies.length === 0) {
      return NextResponse.json({ error: '无法解析Cookies内容' }, { status: 400 });
    }

    // 保存到 cookies.json 文件
    const dataDir = path.join(process.cwd(), 'data', 'cookies', account.platform);
    fs.mkdirSync(dataDir, { recursive: true });
    const cookiesPath = path.join(dataDir, `${accountId}.json`);
    fs.writeFileSync(cookiesPath, JSON.stringify(parsedCookies, null, 2));

    logger.info(
      `Imported ${parsedCookies.length} cookies for account: ${account.label} (${account.platform})`
    );

    // 更新账号状态
    await prisma.account.update({
      where: { id: accountId },
      data: {
        sessionStatus: 'logged_in',
        lastLoginAt: new Date(),
      },
    });

    return NextResponse.json({
      message: `成功导入 ${parsedCookies.length} 个Cookies到账号 ${account.label}`,
    });
  } catch (err) {
    logger.error('Cookie import failed:', err);
    return NextResponse.json({ error: 'Cookie import failed' }, { status: 500 });
  }
}
