
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

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
  const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm text-sm";

  const columns: { 
    key: keyof Contract | 'actions' | 'remaining' | 'attachments' | 'serial'; 
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

  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <DataTable
      title={
        <div className={titleStyle}>
            <span className="text-[#eab308]"><ContractIcon /></span>
            <span className="font-bold text-lg tracking-wide">العقود الايجارية</span>
            <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredContracts.length}</span>
        </div>
      }
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
