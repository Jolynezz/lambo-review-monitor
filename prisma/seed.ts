import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 清空现有数据
  await prisma.alert.deleteMany();
  await prisma.review.deleteMany();
  await prisma.account.deleteMany();
  await prisma.setting.deleteMany();

  // 创建账号
  const ctrip = await prisma.account.create({
    data: {
      platform: 'ctrip',
      label: '携程主账号',
      sessionStatus: 'none',
    },
  });

  const fliggy = await prisma.account.create({
    data: {
      platform: 'fliggy',
      label: '飞猪主账号',
      sessionStatus: 'none',
    },
  });

  const qunar = await prisma.account.create({
    data: {
      platform: 'qunar',
      label: '去哪儿主账号',
      sessionStatus: 'none',
    },
  });

  const demo = await prisma.account.create({
    data: {
      platform: 'ctrip',
      label: '演示账号',
      sessionStatus: 'logged_in',
    },
  });

  // 为演示账号创建一些模拟评论
  const demoReviews = [
    {
      platform: 'ctrip',
      externalId: 'demo-001',
      rating: 2.0,
      ratingScale: 5,
      reviewerName: '张先生',
      content: '房间隔音很差，走廊的噪音一清二楚。卫生间也有异味，和五星级的标准完全不符。早餐种类太少，服务态度一般。',
      roomType: '豪华大床房',
      stayDate: '2024-05-15',
      replyStatus: 'none',
      accountId: demo.id,
    },
    {
      platform: 'ctrip',
      externalId: 'demo-002',
      rating: 1.0,
      ratingScale: 5,
      reviewerName: '李女士',
      content: '最差的一次入住体验！前台服务态度恶劣，房间设施老旧，空调不制冷。要求换房被拒绝，完全不值这个价格。卫生间的水龙头漏水，浴缸有污渍。',
      roomType: '行政套房',
      stayDate: '2024-05-10',
      replyStatus: 'none',
      accountId: demo.id,
    },
    {
      platform: 'ctrip',
      externalId: 'demo-003',
      rating: 3.0,
      ratingScale: 5,
      reviewerName: '王先生',
      content: '位置还可以，但是设施确实有些老旧了。床品还算干净，但是地毯有污渍。停车场太小，经常找不到车位。',
      roomType: '标准双床房',
      stayDate: '2024-05-08',
      replyStatus: 'replied',
      accountId: demo.id,
    },
    {
      platform: 'ctrip',
      externalId: 'demo-004',
      rating: 5.0,
      ratingScale: 5,
      reviewerName: '赵女士',
      content: '非常好的酒店，服务一流，设施豪华，位置优越。强烈推荐！',
      roomType: '总统套房',
      stayDate: '2024-05-20',
      replyStatus: 'replied',
      accountId: demo.id,
    },
    {
      platform: 'ctrip',
      externalId: 'demo-005',
      rating: 2.5,
      ratingScale: 5,
      reviewerName: '陈先生',
      content: '价格偏贵，性价比不高。WiFi信号不稳定，电视遥控器坏了。不过房间面积挺大的。',
      roomType: '豪华大床房',
      stayDate: '2024-05-18',
      replyStatus: 'none',
      accountId: demo.id,
    },
    {
      platform: 'ctrip',
      externalId: 'demo-006',
      rating: 4.0,
      ratingScale: 5,
      reviewerName: '刘女士',
      content: '整体还不错，早餐丰富，泳池也很干净。就是离地铁站有点远。',
      roomType: '豪华双床房',
      stayDate: '2024-05-22',
      replyStatus: 'none',
      accountId: demo.id,
    },
  ];

  for (const reviewData of demoReviews) {
    const review = await prisma.review.create({ data: reviewData });

    // 评分 <= 3 的自动创建差评告警
    if (review.rating <= 3) {
      await prisma.alert.create({
        data: {
          status: 'pending',
          reasons: JSON.stringify(['低评分评论']),
          matchedKeywords: JSON.stringify([]),
          reviewId: review.id,
        },
      });
    }
  }

  // 创建检测规则设置
  await prisma.setting.createMany({
    data: [
      { key: 'negative_threshold', value: '3' },
      { key: 'keywords', value: '差,糟糕,恶心,脏,臭,噪音,隔音差,态度差,老旧,破旧,不值,投诉,退款,差评,不满,失望,太差,最差,垃圾,骗人' },
      { key: 'notify_on_negative', value: 'true' },
      { key: 'notify_on_keywords', value: 'true' },
      { key: 'min_rating', value: '0' },
      { key: 'max_rating', value: '3' },
    ],
  });

  console.log('Seed completed!');
  console.log(`  Accounts: 4`);
  console.log(`  Reviews: ${demoReviews.length}`);
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
