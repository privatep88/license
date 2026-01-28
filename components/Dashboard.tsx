
import React, { useMemo } from 'react';
import type { License, Contract, Procedure } from '../types';
import { RecordStatus } from '../types';
import { DashboardIcon, LicenseIcon, ContractIcon, AgencyIcon, SupplierIcon, OtherTopicsIcon, ProcedureIcon, TrademarkIcon } from './icons/TabIcons';
import { formatCost } from '../utils';
import { CheckIcon, ShieldIcon, ClipboardListIcon } from './icons/ActionIcons';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface DashboardProps {
    commercialLicenses: License[];
    operationalLicenses: License[];
    civilDefenseCerts: License[];
    leaseContracts: Contract[];
    generalContracts: License[];
    specialAgencies: License[];
    trademarkCerts: License[];
    otherTopics: License[];
    procedures: Procedure[];
}

const COLORS = {
    active: '#22c55e', // Green-500
    soon: '#eab308',   // Yellow-500
    expired: '#ef4444', // Red-500
    blue: '#3b82f6',
    dark: '#0f172a'
};

const Dashboard: React.FC<DashboardProps> = ({
    commercialLicenses,
    operationalLicenses,
    civilDefenseCerts,
    leaseContracts,
    generalContracts,
    specialAgencies,
    trademarkCerts,
    otherTopics,
    procedures
}) => {

    // Helper to calculate stats per category
    const calculateCategoryStats = (items: (License | Contract)[]) => {
        const total = items.length;
        const active = items.filter(i => i.status === RecordStatus.Active).length;
        const soon = items.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expired = items.filter(i => i.status === RecordStatus.Expired).length;
        return { total, active, soon, expired };
    };

    const stats = useMemo(() => {
        const allLicenses = [
            ...commercialLicenses,
            ...operationalLicenses,
            ...civilDefenseCerts,
            ...generalContracts,
            ...specialAgencies,
            ...trademarkCerts,
            ...otherTopics
        ];

        // Contracts require special handling for costs
        const totalContractCost = leaseContracts.reduce((sum, c) => sum + (c.documentedCost || 0) + (c.internalCost || 0), 0);
        const totalLicenseCost = allLicenses.reduce((sum, l) => sum + (l.cost || 0), 0);
        
        const allItemsWithStatus = [...allLicenses, ...leaseContracts];
        const totalRecords = allItemsWithStatus.length + procedures.length; // Include procedures in total count
        const activeCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Active).length;
        const soonCount = allItemsWithStatus.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expiredCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Expired).length;

        // Calculate compliance rate (excluding procedures as they don't have status)
        const complianceBase = allItemsWithStatus.length;
        const complianceRate = complianceBase > 0 ? Math.round((activeCount / complianceBase) * 100) : 0;

        return {
            totalRecords,
            complianceRate,
            activeCount,
            soonCount,
            expiredCount,
            totalCost: totalContractCost + totalLicenseCost,
            categories: {
                commercial: calculateCategoryStats(commercialLicenses),
                operational: calculateCategoryStats(operationalLicenses),
                civilDefense: calculateCategoryStats(civilDefenseCerts),
                lease: calculateCategoryStats(leaseContracts),
                general: calculateCategoryStats(generalContracts),
                agency: calculateCategoryStats(specialAgencies),
                trademark: calculateCategoryStats(trademarkCerts),
                other: calculateCategoryStats(otherTopics),
            }
        };
    }, [commercialLicenses, operationalLicenses, civilDefenseCerts, leaseContracts, generalContracts, specialAgencies, trademarkCerts, otherTopics, procedures]);

    // Data for Pie Chart (Overall Status)
    const pieData = [
        { name: 'نشط', value: stats.activeCount, color: COLORS.active },
        { name: 'قارب على الانتهاء', value: stats.soonCount, color: COLORS.soon },
        { name: 'منتهي', value: stats.expiredCount, color: COLORS.expired },
    ].filter(d => d.value > 0);

    // Data for Bar Chart (Category Breakdown)
    const barData = [
        { name: 'الرخص التجارية', active: stats.categories.commercial.active, soon: stats.categories.commercial.soon, expired: stats.categories.commercial.expired },
        { name: 'الرخص التشغيلية', active: stats.categories.operational.active, soon: stats.categories.operational.soon, expired: stats.categories.operational.expired },
        { name: 'الدفاع المدني', active: stats.categories.civilDefense.active, soon: stats.categories.civilDefense.soon, expired: stats.categories.civilDefense.expired },
        { name: 'العقود الايجارية', active: stats.categories.lease.active, soon: stats.categories.lease.soon, expired: stats.categories.lease.expired },
        { name: 'عقود الموردين', active: stats.categories.general.active, soon: stats.categories.general.soon, expired: stats.categories.general.expired },
        { name: 'الوكالات', active: stats.categories.agency.active, soon: stats.categories.agency.soon, expired: stats.categories.agency.expired },
        { name: 'العلامات', active: stats.categories.trademark.active, soon: stats.categories.trademark.soon, expired: stats.categories.trademark.expired },
        { name: 'أخرى', active: stats.categories.other.active, soon: stats.categories.other.soon, expired: stats.categories.other.expired },
    ];

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            
            {/* 1. Hero Section (Dark Blue) */}
            <div className="bg-[#091526] rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white">
                 {/* Background Accent */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Right Side: Title */}
                <div className="relative z-10 text-center md:text-right mb-6 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <DashboardIcon /> 
                        <h1 className="text-3xl font-bold">لوحة المعلومات والإحصائيات</h1>
                    </div>
                    <p className="text-gray-400 text-sm">نظرة شاملة على حالة جميع السجلات والعقود في النظام</p>
                </div>

                {/* Left Side: Big Stats */}
                <div className="flex gap-4 relative z-10">
                    {/* Total Records Box */}
                    <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center">
                        <span className="text-gray-400 text-xs block mb-1">إجمالي السجلات</span>
                        <span className="text-4xl font-bold text-white">{stats.totalRecords}</span>
                    </div>
                     {/* Compliance Rate Box */}
                     <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center">
                        <span className="text-gray-400 text-xs block mb-1">نسبة الامتثال</span>
                        <span className={`text-4xl font-bold ${stats.complianceRate >= 80 ? 'text-[#eab308]' : stats.complianceRate >= 50 ? 'text-orange-400' : 'text-red-400'}`}>
                            {stats.complianceRate}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Cost Card */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm font-bold text-xs">AED</div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-extrabold text-blue-900 mb-1">{formatCost(stats.totalCost)}</h3>
                        <p className="text-blue-700 font-medium text-sm">التكلفة التقديرية</p>
                        <p className="text-blue-400 text-xs mt-1">إجمالي القيم المسجلة</p>
                    </div>
                </div>

                {/* Expired Card */}
                <div className="bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white rounded-lg text-red-500 shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-extrabold text-red-700 mb-1">{stats.expiredCount}</h3>
                        <p className="text-red-800 font-medium text-sm">سجلات منتهية</p>
                        <p className="text-red-400 text-xs mt-1 bg-red-100 px-2 py-0.5 rounded-full inline-block">إجراء فوري مطلوب</p>
                    </div>
                </div>

                {/* Soon Card */}
                <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white rounded-lg text-yellow-600 shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-extrabold text-yellow-700 mb-1">{stats.soonCount}</h3>
                        <p className="text-yellow-800 font-medium text-sm">قاربت على الانتهاء</p>
                         <p className="text-yellow-600 text-xs mt-1 bg-yellow-100 px-2 py-0.5 rounded-full inline-block">خلال 4 أشهر</p>
                    </div>
                </div>

                {/* Active Card */}
                <div className="bg-green-50 rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white rounded-lg text-green-600 shadow-sm">
                            <CheckIcon />
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-3xl font-extrabold text-green-700 mb-1">{stats.activeCount}</h3>
                        <p className="text-green-800 font-medium text-sm">سجلات نشطة</p>
                         <p className="text-green-600 text-xs mt-1">حالة ممتازة</p>
                    </div>
                </div>
            </div>

            {/* 3. Graphical Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Status Distribution (Donut) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">توزيع حالة السجلات</h3>
                        <p className="text-xs text-gray-500 mb-4">نظرة عامة على نسبة الالتزام والصلاحية</p>
                    </div>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                    itemStyle={{ fontFamily: 'Tajawal' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <span className="text-3xl font-bold text-gray-800 block">{stats.activeCount + stats.soonCount + stats.expiredCount}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">سجل</span>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Category Breakdown (Stacked Bar) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">تحليل الفئات والسجلات</h3>
                            <p className="text-xs text-gray-500">مقارنة أداء وحالة كل قسم من أقسام النظام</p>
                        </div>
                        {/* Legend Custom */}
                        <div className="flex gap-3 text-xs">
                             <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> نشط</div>
                             <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> قريب</div>
                             <div className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> منتهي</div>
                        </div>
                    </div>
                    <div className="h-64 w-full" style={{ direction: 'ltr' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={barData}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                barSize={20}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Tajawal' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                />
                                <YAxis 
                                    tick={{ fill: '#64748b', fontSize: 11 }} 
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontFamily: 'Tajawal', fontWeight: 'bold', color: '#0f172a', marginBottom: '5px' }}
                                />
                                <Bar dataKey="active" name="نشط" stackId="a" fill={COLORS.active} radius={[0, 0, 4, 4]} />
                                <Bar dataKey="soon" name="قريب" stackId="a" fill={COLORS.soon} />
                                <Bar dataKey="expired" name="منتهي" stackId="a" fill={COLORS.expired} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* 4. Category Details Grid */}
            <div>
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-6 bg-[#eab308] rounded-full"></span>
                    <h2 className="text-xl font-bold text-gray-800">تفاصيل الفئات</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CategoryDetailCard 
                        title="الرخص التجارية" 
                        icon={<LicenseIcon />} 
                        stats={stats.categories.commercial} 
                    />
                    <CategoryDetailCard 
                        title="الرخص التشغيلية" 
                        icon={<ClipboardListIcon />} 
                        stats={stats.categories.operational} 
                    />
                    <CategoryDetailCard 
                        title="الدفاع المدني" 
                        icon={<ShieldIcon />} 
                        stats={stats.categories.civilDefense} 
                    />
                     <CategoryDetailCard 
                        title="العقود الايجارية" 
                        icon={<ContractIcon />} 
                        stats={stats.categories.lease} 
                    />
                     <CategoryDetailCard 
                        title="عقود الموردين" 
                        icon={<SupplierIcon />} 
                        stats={stats.categories.general} 
                    />
                     <CategoryDetailCard 
                        title="الوكالات الخاصة" 
                        icon={<AgencyIcon />} 
                        stats={stats.categories.agency} 
                    />
                     <CategoryDetailCard 
                        title="العلامات التجارية" 
                        icon={<TrademarkIcon />} 
                        stats={stats.categories.trademark} 
                    />
                     <CategoryDetailCard 
                        title="مواضيع أخرى" 
                        icon={<OtherTopicsIcon />} 
                        stats={stats.categories.other} 
                    />
                </div>
            </div>

            {/* 5. Procedures Database Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <ProcedureIcon />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">قاعدة بيانات الإجراءات</h3>
                        <p className="text-sm text-gray-500">تحتوي على معلومات الاتصال، المواقع الإلكترونية، وبيانات الدخول للجهات الحكومية</p>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-xl px-8 py-4 text-center min-w-[150px]">
                    <span className="text-xs text-blue-500 font-bold uppercase tracking-wider block mb-1">عدد الإجراءات</span>
                    <span className="text-3xl font-extrabold text-blue-700">{procedures.length}</span>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// Sub-component for Category Detail Card
const CategoryDetailCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    stats: { total: number; active: number; soon: number; expired: number };
}> = ({ title, icon, stats }) => {
    
    // Calculate percentages for the progress bar
    const activePct = stats.total > 0 ? (stats.active / stats.total) * 100 : 0;
    const soonPct = stats.total > 0 ? (stats.soon / stats.total) * 100 : 0;
    const expiredPct = stats.total > 0 ? (stats.expired / stats.total) * 100 : 0;

    return (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-gray-500">{icon}</div>
                    <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                </div>
                <span className="bg-[#091526] text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
                    {stats.total}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
                {stats.expired > 0 && <div style={{ width: `${expiredPct}%` }} className="bg-red-500 h-full" />}
                {stats.soon > 0 && <div style={{ width: `${soonPct}%` }} className="bg-yellow-400 h-full" />}
                {stats.active > 0 && <div style={{ width: `${activePct}%` }} className="bg-green-500 h-full" />}
            </div>

            {/* Stats Breakdown */}
            <div className="flex justify-between text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>نشط: {stats.active}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span>قريب: {stats.soon}</span>
                </div>
                <div className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>منتهي: {stats.expired}</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
