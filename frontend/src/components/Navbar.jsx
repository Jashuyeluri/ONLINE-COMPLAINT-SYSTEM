import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Search, Hexagon, CheckCheck, X, Menu } from 'lucide-react';
import api from '../services/api';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { globalSearch, setGlobalSearch } = useSearch();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 15 seconds for new notifications
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      // fail silently
    }
  };

  const handleBellClick = async () => {
    setShowDropdown(prev => !prev);
    if (!showDropdown && unreadCount > 0) {
      try {
        await api.put('/notifications/mark-read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {}
    }
  };

  const handleClear = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
      setShowDropdown(false);
    } catch (err) {}
  };

  const getNotificationIcon = (type) => {
    if (type === 'new_complaint') return '🚨';
    if (type === 'assigned_to_staff') return '👷';
    if (type === 'staff_completed') return '✅';
    return '📋';
  };

  const getStatusColor = (message) => {
    if (message.includes('Resolved')) return 'bg-emerald-50 border-emerald-200';
    if (message.includes('In Progress')) return 'bg-blue-50 border-blue-200';
    if (message.includes('new complaint')) return 'bg-amber-50 border-amber-200';
    if (message.includes('assigned')) return 'bg-violet-50 border-violet-200';
    if (message.includes('completed')) return 'bg-orange-50 border-orange-200';
    return 'bg-slate-50 border-slate-200';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass-morphism fixed top-0 left-0 right-0 z-[60] px-4 md:px-6 py-4 flex justify-between items-center h-20">
      <div className="flex items-center gap-3">
        {user && (
          <button onClick={onMenuClick} className="p-2 -ml-2 lg:hidden text-slate-500 hover:text-indigo-600">
            <Menu className="w-6 h-6" />
          </button>
        )}
        <div className="bg-indigo-600 w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Hexagon className="text-white w-5 h-5 md:w-6 md:h-6 fill-white/20" />
        </div>
        <div>
          <span className="font-extrabold text-lg md:text-xl text-slate-900 tracking-tight block leading-none">RESOLVE</span>
          <span className="text-[9px] md:text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em]">City Portal</span>
        </div>
      </div>

      <div className="hidden md:flex items-center bg-slate-100/50 rounded-2xl px-4 py-2 w-96 group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all border border-transparent focus-within:border-slate-200">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input 
          type="text" 
          placeholder={user?.role === 'admin' ? 'Search all citizen complaints...' : 'Search your reports...'} 
          className="bg-transparent border-none outline-none px-3 text-sm w-full font-medium text-slate-700 placeholder:text-slate-400"
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            // Navigate to the right page automatically when user starts typing
            if (e.target.value.length > 0) {
              if (user?.role === 'admin') navigate('/admin');
              else navigate('/');
            }
          }}
        />
        {globalSearch && (
          <button onClick={() => setGlobalSearch('')} className="flex-shrink-0">
            <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 transition-colors" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleBellClick}
                className="relative p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                id="notification-bell"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-black flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/60 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Notifications</h3>
                      <p className="text-[11px] text-slate-400 font-medium">{unreadCount} unread</p>
                    </div>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs font-bold">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          className={`px-4 py-3.5 flex items-start gap-3 border ${getStatusColor(n.message)} ${!n.isRead ? 'opacity-100' : 'opacity-60'} transition-opacity`}
                        >
                          <span className="text-lg flex-shrink-0 mt-0.5">{getNotificationIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{n.message}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last 10 Shown</p>
                      </div>
                      <button 
                        onClick={handleClear}
                        className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900 leading-tight">{user.name}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user.role}</div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 ring-2 ring-white">
                {user.name[0]}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
