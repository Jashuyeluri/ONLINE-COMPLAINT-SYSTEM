import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, AlertCircle, Wrench, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Explicit Validation
    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(formData.email)) {
      setError("Please use a valid @gmail.com email address");
      toast.error("Invalid Email format");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password too weak");
      return;
    }

    try {
      const res = await api.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      toast.success('Account Created Successfully!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      toast.error(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-indigo-100 animate-fade-in py-12">
      <div className="w-full max-w-[480px] relative">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-subtle-float"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-subtle-float" style={{animationDelay: '-3s'}}></div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[40px] shadow-2xl overflow-hidden shadow-indigo-500/5">
          <div className="p-10 pb-8 text-center">
             <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-6">
              <UserPlus className="text-white w-7 h-7" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 font-medium">Join us to help build a better city</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
            {error && (
              <div className="bg-red-50/50 backdrop-blur-sm text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Full Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter name"
                    required
                    className="input-field pl-12"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter email"
                    required
                    className="input-field pl-12"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    required
                    className="input-field pl-12"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Register As</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button"
                    onClick={() => setFormData({ ...formData, role: 'user' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'user'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}>
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-sm font-bold">Citizen</span>
                  </button>
                  <button type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'staff'
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}>
                    <Wrench className="w-5 h-5 mb-1" />
                    <span className="text-sm font-bold">Staff</span>
                  </button>
                  <button type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'admin'
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}>
                    <Shield className="w-5 h-5 mb-1" />
                    <span className="text-sm font-bold">Admin</span>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">
              <UserPlus className="w-5 h-5" />
              Get Started
            </button>

            <p className="text-center text-slate-500 text-sm font-medium mt-6">
              Joined before? {' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline decoration-2 underline-offset-4 decoration-indigo-100 hover:decoration-indigo-300">Sign in Here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
