/**
 * 后台点评页结构探测工具。
 *
 * 用法：  npm run capture <ctrip|fliggy|qunar>
 *
 * 它会弹出一个真实浏览器：你用商家账号登录、打开本店「点评管理」页，
 * 然后回到终端按 Enter。工具会把当前页面的 HTML 和捕获到的接口 JSON
 * 保存到 data/capture/ 下，据此即可写出准确的选择器/接口解析。
 *
 * 登录验证码、短信、风控均由你在浏览器中手动完成——本工具不做任何绕过。
 */
import fs from 'fs';
import path from 'path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { getPlatformConfig } from './scrapers/configs';

async function main() {
  const platform = process.argv[2];
  if (!platform || !['ctrip', 'fliggy', 'qunar'].includes(platform)) {
    console.error('用法: npm run capture <ctrip|fliggy|qunar>');
    process.exit(1);
  }

  const cfg = getPlatformConfig(platform);
  const url = cfg.reviewUrl.replace('{hotelId}', cfg.hotelId);

  const { chromium } = await import('playwright');
  const userDataDir = path.join(process.cwd(), 'data', 'browser-data', platform, 'capture');
  fs.mkdirSync(userDataDir, { recursive: true });

  console.log(`\n[capture] 平台: ${platform}`);
  console.log(`[capture] 目标点评页: ${url}`);
  console.log('[capture] 正在启动浏览器…（如失败请先执行 npx playwright install chromium）\n');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1360, height: 900 },
    locale: 'zh-CN',
  });

  const captured: { url: string; status: number; body: unknown }[] = [];
  context.on('response', async (res) => {
    const u = res.url();
    if (cfg.apiUrlHints.some((h) => u.includes(h))) {
      try {
        captured.push({ url: u, status: res.status(), body: await res.json() });
      } catch { /* 非 JSON，忽略 */ }
    }
  });

  const page = context.pages()[0] || (await context.newPage());
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch {
    console.log('[capture] 首次导航超时，可手动在浏览器地址栏打开后台点评页。');
  }

  const rl = readline.createInterface({ input, output });
  await rl.question('\n>>> 请在浏览器中登录并打开本店「点评管理」页面，完成后回到这里按 Enter 截取…\n');
  rl.close();

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(process.cwd(), 'data', 'capture');
  fs.mkdirSync(dir, { recursive: true });

  // 截取当前所有打开页面的 HTML
  const pages = context.pages();
  let html = '';
  for (const p of pages) {
    try {
      html += `\n\n<!-- ===== PAGE: ${p.url()} ===== -->\n` + (await p.content());
    } catch { /* 页面已关闭 */ }
  }
  const htmlPath = path.join(dir, `${platform}-${ts}.html`);
  const jsonPath = path.join(dir, `${platform}-${ts}.xhr.json`);
  fs.writeFileSync(htmlPath, html);
  fs.writeFileSync(jsonPath, JSON.stringify(captured, null, 2));

  console.log(`\n[capture] 已保存页面结构: ${htmlPath}`);
  console.log(`[capture] 已保存接口响应: ${jsonPath}（${captured.length} 条）`);
  console.log('[capture] 把这两个文件发给我，即可据此写出准确的点评解析。\n');

  await context.close();
  process.exit(0);
}

main().catch((e) => {
  console.error('[capture] 失败:', e);
  process.exit(1);
});
