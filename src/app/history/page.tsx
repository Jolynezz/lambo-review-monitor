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

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // 使用 useRef 存储筛选参数，避免 useEffect 闭包问题
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

  // 使用 ref 保存 fetchData，避免 useEffect 依赖变化
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
      <div className="page-header">
        <h1>历史差评看板</h1>
      </div>

      {/* 统计卡片 */}
      {data && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{data.stats.totalReviews}</div>
            <div className="stat-label">总评论数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--danger)' }}>
              {data.stats.negativeReviews}
            </div>
            <div className="stat-label">差评数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.stats.avgRating.toFixed(1)}</div>
            <div className="stat-label">平均评分</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success)' }}>
              {data.stats.repliedCount}
            </div>
            <div className="stat-label">已回复</div>
          </div>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="card">
        <div className="filter-bar">
          <div className="form-group">
            <label className="form-label">平台</label>
            <select
              className="form-select"
              value={filters.platform}
              onChange={(e) => handleFilterChange('platform', e.target.value)}
            >
              <option value="">全部</option>
              <option value="ctrip">携程</option>
              <option value="fliggy">飞猪</option>
              <option value="qunar">去哪儿</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">评论类型</label>
            <select
              className="form-select"
              value={filters.reviewType}
              onChange={(e) => handleFilterChange('reviewType', e.target.value)}
            >
              <option value="all">全部</option>
              <option value="negative">差评</option>
              <option value="positive">好评</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">回复状态</label>
            <select
              className="form-select"
              value={filters.replyStatus}
              onChange={(e) => handleFilterChange('replyStatus', e.target.value)}
            >
              <option value="">全部</option>
              <option value="replied">已回复</option>
              <option value="none">未回复</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">最低评分</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="5"
              step="0.5"
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">最高评分</label>
            <input
              type="number"
              className="form-input"
              min="0"
              max="5"
              step="0.5"
              value={filters.maxRating}
              onChange={(e) => handleFilterChange('maxRating', e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="form-group">
            <label className="form-label">开始日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">结束日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">关键词搜索</label>
            <input
              type="text"
              className="form-input"
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              placeholder="搜索评论内容..."
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            搜索
          </button>
        </div>
      </div>

      {/* 数据表格 */}
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
                <th>抓取时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    加载中...
                  </td>
                </tr>
              ) : data && data.data.length > 0 ? (
                data.data.map((review) => (
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
                    <td className="review-content">{review.content.slice(0, 60)}...</td>
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
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {new Date(review.scrapedAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td>
                      {review.alert?.status === 'pending' && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleMarkHandled(review.alert!.id)}
                        >
                          标记已处理
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <h3>暂无匹配数据</h3>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {data && totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={p === filters.page ? 'active' : ''}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              disabled={filters.page >= totalPages}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
