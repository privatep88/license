
import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { Contract, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { ContractIcon } from './icons/TabIcons';
import { formatCost, getStatusClass, calculateRemainingDays } from '../utils';

interface ContractManagementProps {
    contracts: Contract[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: Contract, type: RecordDataType) => void;
    onDelete: (item: Contract, type: RecordDataType) => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ contracts, onAdd, onEdit, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredContracts = contracts.filter(c => statusFilter === 'all' || c.status === statusFilter);

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-right font-medium text-white";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-top";
  const wideCellClass = "px-2 py-4 text-gray-700 align-top break-words max-w-sm";

  const columns: { 
    key: keyof Contract | 'actions' | 'remaining' | 'attachments'; 
    header: string;
    render?: (item: Contract) => React.ReactNode;
    exportValue?: (item: Contract) => string | number | null | undefined;
    headerClassName?: string;
    cellClassName?: string;
  }[] = [
    { key: 'name', header: 'اسم العقد', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'number', header: 'رقم العقد', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'contractType', header: 'نوع العقد', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { 
      key: 'documentedExpiryDate', 
      header: 'انتهاء العقد (الموثق / البيني)', 
      headerClassName: baseHeaderClass,
      cellClassName: baseCellClass,
      render: (item) => (
        <div className="text-xs space-y-1">
          {item.documentedExpiryDate && (
            <div className="flex items-center gap-x-2">
              <span className="font-medium text-gray-500">الموثق:</span>
              <span className="text-gray-900 font-mono">{item.documentedExpiryDate}</span>
            </div>
          )}
          {item.internalExpiryDate && (
             <div className="flex items-center gap-x-2">
              <span className="font-medium text-gray-500">البيني:</span>
              <span className="text-gray-900 font-mono">{item.internalExpiryDate}</span>
            </div>
          )}
        </div>
      ),
      exportValue: (item) => `الموثق: ${item.documentedExpiryDate || 'N/A'}, البيني: ${item.internalExpiryDate || 'N/A'}`
    },
    { 
      key: 'status', 
      header: 'حالة العقد',
      headerClassName: baseHeaderClass,
      cellClassName: baseCellClass,
      render: (item) => (
        <div className="space-y-1.5">
          {item.documentedStatus && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-500 text-xs text-left w-12">الموثق:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(item.documentedStatus)}`}>
                  {item.documentedStatus}
              </span>
            </div>
          )}
          {item.internalStatus && (
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-500 text-xs text-left w-12">البيني:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(item.internalStatus)}`}>
                  {item.internalStatus}
              </span>
            </div>
          )}
        </div>
      ),
      exportValue: (item) => `الموثق: ${item.documentedStatus || 'N/A'}, البيني: ${item.internalStatus || 'N/A'}`
    },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.documentedExpiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
  ];

  return (
    <DataTable
      title={<div className="flex items-center gap-3"><span className="text-blue-800 h-6 w-6"><ContractIcon /></span><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">العقود الايجارية</span></div>}
      exportFileName="العقود الايجارية"
      data={filteredContracts}
      columns={columns}
      onAdd={() => onAdd('leaseContract')}
      onEdit={(item) => onEdit(item, 'leaseContract')}
      onDelete={(item) => onDelete(item, 'leaseContract')}
      filterComponent={
        <StatusFilter 
          value={statusFilter}
          onChange={setStatusFilter}
        />
      }
    />
  );
};

export default ContractManagement;