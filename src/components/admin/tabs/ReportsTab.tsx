import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminReport } from '../../../supabase/adminDb';
import { CheckCircle, Ban, ArrowRight, ShieldAlert, RefreshCw } from 'lucide-react';

export const ReportsTab: React.FC = () => {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id: string, status: 'resolved' | 'dismissed') => {
    await adminDb.updateReportStatus(id, status);
    await adminDb.createAdminLog('Resolve Report', id, `Marked player report ${id} as ${status}.`);
    fetchReports();
  };

  const handleFastBan = async (report: AdminReport) => {
    if (window.confirm(`FAST BAN: Ban reported player ${report.reported_username} permanently?`)) {
      await adminDb.updateUser(report.reported_id, { is_banned: true });
      await adminDb.updateReportStatus(report.id, 'resolved');
      await adminDb.createAdminLog('Ban User (Report)', report.reported_id, `Permanently banned ${report.reported_username} after audit of report ${report.id}.`);
      fetchReports();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and sync */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
          Toxicity & Abuse Reporting Hub
        </h4>
        <button 
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070A12] border border-gray-800 rounded font-orbitron text-[10px] text-gray-400 hover:text-white uppercase transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs bg-cyberPanel border border-gray-900 rounded">Scanning security logs...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs bg-cyberPanel border border-gray-900 rounded">No pending abuse reports found. Excellent community behavior.</div>
        ) : (
          reports.map((report) => (
            <div 
              key={report.id} 
              className={`bg-cyberPanel border p-5 rounded flex flex-col md:flex-row gap-5 justify-between shadow-lg relative ${
                report.status === 'pending' ? 'border-red-500/10 hover:border-red-500/35' : 'border-gray-900 opacity-60'
              }`}
            >
              <div className="space-y-3 flex-1 text-xs">
                {/* Header info */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-orbitron font-bold border ${
                    report.status === 'pending' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    report.status === 'resolved' ? 'bg-cyberGreen/10 border-cyberGreen/20 text-cyberGreen' :
                    'bg-gray-950 border-gray-850 text-gray-500'
                  }`}>
                    {report.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">{new Date(report.timestamp).toLocaleString()}</span>
                </div>

                {/* Conflict players */}
                <div className="flex items-center gap-2 font-mono font-bold text-gray-200">
                  <span className="text-cyberBlue">{report.reporter_username}</span>
                  <ArrowRight size={12} className="text-gray-500 shrink-0" />
                  <span className="text-red-400 flex items-center gap-1"><ShieldAlert size={12} /> {report.reported_username}</span>
                </div>

                {/* Reason description */}
                <div className="space-y-1 bg-[#070A12] border border-gray-950 p-3 rounded font-mono">
                  <div className="text-cyberGold text-[10px] font-orbitron font-bold uppercase tracking-wider mb-1">REASON: {report.reason}</div>
                  <p className="text-gray-400 leading-relaxed text-[11px]">{report.details}</p>
                </div>
              </div>

              {/* Actions right */}
              {report.status === 'pending' && (
                <div className="flex flex-row md:flex-col justify-end gap-2 shrink-0 md:min-w-44 pt-3 md:pt-0">
                  <button
                    onClick={() => handleFastBan(report)}
                    className="flex-1 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-black font-orbitron font-bold uppercase rounded text-[9px] tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <Ban size={12} /> Fast Ban
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'resolved')}
                    className="flex-1 py-2 bg-cyberGreen/10 border border-cyberGreen/20 hover:bg-cyberGreen hover:text-black text-cyberGreen font-orbitron font-bold uppercase rounded text-[9px] tracking-widest cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={12} /> Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, 'dismissed')}
                    className="flex-1 py-2 border border-gray-800 text-gray-400 hover:text-white font-orbitron text-[9px] uppercase tracking-widest rounded cursor-pointer transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
