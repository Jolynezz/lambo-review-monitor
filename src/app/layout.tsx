import type { Metadata } from 'next';
import Nav from './nav';

export const metadata: Metadata = {
  title: 'Lamborghini Review Monitor',
  description: '成都托尼洛兰博基尼酒店 OTA 差评监控与通知系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Nav />
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
