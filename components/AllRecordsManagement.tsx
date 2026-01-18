
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import StatusFilter from './StatusFilter';
import type { License, Contract, RecordDataType, RecordType } from '../types';
import { RecordStatus } from '../types';
import { AllRecordsIcon } from './icons/TabIcons';
import { formatCost, calculateRemainingDays } from '../utils';

interface AllRecordsManagementProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    leaseContracts: Contract[];
    generalContracts: License[];
    specialAgencies: License[];
    trademarkCerts: License[];
    otherTopics: License[];
    onEdit: (item: RecordType, type: RecordDataType) => void;
    onDelete: (item: RecordType, type: RecordDataType) => void;
}

// Interface for the unified row in the table
interface UnifiedRecord extends License {
    originalType: RecordDataType;
    recordTypeLabel: string;
    // For contracts that might have different cost structure
    displayCost: number;
    // Helper to store original object for actions
    originalRecord: RecordType;
}

const AllRecordsManagement: React.FC<AllRecordsManagementProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    leaseContracts,
    generalContracts,
    specialAgencies,
    trademarkCerts,
    otherTopics,
    onEdit,
    onDelete
}) => {
    const [statusFilter, setStatusFilter] = useState<RecordStatus | 'all'>('all');

    // Merge and normalize data
    const unifiedData: UnifiedRecord[] = useMemo(() => {
        const mapLicense = (list: License[], type: RecordDataType, label: string): UnifiedRecord[] => 
            list.map(item => ({
                ...item,
                originalType: type,
                recordTypeLabel: label,
                displayCost: item.cost,
                originalRecord: item
            }));

        const mapContracts = (list: Contract[], type: RecordDataType, label: string): UnifiedRecord[] => 
            list.map(item => ({
                // Map Contract to UnifiedRecord (which extends License)
                id: item.id,
                name: item.name,
                number: item.number,
                // Use documented date as primary, fallback to internal
                expiryDate: item.documentedExpiryDate || item.internalExpiryDate, 
                status: item.status, 
                renewalType: undefined,
                // Sum costs or pick one
                cost: (item.documentedCost || 0) + (item.internalCost || 0),
                displayCost: (item.documentedCost || 0) + (item.internalCost || 0),
                notes: item.notes,
                attachments: item.attachments,
                originalType: type,
                recordTypeLabel: label,
                originalRecord: item
            }));

        return [
            ...mapLicense(commercialLicenses, 'commercialLicense', 'رخصة تجارية'),
            ...mapLicense(operationalLicenses, 'operationalLicense', 'رخصة تشغيلية'),
            ...mapLicense(civilDefenseCerts, 'civilDefenseCert', 'دفاع مدني'),
            ...mapContracts(leaseContracts, 'leaseContract', 'عقد إيجار'),
            ...mapLicense(generalContracts, 'generalContract', 'عقد موردين'),
            ...mapLicense(specialAgencies, 'specialAgency', 'وكالة خاصة'),
            ...mapLicense(trademarkCerts, 'trademarkCert', 'علامة تجارية'),
            ...mapLicense(otherTopics, 'otherTopic', 'موضوع آخر'),
        ];
    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics]);

    const filteredData = useMemo(() => {
        if (statusFilter === 'all') return unifiedData;
        return unifiedData.filter(item => item.status === statusFilter);
    }, [unifiedData, statusFilter]);

    const baseHeaderClass = "whitespace-nowrap px-2 py-3 text-center align-middle font-medium text-white text-sm [&>button]:justify-center";
    const baseCellClass = "whitespace-nowrap px-2 py-4 text-gray-700 align-middle text-center text-sm";
    const wideCellClass = "px-2 py-4 text-gray-700 align-middle text-center break-words max-w-sm text-sm";

    const columns: { key: keyof UnifiedRecord | 'actions' | 'remaining' | 'attachments' | 'serial'; header: string; render?: (item: UnifiedRecord) => React.ReactNode; exportValue?: (item: UnifiedRecord) => string | number | null | undefined; headerClassName?: string; cellClassName?: string; }[] = [
        { key: 'serial', header: '#', headerClassName: baseHeaderClass, cellClassName: "whitespace-nowrap px-2 py-4 text-gray-500 font-bold align-middle text-center text-xs bg-slate-50" },
        { key: 'recordTypeLabel', header: 'نوع السجل', headerClassName: baseHeaderClass, cellClassName: "whitespace-nowrap px-2 py-4 font-semibold text-blue-800 align-middle text-center text-xs bg-blue-50/50" },
        { key: 'name', header: 'الاسم / الموضوع', headerClassName: baseHeaderClass, cellClassName: wideCellClass },
        { key: 'number', header: 'الرقم', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'expiryDate', header: 'تاريخ الانتهاء', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'status', header: 'الحالة', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'remaining', header: 'المدة المتبقية', exportValue: (item) => calculateRemainingDays(item.expiryDate), headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'displayCost', header: 'التكلفة', render: (item) => formatCost(item.displayCost), exportValue: (item) => item.displayCost, headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { key: 'attachments', header: 'المرفقات', headerClassName: baseHeaderClass, cellClassName: baseCellClass },
        { 
            key: 'actions', 
            header: 'إجراءات', 
            headerClassName: baseHeaderClass, 
            cellClassName: baseCellClass,
        },
    ];

    const titleStyle = "flex items-center gap-3 px-5 py-2.5 bg-[#091526] text-white rounded-xl border-r-4 border-[#eab308] shadow-md hover:shadow-lg transition-all duration-300";

    return (
        <DataTable
            title={
                <div className={titleStyle}>
                    <span className="text-[#eab308]"><AllRecordsIcon /></span>
                    <span className="font-bold text-lg tracking-wide">جميع السجلات</span>
                </div>
            }
            exportFileName="جميع_السجلات"
            data={filteredData}
            columns={columns}
            // No onAdd for aggregate view
            onEdit={(item) => onEdit(item.originalRecord, item.originalType)}
            onDelete={(item) => onDelete(item.originalRecord, item.originalType)}
            filterComponent={
                <StatusFilter
                    value={statusFilter}
                    onChange={(val) => setStatusFilter(val)}
                />
            }
        />
    );
};

export default AllRecordsManagement;
