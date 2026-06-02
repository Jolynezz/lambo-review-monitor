'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ReviewRecord {
  id: string;
  platform: string;
  externalId: string;
  rating: number;
  ratingScale: number;
  reviewerName: string;
  content: string;
  roomType: string;
  stayDate: string | null;
  replyStatus: string;
  scrapedAt: string;
  alert: {
    id: string;
    status: string;
    reasons: string[];
    matchedKeywords: string[];
  } | null;
}

interface HistoryResponse {
  data: ReviewRecord[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    totalReviews: number;
    negativeReviews: number;
    avgRating: number;
    repliedCount: number;
  };
}

const platformLabels: Record<string, string> = {
  ctrip: '携程',
  fliggy: '飞猪',
  qunar: '去哪儿',
};

const reviewTypes = [
  { key: 'all', label: '全部' },
  { key: 'negative', label: '差评' },
  { key: 'positive', label: '好评' },
];

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const filtersRef = useRef({
    platform: '',
    reviewType: 'all',
    replyStatus: '',
    minRating: '',
    maxRating: '',
    dateFrom: '',
    dateTo: '',
    keyword: '',
    page: 1,
  });

  const [filters, setFilters] = useState(filtersRef.current);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const f = filtersRef.current;
      const params = new URLSearchParams();
      if (f.platform) params.set('platform', f.platform);
      if (f.reviewType) params.set('reviewType', f.reviewType);
      if (f.replyStatus) params.set('replyStatus', f.replyStatus);
      if (f.minRating) params.set('minRating', f.minRating);
      if (f.maxRating) params.set('maxRating', f.maxRating);
      if (f.dateFrom) params.set('dateFrom', f.dateFrom);
      if (f.dateTo) params.set('dateTo', f.dateTo);
      if (f.keyword) params.set('keyword', f.keyword);
      params.set('page', String(f.page));
      params.set('pageSize', '10');

      const res = await fetch(`/api/reviews/history?${params}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDataRef = useRef(fetchCallback);
  fetchDataRef.current = fetchData;

  function fetchCallback() {
    return fetchData();
  }

  useEffect(() => {
    fetchDataRef.current();
  }, []);

  function handleFilterChange(key: string, value: string) {
    const newFilters = { ...filtersRef.current, [key]: value, page: 1 };
    filtersRef.current = newFilters;
    setFilters(newFilters);
  }

  function handleSearch() {
    fetchDataRef.current();
  }

  function handlePageChange(page: number) {
    const newFilters = { ...filtersRef.current, page };
    filtersRef.current = newFilters;
    setFilters(newFilters);
    fetchDataRef.current();
  }

  async function handleMarkHandled(alertId: string) {
    try {
      await fetch('/api/reviews/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'handled' }),
      });
      fetchDataRef.current();
    } catch (err) {
      console.error('Failed to mark:', err);
    }
  }

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;

  return (
    <div>
      <div className="page-header reveal">
        <div>
          <div className="page-eyebrow">The Archive</div>
          <h1>历史口碑</h1>
          <p className="page-desc">检索全量历史点评——按平台、评分、日期与关键词多维筛选，回溯口碑变迁。</p>
        </div>
      </div>

      {data && (
        <div className="stats-grid reveal d1">
          <div className="stat-card">
            <div className="stat-label">总评论数</div>
            <div className="stat-value">{data.stats.totalReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">差评数</div>
            <div className="stat-value is-rust">{data.stats.negativeReviews}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">平均评分</div>
            <div className="stat-value is-gold">{data.stats.avgRating.toFixed(1)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">已回复</div>
            <div className="stat-value is-olive">{data.stats.repliedCount}</div>
          </div>
        </div>
      )}

      <div className="card reveal d2">
        <div className="card-header">
          检索条件
          <div className="toggle">
            {reviewTypes.map((t) => (
              <button
                key={t.key}
                className={filters.reviewType === t.key ? 'active' : ''}
                onClick={() => { handleFilterChange('reviewType', t.key); fetchDataRef.current(); }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">平台</label>
            <select className="form-select" value={filters.platform} onChange={(e) => handleFilterChange('platform', e.target.value)}>
              <option value="">全部</option>
              <option value="ctrip">携程</option>
              <option value="fliggy">飞猪</option>
              <option value="qunar">去哪儿</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">回复状态</label>
            <select className="form-select" value={filters.replyStatus} onChange={(e) => handleFilterChange('replyStatus', e.target.value)}>
              <option value="">全部</option>
              <option value="replied">已回复</option>
              <option value="none">未回复</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">最低评分</label>
            <input type="number" className="form-input" min="0" max="5" step="0.5" value={filters.minRating} onChange={(e) => handleFilterChange('minRating', e.target.value)} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">最高评分</label>
            <input type="number" className="form-input" min="0" max="5" step="0.5" value={filters.maxRating} onChange={(e) => handleFilterChange('maxRating', e.target.value)} placeholder="5" />
          </div>
          <div className="form-group">
            <label className="form-label">开始日期</label>
            <input type="date" className="form-input" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">结束日期</label>
            <input type="date" className="form-input" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">关键词</label>
            <input type="text" className="form-input" value={filters.keyword} onChange={(e) => handleFilterChange('keyword', e.target.value)} placeholder="搜索评论内容…" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>检索</button>
        </div>
      </div>

      <div className="card reveal d3">
        <div className="card-header">
          检索结果
          {data && <span className="count">共 {data.total} 条</span>}
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
                <th>抓取时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row"><td colSpan={10}>检索中 …</td></tr>
              ) : data && data.data.length > 0 ? (
                data.data.map((review) => (
                  <tr key={review.id}>
                    <td><span className="badge badge-platform">{platformLabels[review.platform] || review.platform}</span></td>
                    <td>
                      <span className={`rating ${review.rating <= 3 ? 'rating-low' : ''}`}>
                        {review.rating}<span className="scale"> / {review.ratingScale}</span>
                      </span>
                    </td>
                    <td className="cell-name">{review.reviewerName}</td>
                    <td className="review-content">
                      {review.content.slice(0, 60)}{review.content.length > 60 ? '…' : ''}
                      {review.alert && review.alert.matchedKeywords.length > 0 && (
                        <div className="keywords">
                          {review.alert.matchedKeywords.map((k, i) => (
                            <span key={i} className="keyword-tag">{k}</span>
                          ))}
                        </div>
                      )}
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
                    <td className="cell-time">{new Date(review.scrapedAt).toLocaleDateString('zh-CN')}</td>
                    <td>
                      {review.alert?.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleMarkHandled(review.alert!.id)}>标记已处理</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <div className="mark">—</div>
                      <h3>暂无匹配数据</h3>
                      <p>尝试放宽筛选条件</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && totalPages > 1 && (
          <div className="pagination">
            <button disabled={filters.page <= 1} onClick={() => handlePageChange(filters.page - 1)}>上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={p === filters.page ? 'active' : ''} onClick={() => handlePageChange(p)}>{p}</button>
            ))}
            <button disabled={filters.page >= totalPages} onClick={() => handlePageChange(filters.page + 1)}>下一页</button>
          </div>
        )}
      </div>
    </div>
  );
}
