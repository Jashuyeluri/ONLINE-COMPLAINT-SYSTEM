import { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FileText, Search, Filter, ChevronDown, ChevronUp, MapPin, Calendar, Tag } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } finally { setLoading(false); }
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusSteps = ['Pending', 'In Progress', 'Resolved'];

  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">My Complaints</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          My Submitted Reports <FileText className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">Track all complaints you have filed with the city</p>
      </header>

      {/* Filters */}
      <div className="bg-white/50 backdrop-blur-md p-2 rounded-[32px] border border-white/50 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search your reports..."
            className="w-full pl-14 pr-6 py-4 bg-white/80 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select className="w-full pl-12 pr-6 py-4 bg-white/80 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none font-bold text-slate-700 text-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaint List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading your complaints...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold">No complaints found matching your filters.</div>
        ) : (
          filtered.map(c => (
            <div key={c._id} className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === c._id ? null : c._id)}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{c.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">{c.category}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" />{c.location}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="w-3 h-3" />{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={c.status} />
                  {expanded === c._id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {expanded === c._id && (
                <div className="pb-6 border-t border-slate-50">
                  {/* Progress Timeline */}
                  <div className="mt-5 mb-5">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Progress Timeline</p>
                    <div className="flex items-center gap-0">
                      {statusSteps.map((step, i) => {
                        const currentIdx = statusSteps.indexOf(c.status);
                        const isActive = i <= currentIdx;
                        const isLast = i === statusSteps.length - 1;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                                {i + 1}
                              </div>
                              <span className={`text-[10px] font-bold whitespace-nowrap ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{step}</span>
                            </div>
                            {!isLast && <div className={`h-0.5 flex-1 mx-2 mb-4 ${i < currentIdx ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium bg-slate-50 rounded-2xl p-4">{c.description}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyComplaints;
