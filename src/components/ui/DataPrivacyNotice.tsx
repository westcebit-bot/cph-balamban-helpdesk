import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DataPrivacyNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r shadow-xs mb-6 text-amber-900 text-sm">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-950 flex items-center gap-1.5 text-xs tracking-wider uppercase">
            <span>Philippine Data Privacy Act (RA 10173) Warning Notice</span>
            <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
          </h4>
          <p className="mt-1 text-xs text-amber-800 leading-relaxed font-medium">
            "Do not include patient names, medical record numbers, clinical documents, or other sensitive patient information unless specifically authorized and required for IT troubleshooting."
          </p>
        </div>
      </div>
    </div>
  );
};
