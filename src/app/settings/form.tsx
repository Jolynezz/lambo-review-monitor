'use client';

import { useState } from 'react';

interface SettingsFormProps {
  initialSettings: {
    negative_threshold: string;
    keywords: string;
    notify_on_negative: string;
    notify_on_keywords: string;
    min_rating: string;
    max_rating: string;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  function handleChange(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setResult(data.message || '保存成功');
    } catch (err) {
      setResult('保存失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="card-header">
        判定与通知规则
        <span className="count">DETECTION</span>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">差评评分阈值</label>
          <input
            type="number" className="form-input" min="0" max="5" step="0.5"
            value={settings.negative_threshold}
            onChange={(e) => handleChange('negative_threshold', e.target.value)}
          />
          <p className="form-hint">评分低于此值的点评将被判定为差评并记录。</p>
        </div>

        <div className="form-group">
          <label className="form-label">评分筛选范围</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="number" className="form-input" min="0" max="5" step="0.5"
              value={settings.min_rating} onChange={(e) => handleChange('min_rating', e.target.value)} placeholder="最低"
            />
            <span style={{ color: 'var(--ink-faint)' }}>—</span>
            <input
              type="number" className="form-input" min="0" max="5" step="0.5"
              value={settings.max_rating} onChange={(e) => handleChange('max_rating', e.target.value)} placeholder="最高"
            />
          </div>
          <p className="form-hint">仅抓取落在该评分区间内的点评。</p>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">差评关键词</label>
        <textarea
          className="form-textarea"
          value={settings.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          rows={4}
          placeholder="差, 糟糕, 恶心, 脏, 臭 …"
        />
        <p className="form-hint">以逗号分隔。评论命中任一关键词时触发预警。</p>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">低评分通知</label>
          <select className="form-select" value={settings.notify_on_negative} onChange={(e) => handleChange('notify_on_negative', e.target.value)}>
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">关键词匹配通知</label>
          <select className="form-select" value={settings.notify_on_keywords} onChange={(e) => handleChange('notify_on_keywords', e.target.value)}>
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </select>
        </div>
      </div>

      <div className="actions" style={{ marginTop: 8, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
        <button className="btn btn-gold" onClick={handleSave} disabled={loading}>
          {loading ? '保存中…' : '保存设置'}
        </button>
        {result && <span className="toast">{result}</span>}
      </div>
    </div>
  );
}
