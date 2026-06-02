import { Scraper, ScraperResult, ScrapedReview } from './types';
import { logger } from '@/lib/logger';

// 模拟评论池：覆盖好评 / 差评 / 中评，便于演示检测与预警
const POOL: Omit<ScrapedReview, 'externalId'>[] = [
  { rating: 1.5, ratingScale: 5, reviewerName: '测试用户·钱', content: '最差体验！空调坏了报修没人来，卫生间有异味，床单上有污渍。完全不值这个价格，强烈不推荐。', roomType: '标准双床房', stayDate: '2024-05-27', replyStatus: 'none' },
  { rating: 2.0, ratingScale: 5, reviewerName: '测试用户·孙', content: '房间隔音很差，设施老旧，和描述完全不符。前台态度也不好，办理入住磨蹭了半天。', roomType: '豪华大床房', stayDate: '2024-05-25', replyStatus: 'none' },
  { rating: 1.0, ratingScale: 5, reviewerName: '测试用户·周', content: '订的豪华房被换成标准房，差价不退，要求退款被拒，服务态度恶劣。已投诉，垃圾体验。', roomType: '行政套房', stayDate: '2024-05-24', replyStatus: 'none' },
  { rating: 2.5, ratingScale: 5, reviewerName: '测试用户·吴', content: '价格偏贵，性价比不高。WiFi 慢，热水时冷时热。房间面积还行，景观一般。', roomType: '豪华大床房', stayDate: '2024-05-23', replyStatus: 'none' },
  { rating: 3.0, ratingScale: 5, reviewerName: '测试用户·郑', content: '中规中矩。位置不错，但早餐种类少，地毯有污渍。隔音差了点，凑合住一晚。', roomType: '标准大床房', stayDate: '2024-05-22', replyStatus: 'none' },
  { rating: 3.5, ratingScale: 5, reviewerName: '测试用户·王', content: '硬件不错，大堂漂亮。但餐厅出餐慢，客房送餐等了很久。其他都还满意。', roomType: '豪华双床房', stayDate: '2024-05-21', replyStatus: 'replied' },
  { rating: 4.0, ratingScale: 5, reviewerName: '测试用户·冯', content: '整体还不错，位置好，服务热情，早餐丰富。扣一分是因为退房排队较久。', roomType: '行政大床房', stayDate: '2024-05-20', replyStatus: 'replied' },
  { rating: 4.5, ratingScale: 5, reviewerName: '测试用户·陈', content: '房间视野好，可以看到江景。床很舒服，员工态度好，办理入住很快。会再来。', roomType: '豪华大床房', stayDate: '2024-05-19', replyStatus: 'replied' },
  { rating: 5.0, ratingScale: 5, reviewerName: '测试用户·褚', content: '非常满意！前台主动升级房间，管家服务贴心，设施豪华，夜景绝美。强烈推荐。', roomType: '总统套房', stayDate: '2024-05-18', replyStatus: 'replied' },
  { rating: 2.0, ratingScale: 5, reviewerName: '测试用户·卫', content: '房间有霉味，窗帘有污渍，太脏了。客房打扫不及时，毛巾都没换，非常失望。', roomType: '豪华大床房', stayDate: '2024-05-17', replyStatus: 'none' },
  { rating: 1.0, ratingScale: 5, reviewerName: '测试用户·蒋', content: '房间居然有蟑螂，被子有污渍，一股潮湿霉味。前台态度差，要求退款被拒，再也不来。', roomType: '标准双床房', stayDate: '2024-05-16', replyStatus: 'none' },
  { rating: 4.0, ratingScale: 5, reviewerName: '测试用户·沈', content: '亲子出行，泳池和健身房设施齐全，孩子很喜欢。早餐品类丰富，值得推荐。', roomType: '豪华双床房', stayDate: '2024-05-15', replyStatus: 'replied' },
];

const PROVINCES = ['广东省', '四川省', '浙江省', '江苏省', '北京市', '上海市', '山东省', '河南省', '湖北省', '重庆市'];

export class MockScraper implements Scraper {
  platform = 'mock';

  async scrape(accountId: string): Promise<ScraperResult> {
    logger.info(`[MockScraper] Scraping for account: ${accountId}`);

    // 每次随机抽取 5–8 条，模拟真实抓取的增量
    const count = 5 + Math.floor(Math.random() * 4);
    const shuffled = [...POOL].sort(() => Math.random() - 0.5).slice(0, count);
    const stamp = Date.now();

    const reviews: ScrapedReview[] = shuffled.map((r, i) => ({
      ...r,
      province: PROVINCES[Math.floor(Math.random() * PROVINCES.length)],
      externalId: `mock-${stamp}-${String(i + 1).padStart(3, '0')}`,
    }));

    return {
      platform: 'mock',
      reviews,
      success: true,
    };
  }
}
