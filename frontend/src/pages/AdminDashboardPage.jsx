import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Users,
  Package,
  TrendingUp,
  Check,
  X,
  Eye,
  Trash2,
  FileText,
  RefreshCw,
  UserCheck,
  UserX,
  Lock,
  ExternalLink
} from 'lucide-react';
import { formatINR, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'users' | 'audit'
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [metrics, setMetrics] = useState({
    totalUsers: 418,
    activeProducts: 86,
    totalVolumeInRupees: 72400,
    openReports: 2
  });

  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch metrics
      const metricsRes = await adminService.getDashboard().catch(() => null);
      if (metricsRes?.data) {
        setMetrics(metricsRes.data);
      }

      // 2. Fetch reports
      const reportsRes = await adminService.getReports({ limit: 50 }).catch(() => null);
      if (reportsRes?.data?.reports) {
        setReports(reportsRes.data.reports);
      }

      // 3. Fetch users
      const usersRes = await adminService.getUsers({ limit: 50 }).catch(() => null);
      if (usersRes?.data?.users) {
        setUsersList(usersRes.data.users);
      }

      // 4. Fetch audit logs
      const auditRes = await adminService.getAuditLogs({ limit: 30 }).catch(() => null);
      if (auditRes?.data?.logs) {
        setAuditLogs(auditRes.data.logs);
      }
    } catch (err) {
      console.error('Failed to refresh admin console data:', err);
      showToast('Error syncing live admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDismissReport = async (reportId) => {
    setActionLoadingId(reportId);
    try {
      await adminService.updateReport(reportId, {
        status: 'DISMISSED',
        adminNotes: 'Dismissed by campus moderator'
      });
      setReports((prev) => prev.filter((r) => (r._id || r.id) !== reportId));
      showToast('Report reviewed and dismissed.', 'info');
      // Refresh audit logs
      const auditRes = await adminService.getAuditLogs({ limit: 10 }).catch(() => null);
      if (auditRes?.data?.logs) setAuditLogs(auditRes.data.logs);
    } catch (err) {
      showToast(err.message || 'Failed to dismiss report', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelistProduct = async (report) => {
    const reportId = report._id || report.id;
    const productId = report.reportedProductId?._id || report.productId;
    const itemTitle = report.reportedProductId?.title || report.reportedItem || 'Listing';

    setActionLoadingId(reportId);
    try {
      // 1. Update product status to INACTIVE
      if (productId) {
        await adminService.updateProductStatus(productId, {
          status: 'INACTIVE',
          reason: `Violated campus policy: ${report.reason}`
        });
      }

      // 2. Resolve the report
      await adminService.updateReport(reportId, {
        status: 'RESOLVED',
        adminNotes: `Item delisted by administrator due to policy infraction (${report.reason}).`
      });

      setReports((prev) => prev.filter((r) => (r._id || r.id) !== reportId));
      showToast(`Listing "${itemTitle}" has been delisted from catalog.`, 'warning');

      // Refresh metrics & audit logs
      fetchAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to moderate product listing', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleUserStatus = async (targetUser) => {
    const targetUserId = targetUser._id || targetUser.id;
    const isCurrentlyActive = targetUser.status === 'ACTIVE';
    const newStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';

    if (user?._id === targetUserId) {
      showToast('You cannot suspend your own admin account.', 'error');
      return;
    }

    setActionLoadingId(targetUserId);
    try {
      await adminService.updateUserStatus(targetUserId, {
        status: newStatus,
        reason: isCurrentlyActive ? 'Account suspended for rule violation' : 'Account reactivated'
      });

      setUsersList((prev) =>
        prev.map((u) => ((u._id || u.id) === targetUserId ? { ...u, status: newStatus } : u))
      );

      showToast(
        `User ${targetUser.name} marked as ${newStatus}.`,
        newStatus === 'ACTIVE' ? 'success' : 'warning'
      );

      // Refresh audit logs
      const auditRes = await adminService.getAuditLogs({ limit: 10 }).catch(() => null);
      if (auditRes?.data?.logs) setAuditLogs(auditRes.data.logs);
    } catch (err) {
      showToast(err.error?.message || err.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Campus Integrity & Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Admin Moderation Console</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce peer marketplace rules, review student complaints, and oversee university users
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          <span>Sync Console</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Students</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalUsers ?? 418}</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Listings</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.activeProducts ?? 86}</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Volume</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">
              ₹{Number(metrics.totalVolumeInRupees || 72400).toLocaleString('en-IN')}
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Reports</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-rose-600">{reports.length}</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'reports' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Flagged Items ({reports.length})</span>
          {activeTab === 'reports' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'users' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Campus Users ({usersList.length})</span>
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative ${
            activeTab === 'audit' ? 'text-teal-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Audit Trail ({auditLogs.length})</span>
          {activeTab === 'audit' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab 1: Reports Queue */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Student Flagged Listings ({reports.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Campus moderator decision required</span>
          </div>

          {reports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {reports.map((rep) => {
                const repId = rep._id || rep.id;
                const itemTitle = rep.reportedProductId?.title || rep.reportedItem || 'Unknown Listing';
                const reporterName = rep.reporterId?.name || rep.reporter?.name || rep.reporter || 'Verified Student';
                const isOperating = actionLoadingId === repId;

                return (
                  <div key={repId} className="p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {rep.reason}
                        </span>
                        <strong className="text-sm text-slate-900">{itemTitle}</strong>
                      </div>
                      <span className="text-xs text-slate-400">
                        Flagged by {reporterName} • {formatDate(rep.createdAt || rep.reportedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      "{rep.details}"
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleDismissReport(repId)}
                        disabled={isOperating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Dismiss Report</span>
                      </button>

                      <button
                        onClick={() => handleDelistProduct(rep)}
                        disabled={isOperating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove / Delist Listing</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-slate-500">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Moderation Queue Clear</p>
              <p>No open flags or suspicious student listings right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users List */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Enrolled Campus Accounts ({usersList.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Campus directory management</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Institution / Dept</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map((usr) => {
                  const usrId = usr._id || usr.id;
                  const isOperating = actionLoadingId === usrId;
                  const isSelf = user?._id === usrId;

                  return (
                    <tr key={usrId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{usr.name}</div>
                        <div className="text-[11px] text-slate-400">{usr.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            usr.role === 'ADMIN'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : usr.role === 'SELLER'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {usr.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{usr.college}</div>
                        <div className="text-[11px] text-slate-400">{usr.department}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                            usr.status === 'SUSPENDED' ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              usr.status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                          />
                          {usr.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-400 italic">Current User</span>
                        ) : usr.role === 'ADMIN' ? (
                          <span className="text-[11px] text-slate-400">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(usr)}
                            disabled={isOperating}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                              usr.status === 'SUSPENDED'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {usr.status === 'SUSPENDED' ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Admin Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Platform Security & Moderation Log
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Append-only compliance audit</span>
          </div>

          <div className="space-y-2 text-xs">
            {auditLogs.map((log, idx) => {
              const actorName = log.actorId?.name || 'Moderator / System';
              const detail =
                log.detail ||
                log.metadata?.reason ||
                log.metadata?.note ||
                `Target: ${log.targetType || 'SYSTEM'} ${log.targetId || ''}`;

              return (
                <div
                  key={log._id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {log.action}
                    </span>
                    <div>
                      <span className="text-slate-800 font-semibold">{actorName}: </span>
                      <span className="text-slate-600">{detail}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap ml-4">
                    {formatDate(log.createdAt || log.time)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
