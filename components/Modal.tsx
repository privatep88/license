
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClass = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
  }[size];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300" 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClass} max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale`} 
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fade-in-scale 0.3s forwards' }}
      >
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
            animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
