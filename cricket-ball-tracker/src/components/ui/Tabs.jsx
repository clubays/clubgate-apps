import React from 'react';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`flex bg-[#0b0f14] p-1 rounded-lg border border-[#243146] gap-1 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all select-none ${
              isActive
                ? 'bg-[#182231] text-[#c6ff3d] shadow-xs'
                : 'text-[#8a9ab0] hover:text-[#e8eef5]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
