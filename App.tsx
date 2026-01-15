

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SecondaryHeader from './components/SecondaryHeader';
import LicenseManagement from './components/LicenseManagement';
import ContractManagement from './components/ContractManagement';
import SpecialAgenciesManagement from './components/OtherTopics';
import SupplierContractsManagement from './components/SupplierContractsManagement';
import Modal from './components/Modal';
import RecordForm from './components/RecordForm';
import Footer from './components/Footer';
import type { Tab, RecordType, RecordDataType, License, Contract, Procedure } from './types';
import { RecordStatus } from './types';
import { TABS, MOCK_COMMERCIAL_LICENSES, MOCK_OPERATIONAL_LICENSES, MOCK_CIVIL_DEFENSE_CERTS, MOCK_SPECIAL_AGENCIES, MOCK_LEASE_CONTRACTS, MOCK_GENERAL_CONTRACTS, MOCK_PROCEDURES, ADMIN_EMAIL, MOCK_OTHER_TOPICS, MOCK_TRADEMARK_CERTS } from './constants';
import OtherTopicsContent from './components/OtherTopicsContent';
import ProceduresManagement from './components/ProceduresManagement';
import NotificationBanner from './components/NotificationBanner';
import TrademarkManagement from './components/TrademarkManagement';

const getOverallStatus = (statuses: (RecordStatus | undefined)[]): RecordStatus => {
    const validStatuses = statuses.filter(Boolean) as RecordStatus[];
    if (validStatuses.includes(RecordStatus.Expired)) {
        return RecordStatus.Expired;
    }
    if (validStatuses.includes(RecordStatus.SoonToExpire)) {
        return RecordStatus.SoonToExpire;
    }
    return RecordStatus.Active;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  
  // Data States
  const [commercialLicenses, setCommercialLicenses] = useState<License[]>([]);
  const [operationalLicenses, setOperationalLicenses] = useState<License[]>([]);
  const [civilDefenseCerts, setCivilDefenseCerts] = useState<License[]>([]);
  const [specialAgencies, setSpecialAgencies] = useState<License[]>([]);
  const [leaseContracts, setLeaseContracts] = useState<Contract[]>([]);
  const [generalContracts, setGeneralContracts] = useState<License[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [otherTopicsData, setOtherTopicsData] = useState<License[]>([]);
  const [trademarkCerts, setTrademarkCerts] = useState<License[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Notification State
  const [expiringItems, setExpiringItems] = useState<Array<License | Contract>>([]);
  const [showNotification, setShowNotification] = useState(false);


  // Modal State
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; record?: RecordType; type?: RecordDataType }>({ isOpen: false });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; record?: RecordType; type?: RecordDataType }>({ isOpen: false });

  const getCalculatedStatus = (expiryDate: string | undefined): RecordStatus => {
    if (!expiryDate) {
        return RecordStatus.Active; // Default if no date
    }
    const now = new Date();
    // Use start of day for consistent comparison, avoids timezone issues with setHours(0,0,0,0)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    const parts = expiryDate.split('-');
    if (parts.length !== 3) return RecordStatus.Active;
    
    // Create expiry date at start of day, local time, for accurate comparison
    const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    if (isNaN(expiry.getTime())) {
        return RecordStatus.Active; // Invalid date
    }

    if (expiry < today) {
        return RecordStatus.Expired;
    }

    const fourMonthsFromNow = new Date(today);
    fourMonthsFromNow.setDate(today.getDate() + 120); // 4 months = 120 days

    if (expiry <= fourMonthsFromNow) {
        return RecordStatus.SoonToExpire;
    }

    return RecordStatus.Active;
  };

  useEffect(() => {
    const allData = [
      ...MOCK_COMMERCIAL_LICENSES,
      ...MOCK_OPERATIONAL_LICENSES,
      ...MOCK_CIVIL_DEFENSE_CERTS,
      ...MOCK_SPECIAL_AGENCIES,
      ...MOCK_LEASE_CONTRACTS,
      ...MOCK_GENERAL_CONTRACTS,
      ...MOCK_OTHER_TOPICS,
      ...MOCK_TRADEMARK_CERTS,
    ];

    const today = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('lastEmailCheckDate');

    if (lastCheck !== today) {
        const now = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(now.getDate() + 90);

        const expiring = allData.filter(item => {
            const expiryDateStr = 'expiryDate' in item ? item.expiryDate : item.documentedExpiryDate;
            if (!expiryDateStr) return false;
            
            const expiryDate = new Date(expiryDateStr);
            return expiryDate > now && expiryDate <= ninetyDaysFromNow;
        });

        if (expiring.length > 0) {
            setExpiringItems(expiring);
            if (sessionStorage.getItem('notificationDismissed') !== 'true') {
              setShowNotification(true);
            }
        }
        localStorage.setItem('lastEmailCheckDate', today);
    }
    
    const processLicenses = (licenses: License[]): License[] => 
        licenses.map(l => ({ ...l, status: getCalculatedStatus(l.expiryDate) }));
        
    const processContracts = (contracts: Contract[]): Contract[] => 
        contracts.map(c => {
            const documentedStatus = c.documentedExpiryDate ? getCalculatedStatus(c.documentedExpiryDate) : undefined;
            const internalStatus = c.internalExpiryDate ? getCalculatedStatus(c.internalExpiryDate) : undefined;
            const status = getOverallStatus([documentedStatus, internalStatus]);
            return {
                ...c,
                documentedStatus,
                internalStatus,
                status
            };
        });

    setCommercialLicenses(processLicenses(MOCK_COMMERCIAL_LICENSES));
    setOperationalLicenses(processLicenses(MOCK_OPERATIONAL_LICENSES));
    setCivilDefenseCerts(processLicenses(MOCK_CIVIL_DEFENSE_CERTS));
    setSpecialAgencies(processLicenses(MOCK_SPECIAL_AGENCIES));
    setLeaseContracts(processContracts(MOCK_LEASE_CONTRACTS));
    setGeneralContracts(processLicenses(MOCK_GENERAL_CONTRACTS));
    setProcedures(MOCK_PROCEDURES);
    setOtherTopicsData(processLicenses(MOCK_OTHER_TOPICS));
    setTrademarkCerts(processLicenses(MOCK_TRADEMARK_CERTS));
}, []);


  const handleAdd = (type: RecordDataType) => {
    setModalInfo({ isOpen: true, type: type, record: undefined });
  };

  const handleEdit = (record: RecordType, type: RecordDataType) => {
    setModalInfo({ isOpen: true, type: type, record: record });
  };

  const handleCloseModal = () => {
    setModalInfo({ isOpen: false, type: undefined, record: undefined });
  };
  
  const handleDelete = (recordToDelete: RecordType, type: RecordDataType) => {
    setDeleteConfirmation({ isOpen: true, record: recordToDelete, type: type });
  };

  const handleConfirmDelete = () => {
    const { record: recordToDelete, type } = deleteConfirmation;
    if (!recordToDelete || !type) return;

    const setters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<any[]>>>> = {
        commercialLicense: setCommercialLicenses,
        operationalLicense: setOperationalLicenses,
        civilDefenseCert: setCivilDefenseCerts,
        specialAgency: setSpecialAgencies,
        leaseContract: setLeaseContracts,
        generalContract: setGeneralContracts,
        procedure: setProcedures,
        otherTopic: setOtherTopicsData,
        trademarkCert: setTrademarkCerts,
    };

    const setter = setters[type];
    if (setter) {
        setter(prev => prev.filter(r => r.id !== recordToDelete.id));
    }

    setDeleteConfirmation({ isOpen: false, record: undefined, type: undefined });
  };

  const handleSave = (recordToSave: RecordType) => {
    const { type } = modalInfo;
    
    let recordWithStatus: RecordType;
        
    if (type === 'leaseContract') {
        const contract = recordToSave as Contract;
        const documentedStatus = contract.documentedExpiryDate ? getCalculatedStatus(contract.documentedExpiryDate) : undefined;
        const internalStatus = contract.internalExpiryDate ? getCalculatedStatus(contract.internalExpiryDate) : undefined;
        const overallStatus = getOverallStatus([documentedStatus, internalStatus]);
        recordWithStatus = {
            ...contract,
            documentedStatus,
            internalStatus,
            status: overallStatus,
        };
    } else {
        let calculatedStatus: RecordStatus | undefined;
        if ('expiryDate' in recordToSave && recordToSave.expiryDate) {
            calculatedStatus = getCalculatedStatus(recordToSave.expiryDate);
        } else {
            // Procedure type does not have status
            calculatedStatus = 'status' in recordToSave ? recordToSave.status : RecordStatus.Active;
        }
        recordWithStatus = {
            ...recordToSave,
            ...(calculatedStatus && { status: calculatedStatus }),
        };
    }
        
    const isNew = !recordToSave.id;

    const updateList = <T extends {id: number}>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
        if(isNew) {
            setter(prev => [...prev, { ...item, id: Date.now() }]);
        } else {
            setter(prev => prev.map(r => r.id === item.id ? item : r));
        }
    };
    
    const licenseSetters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<License[]>>>> = {
      commercialLicense: setCommercialLicenses,
      operationalLicense: setOperationalLicenses,
      civilDefenseCert: setCivilDefenseCerts,
      specialAgency: setSpecialAgencies,
      generalContract: setGeneralContracts,
      otherTopic: setOtherTopicsData,
      trademarkCert: setTrademarkCerts,
    };
    
    if (type && type in licenseSetters) {
      const setter = licenseSetters[type];
      if (setter) {
        updateList(setter, recordWithStatus as License);
      }
    } else if (type === 'leaseContract') {
      updateList(setLeaseContracts, recordWithStatus as Contract);
    } else if (type === 'procedure') {
      updateList(setProcedures, recordToSave as Procedure);
    }

    handleCloseModal();
  };
  
  // Filter Logic
  const lowercasedQuery = searchQuery.toLowerCase();
  
  const filteredCommercialLicenses = commercialLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOperationalLicenses = operationalLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredCivilDefenseCerts = civilDefenseCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredSpecialAgencies = specialAgencies.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredLeaseContracts = leaseContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredGeneralContracts = generalContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOtherTopicsData = otherTopicsData.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredTrademarkCerts = trademarkCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredProcedures = procedures.filter(item =>
    item.licenseName.toLowerCase().includes(lowercasedQuery) ||
    item.authority.toLowerCase().includes(lowercasedQuery) ||
    item.contactNumbers.toLowerCase().includes(lowercasedQuery) ||
    item.email.toLowerCase().includes(lowercasedQuery) ||
    item.websiteName.toLowerCase().includes(lowercasedQuery) ||
    item.websiteUrl.toLowerCase().includes(lowercasedQuery) ||
    item.username.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const handleSendNotificationEmail = () => {
    const subject = "تنبيه: رخص وعقود على وشك الانتهاء";
    const body = `
        تحية طيبة,

        هذا البريد للتنبيه بوجود الرخص/العقود التالية التي ستنتهي صلاحيتها قريباً:

        ${expiringItems.map(item =>
          `- ${item.name} (رقم: ${item.number}) - تاريخ الانتهاء: ${'expiryDate' in item ? item.expiryDate : item.documentedExpiryDate}`
        ).join('\n')}

        يرجى اتخاذ الإجراءات اللازمة للتجديد.

        مع تحيات,
        نظام إدارة الرخص والعقود
    `;
    
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    sessionStorage.setItem('notificationDismissed', 'true');
  };

  const renderContent = () => {
    switch (activeTab.id) {
      case 'licenses':
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'contracts':
        return <ContractManagement 
                    contracts={filteredLeaseContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'other':
        return <SpecialAgenciesManagement 
                    agencies={filteredSpecialAgencies}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'supplierContracts':
        return <SupplierContractsManagement
                    generalContracts={filteredGeneralContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'otherTopics':
        return <OtherTopicsContent
                    topics={filteredOtherTopicsData}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'procedures':
        return <ProceduresManagement
                    procedures={filteredProcedures}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'trademarks':
        return <TrademarkManagement
                    certificates={filteredTrademarkCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      default:
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <SecondaryHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {showNotification && expiringItems.length > 0 && (
          <NotificationBanner 
              count={expiringItems.length}
              onSendEmail={handleSendNotificationEmail}
              onDismiss={handleDismissNotification}
          />
      )}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Previous Nav was here, now removed */}
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            {renderContent()}
          </div>
        </div>
      </main>
      <Modal isOpen={modalInfo.isOpen} onClose={handleCloseModal} title={modalInfo.record ? "تعديل السجل" : "إضافة سجل جديد"}>
        {modalInfo.isOpen && (
            <RecordForm
                initialData={modalInfo.record}
                type={modalInfo.type!}
                onSave={handleSave}
                onCancel={handleCloseModal}
            />
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        title="تأكيد الحذف"
        size="sm"
      >
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mt-5">حذف السجل</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setDeleteConfirmation({ isOpen: false })}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              نعم, قم بالحذف
            </button>
          </div>
        </div>
      </Modal>
      <Footer />
    </div>
  );
};

export default App;