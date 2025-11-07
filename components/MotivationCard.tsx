
import React from 'react';

interface MotivationCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const MotivationCard: React.FC<MotivationCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-lg p-6 h-full flex flex-col transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-sky-400">
            {icon}
        </div>
        <h2 className="text-2xl font-semibold text-sky-300">{title}</h2>
      </div>
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default MotivationCard;
