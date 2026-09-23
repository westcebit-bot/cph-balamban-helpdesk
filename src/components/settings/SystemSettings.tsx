import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { DEFAULT_SLA_SETTINGS } from '../../lib/sla';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Settings, Sliders, Shield, Layers, Bell, CheckCircle2 } from 'lucide-react';

export const SystemSettings: React.FC = () => {
  const { categories, departments } = useTickets();

  const [activeTab, setActiveTab] = useState<'sla' | 'categories' | 'departments'>('sla');
  const [slaSettings, setSlaSettings] = useState(DEFAULT_SLA_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSLA = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-700" /> Administrative System Settings
        </CardTitle>
        <p className="text-xs text-slate-500">
          Configure SLA response targets, category hierarchies, hospital departments, and IT helpdesk policy parameters
        </p>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-4">
          <button
            onClick={() => setActiveTab('sla')}
            className={`pb-2 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
              activeTab === 'sla' ? 'border-sky-600 text-sky-800' : 'border-transparent text-slate-500'
            }`}
          >
            SLA Response & Resolution Targets
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-2 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
              activeTab === 'categories' ? 'border-sky-600 text-sky-800' : 'border-transparent text-slate-500'
            }`}
          >
            Ticket Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-2 text-xs font-bold cursor-pointer transition-colors border-b-2 ${
              activeTab === 'departments' ? 'border-sky-600 text-sky-800' : 'border-transparent text-slate-500'
            }`}
          >
            Hospital Departments ({departments.length})
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
          </div>
        )}

        {activeTab === 'sla' && (
          <form onSubmit={handleSaveSLA} className="space-y-4 max-w-2xl">
            <h4 className="font-bold text-slate-800 text-xs uppercase">Target Thresholds (Minutes)</h4>
            <div className="space-y-3">
              {(Object.keys(slaSettings) as Array<keyof typeof slaSettings>).map((priority) => (
                <div key={priority} className="p-3 bg-slate-50 rounded border border-slate-200 grid grid-cols-3 items-center gap-3 text-xs">
                  <span className="font-bold text-slate-800">{priority} Priority</span>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">First Response Target (Mins)</label>
                    <input
                      type="number"
                      value={slaSettings[priority].response_target_minutes}
                      onChange={(e) =>
                        setSlaSettings({
                          ...slaSettings,
                          [priority]: {
                            ...slaSettings[priority],
                            response_target_minutes: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full border p-1 rounded bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block">Resolution Target (Mins)</label>
                    <input
                      type="number"
                      value={slaSettings[priority].resolution_target_minutes}
                      onChange={(e) =>
                        setSlaSettings({
                          ...slaSettings,
                          [priority]: {
                            ...slaSettings[priority],
                            resolution_target_minutes: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="w-full border p-1 rounded bg-white text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button type="submit" variant="primary" size="sm">
              Save SLA Policy Settings
            </Button>
          </form>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase">Active Ticket Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <h5 className="font-bold text-xs text-sky-900">{c.name}</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>
                  <div className="mt-2 text-[10px] text-slate-400 font-medium">
                    Subcategories: {c.subcategories?.map((s) => s.name).join(', ') || 'None'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase">Hospital Departments</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((d) => (
                <div key={d.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                  <span className="font-mono text-[10px] font-bold text-sky-900 bg-sky-100 px-1.5 py-0.5 rounded">{d.code}</span>
                  <h5 className="font-bold text-xs text-slate-800 mt-1">{d.name}</h5>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
