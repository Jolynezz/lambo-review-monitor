'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '监控总览', en: 'Overview' },
  { href: '/history', label: '历史口碑', en: 'Archive' },
  { href: '/reviews', label: '评论 · 差评', en: 'Reviews' },
  { href: '/accounts', label: '账号管理', en: 'Accounts' },
  { href: '/settings', label: '检测设置', en: 'Settings' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Tonino Lamborghini Resort" className="brand-logo" />
        <div className="brand-sub">Chengdu · Review Console</div>
        <div className="brand-rule" />
      </Link>

      <nav>
        <div className="nav-section-label">导览</div>
        <ul className="nav-list">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className={`nav-link${isActive ? ' active' : ''}`}>
                  <span className="nav-idx">{String(i + 1).padStart(2, '0')}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-foot">
        <span className="mode-chip">
          <span className="mode-dot" />
          系统运行中 · Mock
        </span>
        <div className="copy">成都托尼洛兰博基尼酒店<br />OTA 口碑监控台 © 2026</div>
      </div>
    </aside>
  );
}
