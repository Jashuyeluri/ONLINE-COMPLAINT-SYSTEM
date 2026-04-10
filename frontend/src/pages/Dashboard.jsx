import { useState, useEffect } from 'react';
import api from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import { Search, Filter, Plus, Loader2, Inbox, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { globalSearch } = useSearch();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Total Reports', value: complaints.length, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active', value: complaints.filter(c => c.status !== 'Resolved').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Files Solved', value: complaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  // Combine local search bar AND global navbar search
  const combinedSearch = globalSearch || searchTerm;
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(combinedSearch.toLowerCase()) || 
                          c.category.toLowerCase().includes(combinedSearch.toLowerCase()) ||
                          c.location?.toLowerCase().includes(combinedSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 animate-fade-in ">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-[2px] bg-indigo-600"></span>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Overview</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Dashboard</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time status of your city infrastructure reports</p>
        </div>
        {user?.role === 'user' && (
          <Link 
            to="/submit" 
            className="btn-primary"
          >
            <Plus className="w-5 h-5" />
            New Report
          </Link>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all duration-300">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/50 backdrop-blur-md p-2 rounded-[32px] border border-white/50 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports by ID, name or category..."
            className="w-full pl-14 pr-6 py-4 bg-white/80 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-56">
          <Filter className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="w-full pl-12 pr-10 py-4 bg-white/80 border border-slate-100 rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none appearance-none font-bold text-slate-700 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/30 backdrop-blur-sm rounded-[40px] border border-white/50">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin absolute top-3 left-3" style={{animationDirection: 'reverse'}}></div>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Synchronizing Data...</p>
        </div>
      ) : filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredComplaints.map(complaint => (
            <ComplaintCard key={complaint._id} complaint={complaint} />
          ))}
        </div>
      ) : (
        <div className="bg-white/40 backdrop-blur-sm rounded-[40px] border border-dashed border-slate-300 py-32 text-center animate-slide-up">
          <div className="bg-white w-20 h-20 rounded-[28px] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-8 animate-subtle-float">
            <Inbox className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">No Reports Found</h3>
          <p className="text-slate-400 mt-2 max-w-sm mx-auto font-medium ">
            We couldn't find any complaints matching your current filters. Try adjusting your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
