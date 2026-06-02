import { ScrapedReview } from '../scrapers/types';
import { DetectionResult } from './rules';

/**
 * AI 差评检测（占位）
 *
 * 可接入 OpenAI / 通义千问 / 其他 LLM API
 * 对评论内容进行语义分析，判断是否为差评
 */
export async function aiDetect(review: ScrapedReview): Promise<DetectionResult> {
  // TODO: 实现 AI 检测逻辑
  // 示例：
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: '你是一个酒店评论分析助手。判断以下评论是否为差评，返回JSON格式。',
  //       },
  //       {
  //         role: 'user',
  //         content: review.content,
  //       },
  //     ],
  //   }),
  // });

  return {
    isNegative: false,
    reasons: [],
    matchedKeywords: [],
  };
}
