import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit,
  QrCode,
  FileText,
  UserPlus,
  Wrench,
  Archive,
  Building2,
  Cpu,
  HardDrive,
  Shield,
  IndianRupee,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Activity,
  Printer,
  History,
  FileCheck2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import {
  Asset,
  AuditLog,
  ServiceRecord,
  PageView,
  AssetStatus,
  COMPANY_NAMES,
  COMPANY_BADGES,
  STATUS_COLORS,
} from '../types';
import { formatCurrencyINR, formatDateDisplay } from '../utils/assetUtils';
import { useAuth } from '../context/AuthContext';
import { DataService } from '../services/dataService';
import { AssetTagModal } from '../components/common/AssetTagModal';
import { HandoverSlipModal } from '../components/common/HandoverSlipModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface AssetDetailsPageProps {
  assetId: string;
  assets: Asset[];
  auditLogs: AuditLog[];
  serviceRecords: ServiceRecord[];
  onNavigate: (page: PageView, assetId?: string) => void;
  onRefreshData: () => void;
}

export const AssetDetailsPage: React.FC<AssetDetailsPageProps> = ({
  assetId,
  assets,
  auditLogs,
  serviceRecords,
  onNavigate,
  onRefreshData,
}) => {
  const { currentUser, canEditAsset, canRetireAsset, isITManager } = useAuth();

  const asset = assets.find((a) => a.id === assetId || a.assetId === assetId);

  // Modals state
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [slipModalOpen, setSlipModalOpen] = useState(false);

  // Quick Action Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeName: asset?.assignedEmployeeName || '',
    username: asset?.assetUserName || '',
    department: asset?.department || 'Engineering & Design',
    location: asset?.location || '',
  });

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    serviceType: 'Preventive Maintenance & Cleaning',
    serviceProvider: 'In-House IT Team',
    cost: 0,
    technicianNotes: 'Routine cleaning, thermal paste inspection, and OS updates installed.',
  });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<AssetStatus>(asset?.status || 'ACTIVE');
  const [statusReason, setStatusReason] = useState('');

  if (!asset) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Asset Not Found</h2>
        <p className="mt-1 text-xs text-slate-500">The requested asset ID "{assetId}" does not exist.</p>
        <button
          onClick={() => onNavigate('assets')}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Assets List</span>
        </button>
      </div>
    );
  }

  // Filter audit logs and service records specific to this asset
  const assetLogs = auditLogs.filter((l) => l.assetId === asset.assetId || l.assetId === asset.id);
  const assetServices = serviceRecords.filter((s) => s.assetId === asset.assetId || s.assetId === asset.id);

  const statusStyle = STATUS_COLORS[asset.status] || STATUS_COLORS.ACTIVE;
  const companyBadge = COMPANY_BADGES[asset.company];

  // Quick Handlers
  const handleSaveAssignment = async () => {
    try {
      await DataService.saveAsset(
        {
          ...asset,
          assignedEmployeeName: assignForm.employeeName,
          assetUserName: assignForm.username,
          department: assignForm.department,
          location: assignForm.location,
          status: assignForm.employeeName ? 'ACTIVE' : 'IN STOCK',
        },
        currentUser,
        false
      );
      setAssignModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update assignment');
    }
  };

  const handleSaveService = async () => {
    try {
      await DataService.addServiceRecord(
        {
          assetDocId: asset.id,
          assetId: asset.assetId,
          serviceDate: new Date().toISOString().split('T')[0],
          serviceType: 'Routine Maintenance',
          vendor: serviceForm.serviceProvider || 'In-House IT',
          cost: Number(serviceForm.cost) || 0,
          issueDescription: serviceForm.serviceType,
          actionTaken: serviceForm.technicianNotes,
          partsReplaced: '',
          nextFollowup: '',
          recordedBy: currentUser.name,
        },
        currentUser
      );
      setServiceModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      alert(err?.message || 'Failed to record service details');
    }
  };

  const handleSaveStatus = async () => {
    try {
      await DataService.saveAsset(
        {
          ...asset,
          status: newStatus,
          remarks: statusReason
            ? `${asset.remarks || ''} [${new Date().toISOString().split('T')[0]} Status -> ${newStatus}: ${statusReason}]`
            : asset.remarks,
        },
        currentUser,
        false
      );
      setStatusModalOpen(false);
      onRefreshData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('assets')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl font-mono">
                {asset.assetId}
              </h1>
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${companyBadge.bg}`}>
                {COMPANY_NAMES[asset.company]}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                {asset.status}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {asset.manufacturer} {asset.model} • Tag: {asset.assetNumber || 'N/A'} • SN: {asset.serialNumber || 'N/A'}
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {canEditAsset && (
            <button
              onClick={() => onNavigate('asset-edit', asset.id)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Edit className="h-4 w-4 text-blue-600" />
              <span>Edit Asset</span>
            </button>
          )}

          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <UserPlus className="h-4 w-4 text-emerald-600" />
            <span>Reassign / Custody</span>
          </button>

          <button
            onClick={() => setServiceModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Wrench className="h-4 w-4 text-amber-600" />
            <span>Log Service</span>
          </button>

          <button
            onClick={() => setTagModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900"
          >
            <QrCode className="h-4 w-4" />
            <span>Asset QR Sticker</span>
          </button>

          <button
            onClick={() => setSlipModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900"
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Handover Slip</span>
          </button>

          <button
            onClick={() => setStatusModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Archive className="h-4 w-4 text-slate-600" />
            <span>Lifecycle Status</span>
          </button>
        </div>
      </div>

      {/* Alert Banners if any */}
      {(asset.warrantyAlert || asset.replacementAlert) && (
        <div className="space-y-2">
          {asset.warrantyAlert && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-3.5 text-xs text-amber-900 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <strong>Warranty Attention Required:</strong> OEM warranty expired or expires within 60 days on{' '}
                <strong>{formatDateDisplay(asset.warrantyEnd)}</strong>. Contact vendor {asset.vendor || 'OEM'} for AMC extension.
              </div>
            </div>
          )}
          {asset.replacementAlert && (
            <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-900 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
              <Clock className="h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <strong>Asset Replacement Due:</strong> This machine has reached <strong>{asset.assetAge}</strong> (exceeding expected useful life of {asset.expectedLife} years). Plan budget replacement.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Specifications & Assignment Bento Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Box 1: Custody & Network Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Custody & Assignment</span>
            </h2>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {asset.company}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400">Assigned Employee</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {asset.assignedEmployeeName || 'Unassigned (Buffer Stock)'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400">Login User</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {asset.assetUserName || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {asset.department || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-400">Location / Plant</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {asset.location || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">IP Address</span>
                <p className="font-mono font-semibold text-blue-600">
                  {asset.ipAddress || 'DHCP'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Box 2: Hardware Specifications */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Hardware Specs</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-500">
              {asset.assetType} ({asset.condition})
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Processor (CPU)</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.processor || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">RAM Memory</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.ram || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Storage Drive</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.storage || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Display / Monitor</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.display || 'N/A'} ({asset.displaySize || ''})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Motherboard</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.motherboard || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">LAN / UPS</span>
              <span className="font-semibold text-slate-900 dark:text-white">{asset.lanCard || 'LAN'} • {asset.upsBattery || 'UPS'}</span>
            </div>
          </div>
        </div>

        {/* Box 3: Financial Valuation & Software */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-600" />
              <span>Valuation & Licensing</span>
            </h2>
            <span className="text-[10px] font-bold text-emerald-600 font-mono">
              Age: {asset.assetAge}
            </span>
          </div>

          <div className="mt-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Purchase Cost</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {formatCurrencyINR(asset.purchaseCost)}
              </span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-400">Depreciated Book Value</span>
              <span className="text-base font-extrabold text-emerald-600">
                {formatCurrencyINR(asset.depreciatedValue)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Vendor & Invoice</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {asset.vendor || 'N/A'} (#{asset.invoiceNumber || 'N/A'})
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">OS & Antivirus</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {asset.windowsVersion || 'Win OS'} • {asset.escan || 'eScan'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Office Suite</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {asset.msOffice || 'Standard'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Records & Audit Trail Tabs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Service & Repair History */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Service & Maintenance Log ({assetServices.length})
              </h2>
            </div>
            <button
              onClick={() => setServiceModalOpen(true)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              + Add Record
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {assetServices.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <FileText className="mx-auto mb-1 h-6 w-6 text-slate-400" />
                No service records or hardware maintenance logged yet.
              </div>
            ) : (
              assetServices.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {rec.serviceType}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {formatDateDisplay(rec.serviceDate)}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {rec.technicianNotes}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                    <span>Vendor: <strong>{rec.serviceProvider}</strong></span>
                    <span>Cost: <strong>{formatCurrencyINR(rec.cost)}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit History Log for this Asset */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Complete Lifecycle Audit Trail ({assetLogs.length})
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Immutable Trace
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {assetLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Activity className="mx-auto mb-1 h-6 w-6 text-slate-400" />
                Audit records will appear as changes are performed.
              </div>
            ) : (
              assetLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{log.action}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                    {log.details}
                  </p>
                  <div className="mt-1.5 text-[10px] text-slate-400">
                    Logged by: <strong className="text-slate-700 dark:text-slate-200">{log.performedBy}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Asset Tag & Handover Modals */}
      <AssetTagModal asset={asset} isOpen={tagModalOpen} onClose={() => setTagModalOpen(false)} />
      <HandoverSlipModal asset={asset} isOpen={slipModalOpen} onClose={() => setSlipModalOpen(false)} />

      {/* Quick Reassign Modal */}
      <ConfirmationModal
        isOpen={assignModalOpen}
        title="Reassign Asset Custody"
        message="Update the designated employee, login username, and department location for this machine."
        confirmText="Save Assignment"
        onConfirm={handleSaveAssignment}
        onCancel={() => setAssignModalOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Employee Full Name
            </label>
            <input
              type="text"
              value={assignForm.employeeName}
              onChange={(e) => setAssignForm({ ...assignForm, employeeName: e.target.value })}
              placeholder="e.g. Ramesh Deshmukh (leave blank for buffer stock)"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              System Username
            </label>
            <input
              type="text"
              value={assignForm.username}
              onChange={(e) => setAssignForm({ ...assignForm, username: e.target.value })}
              placeholder="e.g. rdeshmukh"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department
            </label>
            <select
              value={assignForm.department}
              onChange={(e) => setAssignForm({ ...assignForm, department: e.target.value })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="Engineering & Design">Engineering & Design</option>
              <option value="Quality Assurance (QA/QC)">Quality Assurance (QA/QC)</option>
              <option value="Sales & Field Services">Sales & Field Services</option>
              <option value="Accounts & Billing">Accounts & Billing</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Human Resources (HR)">Human Resources (HR)</option>
              <option value="Administration">Administration</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Location / Plant
            </label>
            <input
              type="text"
              value={assignForm.location}
              onChange={(e) => setAssignForm({ ...assignForm, location: e.target.value })}
              placeholder="e.g. Hadapsar Plant - 2nd Floor"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Quick Service Log Modal */}
      <ConfirmationModal
        isOpen={serviceModalOpen}
        title="Log Service or Repair Record"
        message="Append a technical maintenance or repair record to this machine's service history."
        confirmText="Record Service"
        onConfirm={handleSaveService}
        onCancel={() => setServiceModalOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service Type
            </label>
            <input
              type="text"
              value={serviceForm.serviceType}
              onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
              placeholder="e.g. RAM Upgrade, Display Replacement, Preventive Maintenance"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor / Tech Provider
              </label>
              <input
                type="text"
                value={serviceForm.serviceProvider}
                onChange={(e) => setServiceForm({ ...serviceForm, serviceProvider: e.target.value })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost (INR ₹)
              </label>
              <input
                type="number"
                value={serviceForm.cost}
                onChange={(e) => setServiceForm({ ...serviceForm, cost: Number(e.target.value) })}
                className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Technician Notes / Parts Replaced
            </label>
            <textarea
              rows={3}
              value={serviceForm.technicianNotes}
              onChange={(e) => setServiceForm({ ...serviceForm, technicianNotes: e.target.value })}
              placeholder="Details of repair, replaced components, diagnostics..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
      </ConfirmationModal>

      {/* Lifecycle Status Modal */}
      <ConfirmationModal
        isOpen={statusModalOpen}
        title="Update Asset Lifecycle Status"
        message="Change the status of this asset. Note: hard deletion is disabled; obsolete assets must be set to RETIRED or SCRAPPED."
        confirmText="Confirm Status Change"
        onConfirm={handleSaveStatus}
        onCancel={() => setStatusModalOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              New Lifecycle Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AssetStatus)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="ACTIVE">ACTIVE (In Service)</option>
              <option value="IN STOCK">IN STOCK (Buffer Store)</option>
              <option value="UNDER REPAIR">UNDER REPAIR (Service Center)</option>
              <option value="RETIRED">RETIRED (Decommissioned)</option>
              <option value="SCRAPPED">SCRAPPED (Disposed/Recycled)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Status Change
            </label>
            <textarea
              rows={2}
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="e.g. Sent for motherboard repair / Decommissioned due to age"
              className="w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};
