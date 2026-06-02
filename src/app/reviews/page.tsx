import { prisma } from '@/lib/db';
import ReviewsActions from './actions';
import PlatformBadge from '../platform-badge';

interface PageProps {
  searchParams: { platform?: string; status?: string; view?: string };
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const platform = searchParams.platform || '';
  const status = searchParams.status || '';
  const view = searchParams.view || 'all';

  const where: Record<string, unknown> = {};
  if (platform) where.platform = platform;

  if (view === 'alerts') {
    where.alert = status ? { status } : { isNot: null };
  } else if (status === 'replied' || status === 'none') {
    where.replyStatus = status;
  }

  const reviews = await prisma.review.findMany({
    where,
    include: { alert: true, account: true },
    orderBy: { scrapedAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <div className="page-header reveal">
        <div>
          <div className="page-eyebrow">Voice of the Guest</div>
          <h1>评论 · 差评</h1>
          <p className="page-desc">逐条审阅访客点评，对触发预警的差评进行跟进与归档。</p>
        </div>
        <ReviewsActions />
      </div>

      <div className="card reveal d1" style={{ paddingBottom: 22 }}>
        <form method="GET" className="filter-bar">
          <div className="form-group">
            <label className="form-label">平台</label>
            <select className="form-select" name="platform" defaultValue={platform}>
              <option value="">全部平台</option>
              <option value="ctrip">携程</option>
              <option value="fliggy">飞猪</option>
              <option value="qunar">去哪儿</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">视图</label>
            <select className="form-select" name="view" defaultValue={view}>
              <option value="all">全部评论</option>
              <option value="alerts">仅差评预警</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">状态</label>
            <select className="form-select" name="status" defaultValue={status}>
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="handled">已处理</option>
              <option value="dismissed">已忽略</option>
              <option value="replied">已回复</option>
              <option value="none">未回复</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit">应用筛选</button>
        </form>
      </div>

      <div className="card reveal d2">
        <div className="card-header">
          评论明细
          <span className="count">{reviews.length} 条 · 最多展示 50</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>平台</th>
                <th>评分</th>
                <th>访客</th>
                <th>内容</th>
                <th>房型</th>
                <th>入住</th>
                <th>回复</th>
                <th>预警</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td><PlatformBadge platform={review.platform} /></td>
                  <td>
                    <span className={`rating ${review.rating <= 3 ? 'rating-low' : ''}`}>
                      {review.rating}
                      <span className="scale"> / {review.ratingScale}</span>
                    </span>
                  </td>
                  <td className="cell-name">{review.reviewerName}</td>
                  <td className="review-content">
                    {review.content.slice(0, 80)}
                    {review.content.length > 80 ? '…' : ''}
                  </td>
                  <td className="cell-dim">{review.roomType || '—'}</td>
                  <td className="cell-dim">{review.stayDate || '—'}</td>
                  <td>
                    <span className={`badge ${review.replyStatus === 'replied' ? 'badge-success' : 'badge-pending'}`}>
                      {review.replyStatus === 'replied' ? '已回复' : '未回复'}
                    </span>
                  </td>
                  <td>
                    {review.alert ? (
                      <span className={`badge badge-${review.alert.status === 'pending' ? 'pending' : review.alert.status === 'handled' ? 'handled' : 'dismissed'}`}>
                        {review.alert.status === 'pending' ? '待处理' : review.alert.status === 'handled' ? '已处理' : '已忽略'}
                      </span>
                    ) : (
                      <span className="cell-dim">—</span>
                    )}
                  </td>
                  <td>
                    {review.alert?.status === 'pending' && (
                      <form action="/api/reviews/mark" method="POST">
                        <input type="hidden" name="alertId" value={review.alert.id} />
                        <input type="hidden" name="status" value="handled" />
                        <button type="submit" className="btn btn-ghost btn-sm">标记已处理</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="mark">—</div>
                      <h3>暂无评论数据</h3>
                      <p>调整筛选条件，或手动触发一次抓取</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
