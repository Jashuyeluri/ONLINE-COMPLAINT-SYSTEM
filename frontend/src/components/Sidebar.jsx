import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PlusCircle, ShieldCheck, HelpCircle,
  ChevronRight, Loader2, Bell, User, FileText,
  BarChart3, Users, MessageSquare, Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { generateComplaintsPDF } from '../utils/reportGenerator';
import api from '../services/api';
import toast from 'react-hot-toast';

const Sidebar = ({ mobileOpen, closeMobile }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const res = await api.get('/complaints');
      generateComplaintsPDF(res.data, user.name);
      toast.success('Report Generated!');
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  // ── CITIZEN navigation
  const citizenLinks = [
    { to: '/',               icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/submit',         icon: PlusCircle,      label: 'New Complaint' },
    { to: '/my-complaints',  icon: FileText,         label: 'My Complaints' },
    { to: '/queries',         icon: MessageSquare,    label: 'Ask Admin' },
    { to: '/notifications',  icon: Bell,             label: 'Notifications' },
    { to: '/profile',        icon: User,             label: 'My Profile' },
    { to: '/faq',            icon: HelpCircle,       label: 'Help & FAQ' },
  ];

  // ── ADMIN navigation
  const adminLinks = [
    { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin',      icon: ShieldCheck,     label: 'Admin Panel' },
    { to: '/analytics',  icon: BarChart3,        label: 'Analytics' },
    { to: '/users',      icon: Users,            label: 'User Management' },
    { to: '/admin-queries', icon: MessageSquare,  label: 'User Queries' },
    { to: '/notifications', icon: Bell,          label: 'Notifications' },
    { to: '/profile',    icon: User,             label: 'My Profile' },
    { to: '/faq',        icon: HelpCircle,       label: 'Help & FAQ' },
  ];

  // ── STAFF navigation
  const staffLinks = [
    { to: '/',              icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff-panel',   icon: Wrench,          label: 'My Assignments' },
    { to: '/notifications', icon: Bell,            label: 'Notifications' },
    { to: '/profile',       icon: User,            label: 'My Profile' },
    { to: '/faq',           icon: HelpCircle,      label: 'Help & FAQ' },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : citizenLinks;

  return (
    <aside className={`w-72 fixed left-0 top-20 bottom-0 bg-white/95 lg:bg-white/40 backdrop-blur-xl border-r border-slate-100 p-6 flex flex-col z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}`}>
      <div className="space-y-1 flex-grow">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
        {links.map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={() => closeMobile && closeMobile()}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                  : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <link.icon className="w-5 h-5" />
              <span className="font-bold text-sm tracking-tight">{link.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
          </NavLink>
        ))}
      </div>

      {/* PDF Download Card — citizens only */}
      {user?.role === 'user' && (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            <p className="text-xs font-bold text-indigo-100 uppercase mb-1">My Report</p>
            <p className="text-sm font-medium leading-normal mb-3">Download a PDF of your personally submitted complaints</p>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-bold transition-all border border-white/10 italic flex items-center justify-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Download PDF'}
            </button>
          </div>
        </div>
      )}

      {/* Staff info card */}
      {user?.role === 'staff' && (
        <div className="mt-6">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl p-5 text-white shadow-xl shadow-teal-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors" />
            <p className="text-xs font-bold text-teal-100 uppercase mb-1">Staff Member</p>
            <p className="text-sm font-medium leading-normal mb-1">{user?.name}</p>
            <p className="text-xs text-teal-200 italic">Check your assignments and update completion status</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
