import { ScrapedReview } from '../scrapers/types';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface DetectionResult {
  isNegative: boolean;
  reasons: string[];
  matchedKeywords: string[];
}

export async function detectNegativeReview(review: ScrapedReview): Promise<DetectionResult> {
  const reasons: string[] = [];
  const matchedKeywords: string[] = [];

  // 获取设置
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  const threshold = parseFloat(settingsMap['negative_threshold'] || '3');
  const keywordsStr = settingsMap['keywords'] || '';
  const keywords = keywordsStr.split(',').map((k) => k.trim()).filter(Boolean);

  // 规则1: 低评分检测
  if (review.rating <= threshold) {
    reasons.push(`低评分 (${review.rating}/${review.ratingScale})`);
  }

  // 规则2: 关键词匹配
  if (keywords.length > 0) {
    const contentLower = review.content.toLowerCase();
    for (const keyword of keywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }
    if (matchedKeywords.length > 0) {
      reasons.push(`包含敏感关键词: ${matchedKeywords.join(', ')}`);
    }
  }

  // 规则3: AI 检测（占位）
  // const aiResult = await aiDetect(review);
  // if (aiResult.isNegative) reasons.push(...aiResult.reasons);

  const isNegative = reasons.length > 0;

  return {
    isNegative,
    reasons,
    matchedKeywords,
  };
}
