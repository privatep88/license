
import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { License, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { TrademarkIcon } from './icons/TabIcons';
import { formatCost, calculateRemainingDays } from '../utils';


interface TrademarkManagementProps {
    certificates: License[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: License, type: RecordDataType) => void;
    onDelete: (item: License, type: RecordDataType) => void;
}

const TrademarkManagement: React.FC<TrademarkManagementProps> = ({
    certificates,
    onAdd,
    onEdit,
    onDelete
}) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredCertificates = certificates.filter(l => statusFilter === 'all' || l.status === statusFilter);
  
  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
  const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm text-sm";

  const columns: { key: keyof License | 'actions' | 'remaining' | 'attachments' | 'serial'; header: string; render?: (item: License) => React.ReactNode; exportValue?: (item: License) => string | number | null | undefined; headerClassName?: string; cellClassName?: string; }[] = [
    { key: 'name', header: 'اسم الشهادة', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'number', header: 'رقم الشهادة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'registrationDate', header: 'تاريخ التسجيل', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'status', header: 'الحالة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
  ];
  
  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <div>
      <DataTable
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><TrademarkIcon /></span>
                <span className="font-bold text-lg tracking-wide">العلامات التجارية المسجلة</span>
            </div>
        }
        exportFileName="العلامات التجارية المسجلة"
        data={filteredCertificates}
        columns={columns}
        onAdd={() => onAdd('trademarkCert')}
        onEdit={(item) => onEdit(item, 'trademarkCert')}
        onDelete={(item) => onDelete(item, 'trademarkCert')}
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

export default TrademarkManagement;
