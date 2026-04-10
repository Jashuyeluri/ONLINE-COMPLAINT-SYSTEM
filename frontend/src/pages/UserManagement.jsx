import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, Shield, User, ShieldCheck, UserCheck, Clock, Wrench } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    if (u.role === 'admin') return false;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const citizenCount = users.filter(u => u.role === 'user').length;
  const staffCount = users.filter(u => u.role === 'staff').length;
  const totalUsers = citizenCount + staffCount;
  const totalComplaints = users.reduce((sum, u) => sum + u.total, 0);

  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Citizens</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          User Management <Users className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">Overview of all registered users in the system</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="bg-indigo-50 text-indigo-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0"><Users className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide sm:tracking-wider truncate" title="Total Active">Total Active</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{loading ? '—' : totalUsers}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="bg-blue-50 text-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0"><UserCheck className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide sm:tracking-wider truncate" title="Citizens">Citizens</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{loading ? '—' : citizenCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm flex items-center gap-3 sm:gap-4 overflow-hidden">
          <div className="bg-teal-50 text-teal-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0"><Wrench className="w-5 h-5 sm:w-6 sm:h-6" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide sm:tracking-wider truncate" title="Staff">Staff</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">{loading ? '—' : staffCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white/50 backdrop-blur-md p-2 rounded-[32px] border border-white/50 shadow-sm">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name or email..."
              className="w-full pl-14 pr-6 py-4 bg-white/80 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {['all', 'user', 'staff'].map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all ${
                roleFilter === role
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {role === 'all' ? 'All' : role === 'user' ? 'Citizens' : 'Staff'}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">User</th>
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Filed</th>
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</th>
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Resolved</th>
                <th className="py-5 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 font-bold">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-16 text-slate-400 font-bold">No users found.</td></tr>
              ) : (
                filtered.map(u => (
                  <tr key={u._id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                          u.role === 'admin'
                            ? 'bg-gradient-to-br from-violet-100 to-violet-200 text-violet-700'
                            : u.role === 'staff'
                            ? 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700'
                            : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700'
                        }`}>
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{u.name}</p>
                          <p className="text-xs text-slate-400 italic">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black border ${
                        u.role === 'admin'
                          ? 'bg-violet-50 text-violet-700 border-violet-200'
                          : u.role === 'staff'
                          ? 'bg-teal-50 text-teal-700 border-teal-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : u.role === 'staff' ? <Wrench className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {u.role === 'admin' ? 'Admin' : u.role === 'staff' ? 'Staff' : 'Citizen'}
                      </span>
                    </td>
                    {u.role === 'admin' ? (
                      <td colSpan={4} className="py-5 px-4">
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest italic">System Administration Account</span>
                      </td>
                    ) : (
                      <>
                        <td className="py-5 px-4 font-black text-slate-900">{u.total}</td>
                        <td className="py-5 px-4">
                          <span className="text-amber-600 font-black">{u.pending}</span>
                        </td>
                        <td className="py-5 px-4">
                          <span className="text-emerald-600 font-black">{u.resolved}</span>
                        </td>
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${u.total > 0 ? (u.resolved / u.total) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs font-black text-emerald-600">{u.total > 0 ? Math.round((u.resolved / u.total) * 100) : 0}%</span>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
