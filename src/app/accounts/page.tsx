import { prisma } from '@/lib/db';
import AccountsActions from './actions';
import RealLoginButton from './real-login-button';

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

export default async function AccountsPage() {
  const accounts = await prisma.account.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div>
      <div className="page-header reveal">
        <div>
          <div className="page-eyebrow">Credentials</div>
          <h1>账号管理</h1>
          <p className="page-desc">维护各 OTA 平台的登录态。可通过真实登录或导入 Cookies 建立会话。</p>
        </div>
        <AccountsActions accounts={accounts} />
      </div>

      <div className="card reveal d1">
        <div className="card-header">
          平台账号
          <span className="count">{accounts.length} 个账号</span>
        </div>
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
                  <td><span className="badge badge-platform">{platformLabels[account.platform] || account.platform}</span></td>
                  <td className="cell-name">{account.label}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass[account.sessionStatus] || 'badge-dismissed'}`}>
                      {statusLabels[account.sessionStatus] || account.sessionStatus}
                    </span>
                  </td>
                  <td>{account._count.reviews}</td>
                  <td className="cell-time">
                    {account.lastLoginAt ? new Date(account.lastLoginAt).toLocaleString('zh-CN') : '—'}
                  </td>
                  <td className="cell-time">
                    {account.lastScrapeAt ? new Date(account.lastScrapeAt).toLocaleString('zh-CN') : '—'}
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
                      <div className="mark">—</div>
                      <h3>暂无账号</h3>
                      <p>请先在数据库中创建监控账号</p>
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
