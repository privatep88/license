

import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { License, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { OtherTopicsIcon } from './icons/TabIcons';
import { formatCost, calculateRemainingDays } from '../utils';


interface OtherTopicsContentProps {
    topics: License[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: License, type: RecordDataType) => void;
    onDelete: (item: License, type: RecordDataType) => void;
}

const OtherTopicsContent: React.FC<OtherTopicsContentProps> = ({
    topics,
    onAdd,
    onEdit,
    onDelete
}) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredTopics = topics.filter(l => statusFilter === 'all' || l.status === statusFilter);
  
  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center";
  const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm";

  const otherTopicsColumns: { key: keyof License | 'actions' | 'remaining' | 'attachments'; header: string; render?: (item: License) => React.ReactNode; exportValue?: (item: License) => string | number | null | undefined; headerClassName?: string; cellClassName?: string; }[] = [
    { key: 'name', header: 'الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'number', header: 'الرقم', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'status', header: 'الحالة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
  ];
  
  return (
    <div>
      <DataTable
        title={<div className="flex items-center gap-3"><span className="text-blue-800 h-6 w-6"><OtherTopicsIcon /></span><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">المواضيع الأخرى</span></div>}
        exportFileName="المواضيع الأخرى"
        data={filteredTopics}
        columns={otherTopicsColumns}
        onAdd={() => onAdd('otherTopic')}
        onEdit={(item) => onEdit(item, 'otherTopic')}
        onDelete={(item) => onDelete(item, 'otherTopic')}
        filterComponent={
            <StatusFilter
                value={statusFilter}
                onChange={setStatusFilter}
            />
        }
      />
    </div>
  );
};

export default OtherTopicsContent;