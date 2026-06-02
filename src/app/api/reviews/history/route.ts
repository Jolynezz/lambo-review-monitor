import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || '';
    const reviewType = searchParams.get('reviewType') || 'all';
    const replyStatus = searchParams.get('replyStatus') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxRating = parseFloat(searchParams.get('maxRating') || '5');
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const keyword = searchParams.get('keyword') || '';
    const alertStatus = searchParams.get('alertStatus') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    // 构建 where 条件
    const where: Record<string, unknown> = {};

    if (platform) {
      where.platform = platform;
    }

    // 评论类型筛选
    if (reviewType === 'negative') {
      where.rating = { lte: 3 };
    } else if (reviewType === 'positive') {
      where.rating = { gte: 4 };
    }

    // 评分范围
    if (!isNaN(minRating) || !isNaN(maxRating)) {
      const ratingCondition: Record<string, unknown> = {};
      if (!isNaN(minRating)) ratingCondition.gte = minRating;
      if (!isNaN(maxRating)) ratingCondition.lte = maxRating;
      if (Object.keys(ratingCondition).length > 0) {
        where.rating = { ...ratingCondition, ...(where.rating as Record<string, unknown>) };
      }
    }

    // 回复状态
    if (replyStatus) {
      where.replyStatus = replyStatus;
    }

    // 日期范围
    if (dateFrom || dateTo) {
      const dateCondition: Record<string, unknown> = {};
      if (dateFrom) dateCondition.gte = new Date(dateFrom);
      if (dateTo) dateCondition.lte = new Date(dateTo + 'T23:59:59');
      where.scrapedAt = dateCondition;
    }

    // 关键词搜索
    if (keyword) {
      where.content = { contains: keyword };
    }

    // 差评状态
    if (alertStatus) {
      where.alert = { status: alertStatus };
    }

    // 统计数据
    const [totalReviews, negativeReviews, avgRatingResult, repliedCount] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.count({ where: { ...where, rating: { lte: 3 } } }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
      prisma.review.count({ where: { ...where, replyStatus: 'replied' } }),
    ]);

    // 分页查询
    const rawData = await prisma.review.findMany({
      where,
      include: { alert: true },
      orderBy: { scrapedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 解析 JSON 字符串为数组
    const data = rawData.map((review) => ({
      ...review,
      alert: review.alert
        ? {
            ...review.alert,
            reasons: JSON.parse(review.alert.reasons || '[]'),
            matchedKeywords: JSON.parse(review.alert.matchedKeywords || '[]'),
          }
        : null,
    }));

    const total = await prisma.review.count({ where });

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      stats: {
        totalReviews,
        negativeReviews,
        avgRating: avgRatingResult._avg.rating || 0,
        repliedCount,
      },
    });
  } catch (err) {
    console.error('History query failed:', err);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
