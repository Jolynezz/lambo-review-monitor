import type { Metadata } from 'next';
import Nav from './nav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Toninelli Lamborghini · Review Console',
  description: '成都托尼洛兰博基尼酒店 · OTA 口碑监控与差评预警台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">
          <Nav />
          <div className="app-main">
            <main className="container">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
