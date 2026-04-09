import StatusBadge from './StatusBadge';
import { MapPin, Calendar, Tag, ArrowUpRight, MoreVertical } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const getProgressWidth = (status) => {
    if (status === 'Pending') return 'w-1/3';
    if (status === 'In Progress') return 'w-2/3';
    if (status === 'Completed') return 'w-5/6';
    return 'w-full';
  };

  const getProgressColor = (status) => {
    if (status === 'Pending') return 'bg-amber-400';
    if (status === 'In Progress') return 'bg-blue-500';
    if (status === 'Completed') return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="card-premium group relative">
      <div className="flex justify-between items-start mb-5">
        <div className="bg-slate-50 p-2.5 rounded-2xl group-hover:bg-indigo-50 transition-colors duration-500">
          <Tag className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
        </div>
        <div className="flex items-center gap-2">
           <StatusBadge status={complaint.status} />
           <button className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"><MoreVertical className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <h3 className="font-bold text-slate-800 text-xl leading-tight group-hover:text-indigo-600 transition-colors">
          {complaint.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
          {complaint.description}
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 group-hover:bg-white group-hover:border-indigo-100 transition-all duration-500">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2 px-1 tracking-widest">
            <span>Progress</span>
            <span>{complaint.status}</span>
          </div>
          <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden flex ring-1 ring-slate-100">
            <div className={`h-full transition-all duration-1000 ease-out shadow-sm ${getProgressWidth(complaint.status)} ${getProgressColor(complaint.status)}`} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate max-w-[120px]">{complaint.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 italic">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
          <ArrowUpRight className="text-white w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default ComplaintCard;
