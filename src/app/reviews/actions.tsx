'use client';

import { useState } from 'react';

export default function ReviewsActions() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  async function handleRunScrape() {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/run', { method: 'POST' });
      const data = await res.json();
      setResult(data.message || '抓取完成');
    } catch (err) {
      setResult('抓取失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="actions">
      <button
        className="btn btn-primary"
        onClick={handleRunScrape}
        disabled={loading}
      >
        {loading ? '抓取中...' : '手动抓取'}
      </button>
      {result && (
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
          {result}
        </span>
      )}
    </div>
  );
}
