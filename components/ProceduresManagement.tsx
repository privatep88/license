import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Procedure, RecordDataType } from '../types';
import { PlusIcon, PencilIcon, TrashIcon, ExportIcon, PhoneIcon, MailIcon, GlobeIcon, UserIcon, KeyIcon, CopyIcon, CheckIcon, DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon } from './icons/ActionIcons';
import { ProcedureIcon } from './icons/TabIcons';

interface ProceduresManagementProps {
    procedures: Procedure[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: Procedure, type: RecordDataType) => void;
    onDelete: (item: Procedure, type: RecordDataType) => void;
}

const CopyableField: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="font-medium text-gray-600">{label}:</span>
        <span className="text-gray-800 font-mono">{value}</span>
      </div>
      <button onClick={handleCopy} className="text-gray-500 hover:text-blue-600 transition-colors p-1" aria-label={`Copy ${label}`}>
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
};


const ProceduresManagement: React.FC<ProceduresManagementProps> = ({ procedures, onAdd, onEdit, onDelete }) => {
  
  const handleExport = () => {
      const exportData = procedures.map(p => ({
        'اسم الخدمة': p.licenseName,
        'الجهة المعنية للمراجعة': p.authority,
        'ارقام التواصل': p.contactNumbers,
        'البريد الالكتروني': p.email,
        'اسم الموظف': p.employeeName || '',
        'رقم الموظف': p.employeeNumber || '',
        'المتطلبات': p.requirements || '',
        'اسم الموقع الالكتروني': p.websiteName,
        'عنوان الموقع الالكتروني': p.websiteUrl,
        'اسم المستخدم': p.username,
        'كلمة المرور': p.password,
        'الملاحظات': p.notes || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-fit column widths
      ws['!cols'] = [
        { wch: 30 }, // اسم الخدمة
        { wch: 35 }, // الجهة المعنية
        { wch: 20 }, // ارقام التواصل
        { wch: 25 }, // البريد
        { wch: 20 }, // اسم الموظف
        { wch: 15 }, // رقم الموظف
        { wch: 40 }, // المتطلبات
        { wch: 25 }, // اسم الموقع
        { wch: 35 }, // عنوان الموقع
        { wch: 20 }, // المستخدم
        { wch: 20 }, // المرور
        { wch: 40 }, // الملاحظات
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Procedures");
      
      if(!ws['!props']) ws['!props'] = {};
      ws['!props'].RTL = true;

      XLSX.writeFile(wb, `الإجراءات والمتطلبات.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-3 text-xl font-bold text-gray-700">
            <span className="text-blue-800 h-6 w-6"><ProcedureIcon /></span>
            <span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">الإجراءات والمتطلبات</span> لتجديد الرخص / الأنشطة / العقود / الشهادات / الوكالات - والمواضيع الأخرى
            </span>
        </h2>
        <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <ExportIcon />
              تصدير إلى Excel
            </button>
            <button
              onClick={() => onAdd('procedure')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon />
              إضافة جديد
            </button>
        </div>
      </div>

      {procedures.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {procedures.map(proc => (
            <div key={proc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden group transition-shadow hover:shadow-lg flex flex-col">
                {/* Card Header */}
                <div className="bg-slate-50 p-5 border-b border-gray-200 flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-blue-700">{proc.licenseName}</h3>
                        <p className="text-sm text-slate-500 mt-1">{proc.authority}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onEdit(proc, 'procedure')} className="p-2 bg-white rounded-full shadow text-blue-500 hover:bg-blue-50" aria-label="تعديل"><PencilIcon /></button>
                         <button onClick={() => onDelete(proc, 'procedure')} className="p-2 bg-white rounded-full shadow text-red-500 hover:bg-red-50" aria-label="حذف"><TrashIcon /></button>
                    </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-grow space-y-5">
                    {(proc.contactNumbers || proc.email || proc.employeeName || proc.employeeNumber) && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">معلومات التواصل</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-3 text-sm">
                                {proc.contactNumbers && <div className="flex items-center gap-2"><PhoneIcon /><span className="text-gray-700">{proc.contactNumbers}</span></div>}
                                {proc.email && <div className="flex items-center gap-2"><MailIcon /><a href={`mailto:${proc.email}`} className="text-blue-600 hover:underline truncate">{proc.email}</a></div>}
                                {proc.employeeName && <div className="flex items-center gap-2"><UserIcon /><span className="text-gray-700">{proc.employeeName}</span></div>}
                                {proc.employeeNumber && <div className="flex items-center gap-2"><UserIcon /><span className="font-medium text-gray-500">الرقم:</span><span className="text-gray-700">{proc.employeeNumber}</span></div>}
                            </div>
                        </div>
                    )}

                    {(proc.websiteName || proc.websiteUrl || proc.username || proc.password) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200/80">
                            <h4 className="font-semibold text-gray-700 mb-3">{proc.websiteName || 'الموقع الالكتروني'}</h4>
                            <div className="space-y-2">
                                {proc.websiteUrl && <div className="flex items-center gap-3 text-sm"> <GlobeIcon /> <a href={proc.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{proc.websiteUrl}</a> </div>}
                                {proc.username && <CopyableField label="المستخدم" value={proc.username} icon={<UserIcon />} />}
                                {proc.password && <CopyableField label="المرور" value={proc.password} icon={<KeyIcon />} />}
                            </div>
                        </div>
                    )}

                    {proc.requirements && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">المتطلبات:</h4>
                            <div className="text-sm text-blue-900 bg-blue-50/80 p-3 rounded-lg border border-blue-200/60 whitespace-pre-wrap font-mono">
                                {proc.requirements}
                            </div>
                        </div>
                    )}

                    {proc.notes && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">ملاحظات:</h4>
                            <div className="text-sm text-yellow-900 bg-yellow-50/80 p-3 rounded-lg border border-yellow-200/60">
                                {proc.notes}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Card Footer for Attachments */}
                {proc.attachments && proc.attachments.length > 0 && (
                    <div className="p-5 mt-auto border-t border-gray-200 bg-slate-50/50">
                        <h4 className="text-sm font-semibold text-gray-600 mb-3">المرفقات:</h4>
                        <div className="space-y-2">
                        {proc.attachments.map((att, index) => (
                             <a key={index} href={att.data} target="_blank" rel="noopener noreferrer" title={att.name || 'عرض الملف'} className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-800 transition p-2 bg-white border rounded-md">
                                {(() => {
                                    const type = att.type || '';
                                    if (type.startsWith('image/')) { return <img src={att.data} alt={att.name || 'Preview'} className="h-10 w-10 object-cover rounded-md border flex-shrink-0" />; }
                                    if (type === 'application/pdf') { return <PdfIcon />; }
                                    if (type.includes('msword') || type.includes('wordprocessingml')) { return <WordIcon />; }
                                    if (type.includes('ms-excel') || type.includes('spreadsheetml')) { return <ExcelIcon />; }
                                    if (type.includes('ms-powerpoint') || type.includes('presentationml')) { return <PowerPointIcon />; }
                                    return <DocumentIcon />;
                                })()}
                                 <span className="truncate">{att.name || 'عرض الملف'}</span>
                             </a>
                        ))}
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
            <p>لا توجد إجراءات مسجلة حالياً.</p>
            <p className="mt-2">انقر على "إضافة جديد" لبدء إضافة السجلات.</p>
        </div>
      )}
    </div>
  );
};

export default ProceduresManagement;