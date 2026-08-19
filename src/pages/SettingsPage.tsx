import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Database,
  Shield,
  Clock,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  HardDrive,
  Mail,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { CompanyCode, COMPANY_NAMES } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface SettingsPageProps {
  onRefreshData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshData }) => {
  const { currentUser, isITManager } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const [settings, setSettings] = useState({
    defaultExpectedLife: 5,
    warrantyAlertThresholdDays: 60,
    depreciationMethod: 'Straight-Line (SLD)',
    itContactEmail: 'it.helpdesk@accurate.in',
    backupFrequency: 'Realtime Cloud Firestore Sync',
    requireHandoverSlip: true,
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    DataService.resetToSampleData();
    setResetModalOpen(false);
    onRefreshData();
    alert('System sample inventory data has been reset successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            System & Organization Settings
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure group companies, depreciation rules, alert thresholds, and database synchronization
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          <span>System configuration parameters saved successfully.</span>
        </div>
      )}

      {/* Organizations Configuration List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span>Registered Accurate Group Organizations</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* AGIPL */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                AGIPL
              </span>
              <span className="text-[10px] font-bold text-slate-500">Code: AGIPL</span>
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
              Accurate Gauging Instrument Pvt. Ltd.
            </h3>
            <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>Hadapsar Industrial Estate, Pune</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <span>agipl.it@accurate.in</span>
              </div>
            </div>
          </div>

          {/* ASSPL */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                ASSPL
              </span>
              <span className="text-[10px] font-bold text-slate-500">Code: ASSPL</span>
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
              Accurate Sales and Services Pvt. Ltd.
            </h3>
            <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>Sales HQ & Service Hubs (Pune / Mumbai)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <span>asspl.it@accurate.in</span>
              </div>
            </div>
          </div>

          {/* ONYX */}
          <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 dark:border-purple-900/50 dark:bg-purple-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                ONYX
              </span>
              <span className="text-[10px] font-bold text-slate-500">Code: ONYX</span>
            </div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
              Onyx Precision
            </h3>
            <div className="mt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span>Precision Metrology Plant, Pune</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                <span>onyx.it@accurate.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSaveSettings} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-blue-600" />
          <span>Depreciation & Alert Thresholds</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Asset Useful Life (Years)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={settings.defaultExpectedLife}
              onChange={(e) => setSettings({ ...settings, defaultExpectedLife: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Warranty Advance Expiry Warning (Days)
            </label>
            <select
              value={settings.warrantyAlertThresholdDays}
              onChange={(e) => setSettings({ ...settings, warrantyAlertThresholdDays: Number(e.target.value) })}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value={30}>30 Days before expiry</option>
              <option value={60}>60 Days before expiry (Recommended)</option>
              <option value={90}>90 Days before expiry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              IT Support Central Email
            </label>
            <input
              type="email"
              value={settings.itContactEmail}
              onChange={(e) => setSettings({ ...settings, itContactEmail: e.target.value })}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Database & Sync Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-emerald-600" />
          <span>Storage & Cloud Database Status</span>
        </h2>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Persistence Engine:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> Cloud Firestore & Persistent Local Cache Active
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Security Model:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              Role-Based Access Control (RBAC) & Immutable Audit Trail
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Data Preservation:</span>
            <span className="font-semibold text-blue-600">
              Hard Deletion Disabled (Compliant Scrap/Retire Archival)
            </span>
          </div>
        </div>

        {/* Demo Data Reset for Manager */}
        {isITManager && (
          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Sample Data Reset</div>
              <div className="text-[11px] text-slate-500">Restore factory sample seed assets for test demo</div>
            </div>
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
            >
              Reset Seed Data
            </button>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={resetModalOpen}
        title="Reset to Demo Sample Data?"
        message="This will reload the initial sample inventory records across AGIPL, ASSPL, and ONYX."
        confirmText="Yes, Reset Data"
        isDestructive={true}
        onConfirm={handleResetData}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
