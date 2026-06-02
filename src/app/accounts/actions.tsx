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
      setResult('请选择账号并输入 Cookies');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/accounts/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccountId, cookies: cookiesText.trim() }),
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
      <button className="btn btn-secondary" onClick={() => setShowImport(true)}>导入 Cookies</button>

      {showImport && (
        <div className="modal-scrim" onClick={() => setShowImport(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">导入 Cookies</div>
            <div className="modal-sub">为指定账号注入登录态，免去真实登录流程。</div>

            <div className="form-group">
              <label className="form-label">选择账号</label>
              <select className="form-select" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
                <option value="">— 请选择 —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}（{a.platform}）</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cookies 内容</label>
              <textarea
                className="form-textarea"
                value={cookiesText}
                onChange={(e) => setCookiesText(e.target.value)}
                placeholder="粘贴 Cookies 内容…"
                rows={8}
              />
              <p className="form-hint">支持两种格式：document.cookie 纯文本，或 JSON 数组。</p>
            </div>

            <div className="actions" style={{ marginTop: 4 }}>
              <button className="btn btn-gold" onClick={handleImportCookies} disabled={loading}>
                {loading ? '导入中…' : '确认导入'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowImport(false)}>取消</button>
              {result && <span className="toast">{result}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
