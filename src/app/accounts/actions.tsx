'use client';

import { useState } from 'react';

interface Account {
  id: string;
  platform: string;
  label: string;
}

interface AccountsActionsProps {
  accounts: Account[];
}

export default function AccountsActions({ accounts }: AccountsActionsProps) {
  const [showImport, setShowImport] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [cookiesText, setCookiesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  async function handleImportCookies() {
    if (!selectedAccountId || !cookiesText.trim()) {
      setResult('请选择账号并输入Cookies');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/accounts/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          cookies: cookiesText.trim(),
        }),
      });
      const data = await res.json();
      setResult(data.message || data.error || '导入完成');
      if (res.ok) {
        setCookiesText('');
        setShowImport(false);
      }
    } catch (err) {
      setResult('导入失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="actions">
      <button
        className="btn btn-secondary"
        onClick={() => setShowImport(!showImport)}
      >
        导入Cookies
      </button>

      {showImport && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
          onClick={() => setShowImport(false)}
        >
          <div
            className="card"
            style={{ width: 500, maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header">导入Cookies</div>

            <div className="form-group">
              <label className="form-label">选择账号</label>
              <select
                className="form-select"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">-- 请选择 --</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} ({a.platform})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cookies 内容</label>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                支持两种格式：document.cookie 纯文本 或 JSON 数组
              </p>
              <textarea
                className="form-textarea"
                value={cookiesText}
                onChange={(e) => setCookiesText(e.target.value)}
                placeholder="粘贴Cookies内容..."
                rows={8}
              />
            </div>

            <div className="actions" style={{ marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={handleImportCookies}
                disabled={loading}
              >
                {loading ? '导入中...' : '确认导入'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowImport(false)}
              >
                取消
              </button>
            </div>

            {result && (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--accent)' }}>
                {result}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
