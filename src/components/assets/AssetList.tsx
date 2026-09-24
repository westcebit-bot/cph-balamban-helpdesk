import React, { useState } from 'react';
import { ITAsset, Ticket } from '../../types';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Search, Plus, HardDrive, Wrench, Shield, Edit, Trash2, History } from 'lucide-react';

export const AssetList: React.FC = () => {
  const { user, role } = useAuth();
  const { assets, createAsset, updateAsset, deleteAsset, getAssetHistory, departments } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetHistory, setSelectedAssetHistory] = useState<{ asset: ITAsset; tickets: Ticket[] } | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ITAsset | null>(null);

  // Form State
  const [assetTag, setAssetTag] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<any>('Desktop Computer');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<any>('Active');
  const [remarks, setRemarks] = useState('');

  const filteredAssets = assets.filter((a) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      a.asset_tag.toLowerCase().includes(q) ||
      a.device_name.toLowerCase().includes(q) ||
      a.brand.toLowerCase().includes(q) ||
      a.model.toLowerCase().includes(q) ||
      a.serial_number.toLowerCase().includes(q)
    );
  });

  const openCreateModal = () => {
    setEditingAsset(null);
    setAssetTag(`CPH-AST-${String(assets.length + 101).padStart(4, '0')}`);
    setDeviceName('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setLocation('');
    setRemarks('');
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === departmentId);
    if (editingAsset) {
      await updateAsset(editingAsset.id, {
        asset_tag: assetTag,
        device_name: deviceName,
        device_type: deviceType,
        brand,
        model,
        serial_number: serialNumber,
        department_id: departmentId,
        department_name: dept?.name,
        location,
        status,
        remarks,
      });
    } else {
      await createAsset({
        asset_tag: assetTag,
        device_name: deviceName,
        device_type: deviceType,
        brand,
        model,
        serial_number: serialNumber,
        department_id: departmentId,
        department_name: dept?.name,
        location,
        acquisition_date: new Date().toISOString().split('T')[0],
        status,
        remarks,
      });
    }
    setShowFormModal(false);
  };

  return (
    <Card className="shadow-md border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-slate-800 text-lg font-bold flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-sky-700" /> IT Asset Registry & Hardware History
          </CardTitle>
          <p className="text-xs text-slate-500">
            Track hardware assets, workstations, PhilHealth/iHOMIS terminals, and repair history for CPH-Balamban
          </p>
        </div>

        {(role === 'admin' || role === 'technician') && (
          <Button onClick={openCreateModal} variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Register New Asset
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search asset tag, brand, serial #, device name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Asset Tag</th>
                <th className="p-3">Device Name & Specs</th>
                <th className="p-3">Department & Location</th>
                <th className="p-3">Serial Number</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredAssets.map((a) => {
                const history = getAssetHistory(a.asset_tag);
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-sky-900 whitespace-nowrap">{a.asset_tag}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{a.device_name}</p>
                      <p className="text-[11px] text-slate-500">{a.brand} {a.model} &bull; {a.device_type}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-800">{a.department_name || 'General'}</p>
                      <p className="text-[11px] text-slate-500">{a.location}</p>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{a.serial_number}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : a.status === 'In Repair'
                          ? 'bg-red-100 text-red-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAssetHistory({ asset: a, tickets: history })}
                        title="View Incident History"
                      >
                        <History className="w-3.5 h-3.5 mr-1" /> History ({history.length})
                      </Button>
                      {(role === 'admin' || user?.id === 'usr-superadmin') && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingAsset(a);
                              setAssetTag(a.asset_tag);
                              setDeviceName(a.device_name);
                              setDeviceType(a.device_type);
                              setBrand(a.brand);
                              setModel(a.model);
                              setSerialNumber(a.serial_number);
                              setDepartmentId(a.department_id);
                              setLocation(a.location);
                              setStatus(a.status);
                              setRemarks(a.remarks || '');
                              setShowFormModal(true);
                            }}
                            className="text-sky-700 hover:text-sky-900 cursor-pointer text-xs"
                            title="Edit Asset"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete asset "${a.asset_tag}"?`)) {
                                deleteAsset(a.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-900 hover:bg-rose-50 cursor-pointer text-xs font-semibold"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-500" /> Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Asset Form Modal */}
      {showFormModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowFormModal(false)}
          title={editingAsset ? 'Edit IT Asset' : 'Register New IT Asset'}
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold block mb-1">Asset Tag *</label>
                <input
                  type="text"
                  required
                  value={assetTag}
                  onChange={(e) => setAssetTag(e.target.value)}
                  className="w-full border p-1.5 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Device Name *</label>
                <input
                  type="text"
                  required
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full border p-1.5 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border p-1.5 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border p-1.5 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full border p-1.5 rounded"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border p-1.5 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="In Repair">In Repair</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold block mb-1">Location / Office</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border p-1.5 rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setShowFormModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Asset</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Asset History Modal */}
      {selectedAssetHistory && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAssetHistory(null)}
          title={`Incident History - ${selectedAssetHistory.asset.asset_tag} (${selectedAssetHistory.asset.device_name})`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded border">
              <p><strong>Brand/Model:</strong> {selectedAssetHistory.asset.brand} {selectedAssetHistory.asset.model}</p>
              <p><strong>Serial No:</strong> {selectedAssetHistory.asset.serial_number}</p>
              <p><strong>Location:</strong> {selectedAssetHistory.asset.location}</p>
            </div>

            <h4 className="font-bold text-slate-700 uppercase border-b pb-1">Associated IT Support Tickets</h4>
            {selectedAssetHistory.tickets.length === 0 ? (
              <p className="text-slate-400 italic">No tickets reported for this IT asset.</p>
            ) : (
              <div className="space-y-2">
                {selectedAssetHistory.tickets.map((t) => (
                  <div key={t.id} className="p-3 bg-white rounded border flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-sky-900">{t.ticket_number}</span>
                      <p className="font-semibold text-slate-800">{t.title}</p>
                      <p className="text-[10px] text-slate-500">Status: {t.status} &bull; Priority: {t.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </Card>
  );
};
