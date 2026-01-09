import React from 'react';
import { SearchIcon } from './icons/ActionIcons';

const SaherTextLogo: React.FC = () => (
  <div className="flex flex-col items-end">
    <span className="text-3xl font-bold text-white tracking-tight">SAHER</span>
    <span className="text-xs font-semibold text-gray-400 tracking-wider -mt-1 uppercase">FOR SMART SERVICES</span>
  </div>
);

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <SaherTextLogo />
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">إدارة الخدمات العامة / قسم إدارة المرافق</h1>
            <p className="text-sm text-gray-400 mt-1">نظام الرخص التجارية والأنشطة والعقود</p>
          </div>
           <div className="w-64 md:w-80 flex justify-end">
             <div className="relative w-full">
                <input
                    type="text"
                    placeholder="بحث في جميع السجلات..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="w-full pr-10 pl-4 py-2 bg-slate-700 border border-slate-600 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <SearchIcon />
                </div>
            </div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;