# Lamborghini Review Monitor

成都托尼洛兰博基尼酒店 OTA 差评监控与通知系统

基于 Next.js 14 + Prisma + Playwright + node-cron 构建，支持携程/飞猪/去哪儿平台的酒店评论自动抓取、差评检测和邮件通知。

## 功能特性

- **多平台抓取**: 支持携程、飞猪、去哪儿等 OTA 平台
- **差评检测**: 基于评分阈值 + 关键词匹配的规则引擎（可扩展 AI 检测）
- **邮件通知**: 检测到差评后自动发送邮件告警
- **数据看板**: 实时查看评论统计、差评告警
- **历史看板**: 多维度筛选历史评论（平台/评分/日期/关键词等）
- **账号管理**: 管理多个平台账号，支持 Cookies 导入
- **检测设置**: 自定义差评阈值、关键词、通知规则
- **定时任务**: 基于 node-cron 的定时抓取

## 技术栈

- **框架**: Next.js 14 (App Router)
- **数据库**: SQLite + Prisma ORM
- **抓取**: Playwright (支持 Mock 模式)
- **定时**: node-cron
- **通知**: Nodemailer
- **样式**: CSS 深色主题

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
# 编辑 .env 文件，配置 SMTP 等参数
```

### 4. 初始化数据库

```bash
npx prisma db push
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 运行模式

### Mock 模式（默认）

在 `.env` 中设置 `SCRAPER=mock`，使用模拟数据运行，无需真实浏览器。

### Playwright 模式

设置 `SCRAPER=playwright`，使用真实浏览器抓取。需要先登录账号或导入 Cookies。

## 项目结构

```
lambo-review-monitor/
├── prisma/
│   ├── schema.prisma          # 数据模型
│   └── seed.ts                # 种子数据
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 根布局
│   │   ├── page.tsx           # 数据看板
│   │   ├── nav.tsx            # 导航组件
│   │   ├── globals.css        # 全局样式
│   │   ├── reviews/           # 评论/差评页面
│   │   ├── history/           # 历史看板
│   │   ├── accounts/          # 账号管理
│   │   ├── settings/          # 检测设置
│   │   └── api/               # API 路由
│   ├── lib/
│   │   ├── config.ts          # 配置管理
│   │   ├── db.ts              # Prisma 客户端
│   │   └── logger.ts          # 日志工具
│   └── worker/
│       ├── scrapers/          # 抓取器
│       ├── detect/            # 差评检测
│       ├── notify/            # 邮件通知
│       ├── pipeline.ts        # 抓取管道
│       ├── login.ts           # 登录逻辑
│       ├── once.ts            # 单次运行
│       └── index.ts           # 定时 Worker
├── .env
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
