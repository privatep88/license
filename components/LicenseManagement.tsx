

import React, { useState } from 'react';
import DataTable from './DataTable';
import type { License, RecordDataType } from '../types';
import StatusFilter from './StatusFilter';
import { LicenseIcon } from './icons/TabIcons';
import { ClipboardListIcon, ShieldIcon } from './icons/ActionIcons';
import { formatCost, calculateRemainingDays } from '../utils';

interface LicenseManagementProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    onAdd: (type: RecordDataType) => void;
    onEdit: (item: License, type: RecordDataType) => void;
    onDelete: (item: License, type: RecordDataType) => void;
}

// FIX: Define a reusable column type to enforce type safety on column definitions.
type LicenseColumn = {
  key: keyof License | 'actions' | 'remaining' | 'attachments';
  header: string;
  render?: (item: License) => React.ReactNode;
  exportValue?: (item: License) => string | number | null | undefined;
  headerClassName?: string;
  cellClassName?: string;
};

const LicenseManagement: React.FC<LicenseManagementProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    onAdd,
    onEdit,
    onDelete
}) => {
  const [commercialFilter, setCommercialFilter] = useState<'all' | any>('all');
  const [operationalFilter, setOperationalFilter] = useState<'all' | any>('all');
  const [civilDefenseFilter, setCivilDefenseFilter] = useState<'all' | any>('all');

  const filteredCommercial = commercialLicenses.filter(
    l => commercialFilter === 'all' || l.status === commercialFilter
  );
  const filteredOperational = operationalLicenses.filter(
    l => operationalFilter === 'all' || l.status === operationalFilter
  );
  const filteredCivilDefense = civilDefenseCerts.filter(
    l => civilDefenseFilter === 'all' || l.status === civilDefenseFilter
  );

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-right font-medium text-white";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-top";
  const wideCellClass = "px-2 py-4 text-gray-700 align-top break-words max-w-sm";

  // FIX: Use the defined LicenseColumn type for strong typing and better readability.
  const baseLicenseColumns: LicenseColumn[] = [
    { key: 'number', header: 'رقم الرخصة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'status', header: 'حالة الرخصة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'cost', header: 'التكلفة', render: (item) => formatCost(item.cost), exportValue: (item) => item.cost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
    { key: 'notes', header: 'الملاحظات', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    { key: 'actions', header: 'إجراءات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
  ];

  // FIX: Use the defined LicenseColumn type to fix type inference issue.
  const commercialLicenseColumns: LicenseColumn[] = [
    { key: 'name', header: 'اسم الرخصة التجارية', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns
  ];
  
  // FIX: Use the defined LicenseColumn type to fix type inference issue.
  const operationalLicenseColumns: LicenseColumn[] = [
    { key: 'name', header: 'الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns.map(c => c.key === 'number' ? {...c, header: 'الرقم'} : c)
  ];
  
  // FIX: Use the defined LicenseColumn type to fix type inference issue.
  const civilDefenseCertColumns: LicenseColumn[] = [
    { key: 'name', header: 'الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns.map(c => c.key === 'number' ? {...c, header: 'الرقم'} : c)
  ];

  return (
    <div>
      <DataTable
        title={<div className="flex items-center gap-3"><span className="text-blue-800 h-6 w-6"><LicenseIcon /></span><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">الرخص التجارية</span></div>}
        exportFileName="الرخص التجارية"
        data={filteredCommercial}
        columns={commercialLicenseColumns}
        onAdd={() => onAdd('commercialLicense')}
        onEdit={(item) => onEdit(item, 'commercialLicense')}
        onDelete={(item) => onDelete(item, 'commercialLicense')}
        filterComponent={
            <StatusFilter 
                value={commercialFilter}
                onChange={(newValue) => setCommercialFilter(newValue)}
            />
        }
      />
      <DataTable
        title={<div className="flex items-center gap-3"><ClipboardListIcon /><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">الرخص التشغيلية</span></div>}
        exportFileName="الرخص التشغيلية"
        data={filteredOperational}
        columns={operationalLicenseColumns}
        onAdd={() => onAdd('operationalLicense')}
        onEdit={(item) => onEdit(item, 'operationalLicense')}
        onDelete={(item) => onDelete(item, 'operationalLicense')}
        filterComponent={
            <StatusFilter 
                value={operationalFilter}
                onChange={(newValue) => setOperationalFilter(newValue)}
            />
        }
      />
      <DataTable
        title={<div className="flex items-center gap-3"><ShieldIcon /><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-semibold">شهادات الدفاع المدني</span></div>}
        exportFileName="شهادات الدفاع المدني"
        data={filteredCivilDefense}
        columns={civilDefenseCertColumns}
        onAdd={() => onAdd('civilDefenseCert')}
        onEdit={(item) => onEdit(item, 'civilDefenseCert')}
        onDelete={(item) => onDelete(item, 'civilDefenseCert')}
        filterComponent={
            <StatusFilter 
                value={civilDefenseFilter}
                onChange={(newValue) => setCivilDefenseFilter(newValue)}
            />
        }
      />
    </div>
  );
};

export default LicenseManagement;
