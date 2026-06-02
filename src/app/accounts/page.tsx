import { prisma } from '@/lib/db';
import AccountsActions from './actions';
import RealLoginButton from './real-login-button';

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  const platformLabels: Record<string, string> = {
    ctrip: '携程',
    fliggy: '飞猪',
    qunar: '去哪儿',
  };

  const statusLabels: Record<string, string> = {
    none: '未登录',
    logged_in: '已登录',
    expired: '已过期',
  };

  const statusBadgeClass: Record<string, string> = {
    none: 'badge-dismissed',
    logged_in: 'badge-success',
    expired: 'badge-danger',
  };

  return (
    <div>
      <div className="page-header">
        <h1>账号管理</h1>
        <AccountsActions accounts={accounts} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>平台</th>
                <th>标签</th>
                <th>登录状态</th>
                <th>评论数</th>
                <th>最后登录</th>
                <th>最后抓取</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <span className="badge badge-platform">
                      {platformLabels[account.platform] || account.platform}
                    </span>
                  </td>
                  <td>{account.label}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass[account.sessionStatus] || 'badge-dismissed'}`}>
                      {statusLabels[account.sessionStatus] || account.sessionStatus}
                    </span>
                  </td>
                  <td>{account._count.reviews}</td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {account.lastLoginAt
                      ? new Date(account.lastLoginAt).toLocaleString('zh-CN')
                      : '-'}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {account.lastScrapeAt
                      ? new Date(account.lastScrapeAt).toLocaleString('zh-CN')
                      : '-'}
                  </td>
                  <td>
                    <RealLoginButton accountId={account.id} accountLabel={account.label} />
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <h3>暂无账号</h3>
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
