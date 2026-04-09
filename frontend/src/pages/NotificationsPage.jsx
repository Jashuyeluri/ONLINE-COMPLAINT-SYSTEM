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
      await api.put('/notifications/mark-read');
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

  const getBg = (msg) => {
    if (msg.includes('Resolved')) return 'bg-emerald-50 border-emerald-100';
    if (msg.includes('In Progress')) return 'bg-blue-50 border-blue-100';
    return 'bg-amber-50 border-amber-100';
  };

  return (
    <div className="space-y-8 animate-fade-in lg:ml-72 pt-24 pb-20 px-8">
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
                <span className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                  <CheckCheck className="w-4 h-4" /> All marked as read
                </span>
                <div className="w-1 h-3 border-r border-slate-200"></div>
                <button 
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Clear All
                </button>
              </div>
            </div>
            {notifications.map(n => (
              <div key={n._id} className={`flex items-start gap-4 p-5 rounded-3xl border ${getBg(n.message)} transition-all`}>
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
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
