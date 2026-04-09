import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Send, MapPin, Tag, Type, AlignLeft, Info, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Road',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/complaints', formData);
      toast.success('Complaint Submitted successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-24 pb-20 px-6 animate-fade-in lg:ml-72">
      <header className="mb-12 relative">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -z-10 animate-subtle-float"></div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-8 h-[2px] bg-indigo-600"></span>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">New Submission</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Report an Issue
          <Sparkles className="w-6 h-6 text-amber-500 fill-amber-500/20" />
        </h1>
        <p className="text-slate-500 font-medium mt-2">Submit detailed information to help our maintenance teams</p>
      </header>

      <div className="bg-white/80 backdrop-blur-2xl rounded-[40px] border border-white/50 shadow-2xl shadow-indigo-500/5 p-10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <div className="group space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
              <Type className="w-4 h-4 text-indigo-500" />
              Report Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Streetlight out on 5th Avenue"
              className="input-field"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
                <Tag className="w-4 h-4 text-indigo-500" />
                Category
              </label>
              <div className="relative">
                <select
                  className="input-field appearance-none cursor-pointer font-bold pr-10"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Road">Road</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <Tag className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="group space-y-3">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
                <MapPin className="w-4 h-4 text-indigo-500" />
                Location
              </label>
              <input
                type="text"
                required
                placeholder="Area, Street or Landmark"
                className="input-field"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="group space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2 ml-1 group-focus-within:text-indigo-600 transition-colors">
              <AlignLeft className="w-4 h-4 text-indigo-500" />
              Detailed Description
            </label>
            <textarea
              required
              rows="5"
              placeholder="Provide as much detail as possible to help our team identify and fix the issue faster..."
              className="input-field resize-none leading-relaxed"
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="bg-indigo-50/50 rounded-3xl p-6 flex gap-4 border border-indigo-100/50">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm h-11 w-11 flex-shrink-0 flex items-center justify-center">
              <Info className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-900 font-bold mb-1 leading-none pt-1">Important Note</p>
              <p className="text-xs text-indigo-600/80 leading-relaxed font-bold italic">
                Our verification team reviews every report within 24 hours. You can track progress via your dashboard.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-5 text-xl tracking-tight"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing Report...
              </>
            ) : (
              <>
                <Send className="w-6 h-6" />
                Submit and Track
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
