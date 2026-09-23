import React from 'react';
import { Shield, Building, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-xs no-print">
      <div className="w-full px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded bg-sky-800 flex items-center justify-center text-white font-bold text-[10px]">
            CPH
          </div>
          <div>
            <p className="font-bold text-slate-200">Cebu Provincial Hospital – Balamban</p>
            <p className="text-[11px] text-slate-500">Balamban, Cebu, Philippines &bull; IT Department Ticketing System</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> RA 10173 Protected
          </span>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-sky-400" /> Provincial Government of Cebu
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" /> ITSM Best Practice
          </span>
        </div>
      </div>
    </footer>
  );
};
