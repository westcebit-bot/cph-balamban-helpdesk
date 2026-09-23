import React, { useState } from 'react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { TicketPriority, DeviceType } from '../../types';
import { DataPrivacyNotice } from '../ui/DataPrivacyNotice';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CheckCircle2, Upload, AlertCircle, FileText, Tag, MapPin, Phone, Building } from 'lucide-react';

interface TicketFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TicketForm: React.FC<TicketFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const { categories, departments, assets, createTicket, tickets } = useTickets();

  // Calculated next ticket number preview
  const year = new Date().getFullYear();
  const nextSeq = String(tickets.length + 1).padStart(5, '0');
  const previewTicketNumber = `CPH-IT-${year}-${nextSeq}`;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(user?.department_id || departments[0]?.id || '');
  const [unit, setUnit] = useState('');
  const [contactNumber, setContactNumber] = useState(user?.phone || 'Loc 101');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [deviceType, setDeviceType] = useState<DeviceType>('Desktop Computer');
  const [location, setLocation] = useState(user?.location || 'Main Hospital Building');
  const [assetTag, setAssetTag] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketNo, setSubmittedTicketNo] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !departmentId || !categoryId) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTicket({
        title,
        description,
        department_id: departmentId,
        unit,
        contact_number: contactNumber,
        category_id: categoryId,
        subcategory_id: subcategoryId || undefined,
        priority,
        device_type: deviceType,
        location,
        asset_tag: assetTag || undefined,
        attachments: files,
      });

      setSubmittedTicketNo(created.ticket_number);
      setIsSubmitting(false);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err) {
      setIsSubmitting(false);
      alert('Failed to submit ticket. Please try again.');
    }
  };

  if (submittedTicketNo) {
    return (
      <Card className="max-w-2xl mx-auto shadow-xl border-emerald-200 bg-emerald-50/40">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">IT Ticket Successfully Submitted!</h2>
          <p className="text-sm text-slate-600 mt-2">
            Your ticket has been registered in the CPH-Balamban Helpdesk queue.
          </p>
          <div className="my-6 inline-block bg-white px-6 py-3 rounded-lg border border-emerald-200 shadow-xs">
            <span className="text-xs text-slate-400 uppercase font-semibold block">Ticket Tracking Number</span>
            <span className="text-2xl font-black text-sky-900 tracking-wider font-mono">{submittedTicketNo}</span>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            The IT Department team has been notified. You can track this ticket's status in your <strong>My Tickets</strong> workspace.
          </p>
          <Button onClick={() => setSubmittedTicketNo(null)} variant="primary">
            Submit Another Ticket
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-slate-200">
      <CardHeader className="bg-sky-900 text-white flex items-center justify-between">
        <div>
          <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
            <span>New IT Support Ticket</span>
          </CardTitle>
          <p className="text-xs text-sky-200 mt-0.5">Cebu Provincial Hospital – Balamban IT Department</p>
        </div>
        <div className="bg-sky-800 border border-sky-700 px-3 py-1.5 rounded text-xs font-mono font-bold text-amber-300">
          Auto ID: {previewTicketNumber}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <DataPrivacyNotice />

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Requester & Location Info */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-700" /> Requester & Contact Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requester Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.full_name || ''}
                  className="w-full bg-slate-200/70 border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Unit / Section</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 3, Cashier Counter 2"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number / Extension *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Loc 105 or 0917-xxx-xxxx"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office / Specific Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Hospital Building 1st Floor Room 104"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Issue Classification & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Subcategory</label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select Subcategory (Optional)</option>
                {selectedCategory?.subcategories?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Device / Service Type *</label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
                required
              >
                <option value="Desktop Computer">Desktop Computer</option>
                <option value="Laptop">Laptop</option>
                <option value="Printer">Printer</option>
                <option value="Scanner">Scanner</option>
                <option value="Network / LAN">Network / LAN</option>
                <option value="Internet Connection">Internet Connection</option>
                <option value="Telephone">Telephone</option>
                <option value="Server">Server</option>
                <option value="Hospital Information System">Hospital Information System (iHOMIS+)</option>
                <option value="PhilHealth eClaims / iHOMIS+">PhilHealth eClaims Portal</option>
                <option value="Other IT Equipment">Other IT Equipment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
                required
              >
                <option value="Critical">🔴 Critical (Hospital-wide / ER outage - 15m Response)</option>
                <option value="High">🟠 High (Department operational impact - 30m Response)</option>
                <option value="Medium">🟡 Medium (Single workstation/user issue - 4h Response)</option>
                <option value="Low">🟢 Low (Routine setup / inquiry - 8h Response)</option>
              </select>
            </div>
          </div>

          {/* Section 3: Asset Tag Option & Issue Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-700" /> Associated IT Asset Tag (Optional)
              </label>
              <select
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select Registered Asset Tag or None</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.asset_tag}>
                    {a.asset_tag} - {a.device_name} ({a.brand} {a.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Title / Short Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g. iHOMIS+ Billing Terminal freezing during official receipt printing"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 font-semibold focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description of the Problem *</label>
              <textarea
                required
                rows={4}
                placeholder="Provide complete details: error messages displayed, steps leading to the issue, affected users, and exact behavior..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
              ></textarea>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-sky-700" /> Attachments / Screenshots (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
              />
              <p className="text-[11px] text-slate-400 mt-1">Supported file types: PNG, JPG, PDF, DOCX (Max 10MB per file)</p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Submit IT Support Ticket
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
