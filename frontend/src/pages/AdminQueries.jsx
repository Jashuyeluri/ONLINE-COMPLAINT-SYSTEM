import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, ArrowLeft, Clock, CheckCircle2, XCircle, User, ShieldCheck, Search, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminQueries = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const repliesEndRef = useRef(null);

  useEffect(() => { fetchQueries(); }, []);

  useEffect(() => {
    if (repliesEndRef.current) {
      repliesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedQuery]);

  const fetchQueries = async () => {
    try {
      const res = await api.get('/queries');
      setQueries(res.data);
    } catch { toast.error('Failed to load queries'); }
    finally { setLoading(false); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedQuery) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/queries/${selectedQuery._id}/reply`, { message: replyText });
      setSelectedQuery(res.data);
      setQueries(prev => prev.map(q => q._id === res.data._id ? res.data : q));
      setReplyText('');
      toast.success('Reply sent!');
    } catch { toast.error('Failed to send reply'); }
    finally { setSubmitting(false); }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this query? The user will not be able to reply.')) return;
    try {
      const res = await api.put(`/queries/${id}/close`);
      setSelectedQuery(res.data);
      setQueries(prev => prev.map(q => q._id === res.data._id ? res.data : q));
      toast.success('Query closed');
    } catch { toast.error('Failed to close query'); }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Answered': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' };
      case 'Closed': return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle, dot: 'bg-slate-400' };
      default: return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock, dot: 'bg-amber-500' };
    }
  };

  const filtered = queries.filter(q => {
    const matchSearch = q.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.createdBy?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || q.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    All: queries.length,
    Open: queries.filter(q => q.status === 'Open').length,
    Answered: queries.filter(q => q.status === 'Answered').length,
    Closed: queries.filter(q => q.status === 'Closed').length
  };

  // ── DETAIL VIEW ──
  if (selectedQuery) {
    const statusConf = getStatusConfig(selectedQuery.status);
    const StatusIcon = statusConf.icon;
    return (
      <div className="space-y-6 animate-fade-in ">
        <button onClick={() => setSelectedQuery(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to all queries
        </button>

        {/* Query Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-2xl shadow-indigo-500/5 p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{selectedQuery.subject}</h2>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                    {selectedQuery.createdBy?.name?.[0] || '?'}
                  </div>
                  <span className="font-bold text-slate-600">{selectedQuery.createdBy?.name}</span>
                </div>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-slate-400 font-medium">{selectedQuery.createdBy?.email}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-slate-400 font-medium">
                  {new Date(selectedQuery.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${statusConf.color}`}>
                <StatusIcon className="w-4 h-4" />
                {selectedQuery.status}
              </div>
              {selectedQuery.status !== 'Closed' && (
                <button onClick={() => handleClose(selectedQuery._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold transition-all">
                  <Lock className="w-3.5 h-3.5" /> Close
                </button>
              )}
            </div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-5 text-slate-700 font-medium leading-relaxed">
            {selectedQuery.message}
          </div>
        </div>

        {/* Thread */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-2xl shadow-indigo-500/5 overflow-hidden">
          <div className="py-5 border-b border-slate-100">
            <h3 className="font-black text-slate-900">Conversation Thread</h3>
            <p className="text-xs text-slate-400 font-medium">{selectedQuery.replies?.length || 0} replies</p>
          </div>

          <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
            {(!selectedQuery.replies || selectedQuery.replies.length === 0) && (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">No replies yet. Type your response below.</p>
              </div>
            )}

            {selectedQuery.replies?.map((reply, i) => {
              const isAdmin = reply.repliedBy?.role === 'admin';
              return (
                <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-3xl p-5 ${
                    isAdmin
                      ? 'bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                        isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-slate-500">
                        {isAdmin ? `Admin (${reply.repliedBy?.name})` : reply.repliedBy?.name || 'User'}
                      </span>
                      <span className="text-[10px] text-slate-300 font-medium">
                        {new Date(reply.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{reply.message}</p>
                  </div>
                </div>
              );
            })}
            <div ref={repliesEndRef} />
          </div>

          {/* Reply Box */}
          {selectedQuery.status === 'Closed' ? (
            <div className="py-4 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-sm text-slate-400 font-bold">This query is closed. No further replies can be sent.</p>
            </div>
          ) : (selectedQuery.replies?.filter(r => r.repliedBy?.role === 'admin').length >= 1) ? (
            <div className="py-4 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-sm text-slate-400 font-bold">You have already replied to this query once. Further admin replies are restricted.</p>
            </div>
          ) : (
            <form onSubmit={handleReply} className="py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your one-time definitive reply..."
                  className="flex-1 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium text-sm"
                />
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white p-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-200"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Support</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          User Queries <MessageSquare className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">View and respond to citizen queries</p>
      </header>

      {/* Status Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Open', 'Answered', 'Closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              filterStatus === status
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {status}
            <span className={`ml-2 px-2 py-0.5 rounded-lg text-[10px] font-black ${
              filterStatus === status ? 'bg-white/20' : 'bg-slate-100'
            }`}>
              {statusCounts[status]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by subject or citizen name..."
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-[24px] focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Queries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading queries...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white/80 rounded-[40px] border border-slate-100 py-24 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-700">No queries found</h3>
            <p className="text-slate-400 font-medium mt-1">No citizen queries match your search or filter.</p>
          </div>
        ) : (
          filtered.map(q => {
            const conf = getStatusConfig(q.status);
            const StatusIcon = conf.icon;
            const lastReply = q.replies?.[q.replies.length - 1];
            return (
              <div
                key={q._id}
                onClick={() => setSelectedQuery(q)}
                className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${conf.dot} shrink-0`} />
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{q.subject}</h3>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-black shrink-0 ${conf.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {q.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1 ml-5">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[10px] font-black text-slate-600">
                        {q.createdBy?.name?.[0] || '?'}
                      </div>
                      <span className="text-xs font-bold text-slate-500">{q.createdBy?.name}</span>
                      <span className="text-[10px] text-slate-300 italic">{q.createdBy?.email}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1 ml-5">{q.message}</p>
                    {lastReply && (
                      <p className="text-xs text-slate-400 mt-2 font-medium ml-5">
                        <span className="font-bold text-slate-500">
                          {lastReply.repliedBy?.role === 'admin' ? '🛡 Admin' : `💬 ${lastReply.repliedBy?.name || 'User'}`}:
                        </span>{' '}
                        {lastReply.message.substring(0, 80)}{lastReply.message.length > 80 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400 font-bold">
                        {new Date(q.updatedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                      {q.replies?.length > 0 && (
                        <p className="text-[10px] text-indigo-500 font-bold mt-0.5">{q.replies.length} replies</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminQueries;
