

import React, { useState } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { Contract, RecordDataType } from '../types';
import { RecordStatus } from '../types';
import { ContractIcon } from './icons/TabIcons';
import { formatCost, getStatusClass, calculateRemainingDays, calculateRemainingPeriod, getRemainingPeriodClass } from '../utils';

interface ContractManagementProps {
    contracts: Contract[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: Contract, type: RecordDataType) => void;
    onDelete: (item: Contract, type: RecordDataType) => void;
}

const ContractManagement: React.FC<ContractManagementProps> = ({ contracts, onAdd, onEdit, onDelete }) => {
  const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

  const filteredContracts = contracts.filter(c => statusFilter === 'all' || c.status === statusFilter);

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center";
  const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm";

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
        <div className="inline-block text-right text-xs space-y-1">
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
        <div className="inline-block space-y-1.5">
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
    { 
      key: 'remaining', 
      header: 'المدة المتبقية', 
      headerClassName: baseHeaderClass,
      cellClassName: baseCellClass,
      render: (item) => (
        <div className="inline-block text-right text-xs space-y-1">
          {item.documentedExpiryDate && (
            <div className="flex items-center gap-x-2">
              <span className="font-medium text-gray-500">الموثق:</span>
              <span className={getRemainingPeriodClass(item.documentedExpiryDate)}>
                {calculateRemainingPeriod(item.documentedExpiryDate)}
              </span>
            </div>
          )}
          {item.internalExpiryDate && (
             <div className="flex items-center gap-x-2">
              <span className="font-medium text-gray-500">البيني:</span>
              <span className={getRemainingPeriodClass(item.internalExpiryDate)}>
                {calculateRemainingPeriod(item.internalExpiryDate)}
              </span>
            </div>
          )}
        </div>
      ),
      exportValue: (item) => {
        const docText = item.documentedExpiryDate ? `الموثق: ${calculateRemainingPeriod(item.documentedExpiryDate)}` : '';
        const internalText = item.internalExpiryDate ? `البيني: ${calculateRemainingPeriod(item.internalExpiryDate)}` : '';
        return [docText, internalText].filter(Boolean).join(' | ');
      }
    },
    { 
      key: 'documentedCost', 
      header: 'التكلفة', 
      headerClassName: baseHeaderClass,
      cellClassName: baseCellClass,
      render: (item) => (
        <div className="inline-block text-right text-xs space-y-1">
          {item.documentedCost != null && (
            <div className="flex items-center gap-x-2 justify-center">
              <span className="font-medium text-gray-500">الموثق:</span>
              <span className="text-gray-900 font-mono">{formatCost(item.documentedCost)}</span>
            </div>
          )}
          {item.internalCost != null && (
             <div className="flex items-center gap-x-2 justify-center">
              <span className="font-medium text-gray-500">البيني:</span>
              <span className="text-gray-900 font-mono">{formatCost(item.internalCost)}</span>
            </div>
          )}
        </div>
      ),
      exportValue: (item) => {
        const docCost = item.documentedCost != null ? `الموثق: ${item.documentedCost}` : '';
        const internalCost = item.internalCost != null ? `البيني: ${item.internalCost}` : '';
        return [docCost, internalCost].filter(Boolean).join(' | ');
      }
    },
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