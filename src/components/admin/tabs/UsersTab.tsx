import React, { useEffect, useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import type { AdminUser } from '../../../supabase/adminDb';
import { Search, Ban, Trash2, Edit2, ShieldAlert, ChevronLeft, ChevronRight, X } from 'lucide-react';

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'restricted'>('all');
  const [sortBy, setSortBy] = useState<'username' | 'xp' | 'coins' | 'created_at'>('xp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editCoins, setEditCoins] = useState(0);
  const [editXp, setEditXp] = useState(0);
  const [editRank, setEditRank] = useState('Bronze V');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminDb.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = adminDb.subscribeToUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSuspend = async (user: AdminUser) => {
    const isSuspended = !user.is_suspended;
    await adminDb.updateUser(user.uid, { is_suspended: isSuspended });
    await adminDb.createAdminLog(
      isSuspended ? 'Suspend User' : 'Unsuspend User', 
      user.uid, 
      `${isSuspended ? 'Suspended' : 'Unsuspended'} player ${user.username}.`
    );
    fetchUsers();
  };

  const handleBan = async (user: AdminUser) => {
    const isBanned = !user.is_banned;
    await adminDb.updateUser(user.uid, { is_banned: isBanned });
    await adminDb.createAdminLog(
      isBanned ? 'Ban User' : 'Unban User', 
      user.uid, 
      `${isBanned ? 'Banned' : 'Unbanned'} player ${user.username} permanently.`
    );
    fetchUsers();
  };

  const handleDelete = async (uid: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete player ${name}? This action is irreversible.`)) {
      await adminDb.deleteUser(uid);
      await adminDb.createAdminLog('Delete User', uid, `Permanently deleted player record ${name}.`);
      fetchUsers();
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditCoins(user.coins);
    setEditXp(user.xp);
    setEditRank(user.rank);
  };

  const handleSaveEdit = async () => {
    if (editingUser) {
      await adminDb.updateUser(editingUser.uid, {
        coins: editCoins,
        xp: editXp,
        rank: editRank
      });
      await adminDb.createAdminLog(
        'Edit Profile', 
        editingUser.uid, 
        `Updated coins: ${editCoins}, XP: ${editXp}, Rank: ${editRank} for user ${editingUser.username}.`
      );
      setEditingUser(null);
      fetchUsers();
    }
  };

  // Filter & Sort Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.uid.includes(searchQuery);

    if (statusFilter === 'online') return matchesSearch && user.online_status;
    if (statusFilter === 'offline') return matchesSearch && !user.online_status;
    if (statusFilter === 'restricted') return matchesSearch && (user.is_banned || user.is_suspended);
    return matchesSearch;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: 'username' | 'xp' | 'coins' | 'created_at') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-cyberPanel border border-gray-900 p-4 rounded">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, email, ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold transition-all font-mono"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {(['all', 'online', 'offline', 'restricted'] as const).map(f => (
            <button
              key={f}
              onClick={() => {
                setStatusFilter(f);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded font-orbitron text-[10px] tracking-wider uppercase border cursor-pointer transition-all ${
                statusFilter === f 
                  ? 'bg-cyberGold/15 border-cyberGold text-cyberGold' 
                  : 'bg-[#070A12] border-gray-900 text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-cyberPanel border border-gray-900 rounded overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">Querying database registry...</div>
        ) : paginatedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-mono text-xs">No records found matching filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#070A12] border-b border-gray-900 text-[10px] text-gray-400 font-orbitron uppercase tracking-widest">
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('username')}>Combatant</th>
                  <th className="p-4">UUID</th>
                  <th className="p-4">Rank</th>
                  <th className="p-4 cursor-pointer hover:text-white text-right" onClick={() => toggleSort('xp')}>XP</th>
                  <th className="p-4 cursor-pointer hover:text-white text-right" onClick={() => toggleSort('coins')}>Coins</th>
                  <th className="p-4">Lobby / Room</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-center">Security Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900/40 text-xs font-mono">
                {paginatedUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-gray-800/10 transition-colors">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-gray-200">{user.username}</div>
                        <div className="text-[10px] text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-[10px]">
                      {user.uid}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] border font-orbitron ${
                        user.rank.includes('Grandmaster') ? 'bg-purple-950/20 border-purple-500/30 text-purple-400' :
                        user.rank.includes('Diamond') ? 'bg-cyan-950/20 border-cyan-500/30 text-cyberBlue' :
                        user.rank.includes('Platinum') ? 'bg-teal-950/20 border-teal-500/30 text-teal-400' :
                        user.rank.includes('Gold') ? 'bg-amber-950/20 border-amber-500/30 text-cyberGold' :
                        'bg-gray-950/20 border-gray-500/30 text-gray-400'
                      }`}>
                        {user.rank}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-300 font-bold">{user.xp.toLocaleString()}</td>
                    <td className="p-4 text-right text-cyberGold font-bold">{user.coins.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">
                      {user.online_status ? (
                        user.room_id ? (
                          <span className="text-cyberOrange font-bold">{user.room_id}</span>
                        ) : (
                          <span className="text-gray-500">Lobby Free</span>
                        )
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.is_banned ? (
                        <span className="text-red-500 font-bold flex items-center gap-1"><ShieldAlert size={12} /> Banned</span>
                      ) : user.is_suspended ? (
                        <span className="text-amber-500 font-bold flex items-center gap-1"><ShieldAlert size={12} /> Suspended</span>
                      ) : user.online_status ? (
                        <span className="text-cyberGreen font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyberGreen animate-ping"></span>
                          Online
                        </span>
                      ) : (
                        <span className="text-gray-600">Offline</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 bg-cyberBlue/10 border border-cyberBlue/20 text-cyberBlue rounded hover:bg-cyberBlue hover:text-black transition-all cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleSuspend(user)}
                          className={`p-1.5 border rounded cursor-pointer transition-all ${
                            user.is_suspended 
                              ? 'bg-amber-500 text-black border-amber-500 hover:bg-amber-600' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black'
                          }`}
                          title={user.is_suspended ? "Lift Suspension" : "Suspend Player"}
                        >
                          <Ban size={12} />
                        </button>
                        <button
                          onClick={() => handleBan(user)}
                          className={`p-1.5 border rounded cursor-pointer transition-all ${
                            user.is_banned 
                              ? 'bg-red-500 text-black border-red-500 hover:bg-red-600' 
                              : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-black'
                          }`}
                          title={user.is_banned ? "Unban Player" : "Permanently Ban"}
                        >
                          <ShieldAlert size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.uid, user.username)}
                          className="p-1.5 bg-red-950/30 border border-red-900/40 text-red-400 rounded hover:bg-red-500 hover:text-black hover:border-red-500 transition-all cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 bg-[#070A12] border-t border-gray-900 text-xs text-gray-500 font-mono">
            <span>Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, sortedUsers.length)} of {sortedUsers.length} combatants</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 bg-[#111827] border border-gray-800 text-gray-400 hover:text-white rounded disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 bg-[#111827] border border-gray-800 rounded font-bold text-gray-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 bg-[#111827] border border-gray-800 text-gray-400 hover:text-white rounded disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Value Modal */}
      {editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#000000]/60 z-50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-cyberPanel border border-cyberGold/20 rounded shadow-2xl relative">
            <div className="h-1 bg-cyberGold w-full" />
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-5">
                <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
                  Adjust Resources: {editingUser.username}
                </h4>
                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Adjust Coins balance
                  </label>
                  <input
                    type="number"
                    value={editCoins}
                    onChange={(e) => setEditCoins(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Adjust XP metrics
                  </label>
                  <input
                    type="number"
                    value={editXp}
                    onChange={(e) => setEditXp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-orbitron text-gray-400 uppercase tracking-widest mb-1.5">
                    Assign Rank Tier
                  </label>
                  <select
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value)}
                    className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
                  >
                    {['Bronze V', 'Bronze II', 'Silver IV', 'Gold V', 'Gold III', 'Gold I', 'Platinum II', 'Platinum I', 'Diamond III', 'Grandmaster'].map(r => (
                      <option key={r} value={r} className="bg-cyberPanel">{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-800 text-gray-400 font-orbitron text-[10px] uppercase rounded hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-cyberGold text-black font-orbitron font-bold text-[10px] uppercase rounded hover:bg-cyberGold/90 transition-all cursor-pointer"
                >
                  Update Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
