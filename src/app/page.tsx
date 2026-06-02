import { prisma } from '@/lib/db';

export default async function DashboardPage() {
  const totalReviews = await prisma.review.count();
  const totalAlerts = await prisma.alert.count({ where: { status: 'pending' } });
  const totalAccounts = await prisma.account.count();
  const handledAlerts = await prisma.alert.count({ where: { status: 'handled' } });

  // 按平台统计
  const reviewsByPlatform = await prisma.review.groupBy({
    by: ['platform'],
    _count: true,
  });

  // 最近差评
  const recentAlerts = await prisma.alert.findMany({
    where: { status: 'pending' },
    include: { review: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const platformLabels: Record<string, string> = {
    ctrip: '携程',
    fliggy: '飞猪',
    qunar: '去哪儿',
  };

  return (
    <div>
      <div className="page-header">
        <h1>数据看板</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalReviews}</div>
          <div className="stat-label">总评论数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--danger)' }}>{totalAlerts}</div>
          <div className="stat-label">待处理差评</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{handledAlerts}</div>
          <div className="stat-label">已处理</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalAccounts}</div>
          <div className="stat-label">监控账号</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header">各平台评论数</div>
          <table>
            <thead>
              <tr>
                <th>平台</th>
                <th>评论数</th>
              </tr>
            </thead>
            <tbody>
              {reviewsByPlatform.map((item) => (
                <tr key={item.platform}>
                  <td>
                    <span className="badge badge-platform">
                      {platformLabels[item.platform] || item.platform}
                    </span>
                  </td>
                  <td>{item._count}</td>
                </tr>
              ))}
              {reviewsByPlatform.length === 0 && (
                <tr>
                  <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">最近差评告警</div>
          {recentAlerts.length === 0 ? (
            <div className="empty-state">
              <h3>暂无待处理差评</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>平台</th>
                  <th>评分</th>
                  <th>评论者</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className="badge badge-platform">
                        {platformLabels[alert.review.platform] || alert.review.platform}
                      </span>
                    </td>
                    <td>
                      <span className={`rating ${alert.review.rating <= 3 ? 'rating-low' : ''}`}>
                        {alert.review.rating}/{alert.review.ratingScale}
                      </span>
                    </td>
                    <td>{alert.review.reviewerName}</td>
                    <td>
                      <span className="badge badge-pending">待处理</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
