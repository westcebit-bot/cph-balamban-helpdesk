import React from 'react';
import { Activity } from 'lucide-react';
import cphLogo from '../../assets/cph_logo.png';

export const HeaderBrand: React.FC = () => {
  return (
    <div className="w-full bg-white px-4 sm:px-6 py-2 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Official CPH Balamban Seal Logo */}
          <div className="relative shrink-0">
            <img
              src={cphLogo}
              alt="Cebu Provincial Hospital – Balamban Official Seal"
              className="w-12 h-12 object-contain drop-shadow-xs"
            />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm md:text-base font-extrabold text-sky-950 uppercase tracking-wide">
                CEBU PROVINCIAL HOSPITAL – BALAMBAN
              </h1>
              <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-sky-200">
                <Activity className="w-3 h-3 text-sky-600" />
                IT Department
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Integrated IT Helpdesk & ITSM Ticketing System &bull; Balamban, Cebu, Philippines
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 text-[11px] text-slate-500 bg-slate-50 px-3 py-1 rounded border border-slate-200 font-medium">
          <span>Official Hospital IT Support Portal</span>
        </div>
      </div>
    </div>
  );
};
