import { prisma } from '@/lib/db';
import SettingsForm from './form';

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div>
      <div className="page-header reveal">
        <div>
          <div className="page-eyebrow">Detection Rules</div>
          <h1>检测设置</h1>
          <p className="page-desc">定义差评的判定标准与通知策略——评分阈值、敏感关键词，以及何时发出预警。</p>
        </div>
      </div>

      <div className="card reveal d1">
        <SettingsForm
          initialSettings={{
            negative_threshold: settingsMap['negative_threshold'] || '3',
            keywords: settingsMap['keywords'] || '',
            notify_on_negative: settingsMap['notify_on_negative'] || 'true',
            notify_on_keywords: settingsMap['notify_on_keywords'] || 'true',
            min_rating: settingsMap['min_rating'] || '0',
            max_rating: settingsMap['max_rating'] || '3',
          }}
        />
      </div>
    </div>
  );
}
