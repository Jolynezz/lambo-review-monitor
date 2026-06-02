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
      {result && <span className="toast">{result}</span>}
      <button className="btn btn-gold" onClick={handleRunScrape} disabled={loading}>
        {loading ? '抓取中…' : '手动抓取'}
      </button>
    </div>
  );
}
