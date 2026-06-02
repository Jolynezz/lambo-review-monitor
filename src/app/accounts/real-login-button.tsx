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
    setMessage('正在启动浏览器...');
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
    setMessage('正在保存登录信息...');
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
      <button
        className="btn btn-sm btn-primary"
        onClick={startLogin}
        disabled={isLoggingIn}
      >
        {isLoggingIn ? '登录中...' : '真实登录'}
      </button>

      {showDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
          }}
        >
          <div
            className="card"
            style={{ width: 450, padding: 24 }}
          >
            <h3 style={{ marginBottom: 16 }}>🔐 登录 {accountLabel}</h3>
            
            <div style={{ marginBottom: 20, lineHeight: 1.6 }}>
              {message}
            </div>

            {isLoggingIn && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  onClick={completeLogin}
                >
                  我已完成登录
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={cancelLogin}
                >
                  取消
                </button>
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
              💡 提示：点击"真实登录"后会弹出浏览器窗口，请在浏览器中完成携程的扫码或密码登录，然后回到这里点击"我已完成登录"。
            </div>
          </div>
        </div>
      )}
    </>
  );
}
