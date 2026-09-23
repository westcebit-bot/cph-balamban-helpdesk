import React from 'react';
import { Activity } from 'lucide-react';

export const HeaderBrand: React.FC = () => {
  return (
    <div className="w-full bg-white px-4 sm:px-6 py-2 border-b border-slate-200">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-sky-950 border-2 border-amber-400 flex items-center justify-center text-white shadow-xs shrink-0 font-extrabold text-xs">
          CPH
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm font-bold text-sky-950 uppercase tracking-wide">
              Cebu Provincial Hospital – Balamban
            </h1>
            <span className="bg-sky-100 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Activity className="w-3 h-3 text-sky-600" />
              IT Department
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Integrated IT Helpdesk & ITSM Ticketing System
          </p>
        </div>
      </div>
    </div>
  );
};
