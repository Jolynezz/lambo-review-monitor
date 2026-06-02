# Lamborghini Review Monitor

成都托尼洛兰博基尼酒店 OTA 差评监控与通知系统。

基于 **Next.js 14 + Prisma + Playwright + node-cron** 构建，支持携程 / 飞猪 / 去哪儿平台的酒店评论自动抓取、差评检测和邮件通知。

## 功能特性

- **多平台抓取**：支持携程、飞猪、去哪儿等 OTA 平台
- **差评检测**：基于评分阈值 + 关键词匹配的规则引擎（可扩展 AI 检测）
- **邮件通知**：检测到差评后自动发送邮件告警
- **数据看板**：实时查看评论统计、差评告警
- **历史看板**：多维度筛选历史评论（平台 / 评分 / 日期 / 关键词等）
- **账号管理**：管理多个平台账号，支持 Cookies 导入
- **检测设置**：自定义差评阈值、关键词、通知规则
- **定时任务**：基于 node-cron 的定时抓取

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 数据库 | SQLite + Prisma ORM |
| 抓取 | Playwright（支持 Mock 模式） |
| 定时 | node-cron |
| 通知 | Nodemailer |
| 样式 | CSS 深色主题 |

## 环境要求

- Node.js 18+
- npm

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 安装 Playwright 浏览器（仅 Playwright 模式需要）

```bash
npx playwright install chromium
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env，按需配置 SMTP、抓取模式等参数
```

可配置项见下方 [环境变量](#环境变量) 一节。默认即可在 Mock 模式下跑通。

### 4. 初始化数据库

```bash
npm run db:push    # 同步 schema，生成 SQLite 数据库
npm run db:seed    # 导入种子数据
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 6.（可选）启动定时 Worker

```bash
npm run worker          # 按 SCRAPE_CRON 定时抓取
# 或单次运行一次抓取
npm run worker:once
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SCRAPER` | `mock` | 抓取模式：`mock`（模拟数据，无需浏览器）/ `playwright`（真实浏览器） |
| `DATABASE_URL` | `file:./data/app.db` | SQLite 数据库路径 |
| `HOTEL_NAME` | `成都托尼洛兰博基尼酒店` | 酒店名称 |
| `SCRAPE_CRON` | `0 */6 * * *` | 定时抓取的 cron 表达式（默认每 6 小时） |
| `SMTP_HOST` | `smtp.example.com` | SMTP 服务器地址 |
| `SMTP_PORT` | `465` | SMTP 端口 |
| `SMTP_SECURE` | `true` | 是否使用 TLS |
| `SMTP_USER` | — | SMTP 账号 |
| `SMTP_PASS` | — | SMTP 密码 / 授权码 |
| `ALERT_EMAIL_TO` | — | 差评告警接收邮箱 |

## 运行模式

### Mock 模式（默认）

`.env` 中设置 `SCRAPER=mock`，使用模拟数据运行，无需真实浏览器，适合开发和演示。

### Playwright 模式（接入真实商家后台）

设置 `SCRAPER=playwright`，用真实浏览器登录**酒店自己的商家后台**抓取**本店点评**。

> 说明：携程 / 飞猪 / 去哪儿都没有面向普通商家、可直接用代码调用的公开点评 API。
> 拿真实数据的现实路径是：用酒店自己的商家账号登录后台 → 复用登录态 → 解析点评页。
> 验证码 / 短信 / 风控由人工在浏览器中完成，本项目不做任何绕过。

完整流程：

1. **安装浏览器内核**（仅首次）
   ```bash
   npx playwright install chromium
   ```
2. **登录商家后台**：在「账号管理」页点击「真实登录」，在弹出的浏览器里完成登录，
   登录态会保存到 `data/`（也可用「导入 Cookies」粘贴登录态）。
3. **探测后台点评页结构**（关键，决定能否拿到数据）：
   ```bash
   npm run capture ctrip      # 或 fliggy / qunar
   ```
   在弹出的浏览器里打开本店「点评管理」页，回终端按 Enter；
   工具会把页面 HTML 与接口 JSON 存到 `data/capture/`。
4. **根据探测结果校准**：把真实点评页 URL 填入 `.env`（`CTRIP_REVIEW_URL` 等），
   并在 `src/worker/scrapers/configs.ts` 里填写各平台的点评选择器。
5. **抓取**：`SCRAPER=playwright` 后，在「评论 / 差评」页点「手动抓取」，
   或运行 `npm run worker:once`。

> 选择器未校准时，Playwright 模式会返回 0 条并提示先运行 `capture`——这是预期行为，
> 因为后台页面结构只有登录后才能确定，不能靠猜。

## 项目结构

```
lambo-review-monitor/
├── prisma/
│   ├── schema.prisma          # 数据模型（Account / Review / Alert / Setting）
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 数据看板
│   │   ├── nav.tsx            # 导航组件
│   │   ├── globals.css        # 全局样式
│   │   ├── reviews/           # 评论 / 差评页面
│   │   ├── history/           # 历史看板
│   │   ├── accounts/          # 账号管理
│   │   ├── settings/          # 检测设置
│   │   └── api/               # API 路由
│   ├── lib/
│   │   ├── config.ts          # 配置管理
│   │   ├── db.ts              # Prisma 客户端
│   │   └── logger.ts          # 日志工具
│   └── worker/
│       ├── scrapers/          # 抓取器（ctrip / fliggy / qunar / mock）
│       ├── detect/            # 差评检测（rules / ai）
│       ├── notify/            # 邮件通知
│       ├── pipeline.ts        # 抓取管道
│       ├── login.ts           # 登录逻辑
│       ├── once.ts            # 单次运行
│       └── index.ts           # 定时 Worker
├── .env.example
├── package.json
├── tsconfig.json
└── next.config.js
```

## 脚本命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:push` | 同步数据库 schema |
| `npm run db:seed` | 导入种子数据 |
| `npm run db:studio` | 打开 Prisma Studio |
| `npm run worker` | 启动定时 Worker |
| `npm run worker:once` | 单次运行抓取 |

## 安全提示

> ⚠️ **不要把敏感数据提交到仓库。** 以下内容已在 `.gitignore` 中排除，请勿手动添加：
>
> - `.env` —— SMTP 密码等密钥
> - `data/` —— 浏览器会话、登录 Cookies（属于账号凭证）
> - `prisma/data/`、`*.db` —— 本地数据库
>
> 如需向协作者分发初始数据，请使用 `prisma/seed.ts` 种子脚本，而非提交数据库文件。
