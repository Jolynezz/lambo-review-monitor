'use client';

import { useState } from 'react';

interface RealLoginButtonProps {
  accountId: string;
  accountLabel: string;
}

export default function RealLoginButton({ accountId, accountLabel }: RealLoginButtonProps) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState('');

  async function startLogin() {
    setIsLoggingIn(true);
    setMessage('正在启动浏览器…');
    setShowDialog(true);
    try {
      const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, action: 'start' }),
      });
      const data = await res.json();
      setMessage(data.message || '浏览器已弹出，请完成登录');
    } catch (err) {
      setMessage('启动登录失败: ' + (err as Error).message);
      setIsLoggingIn(false);
    }
  }

  async function completeLogin() {
    setMessage('正在保存登录信息…');
    try {
      const res = await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, action: 'complete' }),
      });
      const data = await res.json();
      setMessage(data.message || '登录完成');
      if (data.status === 'success') {
        setTimeout(() => {
          setShowDialog(false);
          setIsLoggingIn(false);
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setMessage('保存登录信息失败: ' + (err as Error).message);
    }
  }

  async function cancelLogin() {
    try {
      await fetch('/api/accounts/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, action: 'cancel' }),
      });
    } catch {}
    setShowDialog(false);
    setIsLoggingIn(false);
    setMessage('');
  }

  return (
    <>
      <button className="btn btn-ghost btn-sm" onClick={startLogin} disabled={isLoggingIn}>
        {isLoggingIn ? '登录中…' : '真实登录'}
      </button>

      {showDialog && (
        <div className="modal-scrim">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-title">登录 · {accountLabel}</div>
            <div className="modal-sub">在弹出的浏览器中完成平台登录，随后返回确认。</div>

            <div style={{
              padding: '16px 18px', background: 'var(--paper-3)', border: '1px solid var(--line)',
              borderRadius: 'var(--radius)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)', marginBottom: 20,
            }}>
              {message}
            </div>

            {isLoggingIn && (
              <div className="actions">
                <button className="btn btn-gold" onClick={completeLogin}>我已完成登录</button>
                <button className="btn btn-secondary" onClick={cancelLogin}>取消</button>
              </div>
            )}

            <p className="form-hint" style={{ marginTop: 18 }}>
              点击「真实登录」后会弹出浏览器窗口，请在其中完成扫码或密码登录，再回到此处点击「我已完成登录」。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
