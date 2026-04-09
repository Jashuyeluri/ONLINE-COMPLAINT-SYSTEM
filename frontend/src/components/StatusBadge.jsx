const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50',
    'In Progress': 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50',
    'Completed': 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50',
    'Resolved': 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50'
  };

  const dotColors = {
    'Pending': 'bg-amber-500',
    'In Progress': 'bg-blue-500',
    'Completed': 'bg-orange-500',
    'Resolved': 'bg-emerald-500'
  }

  return (
    <span className={`px-4 py-1 rounded-xl text-[11px] font-extrabold border uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${styles[status] || styles['Pending']}`}>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[status] || dotColors['Pending']}`}></span>
      {status}
    </span>
  );
};

export default StatusBadge;
