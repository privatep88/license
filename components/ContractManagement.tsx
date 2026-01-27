
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

  // Custom Styles for this Table Only
  const baseHeaderClass = "whitespace-nowrap px-1 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  
  // Compact Cell: Forces column to shrink to content width (w-px)
  const compactCellClass = "whitespace-nowrap px-1 py-3 text-gray-700 align-middle text-center text-sm w-px";
  
  // Main Fluid Cell (Name): Allows text wrapping, constrained max width to prevent overflow
  // Removed font-semibold to match Supplier Contracts
  const mainFluidCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal min-w-[180px] max-w-[300px]";
  
  // Note Cell: Allows wrapping, smaller min-width
  const noteCellClass = "px-2 py-3 text-gray-700 align-middle text-center text-sm whitespace-normal min-w-[150px] max-w-[250px]";

  // Helper for internal rows (Label + Value close together) - Fonts normalized to match other tables (text-sm for value)
  const renderRow = (label: string, value: React.ReactNode, colorClass: string = "text-gray-900") => (
     <div className="flex items-center gap-1.5 justify-start">
        <span className="text-xs text-gray-500 font-medium">{label}:</span>
        <span className={`text-sm ${colorClass}`}>{value}</span>
     </div>
  );

  const columns: { 
    key: keyof Contract | 'actions' | 'remaining' | 'attachments' | 'serial'; 
    header: string;
    render?: (item: Contract) => React.ReactNode;
    exportValue?: (item: Contract) => string | number | null | undefined;
    headerClassName?: string;
    cellClassName?: string;
  }[] = [
    { key: 'name', header: 'اسم العقد', headerClassName: baseHeaderClass, cellClassName: mainFluidCellClass },
    { key: 'number', header: 'رقم العقد', headerClassName: baseHeaderClass, cellClassName: compactCellClass },
    { key: 'contractType', header: 'نوع العقد', headerClassName: baseHeaderClass, cellClassName: compactCellClass },
    { 
      key: 'documentedExpiryDate', 
      header: 'تاريخ الانتهاء', 
      headerClassName: baseHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedExpiryDate && renderRow('الموثق', item.documentedExpiryDate)}
          {item.internalExpiryDate && renderRow('البيني', item.internalExpiryDate)}
        </div>
      ),
      exportValue: (item) => `الموثق: ${item.documentedExpiryDate || 'N/A'}, البيني: ${item.internalExpiryDate || 'N/A'}`
    },
    { 
      key: 'status', 
      header: 'الحالة',
      headerClassName: baseHeaderClass,
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1.5 items-start">
          {item.documentedStatus && (
            <div className="flex items-center gap-1.5 justify-start">
               <span className="text-xs text-gray-500 font-medium">الموثق:</span>
               <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${getStatusClass(item.documentedStatus)}`}>
                  {item.documentedStatus}
               </span>
            </div>
          )}
          {item.internalStatus && (
            <div className="flex items-center gap-1.5 justify-start">
               <span className="text-xs text-gray-500 font-medium">البيني:</span>
               <span className={`px-2 py-0.5 rounded text-xs font-bold leading-none ${getStatusClass(item.internalStatus)}`}>
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
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedExpiryDate && renderRow('الموثق', calculateRemainingPeriod(item.documentedExpiryDate), `${getRemainingPeriodClass(item.documentedExpiryDate)} font-bold`)}
          {item.internalExpiryDate && renderRow('البيني', calculateRemainingPeriod(item.internalExpiryDate), `${getRemainingPeriodClass(item.internalExpiryDate)} font-bold`)}
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
      cellClassName: compactCellClass,
      render: (item) => (
        <div className="flex flex-col gap-1 items-start">
          {item.documentedCost != null && renderRow('الموثق', formatCost(item.documentedCost))}
          {item.internalCost != null && renderRow('البيني', formatCost(item.internalCost))}
        </div>
      ),
      exportValue: (item) => {
        const docCost = item.documentedCost != null ? `الموثق: ${item.documentedCost}` : '';
        const internalCost = item.internalCost != null ? `البيني: ${item.internalCost}` : '';
        return [docCost, internalCost].filter(Boolean).join(' | ');
      }
    },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: compactCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: noteCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: compactCellClass },
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
