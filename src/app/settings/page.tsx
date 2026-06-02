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
      <div className="page-header">
        <h1>检测设置</h1>
      </div>

      <div className="card">
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
