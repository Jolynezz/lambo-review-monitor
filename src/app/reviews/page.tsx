import { prisma } from '@/lib/db';
import ReviewsActions from './actions';

interface PageProps {
  searchParams: { platform?: string; status?: string; view?: string };
}

export default async function ReviewsPage({ searchParams }: PageProps) {
  const platform = searchParams.platform || '';
  const status = searchParams.status || '';
  const view = searchParams.view || 'all';

  const where: Record<string, unknown> = {};

  if (platform) {
    where.platform = platform;
  }

  if (view === 'alerts') {
    where.alert = { isNot: null };
    if (status) {
      where.alert = { ...(where.alert as object), status };
    }
  } else if (status === 'replied' || status === 'none') {
    where.replyStatus = status;
  }

  const reviews = await prisma.review.findMany({
    where,
    include: { alert: true, account: true },
    orderBy: { scrapedAt: 'desc' },
    take: 50,
  });

  const platformLabels: Record<string, string> = {
    ctrip: '携程',
    fliggy: '飞猪',
    qunar: '去哪儿',
  };

  return (
    <div>
      <div className="page-header">
        <h1>评论/差评</h1>
        <ReviewsActions />
      </div>

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">平台</label>
          <select className="form-select" defaultValue={platform}>
            <option value="">全部平台</option>
            <option value="ctrip">携程</option>
            <option value="fliggy">飞猪</option>
            <option value="qunar">去哪儿</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">视图</label>
          <select className="form-select" defaultValue={view}>
            <option value="all">全部评论</option>
            <option value="alerts">仅差评告警</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">状态</label>
          <select className="form-select" defaultValue={status}>
            <option value="">全部状态</option>
            <option value="pending">待处理</option>
            <option value="handled">已处理</option>
            <option value="dismissed">已忽略</option>
            <option value="replied">已回复</option>
            <option value="none">未回复</option>
          </select>
        </div>
        <button className="btn btn-primary" type="button">筛选</button>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>平台</th>
                <th>评分</th>
                <th>评论者</th>
                <th>内容</th>
                <th>房型</th>
                <th>入住日期</th>
                <th>回复状态</th>
                <th>告警</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <span className="badge badge-platform">
                      {platformLabels[review.platform] || review.platform}
                    </span>
                  </td>
                  <td>
                    <span className={`rating ${review.rating <= 3 ? 'rating-low' : ''}`}>
                      {review.rating}/{review.ratingScale}
                    </span>
                  </td>
                  <td>{review.reviewerName}</td>
                  <td className="review-content">{review.content.slice(0, 80)}...</td>
                  <td>{review.roomType}</td>
                  <td>{review.stayDate || '-'}</td>
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
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    {review.alert?.status === 'pending' && (
                      <form action="/api/reviews/mark" method="POST">
                        <input type="hidden" name="alertId" value={review.alert.id} />
                        <input type="hidden" name="status" value="handled" />
                        <button type="submit" className="btn btn-sm btn-secondary">
                          标记已处理
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <h3>暂无评论数据</h3>
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
