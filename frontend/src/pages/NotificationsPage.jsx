import { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
      toast.success('Alerts cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const getIcon = (msg) => {
    if (msg.includes('Resolved')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (msg.includes('In Progress')) return <Info className="w-5 h-5 text-blue-500" />;
    return <AlertCircle className="w-5 h-5 text-amber-500" />;
  };

  const getBg = (msg, isRead) => {
    if (!isRead) {
      if (msg.includes('Resolved')) return 'bg-emerald-100 border-emerald-300 shadow-md ring-2 ring-emerald-500/20';
      if (msg.includes('In Progress')) return 'bg-blue-100 border-blue-300 shadow-md ring-2 ring-blue-500/20';
      return 'bg-amber-100 border-amber-300 shadow-md ring-2 ring-amber-500/20';
    }
    // Read state colors
    if (msg.includes('Resolved')) return 'bg-emerald-50 border-emerald-100 opacity-60';
    if (msg.includes('In Progress')) return 'bg-blue-50 border-blue-100 opacity-60';
    return 'bg-amber-50 border-amber-100 opacity-60';
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in ">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Alerts</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Notifications <Bell className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">All alerts and status updates for your account</p>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400 font-bold">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white/80 rounded-[40px] border border-slate-100 py-24 text-center">
            <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-700">All caught up!</h3>
            <p className="text-slate-400 font-medium mt-1">No notifications yet. They'll appear here when your complaint status changes.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-xl hover:bg-indigo-100"
                >
                  <CheckCheck className="w-4 h-4" /> Mark as read
                </button>
                <div className="w-1 h-3 border-r border-slate-200"></div>
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs text-red-500 font-bold hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>
            {notifications.map(n => (
              <div key={n._id} className={`flex items-start gap-4 p-5 rounded-3xl border ${getBg(n.message, n.isRead)} transition-all relative overflow-hidden`}>
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 ${!n.isRead ? 'bg-white' : 'bg-slate-100 opacity-80'}`}>
                  {getIcon(n.message)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{n.message}</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
