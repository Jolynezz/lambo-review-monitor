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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">差评评分阈值</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="5"
            step="0.5"
            value={settings.negative_threshold}
            onChange={(e) => handleChange('negative_threshold', e.target.value)}
          />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            评分低于此值将被标记为差评
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">评分筛选范围</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="number"
              className="form-input"
              min="0"
              max="5"
              step="0.5"
              value={settings.min_rating}
              onChange={(e) => handleChange('min_rating', e.target.value)}
              placeholder="最低"
            />
            <span style={{ alignSelf: 'center', color: 'var(--text-muted)' }}>-</span>
            <input
              type="number"
              className="form-input"
              min="0"
              max="5"
              step="0.5"
              value={settings.max_rating}
              onChange={(e) => handleChange('max_rating', e.target.value)}
              placeholder="最高"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">差评关键词（逗号分隔）</label>
        <textarea
          className="form-textarea"
          value={settings.keywords}
          onChange={(e) => handleChange('keywords', e.target.value)}
          rows={4}
          placeholder="差,糟糕,恶心,脏,臭..."
        />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          评论中包含这些关键词时将触发告警
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="form-group">
          <label className="form-label">低评分通知</label>
          <select
            className="form-select"
            value={settings.notify_on_negative}
            onChange={(e) => handleChange('notify_on_negative', e.target.value)}
          >
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">关键词匹配通知</label>
          <select
            className="form-select"
            value={settings.notify_on_keywords}
            onChange={(e) => handleChange('notify_on_keywords', e.target.value)}
          >
            <option value="true">开启</option>
            <option value="false">关闭</option>
          </select>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存设置'}
        </button>
        {result && (
          <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--accent)' }}>
            {result}
          </span>
        )}
      </div>
    </div>
  );
}
