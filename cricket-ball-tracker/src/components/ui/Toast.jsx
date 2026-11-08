import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const icons = {
    info: <Info className="w-5 h-5 text-[#38bdf8] shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-[#2fd27e] shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-[#ffb020] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#e5473f] shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md flex items-center gap-3 p-4 bg-[#121923] border border-[#243146] rounded-xl shadow-2xl text-sm text-[#e8eef5]">
      {icons[type]}
      <div className="flex-1">{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-[#8a9ab0] hover:text-[#e8eef5]">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
