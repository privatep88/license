
import React from 'react';

interface NotificationBannerProps {
  count: number;
  onSendEmail: () => void;
  onDismiss: () => void;
}

const NotificationIcon: React.FC = () => (
    <svg className="h-6 w-6 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const NotificationBanner: React.FC<NotificationBannerProps> = ({ count, onSendEmail, onDismiss }) => {
  return (
    <div className="bg-yellow-100 border-b-2 border-yellow-200">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between flex-wrap">
                <div className="w-0 flex-1 flex items-center">
                    <span className="flex p-2 rounded-lg bg-yellow-200">
                        <NotificationIcon />
                    </span>
                    <p className="ml-3 mr-3 font-medium text-yellow-800">
                        <span className="md:hidden">تنبيه بانتهاء الصلاحية!</span>
                        <span className="hidden md:inline">
                            لديك {count} رخص/عقود على وشك الانتهاء خلال الـ 90 يومًا القادمة.
                        </span>
                    </p>
                </div>
                <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                    <button
                        onClick={onSendEmail}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-yellow-300 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                        إرسال بريد إلكتروني للتنبيه
                    </button>
                </div>
                <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                    <button
                        type="button"
                        className="-mr-1 flex p-2 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 sm:-mr-2"
                        onClick={onDismiss}
                    >
                        <span className="sr-only">إغلاق</span>
                        <svg className="h-6 w-6 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default NotificationBanner;
