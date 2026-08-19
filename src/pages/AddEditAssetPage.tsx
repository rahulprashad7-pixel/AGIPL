import React, { useState, useEffect } from 'react';
import {
  Save,
  ArrowLeft,
  Building2,
  Cpu,
  HardDrive,
  Shield,
  IndianRupee,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { Asset, CompanyCode, AssetStatus, Condition, PageView, COMPANY_NAMES } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import {
  calculateAssetAge,
  calculateDepreciatedValue,
  calculateExpectedReplacementDate,
  checkWarrantyAlert,
  checkReplacementAlert,
  formatCurrencyINR,
} from '../utils/assetUtils';

interface AddEditAssetPageProps {
  assetIdToEdit?: string | null;
  assets: Asset[];
  onNavigate: (page: PageView, assetId?: string) => void;
  onRefreshAssets: () => void;
}

export const AddEditAssetPage: React.FC<AddEditAssetPageProps> = ({
  assetIdToEdit,
  assets,
  onNavigate,
  onRefreshAssets,
}) => {
  const { currentUser } = useAuth();
  const isNew = !assetIdToEdit;

  // Form State initialized
  const [formData, setFormData] = useState<Partial<Asset>>({
    assetId: '',
    company: 'AGIPL',
    assetType: 'Desktop',
    assetNumber: '',
    status: 'ACTIVE',
    condition: 'NEW',
    assignedEmployeeName: '',
    assetUserName: '',
    department: 'Engineering & Design',
    location: 'Hadapsar Plant',
    ipAddress: '',
    serialNumber: '',
    manufacturer: 'Dell',
    model: 'OptiPlex 7010',
    processor: 'Intel Core i5 (13th Gen)',
    storage: '512GB NVMe SSD',
    ram: '16GB DDR4',
    motherboard: 'OEM Commercial Board',
    display: 'Dell 24" FHD Monitor',
    displaySize: '24 inch',
    lanCard: 'Gigabit Ethernet Port',
    upsBattery: 'APC 600VA UPS',
    windowsVersion: 'Windows 11 Pro 64-bit',
    msOffice: 'Microsoft Office 2021 Home & Business',
    escan: 'eScan Corporate Antivirus Active',
    vendor: 'Softmart Solutions Pune',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 65000,
    invoiceNumber: '',
    expectedLife: 5,
    expectedReplacementDate: '',
    warrantyStart: new Date().toISOString().split('T')[0],
    warrantyEnd: '',
    amcStart: '',
    amcEnd: '',
    lastServiceDate: '',
    remarks: '',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'assignment' | 'hardware' | 'software' | 'financials' | 'warranty'>('general');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-generate suggested Asset ID on company or type change for new assets
  const generateSuggestedAssetId = (company: CompanyCode, type: string) => {
    const typeCode = type.toUpperCase().slice(0, 3);
    const existingMatching = assets.filter((a) => a.company === company && a.assetType === type);
    const nextNum = existingMatching.length + 1;
    const padded = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
    return `${company}-${typeCode}-${padded}`;
  };

  useEffect(() => {
    if (assetIdToEdit) {
      const existing = assets.find((a) => a.id === assetIdToEdit || a.assetId === assetIdToEdit);
      if (existing) {
        setFormData(existing);
      }
    } else {
      // Set initial suggested ID
      const initialId = generateSuggestedAssetId(formData.company || 'AGIPL', formData.assetType || 'Desktop');
      setFormData((prev) => ({
        ...prev,
        assetId: initialId,
        expectedReplacementDate: calculateExpectedReplacementDate(prev.purchaseDate, prev.expectedLife || 5),
      }));
    }
  }, [assetIdToEdit, assets]);

  // Handle form updates
  const handleChange = (field: keyof Asset, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Dynamic calculation adjustments
      if (field === 'purchaseDate' || field === 'expectedLife') {
        const pDate = field === 'purchaseDate' ? value : updated.purchaseDate;
        const eLife = field === 'expectedLife' ? Number(value) : updated.expectedLife || 5;
        updated.expectedReplacementDate = calculateExpectedReplacementDate(pDate, eLife);
      }

      if (field === 'purchaseDate' && !updated.warrantyStart) {
        updated.warrantyStart = value;
      }

      return updated;
    });
  };

  const handleCompanyChange = (comp: CompanyCode) => {
    setFormData((prev) => ({
      ...prev,
      company: comp,
      assetId: isNew ? generateSuggestedAssetId(comp, prev.assetType || 'Desktop') : prev.assetId,
    }));
  };

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      assetType: type,
      assetId: isNew ? generateSuggestedAssetId(prev.company || 'AGIPL', type) : prev.assetId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.assetId || !formData.company || !formData.assetType) {
      setErrorMessage('Asset ID, Company, and Asset Type are required.');
      return;
    }

    // Check duplicate Asset ID for new assets
    if (isNew && assets.some((a) => a.assetId.toLowerCase() === formData.assetId?.toLowerCase())) {
      setErrorMessage(`Asset ID "${formData.assetId}" already exists. Please choose a unique Asset ID.`);
      return;
    }

    setLoading(true);
    try {
      const saved = await DataService.saveAsset(formData, currentUser, isNew);
      onRefreshAssets();
      setSuccessMessage(`Asset ${saved.assetId} successfully ${isNew ? 'created' : 'updated'}!`);
      setTimeout(() => {
        onNavigate('asset-details', saved.id);
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Failed to save asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Preview computed values
  const previewAge = calculateAssetAge(formData.purchaseDate);
  const previewDepreciated = calculateDepreciatedValue(
    Number(formData.purchaseCost) || 0,
    formData.purchaseDate,
    Number(formData.expectedLife) || 5
  );

  return (
    <div className="space-y-6">
      {/* Header & Back Action */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('assets')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {isNew ? 'Add New IT Hardware Asset' : `Edit Asset: ${formData.assetId}`}
            </h1>
            <p className="text-xs text-slate-500">
              {isNew
                ? 'Register equipment specs, network configuration, assignment, and procurement details'
                : 'Modify asset configuration and append automatic change record to audit trail'}
            </p>
          </div>
        </div>

        {/* Live Calculation Preview Badge */}
        <div className="hidden sm:flex items-center gap-3 text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div>
            <span className="text-slate-500">Calculated Age: </span>
            <strong className="text-slate-900 dark:text-white">{previewAge}</strong>
          </div>
          <div className="h-3 w-px bg-slate-300 dark:bg-slate-600" />
          <div>
            <span className="text-slate-500">Book Value: </span>
            <strong className="text-emerald-600">{formatCurrencyINR(previewDepreciated)}</strong>
          </div>
        </div>
      </div>

      {/* Error & Success notifications */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2 dark:border-slate-800">
        {[
          { id: 'general', label: '1. General & Classification' },
          { id: 'assignment', label: '2. Assignment & Location' },
          { id: 'hardware', label: '3. Hardware & Specs' },
          { id: 'software', label: '4. Software & Antivirus' },
          { id: 'financials', label: '5. Procurement & Value' },
          { id: 'warranty', label: '6. Warranty & Maintenance' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: General & Classification */}
        {activeTab === 'general' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Asset Identification & Operating Entity</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Operating Company */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Operating Organization *
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => handleCompanyChange(e.target.value as CompanyCode)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  <option value="AGIPL">AGIPL - Accurate Gauging Instrument Pvt. Ltd.</option>
                  <option value="ASSPL">ASSPL - Accurate Sales and Services Pvt. Ltd.</option>
                  <option value="ONYX">ONYX - Onyx Precision</option>
                </select>
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Hardware Type *
                </label>
                <select
                  value={formData.assetType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  <option value="Desktop">Desktop PC</option>
                  <option value="Laptop">Laptop / Notebook</option>
                  <option value="Workstation">CAD/CAM Workstation</option>
                  <option value="Server">Rack / Tower Server</option>
                  <option value="Monitor">Display Monitor</option>
                  <option value="Printer / MFP">Printer / Multi-Function Copier</option>
                  <option value="Network Switch">Network Switch / Router</option>
                  <option value="UPS / Battery">UPS / Battery Backup</option>
                  <option value="Scanner / CMM">Inspection / CMM Computer</option>
                  <option value="Tablet">Tablet / Handheld</option>
                  <option value="Other">Other IT Peripheral</option>
                </select>
              </div>

              {/* Asset ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset ID (Unique Code) *
                </label>
                <input
                  type="text"
                  value={formData.assetId}
                  onChange={(e) => handleChange('assetId', e.target.value)}
                  placeholder="e.g. AGIPL-DSK-001"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              {/* Internal Asset Number / Tag */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Asset Tag Number
                </label>
                <input
                  type="text"
                  value={formData.assetNumber}
                  onChange={(e) => handleChange('assetNumber', e.target.value)}
                  placeholder="e.g. AG-IT-2023-045"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Lifecycle Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lifecycle Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as AssetStatus)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                >
                  <option value="ACTIVE">ACTIVE (In Service)</option>
                  <option value="IN STOCK">IN STOCK (Buffer Store)</option>
                  <option value="UNDER REPAIR">UNDER REPAIR (Maintenance)</option>
                  <option value="RETIRED">RETIRED (Decommissioned)</option>
                  <option value="SCRAPPED">SCRAPPED (Disposed/Recycled)</option>
                </select>
              </div>

              {/* Condition: New or Old */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Condition (Procured As)
                </label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value="NEW"
                      checked={formData.condition === 'NEW'}
                      onChange={() => handleChange('condition', 'NEW')}
                    />
                    <span>Brand New</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="condition"
                      value="OLD"
                      checked={formData.condition === 'OLD'}
                      onChange={() => handleChange('condition', 'OLD')}
                    />
                    <span>Refurbished / Used (Old)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Assignment & Location */}
        {activeTab === 'assignment' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Custody, User Assignment & Branch Location</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Assigned Employee */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Employee Full Name
                </label>
                <input
                  type="text"
                  value={formData.assignedEmployeeName}
                  onChange={(e) => handleChange('assignedEmployeeName', e.target.value)}
                  placeholder="e.g. Vikas Kulkarni"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Login Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Windows / Login Username
                </label>
                <input
                  type="text"
                  value={formData.assetUserName}
                  onChange={(e) => handleChange('assetUserName', e.target.value)}
                  placeholder="e.g. vkulkarni"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Engineering & Design">Engineering & Design</option>
                  <option value="Quality Assurance (QA/QC)">Quality Assurance (QA/QC)</option>
                  <option value="CNC Machining & CAM">CNC Machining & CAM</option>
                  <option value="Production & Assembly">Production & Assembly</option>
                  <option value="Sales & Field Services">Sales & Field Services</option>
                  <option value="Accounts & Billing">Accounts & Billing</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Human Resources (HR)">Human Resources (HR)</option>
                  <option value="Purchase & Supply Chain">Purchase & Supply Chain</option>
                  <option value="Administration">Administration</option>
                  <option value="Management & Directors">Management & Directors</option>
                  <option value="IT Buffer / Spare Pool">IT Buffer / Spare Pool</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Office / Plant Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Hadapsar Plant - 1st Floor CAD Room"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  IP Address (Static / DHCP)
                </label>
                <input
                  type="text"
                  value={formData.ipAddress}
                  onChange={(e) => handleChange('ipAddress', e.target.value)}
                  placeholder="e.g. 192.168.10.45"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Hardware & Technical Specs */}
        {activeTab === 'hardware' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              <span>Hardware Specifications & Components</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Manufacturer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturer / Brand
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  placeholder="e.g. Dell, HP, Lenovo, Cisco, Canon"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Model Number / Name
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  placeholder="e.g. OptiPlex 7090, ThinkPad E14"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Manufacturer Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  placeholder="e.g. DL-SN-9988231"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Processor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Processor (CPU)
                </label>
                <input
                  type="text"
                  value={formData.processor}
                  onChange={(e) => handleChange('processor', e.target.value)}
                  placeholder="e.g. Intel Core i7-13700 (16 Cores)"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* RAM */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  RAM Memory
                </label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => handleChange('ram', e.target.value)}
                  placeholder="e.g. 16GB DDR4 / 32GB DDR5"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Storage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storage (SSD / HDD)
                </label>
                <input
                  type="text"
                  value={formData.storage}
                  onChange={(e) => handleChange('storage', e.target.value)}
                  placeholder="e.g. 512GB NVMe SSD + 1TB HDD"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Motherboard */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motherboard
                </label>
                <input
                  type="text"
                  value={formData.motherboard}
                  onChange={(e) => handleChange('motherboard', e.target.value)}
                  placeholder="e.g. Dell Q570 / Intel B660"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Display & Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Monitor & Specs
                </label>
                <input
                  type="text"
                  value={formData.display}
                  onChange={(e) => handleChange('display', e.target.value)}
                  placeholder="e.g. Dell UltraSharp 24 InfinityEdge"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Display Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Display Screen Size
                </label>
                <input
                  type="text"
                  value={formData.displaySize}
                  onChange={(e) => handleChange('displaySize', e.target.value)}
                  placeholder="e.g. 24 inch, 14 inch Laptop, 27 inch"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* LAN Card */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  LAN Card / Network Adapter
                </label>
                <input
                  type="text"
                  value={formData.lanCard}
                  onChange={(e) => handleChange('lanCard', e.target.value)}
                  placeholder="e.g. Intel Gigabit I219-LM + Wi-Fi 6"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* UPS / Battery */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPS / Battery Health
                </label>
                <input
                  type="text"
                  value={formData.upsBattery}
                  onChange={(e) => handleChange('upsBattery', e.target.value)}
                  placeholder="e.g. APC 600VA Standalone / 57Wh Battery 95%"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Software & Security */}
        {activeTab === 'software' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Operating System & Software Licensing</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Windows Version */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Windows / OS Version
                </label>
                <input
                  type="text"
                  value={formData.windowsVersion}
                  onChange={(e) => handleChange('windowsVersion', e.target.value)}
                  placeholder="e.g. Windows 11 Pro 64-bit 23H2"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* MS Office */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  MS Office Edition
                </label>
                <input
                  type="text"
                  value={formData.msOffice}
                  onChange={(e) => handleChange('msOffice', e.target.value)}
                  placeholder="e.g. Microsoft Office 2021 Home & Business"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* eScan Antivirus */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  eScan Antivirus Status / License
                </label>
                <input
                  type="text"
                  value={formData.escan}
                  onChange={(e) => handleChange('escan', e.target.value)}
                  placeholder="e.g. eScan Corporate Lic #ESC-AG-889"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Procurement & Valuation */}
        {activeTab === 'financials' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-blue-600" />
              <span>Procurement, Invoices & Depreciation Valuation</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Vendor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                  placeholder="e.g. Softmart Solutions Pune"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleChange('purchaseDate', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Purchase Cost */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purchase Cost (INR ₹)
                </label>
                <input
                  type="number"
                  value={formData.purchaseCost}
                  onChange={(e) => handleChange('purchaseCost', Number(e.target.value))}
                  placeholder="e.g. 75000"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                  placeholder="e.g. INV-SM-2023-991"
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Expected Life (Years) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Useful Lifespan (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={formData.expectedLife}
                  onChange={(e) => handleChange('expectedLife', Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Expected Replacement Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Replacement Date
                </label>
                <input
                  type="date"
                  value={formData.expectedReplacementDate}
                  onChange={(e) => handleChange('expectedReplacementDate', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Warranty, AMC & Remarks */}
        {activeTab === 'warranty' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Warranty, AMC Contracts & Maintenance Notes</span>
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Warranty Start */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  OEM Warranty Start Date
                </label>
                <input
                  type="date"
                  value={formData.warrantyStart}
                  onChange={(e) => handleChange('warrantyStart', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Warranty End */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  OEM Warranty End Date
                </label>
                <input
                  type="date"
                  value={formData.warrantyEnd}
                  onChange={(e) => handleChange('warrantyEnd', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* AMC Start */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AMC Support Start Date
                </label>
                <input
                  type="date"
                  value={formData.amcStart}
                  onChange={(e) => handleChange('amcStart', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* AMC End */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  AMC Support End Date
                </label>
                <input
                  type="date"
                  value={formData.amcEnd}
                  onChange={(e) => handleChange('amcEnd', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Last Service Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Service / Checkup Date
                </label>
                <input
                  type="date"
                  value={formData.lastServiceDate}
                  onChange={(e) => handleChange('lastServiceDate', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Remarks */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Remarks & Asset History Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder="e.g. Workstation allocated for CAD engineering with dedicated GPU. Routine cleaning done."
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onNavigate('assets')}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving to Database...' : isNew ? 'Create & Register Asset' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
