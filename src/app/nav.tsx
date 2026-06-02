'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './globals.css';

const navItems = [
  { href: '/', label: '数据看板', icon: '📊' },
  { href: '/history', label: '历史看板', icon: '📚' },
  { href: '/reviews', label: '评论/差评', icon: '💬' },
  { href: '/accounts', label: '账号管理', icon: '🔑' },
  { href: '/settings', label: '检测设置', icon: '⚙️' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        height: 56,
        gap: 4,
      }}>
        <Link href="/" style={{
          fontWeight: 700,
          fontSize: 16,
          color: 'var(--accent)',
          marginRight: 24,
          whiteSpace: 'nowrap',
        }}>
          Lamborghini Review Monitor
        </Link>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius)',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {item.icon} {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
