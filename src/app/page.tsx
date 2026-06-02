import { prisma } from '@/lib/db';
import Link from 'next/link';
import PlatformBadge from './platform-badge';

export default async function DashboardPage() {
  const totalReviews = await prisma.review.count();
  const totalAlerts = await prisma.alert.count({ where: { status: 'pending' } });
  const totalAccounts = await prisma.account.count();
  const handledAlerts = await prisma.alert.count({ where: { status: 'handled' } });

  const ratingAgg = await prisma.review.aggregate({ _avg: { rating: true } });
  const avgRating = ratingAgg._avg.rating ?? 0;

  const reviewsByPlatform = await prisma.review.groupBy({
    by: ['platform'],
    _count: true,
  });
  const maxPlatform = Math.max(1, ...reviewsByPlatform.map((p) => p._count));

  const recentAlerts = await prisma.alert.findMany({
    where: { status: 'pending' },
    include: { review: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div>
      <div className="page-header reveal">
        <div>
          <div className="page-eyebrow">Operations Overview</div>
          <h1>监控总览</h1>
          <p className="page-desc">
            横跨携程、飞猪、去哪儿三大平台的口碑信号，实时汇集于此。差评在出现的第一时间被捕获并预警。
          </p>
        </div>
      </div>

      <div className="stats-grid reveal d1">
        <div className="stat-card">
          <div className="stat-label">总评论数</div>
          <div className="stat-value">{totalReviews}</div>
          <div className="stat-foot">已归档的全部访客点评</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">待处理差评</div>
          <div className="stat-value is-rust">{totalAlerts}</div>
          <div className="stat-foot">需要人工跟进的预警</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">平均评分</div>
          <div className="stat-value is-gold">{avgRating.toFixed(1)}</div>
          <div className="stat-foot">全平台综合星级</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">监控账号</div>
          <div className="stat-value">{totalAccounts}</div>
          <div className="stat-foot">{handledAlerts} 条预警已妥善处理</div>
        </div>
      </div>

      <div className="two-col">
        <div className="card reveal d2">
          <div className="card-header">
            各平台评论分布
            <span className="count">BY PLATFORM</span>
          </div>
          {reviewsByPlatform.length === 0 ? (
            <div className="empty-state">
              <div className="mark">—</div>
              <h3>暂无数据</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {reviewsByPlatform.map((item) => (
                <div key={item.platform}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                    <PlatformBadge platform={item.platform} />
                    <span className="serif" style={{ fontSize: 22, fontWeight: 600 }}>{item._count}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--paper-sunk)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(item._count / maxPlatform) * 100}%`, background: 'var(--gold)', borderRadius: 100 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card reveal d3">
          <div className="card-header">
            最新差评预警
            <Link href="/reviews?view=alerts" className="count" style={{ color: 'var(--gold)' }}>查看全部 →</Link>
          </div>
          {recentAlerts.length === 0 ? (
            <div className="empty-state">
              <div className="mark">✦</div>
              <h3>一切安好</h3>
              <p>当前没有待处理的差评预警</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>平台</th>
                    <th>评分</th>
                    <th>访客</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td><PlatformBadge platform={alert.review.platform} /></td>
                      <td>
                        <span className={`rating ${alert.review.rating <= 3 ? 'rating-low' : ''}`}>
                          {alert.review.rating}
                          <span className="scale"> / {alert.review.ratingScale}</span>
                        </span>
                      </td>
                      <td className="cell-name">{alert.review.reviewerName}</td>
                      <td><span className="badge badge-pending">待处理</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
