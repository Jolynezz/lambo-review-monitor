import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const KEYWORDS = [
  '差', '糟糕', '恶心', '脏', '臭', '噪音', '隔音', '态度差', '老旧', '破旧',
  '不值', '投诉', '退款', '差评', '不满', '失望', '太差', '最差', '垃圾', '骗人',
  '异味', '漏水', '污渍', '坏', '冷', '吵', '慢', '贵', '霉', '虫',
];
const THRESHOLD = 3;

type Seed = {
  platform: string;
  account: string;
  rating: number;
  reviewerName: string;
  content: string;
  roomType: string;
  stayDate: string;
  scrapedAt: string;
  replyStatus: 'none' | 'replied';
  alertStatus?: 'pending' | 'handled' | 'dismissed';
};

const ACCOUNTS = [
  { key: 'ctrip1', platform: 'ctrip', label: '携程旗舰店', sessionStatus: 'logged_in', lastLoginAt: '2024-05-27T09:12:00', lastScrapeAt: '2024-05-28T06:00:00' },
  { key: 'ctrip2', platform: 'ctrip', label: '携程·成都直营店', sessionStatus: 'logged_in', lastLoginAt: '2024-05-25T20:40:00', lastScrapeAt: '2024-05-28T06:00:00' },
  { key: 'fliggy1', platform: 'fliggy', label: '飞猪官方旗舰店', sessionStatus: 'logged_in', lastLoginAt: '2024-05-26T11:05:00', lastScrapeAt: '2024-05-28T06:00:00' },
  { key: 'qunar1', platform: 'qunar', label: '去哪儿旗舰店', sessionStatus: 'logged_in', lastLoginAt: '2024-05-24T14:30:00', lastScrapeAt: '2024-05-28T06:00:00' },
  { key: 'qunar2', platform: 'qunar', label: '去哪儿·分销渠道', sessionStatus: 'expired', lastLoginAt: '2024-04-30T08:00:00', lastScrapeAt: '2024-05-12T06:00:00' },
];

const REVIEWS: Seed[] = [
  // ——— 携程 旗舰店 ———
  { platform: 'ctrip', account: 'ctrip1', rating: 1.0, reviewerName: '李女士', stayDate: '2024-05-10', scrapedAt: '2024-05-11T08:30:00', replyStatus: 'none', roomType: '行政套房',
    content: '最差的一次入住体验！前台服务态度恶劣，房间设施老旧，空调不制冷。要求换房被拒绝，完全不值这个价格。卫生间的水龙头漏水，浴缸有污渍。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 2.0, reviewerName: '张先生', stayDate: '2024-05-15', scrapedAt: '2024-05-16T10:15:00', replyStatus: 'none', roomType: '豪华大床房',
    content: '房间隔音很差，走廊的噪音一清二楚，半夜被隔壁吵醒好几次。卫生间也有异味，和五星级的标准完全不符。早餐种类太少，服务态度一般。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 2.5, reviewerName: '陈先生', stayDate: '2024-05-18', scrapedAt: '2024-05-19T14:20:00', replyStatus: 'none', roomType: '豪华大床房', alertStatus: 'handled',
    content: '价格偏贵，性价比不高。WiFi 信号不稳定，电视遥控器坏了报修等了两小时才换。不过房间面积挺大的，景观还行。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 3.0, reviewerName: '王先生', stayDate: '2024-05-08', scrapedAt: '2024-05-09T09:00:00', replyStatus: 'replied', roomType: '标准双床房',
    content: '位置还可以，但是设施确实有些老旧了。床品还算干净，但是地毯有污渍。停车场太小，经常找不到车位。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 5.0, reviewerName: '赵女士', stayDate: '2024-05-20', scrapedAt: '2024-05-21T16:45:00', replyStatus: 'replied', roomType: '总统套房',
    content: '非常好的酒店，服务一流，设施豪华，位置优越。前台主动升级了房间，管家服务很贴心。强烈推荐！' },
  { platform: 'ctrip', account: 'ctrip1', rating: 4.5, reviewerName: '孙女士', stayDate: '2024-05-22', scrapedAt: '2024-05-23T11:30:00', replyStatus: 'replied', roomType: '豪华双床房',
    content: '整体体验很好，大堂很气派，早餐丰富，泳池干净。唯一不足是离地铁站稍远，打车比较方便。会再来。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 1.5, reviewerName: '周先生', stayDate: '2024-04-28', scrapedAt: '2024-04-29T19:10:00', replyStatus: 'none', roomType: '豪华大床房',
    content: '房间有一股霉味，窗帘上还有污渍，太脏了。客房服务打扫不及时，毛巾用过了都没换。这种卫生条件真的让人失望。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 4.0, reviewerName: '吴女士', stayDate: '2024-04-20', scrapedAt: '2024-04-21T08:50:00', replyStatus: 'replied', roomType: '行政大床房',
    content: '行政酒廊的下午茶不错，工作人员很热情。房间采光好，就是隔音一般，能听到电梯的声音。' },

  // ——— 携程 成都直营 ———
  { platform: 'ctrip', account: 'ctrip2', rating: 2.0, reviewerName: '郑先生', stayDate: '2024-05-05', scrapedAt: '2024-05-06T13:25:00', replyStatus: 'none', roomType: '标准大床房',
    content: '订的豪华房到店被告知没有了，给安排了标准房，差价也没退。前台态度差，沟通很不耐烦。非常不满，已投诉。' },
  { platform: 'ctrip', account: 'ctrip2', rating: 3.0, reviewerName: '冯女士', stayDate: '2024-04-15', scrapedAt: '2024-04-16T10:40:00', replyStatus: 'replied', roomType: '豪华双床房', alertStatus: 'handled',
    content: '位置不错，购物方便。但热水时冷时热，早上洗澡水温调不好。空调声音有点吵，整体中规中矩。' },
  { platform: 'ctrip', account: 'ctrip2', rating: 5.0, reviewerName: '何先生', stayDate: '2024-04-10', scrapedAt: '2024-04-11T15:00:00', replyStatus: 'replied', roomType: '总统套房',
    content: '商务出行入住，房间宽敞安静，床很舒服。礼宾服务专业，帮忙安排了接送机，体验超出预期。' },
  { platform: 'ctrip', account: 'ctrip2', rating: 4.0, reviewerName: '吕女士', stayDate: '2024-03-28', scrapedAt: '2024-03-29T09:20:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '亲子出行，泳池和健身房设施齐全，孩子很喜欢。早餐品类丰富。扣一分是因为退房时等了比较久。' },
  { platform: 'ctrip', account: 'ctrip2', rating: 1.0, reviewerName: '蒋先生', stayDate: '2024-03-12', scrapedAt: '2024-03-13T18:30:00', replyStatus: 'none', roomType: '标准双床房',
    content: '太差了！房间居然有蟑螂，被子上有污渍，一股潮湿的霉味。找前台理论态度还很差，要求退款被拒。再也不会来了，垃圾体验。' },

  // ——— 飞猪 官方旗舰店 ———
  { platform: 'fliggy', account: 'fliggy1', rating: 2.0, reviewerName: '韩女士', stayDate: '2024-05-12', scrapedAt: '2024-05-13T11:10:00', replyStatus: 'none', roomType: '豪华大床房',
    content: '通过飞猪订的套餐，到店发现餐券不能用，和宣传不符，有种被骗人的感觉。房间倒是还行，但服务流程太混乱。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 4.5, reviewerName: '杨先生', stayDate: '2024-05-19', scrapedAt: '2024-05-20T09:35:00', replyStatus: 'replied', roomType: '行政大床房',
    content: '套餐很划算，含双早和延迟退房。房间视野很好，可以看到江景。服务态度热情，办理入住很快。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 3.0, reviewerName: '朱女士', stayDate: '2024-05-02', scrapedAt: '2024-05-03T14:50:00', replyStatus: 'none', roomType: '豪华双床房', alertStatus: 'dismissed',
    content: '位置好找，房间面积可以。但是装修有点老旧了，洗手台下水比较慢。性价比一般，符合这个价位的预期。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 1.5, reviewerName: '秦先生', stayDate: '2024-04-25', scrapedAt: '2024-04-26T20:05:00', replyStatus: 'none', roomType: '标准大床房',
    content: '非常失望，房间空调坏了一晚上没人修，热得睡不着。打了好几次电话前台都说在处理，结果不了了之。这服务太差了。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 5.0, reviewerName: '许女士', stayDate: '2024-04-18', scrapedAt: '2024-04-19T10:25:00', replyStatus: 'replied', roomType: '总统套房',
    content: '生日入住，酒店准备了果盘和手写卡片，很惊喜。房间豪华，浴缸很大，泡澡看夜景太享受了。下次还会选这里。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 3.5, reviewerName: '邓先生', stayDate: '2024-03-30', scrapedAt: '2024-03-31T08:15:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '酒店硬件不错，大堂很漂亮。但餐厅出餐慢，晚上点的客房送餐等了快一个小时。其他都挺满意。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 2.5, reviewerName: '曹女士', stayDate: '2024-03-08', scrapedAt: '2024-03-09T17:40:00', replyStatus: 'none', roomType: '豪华双床房', alertStatus: 'handled',
    content: '房间窗户密封不好，外面马路噪音很大，隔音差。枕头太软睡不惯。前台办理速度慢，排队等了二十多分钟。' },

  // ——— 去哪儿 旗舰店 ———
  { platform: 'qunar', account: 'qunar1', rating: 1.0, reviewerName: '袁先生', stayDate: '2024-05-14', scrapedAt: '2024-05-15T19:55:00', replyStatus: 'none', roomType: '标准双床房',
    content: '最差体验！房间又小又暗，墙面发霉有霉味，床单上有污渍。卫生间下水道反臭，恶心得很。强烈不推荐，纯属浪费钱。' },
  { platform: 'qunar', account: 'qunar1', rating: 4.0, reviewerName: '于女士', stayDate: '2024-05-21', scrapedAt: '2024-05-22T09:10:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '整体不错，地理位置优越，周边吃饭购物都方便。房间干净整洁，服务也到位。就是停车费有点贵。' },
  { platform: 'qunar', account: 'qunar1', rating: 2.0, reviewerName: '潘先生', stayDate: '2024-05-03', scrapedAt: '2024-05-04T13:30:00', replyStatus: 'none', roomType: '豪华双床房',
    content: '设施太老旧了，电视是老式的，网络也慢。房间有股烟味，明明订的无烟房。和图片差距太大，有点失望。' },
  { platform: 'qunar', account: 'qunar1', rating: 5.0, reviewerName: '马女士', stayDate: '2024-04-22', scrapedAt: '2024-04-23T11:00:00', replyStatus: 'replied', roomType: '行政套房',
    content: '非常满意的一次入住！房间大且安静，行政待遇很值，酒廊免费餐食和饮品很丰富。员工服务细致周到，五星好评。' },
  { platform: 'qunar', account: 'qunar1', rating: 3.0, reviewerName: '范先生', stayDate: '2024-04-05', scrapedAt: '2024-04-06T16:20:00', replyStatus: 'none', roomType: '标准大床房', alertStatus: 'dismissed',
    content: '中规中矩的酒店。优点是位置好、床舒服；缺点是早餐选择少，餐厅环境拥挤。隔音一般，凑合住一晚还行。' },
  { platform: 'qunar', account: 'qunar1', rating: 4.5, reviewerName: '苏女士', stayDate: '2024-03-20', scrapedAt: '2024-03-21T10:05:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '装修很有格调，大堂的灯光和香氛都很有质感。房间布草柔软，睡得很好。性价比高，会推荐给朋友。' },

  // ——— 去哪儿 分销渠道（含较早数据） ———
  { platform: 'qunar', account: 'qunar2', rating: 1.5, reviewerName: '杜先生', stayDate: '2024-02-18', scrapedAt: '2024-02-19T18:40:00', replyStatus: 'none', roomType: '标准双床房',
    content: '价格虽然便宜，但是真的太差了。房间冷，暖气不热，要了两床被子才勉强。卫生间瓷砖有污渍，打扫不干净。不会再订了。' },
  { platform: 'qunar', account: 'qunar2', rating: 3.0, reviewerName: '丁女士', stayDate: '2024-02-05', scrapedAt: '2024-02-06T09:50:00', replyStatus: 'replied', roomType: '豪华大床房', alertStatus: 'handled',
    content: '过年期间入住，价格偏贵但能理解。房间还算干净，就是隔壁一家人很吵，隔音差了点。前台服务态度还可以。' },
  { platform: 'qunar', account: 'qunar2', rating: 4.0, reviewerName: '钟先生', stayDate: '2024-01-26', scrapedAt: '2024-01-27T14:15:00', replyStatus: 'replied', roomType: '行政大床房',
    content: '商务入住体验良好，房间安静，办公桌宽敞。行政酒廊可以处理工作。美中不足是健身房器械有点旧。' },
  { platform: 'qunar', account: 'qunar2', rating: 2.0, reviewerName: '姚女士', stayDate: '2024-01-12', scrapedAt: '2024-01-13T20:30:00', replyStatus: 'none', roomType: '标准大床房',
    content: '入住体验很差，房间灯光昏暗，空调有异味。叫了客房服务半天没人接电话。早餐也很一般，菜品凉了也不补。' },

  // ——— 更多近期数据（多平台混合） ———
  { platform: 'ctrip', account: 'ctrip1', rating: 4.0, reviewerName: '萧女士', stayDate: '2024-05-24', scrapedAt: '2024-05-25T09:00:00', replyStatus: 'none', roomType: '豪华双床房',
    content: '房间干净舒适，服务热情。早餐现做的面点很好吃。停车有点不方便，需要绕到地下三层。总体满意。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 1.0, reviewerName: '田先生', stayDate: '2024-05-26', scrapedAt: '2024-05-27T08:20:00', replyStatus: 'none', roomType: '行政套房',
    content: '名不副实的所谓豪华酒店。房间有异味，地毯脏，卫生间漏水流了一地。投诉无门，要求退款被各种推脱。最差的一次，垃圾！' },
  { platform: 'qunar', account: 'qunar1', rating: 3.5, reviewerName: '汪女士', stayDate: '2024-05-25', scrapedAt: '2024-05-26T10:45:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '位置和环境都不错，房间宽敞明亮。就是入住高峰期前台排队较久，办理慢。其他方面都挺好的。' },
  { platform: 'ctrip', account: 'ctrip2', rating: 5.0, reviewerName: '范先生', stayDate: '2024-05-23', scrapedAt: '2024-05-24T15:30:00', replyStatus: 'replied', roomType: '总统套房',
    content: '顶级的入住体验，无可挑剔。专属管家全程服务，房间布置奢华大气，落地窗的城市夜景绝美。物有所值。' },
  { platform: 'fliggy', account: 'fliggy1', rating: 4.0, reviewerName: '贺女士', stayDate: '2024-05-17', scrapedAt: '2024-05-18T11:25:00', replyStatus: 'replied', roomType: '豪华大床房',
    content: '套餐含双人晚餐，餐厅出品精致。房间设施新，智能控制很方便。服务员态度好。下次还会通过飞猪预订。' },
  { platform: 'ctrip', account: 'ctrip1', rating: 2.5, reviewerName: '邹先生', stayDate: '2024-05-06', scrapedAt: '2024-05-07T19:00:00', replyStatus: 'none', roomType: '标准双床房', alertStatus: 'handled',
    content: '房间偏小，行李都摆不开。窗外正对马路，噪音大隔音差。空调风口有灰，吹出来一股味道。性价比不高。' },
];

async function main() {
  console.log('Seeding database...');

  await prisma.alert.deleteMany();
  await prisma.review.deleteMany();
  await prisma.account.deleteMany();
  await prisma.setting.deleteMany();

  // 账号
  const accountIds: Record<string, string> = {};
  for (const a of ACCOUNTS) {
    const created = await prisma.account.create({
      data: {
        platform: a.platform,
        label: a.label,
        sessionStatus: a.sessionStatus,
        lastLoginAt: a.lastLoginAt ? new Date(a.lastLoginAt) : null,
        lastScrapeAt: a.lastScrapeAt ? new Date(a.lastScrapeAt) : null,
      },
    });
    accountIds[a.key] = created.id;
  }

  // 评论 + 差评预警
  let alertCount = 0;
  let idx = 0;
  for (const r of REVIEWS) {
    idx += 1;
    const review = await prisma.review.create({
      data: {
        platform: r.platform,
        externalId: `seed-${r.platform}-${String(idx).padStart(3, '0')}`,
        rating: r.rating,
        ratingScale: 5,
        reviewerName: r.reviewerName,
        content: r.content,
        roomType: r.roomType,
        stayDate: r.stayDate,
        replyStatus: r.replyStatus,
        scrapedAt: new Date(r.scrapedAt),
        accountId: accountIds[r.account],
      },
    });

    const matched = KEYWORDS.filter((k) => review.content.includes(k));
    const isLow = review.rating <= THRESHOLD;

    if (isLow || matched.length > 0) {
      const reasons: string[] = [];
      if (isLow) reasons.push(`低评分（${review.rating} 分）`);
      if (matched.length > 0) reasons.push(`命中敏感词：${matched.join('、')}`);

      const status = r.alertStatus || 'pending';
      await prisma.alert.create({
        data: {
          status,
          reasons: JSON.stringify(reasons),
          matchedKeywords: JSON.stringify(matched),
          reviewId: review.id,
          notifiedAt: new Date(r.scrapedAt),
          handledAt: status === 'handled' ? new Date(new Date(r.scrapedAt).getTime() + 3600_000) : null,
        },
      });
      alertCount += 1;
    }
  }

  // 检测规则
  await prisma.setting.createMany({
    data: [
      { key: 'negative_threshold', value: String(THRESHOLD) },
      { key: 'keywords', value: KEYWORDS.join(',') },
      { key: 'notify_on_negative', value: 'true' },
      { key: 'notify_on_keywords', value: 'true' },
      { key: 'min_rating', value: '0' },
      { key: 'max_rating', value: '3' },
    ],
  });

  console.log('Seed completed!');
  console.log(`  Accounts: ${ACCOUNTS.length}`);
  console.log(`  Reviews:  ${REVIEWS.length}`);
  console.log(`  Alerts:   ${alertCount}`);
  console.log(`  Settings: 6`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
