import { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertCircle, MapPin } from 'lucide-react';

const Analytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/complaints').then(res => setComplaints(res.data)).finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const completed = complaints.filter(c => c.status === 'Completed').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const categories = ['Road', 'Water', 'Electricity', 'Garbage', 'Other'];
  const categoryData = categories.map(cat => ({
    name: cat,
    count: complaints.filter(c => c.category === cat).length,
  }));
  const maxCount = Math.max(...categoryData.map(d => d.count), 1);

  const statusData = [
    { label: 'Pending', count: pending, color: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
    { label: 'In Progress', count: inProgress, color: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    { label: 'Completed', count: completed, color: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    { label: 'Resolved', count: resolved, color: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  ];

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Group by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  });

  const dailyCounts = last7Days.map(day =>
    complaints.filter(c => new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) === day).length
  );
  const maxDaily = Math.max(...dailyCounts, 1);

  return (
    <div className="space-y-8 animate-fade-in lg:ml-72 pt-24 pb-20 px-8">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-[2px] bg-indigo-600" />
          <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Insights</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          Analytics <BarChart3 className="w-8 h-8 text-indigo-600" />
        </h1>
        <p className="text-slate-500 font-medium mt-1">City-wide complaint statistics and performance metrics</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Complaints', value: total, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Pending', value: pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{loading ? '—' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Bar Chart */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-lg p-8">
          <h3 className="font-black text-slate-900 mb-6 text-lg">Complaints by Category</h3>
          <div className="space-y-4">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500 w-20 flex-shrink-0">{d.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                    style={{ width: `${(d.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-black text-slate-700 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Donut-style */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-lg p-8">
          <h3 className="font-black text-slate-900 mb-6 text-lg">Status Distribution</h3>
          <div className="space-y-4">
            {statusData.map(s => (
              <div key={s.label} className={`flex items-center justify-between p-4 ${s.light} rounded-2xl`}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full ${s.color}`} />
                  <span className={`font-bold ${s.text}`}>{s.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-white/60 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${total > 0 ? (s.count / total) * 100 : 0}%` }} />
                  </div>
                  <span className={`text-lg font-black ${s.text}`}>{s.count}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">Resolution Rate</span>
            <span className="text-2xl font-black text-emerald-600">{resolutionRate}%</span>
          </div>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-lg p-8">
        <h3 className="font-black text-slate-900 mb-8 text-lg">Complaint Volume — Last 7 Days</h3>
        <div className="flex items-end gap-3 h-32">
          {last7Days.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-black text-slate-700">{dailyCounts[i] || ''}</span>
              <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden" style={{ height: '80px' }}>
                <div
                  className="w-full bg-indigo-600 rounded-t-xl transition-all duration-700"
                  style={{ height: `${(dailyCounts[i] / maxDaily) * 80}px`, marginTop: 'auto' }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
