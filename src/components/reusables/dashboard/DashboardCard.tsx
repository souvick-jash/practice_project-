import React from 'react';
import { type LucideIcon } from 'lucide-react';
interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  leadingIcon?: string | LucideIcon;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon: Icon, leadingIcon }) => {
  const renderLeadingIcon = () => {
    if (!leadingIcon) return null;
    if (typeof leadingIcon === 'string') {
      return <small className="inline-block translate-y-[-1px] text-xl">{leadingIcon}</small>;
    }
    const LeadingIcon = leadingIcon;
    return <LeadingIcon />;
  };

  return (
    <div className="d-card bg-card hover:bg-primary-light flex h-full flex-row-reverse justify-between gap-3 rounded-3xl px-6 py-7 transition-all">
      <div className="d-card-icon flex size-18 shrink-0 items-center justify-center rounded-full bg-white">
        <Icon className="size-7" />
      </div>
      <div className="d-card-text flex flex-col justify-between">
        <h2 className="text-base">{title}</h2>
        <p className="d-card-count mt-2 text-4xl font-medium break-all">
          {renderLeadingIcon()}
          {value}
        </p>
      </div>
    </div>
  );
};

export default DashboardCard;
