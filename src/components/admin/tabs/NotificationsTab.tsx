import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminNotification } from '../../../supabase/adminDb';
import { Megaphone, AlertTriangle, ShieldAlert, Send, RefreshCw } from 'lucide-react';

export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // New Alert Fields
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'announcement' | 'maintenance' | 'emergency'>('announcement');
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    // Broadcast action
    await adminDb.createNotification(type, title, message);
    await adminDb.createAdminLog('Broadcast Alert', null, `Broadcasted ${type} message: "${title}".`);
    
    // Reset
    setTitle('');
    setMessage('');
    setSubmitting(false);
    fetchNotifications();
  };

  return (
    <div className="space-y-6">
      {/* Broadcast panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg lg:col-span-1 h-fit">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-5">
            <Megaphone size={16} className="text-cyberGold" />
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Broadcast Command Center</h5>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                Transmission Alert Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['announcement', 'maintenance', 'emergency'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 rounded font-orbitron text-[9px] uppercase tracking-wider border cursor-pointer transition-all ${
                      type === t 
                        ? t === 'emergency' 
                          ? 'bg-red-500/10 border-red-500 text-red-500' 
                          : t === 'maintenance' 
                            ? 'bg-cyberOrange/10 border-cyberOrange text-cyberOrange' 
                            : 'bg-cyberBlue/10 border-cyberBlue text-cyberBlue'
                        : 'bg-[#070A12] border-gray-900 text-gray-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                Broadcast Title Header
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MAINTENANCE PROTOCOL INITIATED"
                className="w-full px-3 py-2.5 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                Alert Description Body
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write transmission contents here..."
                className="w-full px-3 py-2.5 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-cyberGold hover:bg-cyberGold/90 text-black font-orbitron font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer transition-all mt-4 text-[10px] tracking-widest"
            >
              <Send size={12} />
              <span>{submitting ? 'Broadcasting...' : 'Transmit Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Transmission log right */}
        <div className="bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg lg:col-span-2 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <h5 className="font-orbitron text-xs font-bold uppercase tracking-wider text-white">Broadcast Transmission Log</h5>
            <button onClick={fetchNotifications} className="text-gray-500 hover:text-white cursor-pointer">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-thin">
            {loading && notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-500 font-mono text-xs">Querying channels...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-8 text-gray-500 font-mono text-xs">No notifications logged.</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="bg-[#070A12] border border-gray-950 p-4 rounded flex items-start gap-4 hover:border-gray-850 transition-colors">
                  <div className={`p-2 rounded border mt-0.5 shrink-0 ${
                    notif.type === 'emergency' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                    notif.type === 'maintenance' ? 'bg-cyberOrange/10 border-cyberOrange/30 text-cyberOrange' :
                    'bg-cyberBlue/10 border-cyberBlue/30 text-cyberBlue'
                  }`}>
                    {notif.type === 'emergency' ? <ShieldAlert size={16} /> :
                     notif.type === 'maintenance' ? <AlertTriangle size={16} /> :
                     <Megaphone size={16} />}
                  </div>
                  <div className="space-y-1.5 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-orbitron font-bold text-gray-200 tracking-wide uppercase">{notif.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 font-mono text-[11px] leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
