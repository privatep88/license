
import React from 'react';
import { SearchIcon, PrintIcon } from './icons/ActionIcons';

const SaherLogo: React.FC = () => (
  <div className="flex items-center gap-3 sm:gap-4 scale-90 sm:scale-100 origin-right transition-transform">
    {/* Square Icon Container */}
    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-700 border border-blue-600 shadow-lg overflow-hidden group flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-4xl sm:text-5xl font-bold text-white relative z-10 font-sans">S</span>
        <span className="absolute top-4 right-4 flex h-3 w-3 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#eab308] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#eab308]"></span>
        </span>
    </div>

    {/* Text Branding */}
    <div className="flex flex-col items-start">
      <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none">SAHER</span>
      <span className="text-[10px] sm:text-xs font-bold text-[#eab308] tracking-widest uppercase mt-1">FOR SMART SERVICES</span>
    </div>
  </div>
);

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="bg-[#091526] border-b-4 border-[#eab308] shadow-sm relative z-30 print:hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-auto py-4 sm:py-0 sm:h-28 gap-4">
          
          {/* Right Side: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <SaherLogo />
          </div>

          {/* Center: Title (Visible on Large Screens) */}
          <div className="hidden xl:flex flex-col items-center mx-4 text-center">
            <h1 className="text-sm font-medium text-[#eab308] border border-[#12244d] px-5 py-1 rounded-full bg-[#12244d]/20 mb-1">
              إدارة الخدمات العامة / قسم إدارة المرافق
            </h1>
            <p className="text-xl font-bold text-white mt-1">نظام تسجيل الرخص التجارية والأنشطة والعقود</p>
          </div>

           {/* Left Side: Search & Actions */}
           <div className="flex-shrink-0 flex items-center gap-3 sm:gap-4 justify-end">
             
             {/* Search Input */}
             <div className="relative w-32 sm:w-56 md:w-64 print:hidden group">
                <input
                    type="text"
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="w-full pr-9 pl-3 py-2 sm:pr-10 sm:pl-4 sm:py-2.5 bg-slate-900/50 border border-slate-700 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#eab308]/50 focus:border-[#eab308] transition-all text-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#eab308] transition-colors">
                    <SearchIcon />
                </div>
            </div>

            {/* Print Button */}
             <button
                onClick={() => window.print()}
                className="bg-[#1e293b] p-2.5 rounded-xl hover:bg-[#334155] transition-colors shadow-sm flex items-center justify-center print:hidden border border-gray-700 text-white flex-shrink-0"
                aria-label="طباعة الصفحة"
                title="طباعة الصفحة"
             >
                <PrintIcon />
             </button>

           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
