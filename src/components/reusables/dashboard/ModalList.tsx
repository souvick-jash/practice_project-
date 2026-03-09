import type { ReactNode } from 'react';

interface DetailItem {
  label: string;
  value: ReactNode; // Supports string, JSX, <Chip />, <a />, etc.
  active?: boolean;
}

interface DetailListProps {
  items: DetailItem[];
  className?: string;
}

export const DetailList = ({ items, className = '' }: DetailListProps) => {
  return (
    <div className={`details-wrap ${className}`}>
      <div className="space-y-3">
        {items.map((item, index) =>
          item.active === false ? null : (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-600">{item.label}</span>
              <span className="text-black">{item.value}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
};
