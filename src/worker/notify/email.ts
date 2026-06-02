import nodemailer from 'nodemailer';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';

interface NotifyPayload {
  reviewId: string;
  platform: string;
  rating: number;
  reviewerName: string;
  content: string;
  reasons: string[];
  matchedKeywords: string[];
}

export async function sendAlertEmail(payload: NotifyPayload): Promise<boolean> {
  if (!config.smtp.host || !config.smtp.user) {
    logger.warn('SMTP not configured, skipping email notification');
    return false;
  }

  const platformLabels: Record<string, string> = {
    ctrip: '携程',
    fliggy: '飞猪',
    qunar: '去哪儿',
  };

  try {
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4a853;">差评告警 - ${config.hotelName}</h2>
        <hr style="border-color: #eee;" />
        <p><strong>平台：</strong>${platformLabels[payload.platform] || payload.platform}</p>
        <p><strong>评分：</strong><span style="color: #e74c3c; font-weight: bold;">${payload.rating}/5</span></p>
        <p><strong>评论者：</strong>${payload.reviewerName}</p>
        <p><strong>评论内容：</strong></p>
        <blockquote style="background: #f5f5f5; padding: 12px; border-left: 3px solid #e74c3c;">
          ${payload.content}
        </blockquote>
        <p><strong>告警原因：</strong></p>
        <ul>
          ${payload.reasons.map((r) => `<li>${r}</li>`).join('')}
        </ul>
        ${payload.matchedKeywords.length > 0 ? `
          <p><strong>匹配关键词：</strong> ${payload.matchedKeywords.join(', ')}</p>
        ` : ''}
        <hr style="border-color: #eee;" />
        <p style="color: #888; font-size: 12px;">
          此邮件由 Lamborghini Review Monitor 自动发送
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: config.smtp.user,
      to: config.smtp.to,
      subject: `[差评告警] ${config.hotelName} - ${platformLabels[payload.platform] || payload.platform} ${payload.rating}分`,
      html: htmlContent,
    });

    logger.info(`Alert email sent for review: ${payload.reviewId}`);
    return true;
  } catch (err) {
    logger.error('Failed to send alert email:', err);
    return false;
  }
}
