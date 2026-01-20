
import React from 'react';

interface NotificationBannerProps {
  count: number;
  onSendEmail: () => void;
  onDismiss: () => void;
}

const NotificationIcon: React.FC = () => (
    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[#eab308]/10 border border-[#eab308]/30">
         <svg className="h-6 w-6 text-[#eab308] animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
    </div>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({ count, onSendEmail, onDismiss }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 animate-fade-in-down relative z-20">
        <div className="bg-[#091526] rounded-2xl shadow-xl border border-[#1e293b] overflow-hidden relative">
            {/* Gold Accent Line (Right Side for RTL) */}
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#eab308]" />
            
            <div className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                    
                    {/* Icon & Text Section */}
                    <div className="flex items-center gap-4 w-full md:w-auto text-right">
                        <div className="flex-shrink-0">
                            <NotificationIcon />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                تنبيه بقرب انتهاء الصلاحية
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-200 border border-red-800">
                                    هام
                                </span>
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                يرجى الانتباه، هناك <span className="text-[#eab308] font-bold text-lg mx-1">{count}</span> سجلات تحولت حالتها مؤخراً إلى <span className="text-[#eab308] font-medium underline decoration-dashed underline-offset-4 decoration-[#eab308]/50">قاربت على الانتهاء</span>.
                            </p>
                        </div>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end pl-2">
                        <button
                            onClick={onSendEmail}
                            className="flex-1 md:flex-none whitespace-nowrap px-5 py-2.5 bg-[#eab308] hover:bg-[#ca9a07] text-[#091526] text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-900/20 hover:shadow-yellow-900/40 flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>إرسال تقرير</span>
                        </button>
                        
                        <button
                            onClick={onDismiss}
                            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            aria-label="إغلاق التنبيه"
                            title="إغلاق"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Ambient Background Decor */}
             <div className="absolute left-0 bottom-0 w-48 h-48 bg-[#eab308] opacity-[0.03] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none" />
             <div className="absolute top-0 right-20 w-24 h-24 bg-blue-500 opacity-[0.05] rounded-full blur-2xl transform pointer-events-none" />
        </div>
        <style>{`
            @keyframes fade-in-down {
                0% { opacity: 0; transform: translateY(-10px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down {
                animation: fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
        `}</style>
    </div>
  );
};

export default NotificationBanner;
