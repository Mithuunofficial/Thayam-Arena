import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import { Search, RefreshCw } from 'lucide-react';

export const LogsTab: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fix: import adminDb correctly from supabase/adminDb
  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Wait, let's use the local storage method via the adminDb service
      const data = await adminDb.getAdminLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    return log.admin_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
           log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (log.target_id && log.target_id.includes(searchQuery));
  });

  return (
    <div className="space-y-6">
      {/* Search and sync */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-cyberPanel border border-gray-900 p-4 rounded">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold transition-all font-mono"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <button 
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070A12] border border-gray-800 rounded font-orbitron text-[10px] text-gray-400 hover:text-white uppercase transition-all cursor-pointer w-full md:w-auto justify-center"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-cyberPanel border border-gray-900 rounded overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">Accessing system journals...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">No audit logs matching search parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#070A12] border-b border-gray-900 text-[10px] text-gray-400 font-orbitron uppercase tracking-widest">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target UUID</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/40 text-xs font-mono text-gray-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                    <td className="p-4 text-gray-500 text-[10px]">
                      {log.id}
                    </td>
                    <td className="p-4 font-bold text-cyberGold">
                      {log.admin_username}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] border border-gray-800 bg-[#070A12] font-orbitron text-gray-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 text-[10px]">
                      {log.target_id || '-'}
                    </td>
                    <td className="p-4 max-w-xs truncate text-[11px]" title={log.details}>
                      {log.details}
                    </td>
                    <td className="p-4 text-gray-400">
                      {log.ip_address}
                    </td>
                    <td className="p-4 text-gray-500 text-[10px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
