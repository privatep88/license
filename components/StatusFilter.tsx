
import React from 'react';
import { RecordStatus } from '../types';

interface StatusFilterProps {
  value: RecordStatus | 'all';
  onChange: (newValue: RecordStatus | 'all') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const options = [
    { value: 'all', label: 'الكل', activeClass: 'bg-[#334155] text-white border-transparent' },
    { value: RecordStatus.Active, label: RecordStatus.Active, activeClass: 'bg-green-500 text-white border-transparent' },
    { value: RecordStatus.SoonToExpire, label: RecordStatus.SoonToExpire, activeClass: 'bg-yellow-500 text-white border-transparent' },
    { value: RecordStatus.Expired, label: RecordStatus.Expired, activeClass: 'bg-red-500 text-white border-transparent' },
  ];

  const baseClass = "px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const inactiveClass = "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300";

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value as RecordStatus | 'all')}
          className={`${baseClass} ${value === opt.value ? opt.activeClass : inactiveClass}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
