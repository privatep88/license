
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { RecordStatus, Attachment } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon, ExportIcon, SortIcon, SortAscIcon, SortDescIcon, ExcelSheetIcon } from './icons/ActionIcons';
import { getStatusClass, calculateRemainingPeriod, getRemainingPeriodClass, calculateRemainingDays, getStatusWeight } from '../utils';

interface Column<T> {
  key: keyof T | 'actions' | 'remaining' | 'attachments' | 'serial';
  header: string;
  render?: (item: T) => React.ReactNode;
  exportValue?: (item: T) => string | number | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<T> {
  title: React.ReactNode;
  exportFileName: string;
  data: T[];
  columns: Column<T>[];
  onAdd?: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  filterComponent?: React.ReactNode;
}

const DataTable = <T extends { id: number; status?: RecordStatus; expiryDate?: string; documentedExpiryDate?: string; attachments?: Attachment[]; }>({ title, exportFileName, data, columns, onAdd, onEdit, onDelete, filterComponent }: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return data;
    }

    const sortableItems = [...data];
    sortableItems.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const key = sortConfig.key as keyof T | 'remaining';

      if (key === 'remaining') {
        aValue = calculateRemainingDays(a.expiryDate || a.documentedExpiryDate);
        bValue = calculateRemainingDays(b.expiryDate || b.documentedExpiryDate);
      } else {
        aValue = a[key];
        bValue = b[key];
      }
      
      if (aValue === null || typeof aValue === 'undefined') return 1;
      if (bValue === null || typeof bValue === 'undefined') return -1;
      
      let comparison = 0;
      
      const isDateKey = ['expiryDate', 'documentedExpiryDate', 'internalExpiryDate', 'registrationDate'].includes(key as string);
      const isStatusKey = key === 'status';

      if (isStatusKey) {
          const weightA = getStatusWeight(aValue);
          const weightB = getStatusWeight(bValue);
          comparison = weightA - weightB;
      }
      else if (isDateKey && typeof aValue === 'string' && typeof bValue === 'string') {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (dateA < dateB) comparison = -1;
          if (dateA > dateB) comparison = 1;
      } 
      else if (typeof aValue === 'number' && typeof bValue === 'number') {
          if (aValue < bValue) comparison = -1;
          if (aValue > bValue) comparison = 1;
      }
      else {
          comparison = String(aValue).localeCompare(String(bValue), 'ar');
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });

    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const exportableColumns = columns.filter(
      (col) => col.key !== 'actions' && col.key !== 'attachments'
    );

    const exportData = sortedData.map((item, index) => {
        const row: { [key: string]: any } = {};
        exportableColumns.forEach((col) => {
            let value;
            if (col.exportValue) {
                value = col.exportValue(item);
            } else if (col.key === 'remaining') {
                value = calculateRemainingDays(item.expiryDate || item.documentedExpiryDate);
            } else if (col.key === 'serial') {
                value = index + 1;
            } else {
                value = item[col.key as keyof T];
            }
            row[col.header] = value ?? '';
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Fix: Auto-fit column widths
    const colWidths = exportableColumns.map(col => {
        const key = String(col.key);
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('notes')) return { wch: 45 };
        if (key.toLowerCase().includes('number')) return { wch: 20 };
        if (key.toLowerCase().includes('date')) return { wch: 15 };
        if (String(col.key) === 'serial') return { wch: 5 };
        return { wch: 20 };
    });
    ws['!cols'] = colWidths;
    
    // Fix: Set Sheet Direction to Right-to-Left for Arabic support
    if(!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ rightToLeft: true });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "البيانات");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };
  
  return (
    <div className="mb-12 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {filterComponent}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-green-700 border border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors shadow-sm text-sm font-medium"
            >
              <ExcelSheetIcon />
              <span>تصدير Excel</span>
            </button>
            {onAdd && (
                <button
                  onClick={onAdd}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#334155] text-white px-4 py-2 rounded-lg hover:bg-[#1e293b] transition-colors shadow-sm text-sm font-medium"
                >
                  <PlusIcon />
                  <span>إضافة</span>
                </button>
            )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1e293b]">
            <tr>
              {columns.map((col) => {
                 const isSortable = !['actions', 'attachments', 'serial'].includes(String(col.key));
                 return (
                    <th key={String(col.key)} className={col.headerClassName || "whitespace-nowrap px-4 py-3 text-center font-medium text-white text-sm"}>
                      {isSortable ? (
                         <button onClick={() => requestSort(String(col.key))} className="flex items-center justify-center gap-1.5 group w-full focus:outline-none hover:text-blue-200 transition-colors">
                            <span>{col.header}</span>
                            <span className={`transition-opacity ${sortConfig.key === String(col.key) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                {sortConfig.key === String(col.key)
                                  ? (sortConfig.direction === 'asc' ? <SortAscIcon /> : <SortDescIcon />)
                                  : <SortIcon />}
                            </span>
                         </button>
                      ) : (
                        <span>{col.header}</span>
                      )}
                    </th>
                 )
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {sortedData.length > 0 ? (
                sortedData.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {columns.map((col) => {
                    const defaultTdClass = ['name', 'notes', 'recordTypeLabel'].includes(String(col.key))
                        ? 'px-4 py-3 text-gray-700 align-middle text-sm min-w-[200px]'
                        : 'whitespace-nowrap px-4 py-3 text-gray-700 align-middle text-sm text-center';
                    
                    const tdClass = col.cellClassName || defaultTdClass;

                    return (
                        <td key={`${item.id}-${String(col.key)}`} className={tdClass}>
                        {col.render ? (
                            col.render(item)
                        ) : col.key === 'actions' ? (
                            <div className="flex gap-3 justify-center">
                            <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors" title="تعديل"><PencilIcon /></button>
                            <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors" title="حذف"><TrashIcon /></button>
                            </div>
                        ) : col.key === 'serial' ? (
                            <span className="font-bold text-gray-500 text-xs">{index + 1}</span>
                        ) : col.key === 'status' && item.status ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClass(item.status)}`}>
                                {item.status}
                            </span>
                        ) : col.key === 'remaining' ? (
                            <span className={getRemainingPeriodClass(item.expiryDate || item.documentedExpiryDate)}>
                                {calculateRemainingPeriod(item.expiryDate || item.documentedExpiryDate)}
                            </span>
                        ) : col.key === 'attachments' ? (
                            item.attachments && item.attachments.length > 0 ? (
                                <div className="flex items-center gap-1 justify-center flex-wrap max-w-[150px] mx-auto">
                                    {item.attachments.map((att, index) => (
                                        <a href={att.data} key={index} target="_blank" rel="noopener noreferrer" title={att.name || 'عرض الملف'} className="hover:scale-110 transition-transform">
                                            {(() => {
                                                const type = att.type || '';
                                                if (type.startsWith('image/')) {
                                                    return <img src={att.data} alt="file" className="h-8 w-8 object-cover rounded shadow-sm border border-gray-200" />;
                                                }
                                                if (type === 'application/pdf') return <div className="h-8 w-8"><PdfIcon /></div>;
                                                if (type.includes('word')) return <div className="h-8 w-8"><WordIcon /></div>;
                                                if (type.includes('excel') || type.includes('sheet')) return <div className="h-8 w-8"><ExcelIcon /></div>;
                                                return <div className="h-8 w-8"><DocumentIcon /></div>;
                                            })()}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-300 text-xs">-</span>
                            )
                        ) : (
                            String(item[col.key as keyof T] ?? '')
                        )}
                        </td>
                    );
                    })}
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 bg-gray-50">
                        لا توجد بيانات للعرض
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
