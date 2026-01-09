import React, { useState, useEffect } from 'react';
import type { License, Contract, RecordType, RecordDataType, Procedure, Attachment } from '../types';
import { RecordStatus, RenewalType, ContractType } from '../types';
import { DocumentIcon, PdfIcon, WordIcon, ExcelIcon, PowerPointIcon } from './icons/ActionIcons';

interface RecordFormProps {
  initialData?: RecordType;
  type: RecordDataType;
  onSave: (record: RecordType) => void;
  onCancel: () => void;
}

const FormField: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
    <div className="mb-4">
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {/* Clone element to add id prop for accessibility */}
        {React.cloneElement(children as React.ReactElement, { id: htmlFor })}
    </div>
);

const commonInputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

const FilePreviewIcon: React.FC<{ type: string }> = ({ type }) => {
    const iconContainerClass = "h-12 w-12 flex items-center justify-center bg-gray-100 rounded-md flex-shrink-0";
    if (type === 'application/pdf') return <div className={iconContainerClass}><PdfIcon /></div>;
    if (type.includes('msword') || type.includes('wordprocessingml')) return <div className={iconContainerClass}><WordIcon /></div>;
    if (type.includes('ms-excel') || type.includes('spreadsheetml')) return <div className={iconContainerClass}><ExcelIcon /></div>;
    if (type.includes('ms-powerpoint') || type.includes('presentationml')) return <div className={iconContainerClass}><PowerPointIcon /></div>;
    return <div className={iconContainerClass}><DocumentIcon /></div>;
};

const RecordForm: React.FC<RecordFormProps> = ({ initialData, type, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<RecordType>>(initialData || {});

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type: inputType } = e.target;
    
    // Special handling for contractType change to manage date fields
    if (name === 'contractType') {
        setFormData(prev => {
            const updated = { ...prev, contractType: value as ContractType } as Partial<Contract>;
            // Clear irrelevant date fields to prevent submitting stale data
            if (value === ContractType.Documented) {
                updated.internalExpiryDate = ''; 
            } else if (value === ContractType.Internal) {
                updated.documentedExpiryDate = '';
            }
            return updated;
        });
        return; 
    }

    // General handling for other inputs
    const isNumber = inputType === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) || 0 : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const filePromises = Array.from(files).map((file: File) => {
        return new Promise<Attachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve({
                    data: reader.result as string,
                    name: file.name,
                    type: file.type
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(filePromises).then(newAttachments => {
        setFormData(prev => {
            const existingAttachments = (prev as any).attachments || [];
            return {
                ...prev,
                attachments: [...existingAttachments, ...newAttachments]
            };
        });
    });
  };
  
  const handleRemoveAttachment = (indexToRemove: number) => {
    setFormData(prev => {
        const currentAttachments = (prev as any).attachments || [];
        return {
            ...prev,
            attachments: currentAttachments.filter((_: any, index: number) => index !== indexToRemove)
        };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as RecordType);
  };
  
  const attachmentData = formData as Partial<License | Contract | Procedure>;

  const attachmentField = (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">المرفقات</label>
        <input
            type="file"
            name="attachment-input"
            multiple
            accept="image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:ml-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {attachmentData.attachments && attachmentData.attachments.length > 0 && (
            <div className="mt-4 space-y-3">
                {attachmentData.attachments.map((att, index) => (
                     <div key={index} className="flex items-center justify-between gap-4 p-2 border rounded-md bg-gray-50">
                        <a href={att.data} target="_blank" rel="noopener noreferrer" title={`عرض ${att.name}`} className="flex items-center gap-4 flex-grow min-w-0">
                          {att.type?.startsWith('image/') ? (
                              <img src={att.data} alt="Preview" className="h-12 w-12 object-cover rounded-md border" />
                          ) : (
                              <FilePreviewIcon type={att.type} />
                          )}
                          <div className="flex-grow min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate hover:underline">{att.name}</p>
                              <p className="text-xs text-gray-500">{att.type}</p>
                          </div>
                        </a>
                        <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex-shrink-0"
                        >
                            حذف
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderLicenseFields = (data: Partial<License>) => (
    <>
      <FormField label={
          type === 'specialAgency' ? "اسم الوكالة" :
          type === 'operationalLicense' ? "الموضوع" :
          type === 'civilDefenseCert' ? "الموضوع" :
          type === 'otherTopic' ? "الموضوع" :
          type === 'generalContract' ? "اسم العقد العام" :
          "اسم الرخصة"
      } htmlFor="name">
          <input type="text" name="name" value={data.name || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <FormField label={
          type === 'operationalLicense' ? "الرقم" :
          type === 'civilDefenseCert' ? "الرقم" :
          type === 'specialAgency' ? "رقم المصادقة" :
          type === 'otherTopic' ? "الرقم" :
          type === 'generalContract' ? "رقم العقد" :
          "رقم الرخصة"
      } htmlFor="number">
        <input type="text" name="number" value={data.number || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="تاريخ الانتهاء" htmlFor="expiryDate">
          <input type="date" name="expiryDate" value={data.expiryDate || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
         <FormField label="التكلفة" htmlFor="cost">
          <input type="number" name="cost" value={data.cost || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
      </div>
      {type === 'generalContract' && (
        <FormField label="نوع التجديد" htmlFor="renewalType">
            <select name="renewalType" value={data.renewalType || ''} onChange={handleChange} className={commonInputClass} required>
                <option value="" disabled>اختر النوع</option>
                {Object.values(RenewalType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </FormField>
      )}
      <FormField label="الملاحظات" htmlFor="notes">
        <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
    </>
  );

  const renderContractFields = (data: Partial<Contract>) => (
    <>
        <FormField label="اسم العقد" htmlFor="name">
            <input type="text" name="name" value={data.name || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
        <FormField label="رقم العقد" htmlFor="number">
            <input type="text" name="number" value={data.number || ''} onChange={handleChange} className={commonInputClass} required />
        </FormField>
        <FormField label="نوع العقد" htmlFor="contractType">
            <select name="contractType" value={data.contractType || ''} onChange={handleChange} className={commonInputClass} required>
                <option value="" disabled>اختر النوع</option>
                {Object.values(ContractType).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </FormField>

        { (data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal) &&
            <FormField label="تاريخ انتهاء العقد الموثق" htmlFor="documentedExpiryDate">
              <input type="date" name="documentedExpiryDate" value={data.documentedExpiryDate || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Documented || data.contractType === ContractType.DocumentedAndInternal} />
            </FormField>
        }
        
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            { (data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal) &&
                <FormField label="تاريخ انتهاء العقد البيني" htmlFor="internalExpiryDate">
                  <input type="date" name="internalExpiryDate" value={data.internalExpiryDate || ''} onChange={handleChange} className={commonInputClass} required={data.contractType === ContractType.Internal || data.contractType === ContractType.DocumentedAndInternal} />
                </FormField>
            }
            <FormField label="التكلفة" htmlFor="cost">
              <input type="number" name="cost" value={data.cost || ''} onChange={handleChange} className={commonInputClass} required />
            </FormField>
        </div>
        <FormField label="الملاحظات" htmlFor="notes">
            <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
        </FormField>
    </>
  );

  const renderProcedureFields = (data: Partial<Procedure>) => (
    <>
      <FormField label="اسم الخدمة" htmlFor="licenseName">
        <input type="text" name="licenseName" value={data.licenseName || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <FormField label="الجهة المعنية للمراجعة" htmlFor="authority">
        <input type="text" name="authority" value={data.authority || ''} onChange={handleChange} className={commonInputClass} required />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="ارقام التواصل" htmlFor="contactNumbers">
          <input type="text" name="contactNumbers" value={data.contactNumbers || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="البريد الالكتروني" htmlFor="email">
          <input type="email" name="email" value={data.email || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم الموظف ( إن وجد)" htmlFor="employeeName">
          <input type="text" name="employeeName" value={data.employeeName || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="رقم الموظف" htmlFor="employeeNumber">
          <input type="text" name="employeeNumber" value={data.employeeNumber || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم الموقع الالكتروني" htmlFor="websiteName">
          <input type="text" name="websiteName" value={data.websiteName || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="عنوان الموقع الالكتروني (URL)" htmlFor="websiteUrl">
          <input type="url" name="websiteUrl" value={data.websiteUrl || ''} onChange={handleChange} className={commonInputClass} placeholder="https://example.com" />
        </FormField>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="اسم المستخدم" htmlFor="username">
          <input type="text" name="username" value={data.username || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
        <FormField label="كلمة المرور" htmlFor="password">
          <input type="text" name="password" value={data.password || ''} onChange={handleChange} className={commonInputClass} />
        </FormField>
      </div>
       <FormField label="المتطلبات" htmlFor="requirements">
        <textarea name="requirements" value={data.requirements || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
      <FormField label="الملاحظات" htmlFor="notes">
        <textarea name="notes" value={data.notes || ''} onChange={handleChange} className={commonInputClass} rows={3}></textarea>
      </FormField>
    </>
  );


  const renderFields = () => {
    switch(type) {
      case 'leaseContract':
        return renderContractFields(formData as Partial<Contract>);
      case 'procedure':
        return renderProcedureFields(formData as Partial<Procedure>);
      default:
        return renderLicenseFields(formData as Partial<License>);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {renderFields()}
      {attachmentField}
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
          إلغاء الأمر
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          حفظ
        </button>
      </div>
    </form>
  );
};

export default RecordForm;