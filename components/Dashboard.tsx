
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
    active: '#10b981', // Emerald-500 (Vibrant Green)
    soon: '#f59e0b',   // Amber-500 (Warm Yellow)
    expired: '#ef4444', // Red-500 (Alert Red)
    blue: '#3b82f6',
    dark: '#0f172a',
    slate: '#cbd5e1'
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 shadow-xl rounded-xl text-right min-w-[180px] z-50">
                <p className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 text-sm">{label}</p>
                <div className="space-y-2">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4 text-xs font-medium">
                            <span className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }}></span>
                                <span className="text-slate-600">{entry.name}</span>
                            </span>
                            <span className="font-bold font-mono text-sm" style={{ color: entry.fill }}>{entry.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
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

    // Data for Horizontal Bar Chart (Category Breakdown)
    // Removed categories with 0 total items to keep the chart clean
    const barData = [
        { name: 'الرخص التجارية', active: stats.categories.commercial.active, soon: stats.categories.commercial.soon, expired: stats.categories.commercial.expired, total: stats.categories.commercial.total },
        { name: 'الرخص التشغيلية', active: stats.categories.operational.active, soon: stats.categories.operational.soon, expired: stats.categories.operational.expired, total: stats.categories.operational.total },
        { name: 'الدفاع المدني', active: stats.categories.civilDefense.active, soon: stats.categories.civilDefense.soon, expired: stats.categories.civilDefense.expired, total: stats.categories.civilDefense.total },
        { name: 'العقود الايجارية', active: stats.categories.lease.active, soon: stats.categories.lease.soon, expired: stats.categories.lease.expired, total: stats.categories.lease.total },
        { name: 'عقود الموردين', active: stats.categories.general.active, soon: stats.categories.general.soon, expired: stats.categories.general.expired, total: stats.categories.general.total },
        { name: 'الوكالات', active: stats.categories.agency.active, soon: stats.categories.agency.soon, expired: stats.categories.agency.expired, total: stats.categories.agency.total },
        { name: 'العلامات', active: stats.categories.trademark.active, soon: stats.categories.trademark.soon, expired: stats.categories.trademark.expired, total: stats.categories.trademark.total },
        { name: 'أخرى', active: stats.categories.other.active, soon: stats.categories.other.soon, expired: stats.categories.other.expired, total: stats.categories.other.total },
    ].filter(item => item.total > 0); // Only show categories with data

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            
            {/* 1. Hero Section (Dark Blue) */}
            <div className="bg-[#091526] rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white">
                 {/* Background Accent */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#eab308] opacity-5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
                
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
                    <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center group hover:border-[#eab308] transition-colors">
                        <span className="text-gray-400 text-xs block mb-1">إجمالي السجلات</span>
                        <span className="text-4xl font-bold text-white group-hover:text-[#eab308] transition-colors">{stats.totalRecords}</span>
                    </div>
                     {/* Compliance Rate Box */}
                     <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center group hover:border-green-500 transition-colors">
                        <span className="text-gray-400 text-xs block mb-1">نسبة الامتثال</span>
                        <span className={`text-4xl font-bold transition-colors ${stats.complianceRate >= 80 ? 'text-green-500' : stats.complianceRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {stats.complianceRate}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Cost Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="font-bold text-xs">AED</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{formatCost(stats.totalCost)}</h3>
                        <p className="text-slate-500 font-medium text-sm">التكلفة التقديرية</p>
                    </div>
                </div>

                {/* Expired Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                     {stats.expiredCount > 0 && <div className="absolute right-0 top-0 w-2 h-full bg-red-500"></div>}
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-xl text-red-500 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.expiredCount}</h3>
                        <p className="text-red-600 font-bold text-sm">سجلات منتهية</p>
                        {stats.expiredCount > 0 && <p className="text-xs text-red-400 mt-2">يرجى اتخاذ إجراء فوري</p>}
                    </div>
                </div>

                {/* Soon Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    {stats.soonCount > 0 && <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400"></div>}
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-yellow-50 rounded-xl text-yellow-600 shadow-sm group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.soonCount}</h3>
                        <p className="text-yellow-600 font-bold text-sm">قاربت على الانتهاء</p>
                        <p className="text-xs text-slate-400 mt-2">خلال 4 أشهر القادمة</p>
                    </div>
                </div>

                {/* Active Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-2 h-full bg-green-500"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-50 rounded-xl text-green-600 shadow-sm group-hover:scale-110 transition-transform">
                            <CheckIcon />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 mb-1">{stats.activeCount}</h3>
                        <p className="text-green-600 font-bold text-sm">سجلات نشطة</p>
                        <p className="text-xs text-slate-400 mt-2">حالة ممتازة</p>
                    </div>
                </div>
            </div>

            {/* 3. Graphical Analytics Section - Redesigned */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart 1: Status Distribution (Donut Chart) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="mb-4 z-10">
                        <h3 className="text-lg font-bold text-slate-800">حالة الامتثال العام</h3>
                        <p className="text-xs text-slate-500">توزيع السجلات حسب الحالة الحالية</p>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center relative">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={105}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cornerRadius={6}
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Center Text for Donut */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-slate-400 text-xs font-medium mb-1">الإجمالي</p>
                            <span className="text-4xl font-black text-slate-800 block leading-none">{stats.activeCount + stats.soonCount + stats.expiredCount}</span>
                        </div>
                    </div>
                    
                    {/* Custom Legend */}
                    <div className="flex justify-center gap-4 mt-2">
                        {pieData.map((entry, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                <span className="text-xs font-medium text-slate-600">{entry.name}</span>
                             </div>
                        ))}
                    </div>
                </div>

                {/* Chart 2: Category Breakdown (Horizontal Bar Chart) */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                         <div>
                            <h3 className="text-lg font-bold text-slate-800">تحليل الفئات</h3>
                            <p className="text-xs text-slate-500">أداء كل قسم من أقسام النظام</p>
                        </div>
                    </div>
                    <div className="h-80 w-full" style={{ direction: 'ltr' }}> {/* Keep container LTR for Axis alignment */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={barData}
                                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                                barSize={16}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="name" 
                                    type="category" 
                                    width={120}
                                    tick={{ fill: '#475569', fontSize: 12, fontFamily: 'Tajawal', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    orientation="right" // Right align labels for Arabic
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="active" name="نشط" stackId="a" fill={COLORS.active} radius={[0, 4, 4, 0]} />
                                <Bar dataKey="soon" name="قريب" stackId="a" fill={COLORS.soon} />
                                <Bar dataKey="expired" name="منتهي" stackId="a" fill={COLORS.expired} radius={[4, 0, 0, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend Custom */}
                    <div className="flex justify-end gap-6 mt-4 border-t border-slate-50 pt-4 px-4">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <span className="w-3 h-3 rounded bg-green-500"></span> نشط
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <span className="w-3 h-3 rounded bg-yellow-500"></span> قارب على الانتهاء
                            </div>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                <span className="w-3 h-3 rounded bg-red-500"></span> منتهي
                            </div>
                    </div>
                </div>

            </div>

            {/* 4. Category Details Grid */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-[#eab308] rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">تفاصيل الفئات</h2>
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
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-1 border border-blue-100 shadow-sm">
                <div className="bg-white/50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white shadow-md text-blue-600 rounded-2xl border border-blue-50">
                            <ProcedureIcon />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">قاعدة بيانات الإجراءات</h3>
                            <p className="text-sm text-slate-500 mt-1">معلومات الاتصال، المواقع الإلكترونية، وبيانات الدخول للجهات الحكومية</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">عدد الإجراءات</span>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <span className="text-3xl font-black text-blue-600">{procedures.length}</span>
                    </div>
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
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-slate-400 group-hover:text-blue-600 transition-colors bg-slate-50 p-2 rounded-lg group-hover:bg-blue-50">{icon}</div>
                    <h4 className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">{title}</h4>
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg min-w-[28px] text-center group-hover:bg-[#091526] group-hover:text-white transition-colors">
                    {stats.total}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden flex mb-4 border border-slate-100">
                {stats.expired > 0 && <div style={{ width: `${expiredPct}%` }} className="bg-red-500 h-full" />}
                {stats.soon > 0 && <div style={{ width: `${soonPct}%` }} className="bg-yellow-400 h-full" />}
                {stats.active > 0 && <div style={{ width: `${activePct}%` }} className="bg-green-500 h-full" />}
            </div>

            {/* Stats Breakdown */}
            <div className="flex justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1.5" title="نشط">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>{stats.active}</span>
                </div>
                <div className="flex items-center gap-1.5" title="قريب">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <span>{stats.soon}</span>
                </div>
                <div className="flex items-center gap-1.5" title="منتهي">
                     <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>{stats.expired}</span>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
