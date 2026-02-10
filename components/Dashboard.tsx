
import React, { useMemo } from 'react';
import type { License, Contract, Procedure } from '../types';
import { RecordStatus } from '../types';
import { DashboardIcon, LicenseIcon, ContractIcon, AgencyIcon, SupplierIcon, OtherTopicsIcon, ProcedureIcon, TrademarkIcon } from './icons/TabIcons';
import { formatCost } from '../utils';
import { CheckIcon, ShieldIcon, ClipboardListIcon } from './icons/ActionIcons';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    AreaChart, Area
} from 'recharts';

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
    active: '#10b981', // Emerald-500
    soon: '#f59e0b',   // Amber-500
    expired: '#ef4444', // Red-500
    blue: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    orange: '#f97316',
    cyan: '#06b6d4',
    slate: '#64748b'
};

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-100 shadow-xl rounded-xl text-right min-w-[150px] z-50">
                <p className="font-bold text-slate-800 mb-2 border-b border-slate-100 pb-2 text-sm">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3 text-xs font-medium">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                                <span className="text-slate-600">{entry.name}</span>
                            </span>
                            <span className="font-bold font-mono text-sm text-slate-800">
                                {typeof entry.value === 'number' && entry.name.includes('تكلفة') 
                                    ? formatCost(entry.value) 
                                    : entry.value}
                            </span>
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

        // Combine all items that have status/dates
        const allItemsWithStatus = [...allLicenses, ...leaseContracts];
        
        // 1. Category Stats (Counts)
        const calculateCategoryStats = (items: (License | Contract)[]) => {
            const total = items.length;
            const active = items.filter(i => i.status === RecordStatus.Active).length;
            const soon = items.filter(i => i.status === RecordStatus.SoonToExpire).length;
            const expired = items.filter(i => i.status === RecordStatus.Expired).length;
            return { total, active, soon, expired };
        };

        // 2. Costs per Category
        const catCosts = {
            commercial: commercialLicenses.reduce((sum, i) => sum + (i.cost || 0), 0),
            operational: operationalLicenses.reduce((sum, i) => sum + (i.cost || 0), 0),
            civilDefense: civilDefenseCerts.reduce((sum, i) => sum + (i.cost || 0), 0),
            lease: leaseContracts.reduce((sum, i) => sum + (i.documentedCost || 0) + (i.internalCost || 0), 0),
            general: generalContracts.reduce((sum, i) => sum + (i.cost || 0), 0),
            agency: specialAgencies.reduce((sum, i) => sum + (i.cost || 0), 0),
            trademark: trademarkCerts.reduce((sum, i) => sum + (i.cost || 0), 0),
            other: otherTopics.reduce((sum, i) => sum + (i.cost || 0), 0),
        };

        const totalCost = Object.values(catCosts).reduce((a, b) => a + b, 0);
        const totalRecords = allItemsWithStatus.length + procedures.length;
        const activeCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Active).length;
        const soonCount = allItemsWithStatus.filter(i => i.status === RecordStatus.SoonToExpire).length;
        const expiredCount = allItemsWithStatus.filter(i => i.status === RecordStatus.Expired).length;
        
        const complianceBase = allItemsWithStatus.length;
        const complianceRate = complianceBase > 0 ? Math.round((activeCount / complianceBase) * 100) : 0;

        // 3. Expiry Timeline (Next 12 Months)
        const expiryTimelineData = [];
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        for (let i = 0; i < 12; i++) {
            let m = currentMonth + i;
            let y = currentYear;
            if (m > 11) {
                m -= 12;
                y += 1;
            }
            
            const monthName = ARABIC_MONTHS[m];
            const key = `${monthName} ${y}`;
            
            const count = allItemsWithStatus.filter(item => {
                const dateStr = item.expiryDate || (item as Contract).documentedExpiryDate || (item as Contract).internalExpiryDate;
                if (!dateStr) return false;
                const parts = dateStr.split('-');
                if (parts.length !== 3) return false;
                const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                return d.getMonth() === m && d.getFullYear() === y;
            }).length;
            
            expiryTimelineData.push({ name: key, count: count });
        }

        return {
            totalRecords,
            complianceRate,
            activeCount,
            soonCount,
            expiredCount,
            totalCost,
            categoryCosts: catCosts,
            expiryTimeline: expiryTimelineData,
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

    // Chart Data Preparation
    const pieData = [
        { name: 'نشط', value: stats.activeCount, color: COLORS.active },
        { name: 'قارب على الانتهاء', value: stats.soonCount, color: COLORS.soon },
        { name: 'منتهي', value: stats.expiredCount, color: COLORS.expired },
    ];

    const costData = [
        { name: 'الرخص التجارية', value: stats.categoryCosts.commercial, fill: COLORS.blue },
        { name: 'الرخص التشغيلية', value: stats.categoryCosts.operational, fill: COLORS.cyan },
        { name: 'الدفاع المدني', value: stats.categoryCosts.civilDefense, fill: COLORS.purple },
        { name: 'العقود الايجارية', value: stats.categoryCosts.lease, fill: COLORS.pink },
        { name: 'عقود الموردين', value: stats.categoryCosts.general, fill: COLORS.orange },
        { name: 'الوكالات', value: stats.categoryCosts.agency, fill: COLORS.slate },
        { name: 'العلامات', value: stats.categoryCosts.trademark, fill: '#eab308' },
        { name: 'أخرى', value: stats.categoryCosts.other, fill: '#84cc16' },
    ].filter(item => item.value > 0).sort((a, b) => b.value - a.value);

    // const statusBreakdownData has been removed as it is no longer used for the removed chart

    const formatYAxisCost = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return String(value);
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans">
            
            {/* 1. Hero Section */}
            <div className="bg-[#091526] rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center text-white">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#eab308] opacity-5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4"></div>
                
                <div className="relative z-10 text-center md:text-right mb-6 md:mb-0">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <DashboardIcon /> 
                        <h1 className="text-3xl font-bold">لوحة المعلومات والإحصائيات</h1>
                    </div>
                    <p className="text-gray-400 text-sm">نظرة شاملة على حالة جميع السجلات والعقود في النظام</p>
                </div>

                <div className="flex gap-4 relative z-10">
                    <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center group hover:border-[#eab308] transition-colors">
                        <span className="text-gray-400 text-xs block mb-1">إجمالي السجلات</span>
                        <span className="text-4xl font-bold text-white group-hover:text-[#eab308] transition-colors">{stats.totalRecords}</span>
                    </div>
                     <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-4 w-32 text-center group hover:border-green-500 transition-colors">
                        <span className="text-gray-400 text-xs block mb-1">نسبة الامتثال</span>
                        <span className={`text-4xl font-bold transition-colors ${stats.complianceRate >= 80 ? 'text-green-500' : stats.complianceRate >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {stats.complianceRate}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    </div>
                </div>

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
                    </div>
                </div>

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
                    </div>
                </div>
            </div>

            {/* 3. Detailed Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Cost Distribution Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800">التكلفة حسب الفئة</h3>
                        <p className="text-xs text-slate-500">توزيع التكاليف التقديرية (درهم)</p>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row gap-6 items-start flex-grow">
                        {/* Chart */}
                        <div className="flex-1 h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={costData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }} barCategoryGap={20}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" hide reversed={true} />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        hide
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc', opacity: 0.5}} />
                                    <Bar dataKey="value" name="التكلفة" radius={[4, 0, 0, 4]} barSize={16} background={{ fill: '#f8fafc', radius: [4, 0, 0, 4] }}>
                                        {costData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Detailed Values List */}
                        <div className="w-full lg:w-56 flex flex-col gap-3 pr-2 border-r lg:border-r-0 lg:border-l border-slate-100 pt-2 pb-2">
                            {costData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                     <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }}></span>
                                        <span className="text-xs text-slate-600 font-medium truncate max-w-[90px]" title={item.name}>{item.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-800 font-mono bg-white px-2 py-0.5 rounded border border-slate-100">{formatCost(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Distribution Pie */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
                     <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-800">حالة الامتثال</h3>
                        <p className="text-xs text-slate-500">نسبة السجلات النشطة مقابل المنتهية</p>
                    </div>
                    <div className="flex-grow flex items-center justify-center relative">
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData.filter(d => d.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={5}
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
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-slate-400 text-xs font-medium mb-1">الإجمالي</p>
                            <span className="text-3xl font-black text-slate-800">{stats.activeCount + stats.soonCount + stats.expiredCount}</span>
                        </div>
                    </div>
                    
                     <div className="space-y-3 mt-4">
                        {pieData.map((entry, index) => (
                             <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
                                    <span className="text-sm font-bold text-slate-700">{entry.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <span className="text-lg font-black text-slate-800">{entry.value}</span>
                                     <span className="text-xs text-slate-400 font-medium">سجل</span>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

            </div>

             {/* 4. Expiry Timeline (Full Width) */}
             <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="mb-6 flex justify-between items-end">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">الجدول الزمني للانتهاء</h3>
                        <p className="text-xs text-slate-500">توقع عدد السجلات التي ستنتهي خلال الـ 12 شهراً القادمة</p>
                    </div>
                </div>
                <div className="h-64 w-full" style={{ direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.expiryTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#64748b', fontSize: 11 }} 
                                axisLine={false} 
                                tickLine={false} 
                                interval={0}
                            />
                            <YAxis hide />
                            <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                labelStyle={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                name="عدد السجلات" 
                                stroke="#f59e0b" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                        {stats.expiryTimeline.map((item, index) => (
                            <div key={index} className={`flex flex-col items-center p-3 rounded-xl border transition-all ${item.count > 0 ? 'bg-orange-50 border-orange-100 shadow-sm scale-105' : 'bg-slate-50/50 border-slate-100 opacity-70'}`}>
                                <span className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{item.name}</span>
                                <span className={`text-xl font-black ${item.count > 0 ? 'text-orange-500' : 'text-slate-300'}`}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. Details Grid */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-1.5 bg-[#eab308] rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">بطاقات تفصيلية</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <CategoryDetailCard title="الرخص التجارية" icon={<LicenseIcon />} stats={stats.categories.commercial} />
                    <CategoryDetailCard title="الرخص التشغيلية" icon={<ClipboardListIcon />} stats={stats.categories.operational} />
                    <CategoryDetailCard title="الدفاع المدني" icon={<ShieldIcon />} stats={stats.categories.civilDefense} />
                    <CategoryDetailCard title="العقود الايجارية" icon={<ContractIcon />} stats={stats.categories.lease} />
                    <CategoryDetailCard title="عقود الموردين" icon={<SupplierIcon />} stats={stats.categories.general} />
                    <CategoryDetailCard title="الوكالات الخاصة" icon={<AgencyIcon />} stats={stats.categories.agency} />
                    <CategoryDetailCard title="العلامات التجارية" icon={<TrademarkIcon />} stats={stats.categories.trademark} />
                    <CategoryDetailCard title="مواضيع أخرى" icon={<OtherTopicsIcon />} stats={stats.categories.other} />
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

const CategoryDetailCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    stats: { total: number; active: number; soon: number; expired: number };
}> = ({ title, icon, stats }) => {
    
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

            <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden flex mb-4 border border-slate-100">
                {stats.expired > 0 && <div style={{ width: `${expiredPct}%` }} className="bg-red-500 h-full" />}
                {stats.soon > 0 && <div style={{ width: `${soonPct}%` }} className="bg-yellow-400 h-full" />}
                {stats.active > 0 && <div style={{ width: `${activePct}%` }} className="bg-green-500 h-full" />}
            </div>

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
