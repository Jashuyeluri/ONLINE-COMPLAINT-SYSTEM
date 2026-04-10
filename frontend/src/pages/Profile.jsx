import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Save, Key, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user, login } = useAuth();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '' });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', formData);
      login(res.data.token, res.data.user);
      setSaved(true);
      toast.success('Profile updated successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto w-full">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Account</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          My Profile <User className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">View and manage your personal account information</p>
      </header>

      {/* Avatar Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[32px] p-8 text-white flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-4xl font-black shadow-xl">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-black">{user?.name}</h2>
          <p className="text-indigo-200 font-medium">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-indigo-300" />
            <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">{user?.role === 'admin' ? 'City Official' : user?.role === 'staff' ? 'Staff Member' : 'Citizen'}</span>
          </div>
        </div>
      </div>

      {/* Account Info Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-lg p-8 space-y-6">
        <h3 className="text-lg font-black text-slate-900">Account Information</h3>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-700 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-slate-700 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Account Role</label>
            <div className="flex items-center gap-3 px-4 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <Shield className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-indigo-700 capitalize">{user?.role === 'admin' ? 'City Official' : user?.role === 'staff' ? 'Staff Member' : 'Citizen'}</span>
              <span className="ml-auto text-[10px] font-black text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-lg uppercase">Read Only</span>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-lg p-8 space-y-5">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-600" /> Security</h3>
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-sm font-medium text-amber-700">
          🔒 Password changes are handled securely via your administrator. Contact <strong>admin@city.com</strong> to request a reset.
        </div>
      </div>
    </div>
  );
};

export default Profile;
