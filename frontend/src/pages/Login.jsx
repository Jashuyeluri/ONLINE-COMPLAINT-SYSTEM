import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      login(res.data.token, res.data.user);
      toast.success('Login Successful!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
      toast.error(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 selection:bg-indigo-100 animate-fade-in">
      <div className="w-full max-w-[440px] relative">
        {/* Background blobs */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-subtle-float"></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10 animate-subtle-float" style={{animationDelay: '-3s'}}></div>

        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[40px] shadow-2xl overflow-hidden shadow-indigo-500/5">
          <div className="p-10 pt-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200 mb-6 group transition-all hover:scale-105 duration-500">
              <ShieldCheck className="text-white w-8 h-8 group-hover:rotate-12 transition-transform" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Securely sign in to your portal</p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
            {error && (
              <div className="bg-red-50/50 backdrop-blur-sm text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-slide-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 transition-colors group-focus-within:text-indigo-600">
                  Email Address
                </label>
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
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 transition-colors group-focus-within:text-indigo-600">
                  Password
                </label>
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
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg">
              <LogIn className="w-5 h-5" />
              Sign In
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">New Here?</span></div>
            </div>

            <p className="text-center text-slate-500 text-sm font-medium">
              Join the community. {' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors underline decoration-2 underline-offset-4 decoration-indigo-100 hover:decoration-indigo-300">Create Account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
