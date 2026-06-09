import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { SecurityLog } from '../../../supabase/adminDb';
import { ShieldAlert, RefreshCw, CheckCircle } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityLogs = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getSecurityLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between bg-cyberPanel border border-gray-900 p-4 rounded">
        <div>
          <h4 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">
            Security & Firewall Operations
          </h4>
          <p className="text-[10px] text-gray-500 font-mono mt-0.5">IP addresses monitored and suspicious activity flagged</p>
        </div>
        <button 
          onClick={fetchSecurityLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#070A12] border border-gray-800 rounded font-orbitron text-[10px] text-gray-400 hover:text-white uppercase transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Terminal</span>
        </button>
      </div>

      {/* Main security dashboard split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Security Threat Intel */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-5 shadow-lg space-y-4">
          <h5 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider border-b border-gray-900 pb-3">Security Diagnostics</h5>
          <div className="space-y-4 font-mono text-[11px]">
            <div className="p-3 bg-[#070A12] border border-gray-950 rounded">
              <div className="text-gray-500 font-orbitron text-[9px] uppercase">Firewall Status</div>
              <div className="text-cyberGreen font-bold text-xs mt-1 flex items-center gap-1.5">
                <CheckCircle size={12} /> SHIELD ENGAGED (ACTIVE)
              </div>
            </div>

            <div className="p-3 bg-[#070A12] border border-gray-950 rounded">
              <div className="text-gray-500 font-orbitron text-[9px] uppercase">Banned Node IPs</div>
              <div className="text-white font-bold text-xs mt-1">1 IP Address</div>
              <div className="text-red-400 text-[10px] mt-1.5">198.51.100.12 (Abuse payload flood)</div>
            </div>

            <div className="p-3 bg-[#070A12] border border-gray-950 rounded">
              <div className="text-gray-500 font-orbitron text-[9px] uppercase">Rate Limiter State</div>
              <div className="text-cyberBlue font-bold text-xs mt-1">
                NORMAL OPERATING LOAD
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security Logs Archive */}
        <div className="lg:col-span-2 bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg">
          <h5 className="font-orbitron text-xs font-bold text-white uppercase tracking-wider border-b border-gray-900 pb-3 mb-4 flex items-center gap-1.5">
            <ShieldAlert size={15} className="text-red-500" /> Security Transmission Log
          </h5>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">Decrypting threat records...</div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">No threats or failed auth logs written.</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#070A12] border-b border-gray-900 text-[10px] text-gray-500 font-orbitron uppercase tracking-widest">
                    <th className="p-3">Log Event</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Operator User</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/40 text-gray-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/10 transition-colors">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] border font-orbitron font-bold uppercase ${
                          log.event_type === 'login_success' ? 'bg-cyberGreen/10 border-cyberGreen/20 text-cyberGreen' :
                          log.event_type === 'login_failed' ? 'bg-cyberOrange/10 border-cyberOrange/20 text-cyberOrange' :
                          log.event_type === 'suspicious_activity' ? 'bg-cyberGold/10 border-cyberGold/20 text-cyberGold' :
                          'bg-red-950/20 border-red-500/20 text-red-500'
                        }`}>
                          {log.event_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-gray-400">{log.ip_address}</td>
                      <td className="p-3 text-gray-200 font-bold">{log.username}</td>
                      <td className="p-3 text-gray-400 text-[11px]">{log.details}</td>
                      <td className="p-3 text-gray-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
