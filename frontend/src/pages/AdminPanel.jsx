import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Trash2, CheckCircle, Clock, Search, UserPlus, Download, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToDetailedPDF } from '../utils/reportGenerator';
import { useSearch } from '../context/SearchContext';

const AdminPanel = () => {
  const { globalSearch } = useSearch();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [assignModal, setAssignModal] = useState(null); // complaint id
  const [selectedStaff, setSelectedStaff] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaffList(res.data);
    } catch (err) {
      console.log('Failed to load staff list');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/complaints/${id}`, { status });
      toast.success('Status updated');
      fetchComplaints();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) {
      toast.error('Please select a staff member');
      return;
    }
    try {
      await api.put(`/complaints/${assignModal}/assign`, { staffId: selectedStaff });
      toast.success('Complaint assigned to staff!');
      setAssignModal(null);
      setSelectedStaff('');
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this record?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Record removed');
      fetchComplaints();
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const handleExport = () => {
    try {
      exportToDetailedPDF(complaints);
      toast.success('Audit Log Generated!');
    } catch (err) {
      toast.error('Failed to export data');
    }
  };

  const combinedSearch = globalSearch || searchTerm;
  const filtered = complaints.filter(c => 
    c.title.toLowerCase().includes(combinedSearch.toLowerCase()) || 
    c.createdBy?.name?.toLowerCase().includes(combinedSearch.toLowerCase()) ||
    c.category?.toLowerCase().includes(combinedSearch.toLowerCase()) ||
    c.location?.toLowerCase().includes(combinedSearch.toLowerCase()) ||
    c.createdBy?.email?.toLowerCase().includes(combinedSearch.toLowerCase())
  );

  const statusColor = (s) => {
    if (s === 'Pending') return 'text-amber-600';
    if (s === 'In Progress') return 'text-blue-600';
    if (s === 'Completed') return 'text-orange-600';
    if (s === 'Resolved') return 'text-emerald-600';
    return 'text-slate-600';
  };

  return (
    <div className="space-y-10 animate-fade-in ">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-indigo-600"></span>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Management</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Admin Control
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">Review, assign and manage city-wide reports</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-slate-900 hover:bg-black text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-200 text-sm"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </button>
      </header>

      <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by report title or citizen name..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Report Details</th>
                <th className="py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted By</th>
                <th className="py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Staff</th>
                <th className="py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="py-6 px-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="py-5 px-4">
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{c.title}</div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded leading-none">{c.category}</span>
                       <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                       <span className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.staffNote && (
                      <div className="mt-1.5 text-[11px] text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100 inline-block">
                        📝 Staff: {c.staffNote}
                      </div>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black shadow-sm text-sm">
                        {c.createdBy?.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{c.createdBy?.name || 'Unknown'}</div>
                        <div className="text-[11px] text-slate-400 italic">{c.createdBy?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-4">
                    {c.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-black text-xs">
                          {c.assignedTo.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-teal-700">{c.assignedTo.name}</div>
                          <div className="text-[10px] text-slate-400 italic">{c.assignedTo.email}</div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-300 italic font-bold">Not assigned</span>
                    )}
                  </td>
                  <td className="py-5 px-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-5 px-4">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Action buttons (hidden if resolved) */}
                      {c.status !== 'Resolved' && (
                        <>
                          {!c.assignedTo && (
                            <button 
                              onClick={() => { setAssignModal(c._id); setSelectedStaff(''); }}
                              className="p-2 text-violet-600 hover:bg-violet-100 rounded-xl transition-all"
                              title="Assign to Staff"
                            >
                              <UserPlus className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateStatus(c._id, 'In Progress')}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                            title="In Progress"
                          >
                            <Clock className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(c._id, 'Resolved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                            title="Resolve"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <div className="w-[1px] h-5 bg-slate-200 mx-0.5"></div>
                        </>
                      )}
                      <button 
                        onClick={() => handleDelete(c._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] animate-fade-in" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-slate-100 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Assign to Staff</h3>
                <p className="text-sm text-slate-400 mt-1">Select a staff member to work on this complaint</p>
              </div>
              <button onClick={() => setAssignModal(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {staffList.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No staff members registered yet</p>
                <p className="text-xs text-slate-300 mt-1">Staff can register via the registration page</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {staffList.map(s => (
                  <button key={s._id} onClick={() => setSelectedStaff(s._id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedStaff === s._id 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                      selectedStaff === s._id 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700'
                    }`}>
                      {s.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{s.name}</p>
                      <p className="text-xs text-slate-400 italic">{s.email}</p>
                    </div>
                    {selectedStaff === s._id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)}
                className="flex-1 py-3.5 border-2 border-slate-100 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleAssign}
                disabled={!selectedStaff}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <UserPlus className="w-4 h-4" />
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
