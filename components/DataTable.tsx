import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { RecordStatus, Attachment } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon, ExportIcon, SortIcon, SortAscIcon, SortDescIcon } from './icons/ActionIcons';
import { getStatusClass, calculateRemainingPeriod, getRemainingPeriodClass, calculateRemainingDays } from '../utils';

interface Column<T> {
  key: keyof T | 'actions' | 'remaining' | 'attachments';
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
  onAdd: () => void;
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
        aValue = a.expiryDate || a.documentedExpiryDate;
        bValue = b.expiryDate || b.documentedExpiryDate;
      } else {
        aValue = a[key];
        bValue = b[key];
      }
      
      if (aValue === null || typeof aValue === 'undefined') return 1;
      if (bValue === null || typeof bValue === 'undefined') return -1;
      
      let comparison = 0;
      
      const isDateKey = ['expiryDate', 'documentedExpiryDate', 'internalExpiryDate', 'remaining'].includes(key as string);
      
      if (isDateKey && typeof aValue === 'string' && typeof bValue === 'string') {
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

    const exportData = sortedData.map((item) => {
        const row: { [key: string]: any } = {};
        exportableColumns.forEach((col) => {
            let value;
            if (col.exportValue) {
                value = col.exportValue(item);
            } else if (col.key === 'remaining') {
                // FIX: Export remaining days as a number for sortability in Excel
                value = calculateRemainingDays(item.expiryDate || item.documentedExpiryDate);
            } else {
                value = item[col.key as keyof T];
            }
            row[col.header] = value ?? '';
        });
        return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Auto-fit column widths
    const colWidths = exportableColumns.map(col => {
        const key = String(col.key);
        if (key.toLowerCase().includes('name') || key.toLowerCase().includes('notes')) return { wch: 40 };
        if (key.toLowerCase().includes('number') || key.toLowerCase().includes('remaining')) return { wch: 25 };
        return { wch: 20 };
    });
    ws['!cols'] = colWidths;
    
    if(!ws['!props']) ws['!props'] = {};
    ws['!props'].RTL = true;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };
  
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-700">{title}</h2>
            {filterComponent}
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExportIcon />
              تصدير إلى Excel
            </button>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              إضافة جديد
            </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
          <thead className="bg-slate-800">
            <tr>
              {columns.map((col) => {
                 const isSortable = !['actions', 'attachments'].includes(String(col.key));
                 return (
                    <th key={String(col.key)} className={col.headerClassName || "whitespace-nowrap px-4 py-3 text-right font-medium text-white"}>
                      {isSortable ? (
                         <button onClick={() => requestSort(String(col.key))} className="flex items-center gap-1.5 group w-full text-right focus:outline-none">
                            <span>{col.header}</span>
                            <span className={`transition-opacity ${sortConfig.key === String(col.key) ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-70 text-white'}`}>
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
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((col) => {
                  const defaultTdClass = ['name', 'notes'].includes(String(col.key))
                    ? 'px-4 py-4 text-gray-700 align-top break-words max-w-sm'
                    : 'whitespace-nowrap px-4 py-4 text-gray-700 align-top';
                  
                  const tdClass = col.cellClassName || defaultTdClass;

                  return (
                    <td key={`${item.id}-${String(col.key)}`} className={tdClass}>
                      {col.render ? (
                        col.render(item)
                      ) : col.key === 'actions' ? (
                        <div className="flex gap-2">
                          <button onClick={() => onEdit(item)} className="text-blue-500 hover:text-blue-700" aria-label="تعديل السجل"><PencilIcon /></button>
                          <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700" aria-label="حذف السجل"><TrashIcon /></button>
                        </div>
                      ) : col.key === 'status' && item.status ? (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                              {item.status}
                          </span>
                      ) : col.key === 'remaining' ? (
                          <span className={getRemainingPeriodClass(item.expiryDate || item.documentedExpiryDate)}>
                            {calculateRemainingPeriod(item.expiryDate || item.documentedExpiryDate)}
                          </span>
                      ) : col.key === 'attachments' ? (
                          item.attachments && item.attachments.length > 0 ? (
                              <div className="flex items-center -space-x-4">
                                  {item.attachments.map((att, index) => (
                                      <a href={att.data} key={index} target="_blank" rel="noopener noreferrer" title={att.name || 'عرض الملف'}>
                                          {(() => {
                                              const type = att.type || '';
                                              if (type.startsWith('image/')) {
                                                  return <img src={att.data} alt={att.name || 'Preview'} className="h-10 w-10 object-cover rounded-md border-2 border-white hover:opacity-80 transition-opacity" />;
                                              }
                                              if (type === 'application/pdf') {
                                                  return <PdfIcon />;
                                              }
                                              if (type.includes('msword') || type.includes('wordprocessingml')) {
                                                  return <WordIcon />;
                                              }
                                              if (type.includes('ms-excel') || type.includes('spreadsheetml')) {
                                                  return <ExcelIcon />;
                                              }
                                              if (type.includes('ms-powerpoint') || type.includes('presentationml')) {
                                                  return <PowerPointIcon />;
                                              }
                                              return <DocumentIcon />;
                                          })()}
                                      </a>
                                  ))}
                              </div>
                          ) : (
                              <span className="text-gray-400">لا يوجد</span>
                          )
                      ) : (
                        String(item[col.key as keyof T] ?? '')
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;