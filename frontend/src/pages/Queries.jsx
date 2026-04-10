import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Plus, ArrowLeft, Clock, CheckCircle2, XCircle, User, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Queries = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/queries', { subject, message });
      setQueries(prev => [res.data, ...prev]);
      setSubject(''); setMessage('');
      setShowNewForm(false);
      toast.success('Query submitted successfully!');
    } catch { toast.error('Failed to submit query'); }
    finally { setSubmitting(false); }
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Answered': return { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'Closed': return { color: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle };
      default: return { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock };
    }
  };

  // ── DETAIL VIEW ──
  if (selectedQuery) {
    const statusConf = getStatusConfig(selectedQuery.status);
    const StatusIcon = statusConf.icon;
    return (
      <div className="space-y-6 animate-fade-in ">
        <button onClick={() => setSelectedQuery(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to queries
        </button>

        {/* Query Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-2xl shadow-indigo-500/5 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedQuery.subject}</h2>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Asked on {new Date(selectedQuery.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-bold ${statusConf.color}`}>
              <StatusIcon className="w-4 h-4" />
              {selectedQuery.status}
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
                <p className="text-slate-400 font-bold text-sm">No replies yet. Admin will respond soon.</p>
              </div>
            )}

            {selectedQuery.replies?.map((reply, i) => {
              const isAdmin = reply.repliedBy?.role === 'admin';
              const isMe = reply.repliedBy?._id === user?.id || reply.repliedBy?.email === user?.email;
              return (
                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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
                        {isAdmin ? 'Admin' : reply.repliedBy?.name || 'You'}
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
          {selectedQuery.status !== 'Closed' && (
            <form onSubmit={handleReply} className="py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
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
          {selectedQuery.status === 'Closed' && (
            <div className="py-4 border-t border-slate-100 bg-slate-50/50 text-center">
              <p className="text-sm text-slate-400 font-bold">This query has been closed by admin.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div className="space-y-8 animate-fade-in ">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[2px] bg-indigo-600" />
            <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Support</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Ask Admin <MessageSquare className="w-8 h-8 text-indigo-600" />
          </h1>
          <p className="text-slate-500 font-medium mt-1">Submit queries and get direct responses from admin</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-200 text-sm"
        >
          <Plus className="w-4 h-4" /> New Query
        </button>
      </header>

      {/* New Query Modal */}
      {showNewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowNewForm(false)}>
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-slate-900 mb-1">New Query</h2>
            <p className="text-sm text-slate-400 font-medium mb-6">Ask a question to the admin team</p>
            <form onSubmit={handleSubmitQuery} className="space-y-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief subject of your query"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your query in detail..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all outline-none font-medium resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-200">
                  {submitting ? 'Submitting...' : 'Submit Query'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Queries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading queries...</div>
        ) : queries.length === 0 ? (
          <div className="bg-white/80 rounded-[40px] border border-slate-100 py-24 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-700">No queries yet</h3>
            <p className="text-slate-400 font-medium mt-1">Click "New Query" to ask your first question to admin.</p>
          </div>
        ) : (
          queries.map(q => {
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
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{q.subject}</h3>
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-black shrink-0 ${conf.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {q.status}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium line-clamp-1">{q.message}</p>
                    {lastReply && (
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        <span className="font-bold text-slate-500">
                          {lastReply.repliedBy?.role === 'admin' ? '🛡 Admin' : 'You'}:
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

export default Queries;
