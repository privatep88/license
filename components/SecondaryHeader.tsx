
import React from 'react';
import { Tab } from '../types';
import { TABS } from '../constants';

interface SecondaryHeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    counts: Record<string, number>;
}

const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({ activeTab, onTabChange, counts }) => {
    return (
        <div className="mt-16">
            {/* عرض محدد ليكون "أقل طولاً" من الهيدر الرئيسي */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#091526] border-b-4 border-[#eab308] shadow-lg rounded-2xl overflow-hidden">
                    {/* تم تغيير overflow-x-auto إلى flex-wrap للسماح بالالتفاف */}
                    <nav className="flex flex-wrap items-center justify-center gap-2 p-3" aria-label="Tabs">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab.id === tab.id;
                            const count = counts[tab.id] || 0;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab)}
                                    className={`
                                        group flex items-center gap-2 py-2 px-4 font-medium text-sm whitespace-nowrap transition-all duration-200 relative rounded-lg
                                        ${isActive
                                            ? 'text-[#eab308] bg-white/5'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon />
                                    <span>{tab.name}</span>
                                    
                                    {/* Count Badge */}
                                    <span className={`
                                        inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px]
                                        ${isActive 
                                            ? 'bg-[#eab308] text-[#091526]' 
                                            : 'bg-slate-700 text-slate-300 group-hover:bg-slate-600 group-hover:text-white'
                                        }
                                    `}>
                                        {count}
                                    </span>

                                    {/* Active Indicator */}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#eab308]" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default SecondaryHeader;
