
import React from 'react';

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ label, value, icon, iconBg, iconColor }) => {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-between min-h-[200px]">
      <div className={`${iconBg} ${iconColor} p-4 rounded-3xl mb-4`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-slate-400 text-sm font-medium mb-1 whitespace-pre-wrap">{label}</p>
        <p className="text-[#1e293b] text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
