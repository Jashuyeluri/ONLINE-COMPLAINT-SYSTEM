import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wrench, CheckCircle, Clock, MessageSquare, ChevronDown, Send, Briefcase, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const StaffPanel = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [staffNote, setStaffNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssigned();
  }, []);

  const fetchAssigned = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    if (!staffNote.trim()) {
      toast.error('Please add a completion note');
      return;
    }
    setSubmitting(true);
    try {
      await api.put(`/complaints/${id}/complete`, { staffNote });
      toast.success('Complaint marked as completed! Admin has been notified.');
      setStaffNote('');
      setSelected(null);
      fetchAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status === 'In Progress';
    if (filter === 'completed') return c.status === 'Completed';
    if (filter === 'resolved') return c.status === 'Resolved';
    return true;
  });

  const activeTasks = complaints.filter(c => c.status === 'In Progress').length;
  const completedTasks = complaints.filter(c => c.status === 'Completed' || c.status === 'Resolved').length;

  const statusColor = (s) => {
    if (s === 'In Progress') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'Completed') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'Resolved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">My Assignments</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Staff Panel <Wrench className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">Complaints assigned to you by the admin</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl"><Briefcase className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Assigned</p>
            <p className="text-3xl font-black text-slate-900">{complaints.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl"><Clock className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-black text-blue-600">{activeTasks}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <p className="text-3xl font-black text-emerald-600">{completedTasks}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All', count: complaints.length },
          { key: 'active', label: 'Active', count: complaints.filter(c => c.status === 'In Progress').length },
          { key: 'completed', label: 'Completed', count: complaints.filter(c => c.status === 'Completed').length },
          { key: 'resolved', label: 'Resolved', count: complaints.filter(c => c.status === 'Resolved').length },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all ${
              filter === f.key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}>
            {f.label}
            <span className={`text-[11px] px-2 py-0.5 rounded-lg font-black ${
              filter === f.key ? 'bg-white/20' : 'bg-slate-100'
            }`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* Complaint List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-bold">Loading assignments...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[40px] border border-slate-100 p-16 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg font-bold text-slate-400">No assignments found</p>
            <p className="text-sm text-slate-300 mt-1">Complaints will appear here when admin assigns them to you.</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c._id}
              className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => setSelected(selected === c._id ? null : c._id)}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-black text-slate-900 text-lg">{c.title}</h3>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-[11px] font-black border ${statusColor(c.status)}`}>
                      {c.status === 'In Progress' && <Clock className="w-3 h-3" />}
                      {c.status === 'Completed' && <CheckCircle className="w-3 h-3" />}
                      {c.status === 'Resolved' && <CheckCircle className="w-3 h-3" />}
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">{c.category}</span>
                    <span className="text-[11px] text-slate-400">📍 {c.location}</span>
                    <span className="text-[11px] text-slate-400">🗓 {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] text-slate-400">Reported by:</span>
                    <span className="text-[11px] font-bold text-indigo-600">{c.createdBy?.name || 'Unknown'}</span>
                    <span className="text-[11px] text-slate-400 italic">{c.createdBy?.email}</span>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${selected === c._id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expandable action area */}
              {selected === c._id && (
                <div className="border-t border-slate-100 p-6 bg-slate-50/50 animate-fade-in">
                  {c.status === 'In Progress' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Completion Note</label>
                        <textarea
                          value={staffNote}
                          onChange={e => setStaffNote(e.target.value)}
                          placeholder="Describe the work done (e.g., Pothole filled with asphalt, road leveled)..."
                          className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm min-h-[100px] font-medium"
                        />
                      </div>
                      <button
                        onClick={() => handleComplete(c._id)}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-200 text-sm disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {submitting ? 'Submitting...' : 'Mark as Completed & Notify Admin'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-700 text-sm">
                          {c.status === 'Completed' ? 'Work completed — Waiting for admin approval' : 'Resolved by admin ✅'}
                        </p>
                        {c.staffNote && (
                          <p className="text-sm text-slate-500 mt-1 bg-white p-3 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-600">Your note:</span> {c.staffNote}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffPanel;
