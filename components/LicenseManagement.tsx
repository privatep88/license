
import React, { useState } from 'react';
import DataTable from './DataTable';
import type { License, RecordDataType, RecordStatus } from '../types';
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

type LicenseColumn = {
  key: keyof License | 'actions' | 'remaining' | 'attachments' | 'serial';
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
  const [commercialFilter, setCommercialFilter] = useState<RecordStatus | 'all'>('all');
  const [operationalFilter, setOperationalFilter] = useState<RecordStatus | 'all'>('all');
  const [civilDefenseFilter, setCivilDefenseFilter] = useState<RecordStatus | 'all'>('all');

  const filteredCommercial = commercialLicenses.filter(
    l => commercialFilter === 'all' || l.status === commercialFilter
  );
  const filteredOperational = operationalLicenses.filter(
    l => operationalFilter === 'all' || l.status === operationalFilter
  );
  const filteredCivilDefense = civilDefenseCerts.filter(
    l => civilDefenseFilter === 'all' || l.status === civilDefenseFilter
  );

  const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
  const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
  const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm text-sm";

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

  const commercialLicenseColumns: LicenseColumn[] = [
    { key: 'name', header: 'اسم الرخصة التجارية', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns
  ];
  
  const operationalLicenseColumns: LicenseColumn[] = [
    { key: 'name', header: 'الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns.map(c => c.key === 'number' ? {...c, header: 'الرقم'} : c)
  ];
  
  const civilDefenseCertColumns: LicenseColumn[] = [
    { key: 'name', header: 'الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
    ...baseLicenseColumns.map(c => {
        if (c.key === 'number') return { ...c, header: 'الرقم' };
        if (c.key === 'status') return { ...c, header: 'حالة الشهادة' };
        return c;
    })
  ];

  const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

  return (
    <div>
      <DataTable
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><LicenseIcon /></span>
                <span className="font-bold text-lg tracking-wide">الرخص التجارية</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredCommercial.length}</span>
            </div>
        }
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
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><ClipboardListIcon /></span>
                <span className="font-bold text-lg tracking-wide">الرخص التشغيلية</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredOperational.length}</span>
            </div>
        }
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
        title={
            <div className={titleStyle}>
                <span className="text-[#eab308]"><ShieldIcon /></span>
                <span className="font-bold text-lg tracking-wide">شهادات الدفاع المدني</span>
                <span className="bg-[#eab308] text-[#091526] text-xs font-bold px-2 py-0.5 rounded-full mr-2">{filteredCivilDefense.length}</span>
            </div>
        }
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
