/**
 * 各 OTA 商家后台的抓取配置。
 *
 * 重要：reviewUrl 与 selectors 必须对应「登录后台后能看到本店点评的真实页面」。
 * 由于各平台后台页面结构只有登录后才能看到，selectors 默认留空——
 * 请先用 `npm run capture <platform>` 抓取真实页面，再据此填写选择器，
 * 否则 Playwright 模式会返回 0 条并提示需要校准。
 */
export interface PlatformConfig {
  platform: string;
  /** 后台点评页 URL，{hotelId} 会被替换为对应酒店 ID */
  reviewUrl: string;
  hotelId: string;
  /** 商家后台登录入口（手动登录用） */
  loginUrl: string;
  /** Cookie 默认所属域名 */
  cookieDomain: string;
  /** 后台点评页 DOM 选择器——用 capture 工具校准后填写 */
  selectors: {
    reviewItem: string; // 单条点评的容器
    rating: string;     // 评分
    content: string;    // 点评正文
    reviewer: string;   // 点评人
    date: string;       // 点评/入住日期
    roomType: string;   // 房型
    replied: string;    // 「已回复」标记（存在即视为已回复）
  };
  /** 命中这些 URL 片段的 XHR JSON 响应会被当作点评接口数据兜底解析 */
  apiUrlHints: string[];
}

const EMPTY_SELECTORS = {
  reviewItem: '',
  rating: '',
  content: '',
  reviewer: '',
  date: '',
  roomType: '',
  replied: '',
};

function env(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  ctrip: {
    platform: 'ctrip',
    // 携程商家后台（EBK）；请按真实点评页地址设置 CTRIP_REVIEW_URL
    reviewUrl: env('CTRIP_REVIEW_URL', 'https://ebooking.ctrip.com/'),
    hotelId: env('CTRIP_HOTEL_ID'),
    loginUrl: env('CTRIP_LOGIN_URL', 'https://passport.ctrip.com/user/login?BackUrl=https://ebooking.ctrip.com/'),
    cookieDomain: '.ctrip.com',
    selectors: { ...EMPTY_SELECTORS },
    apiUrlHints: ['review', 'comment', 'pinglun', 'remark'],
  },
  fliggy: {
    platform: 'fliggy',
    reviewUrl: env('FLIGGY_REVIEW_URL', 'https://hotel.alitrip.com/'),
    hotelId: env('FLIGGY_HOTEL_ID'),
    loginUrl: env('FLIGGY_LOGIN_URL', 'https://login.taobao.com/member/login.jhtml'),
    cookieDomain: '.taobao.com',
    selectors: { ...EMPTY_SELECTORS },
    apiUrlHints: ['rate', 'review', 'comment', 'feedback'],
  },
  qunar: {
    platform: 'qunar',
    reviewUrl: env('QUNAR_REVIEW_URL', 'https://bp.qunar.com/'),
    hotelId: env('QUNAR_HOTEL_ID'),
    loginUrl: env('QUNAR_LOGIN_URL', 'https://user.qunar.com/passport/login.jsp'),
    cookieDomain: '.qunar.com',
    selectors: { ...EMPTY_SELECTORS },
    apiUrlHints: ['review', 'comment', 'remark'],
  },
};

export function getPlatformConfig(platform: string): PlatformConfig {
  const cfg = PLATFORM_CONFIGS[platform];
  if (!cfg) throw new Error(`未知平台: ${platform}`);
  return cfg;
}

/** 选择器是否已校准（至少配置了点评容器） */
export function isCalibrated(cfg: PlatformConfig): boolean {
  return Boolean(cfg.selectors.reviewItem);
}
