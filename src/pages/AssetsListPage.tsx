import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertTriangle,
  Clock,
  QrCode,
  FileText,
  Edit,
  Eye,
  UserPlus,
  Wrench,
  Archive,
  RefreshCw,
  CheckSquare,
  Square,
  Shield,
  Layers
} from 'lucide-react';
import {
  Asset,
  CompanyCode,
  AssetStatus,
  Condition,
  COMPANY_NAMES,
  COMPANY_BADGES,
  STATUS_COLORS,
  PageView
} from '../types';
import { formatCurrencyINR, formatDateDisplay } from '../utils/assetUtils';
import { useAuth } from '../context/AuthContext';
import { AssetTagModal } from '../components/common/AssetTagModal';
import { HandoverSlipModal } from '../components/common/HandoverSlipModal';

interface AssetsListPageProps {
  assets: Asset[];
  selectedCompany: CompanyCode | 'ALL';
  onSelectCompany: (c: CompanyCode | 'ALL') => void;
  onNavigate: (page: PageView, assetId?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const AssetsListPage: React.FC<AssetsListPageProps> = ({
  assets,
  selectedCompany,
  onSelectCompany,
  onNavigate,
  searchQuery,
  setSearchQuery,
}) => {
  const { canEditAsset, canRetireAsset, isITManager } = useAuth();

  // Filters State
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [warrantyFilter, setWarrantyFilter] = useState<boolean>(false);
  const [replacementFilter, setReplacementFilter] = useState<boolean>(false);
  const [conditionFilter, setConditionFilter] = useState<Condition | 'ALL'>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<keyof Asset>('assetId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Selection for bulk actions
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Print Tag & Slip Modal States
  const [activeTagAsset, setActiveTagAsset] = useState<Asset | null>(null);
  const [activeSlipAsset, setActiveSlipAsset] = useState<Asset | null>(null);

  // Available unique types and departments for filter dropdowns
  const uniqueTypes = useMemo(() => {
    const set = new Set(assets.map((a) => a.assetType).filter(Boolean));
    return Array.from(set).sort();
  }, [assets]);

  const uniqueDepts = useMemo(() => {
    const set = new Set(assets.map((a) => a.department).filter(Boolean));
    return Array.from(set).sort();
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Company
      if (selectedCompany !== 'ALL' && asset.company !== selectedCompany) return false;
      // Status
      if (statusFilter !== 'ALL' && asset.status !== statusFilter) return false;
      // Type
      if (typeFilter !== 'ALL' && asset.assetType !== typeFilter) return false;
      // Department
      if (deptFilter !== 'ALL' && asset.department !== deptFilter) return false;
      // Condition
      if (conditionFilter !== 'ALL' && asset.condition !== conditionFilter) return false;
      // Warranty Alert
      if (warrantyFilter && !asset.warrantyAlert) return false;
      // Replacement Alert
      if (replacementFilter && !asset.replacementAlert) return false;

      // Text Search across all relevant fields
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          asset.assetId?.toLowerCase().includes(q) ||
          asset.assetNumber?.toLowerCase().includes(q) ||
          asset.serialNumber?.toLowerCase().includes(q) ||
          asset.assignedEmployeeName?.toLowerCase().includes(q) ||
          asset.assetUserName?.toLowerCase().includes(q) ||
          asset.manufacturer?.toLowerCase().includes(q) ||
          asset.model?.toLowerCase().includes(q) ||
          asset.ipAddress?.toLowerCase().includes(q) ||
          asset.department?.toLowerCase().includes(q) ||
          asset.location?.toLowerCase().includes(q) ||
          asset.vendor?.toLowerCase().includes(q) ||
          asset.invoiceNumber?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [
    assets,
    selectedCompany,
    statusFilter,
    typeFilter,
    deptFilter,
    conditionFilter,
    warrantyFilter,
    replacementFilter,
    searchQuery,
  ]);

  // Sorted Assets
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredAssets, sortField, sortDirection]);

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedAssetIds.length === sortedAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(sortedAssets.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // CSV Export of Filtered or Selected
  const handleExportCSV = () => {
    const listToExport =
      selectedAssetIds.length > 0
        ? assets.filter((a) => selectedAssetIds.includes(a.id))
        : sortedAssets;

    const headers = [
      'Asset ID',
      'Company',
      'Asset Type',
      'Asset Number',
      'Status',
      'Condition',
      'Assigned Employee',
      'Username',
      'Department',
      'Location',
      'IP Address',
      'Manufacturer',
      'Model',
      'Serial Number',
      'Processor',
      'RAM',
      'Storage',
      'Motherboard',
      'Display',
      'Display Size',
      'LAN Card',
      'UPS/Battery',
      'Windows Version',
      'MS Office',
      'eScan Antivirus',
      'Vendor',
      'Purchase Date',
      'Purchase Cost (INR)',
      'Invoice Number',
      'Expected Life (Yrs)',
      'Asset Age',
      'Depreciated Value (INR)',
      'Warranty Start',
      'Warranty End',
      'AMC Start',
      'AMC End',
      'Last Service Date',
      'Remarks',
    ];

    const rows = listToExport.map((a) => [
      `"${a.assetId || ''}"`,
      `"${a.company || ''}"`,
      `"${a.assetType || ''}"`,
      `"${a.assetNumber || ''}"`,
      `"${a.status || ''}"`,
      `"${a.condition || ''}"`,
      `"${a.assignedEmployeeName || ''}"`,
      `"${a.assetUserName || ''}"`,
      `"${a.department || ''}"`,
      `"${a.location || ''}"`,
      `"${a.ipAddress || ''}"`,
      `"${a.manufacturer || ''}"`,
      `"${a.model || ''}"`,
      `"${a.serialNumber || ''}"`,
      `"${a.processor || ''}"`,
      `"${a.ram || ''}"`,
      `"${a.storage || ''}"`,
      `"${a.motherboard || ''}"`,
      `"${a.display || ''}"`,
      `"${a.displaySize || ''}"`,
      `"${a.lanCard || ''}"`,
      `"${a.upsBattery || ''}"`,
      `"${a.windowsVersion || ''}"`,
      `"${a.msOffice || ''}"`,
      `"${a.escan || ''}"`,
      `"${a.vendor || ''}"`,
      `"${a.purchaseDate || ''}"`,
      `"${a.purchaseCost || 0}"`,
      `"${a.invoiceNumber || ''}"`,
      `"${a.expectedLife || 5}"`,
      `"${a.assetAge || ''}"`,
      `"${a.depreciatedValue || 0}"`,
      `"${a.warrantyStart || ''}"`,
      `"${a.warrantyEnd || ''}"`,
      `"${a.amcStart || ''}"`,
      `"${a.amcEnd || ''}"`,
      `"${a.lastServiceDate || ''}"`,
      `"${(a.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AccurateGroup_IT_Assets_${selectedCompany}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Header & Main Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              IT Asset Inventory Master
            </h1>
            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {filteredAssets.length} Assets
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Hardware registry, technical specs, network assignments and complete lifecycle logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedAssetIds.length > 0 && (
            <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {selectedAssetIds.length} Selected
            </span>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Export filtered records to CSV"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Print list"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>

          {canEditAsset && (
            <button
              id="add-new-asset-button"
              onClick={() => onNavigate('asset-add')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {/* Text Search */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Keywords
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Asset ID, Serial, Employee, IP, Model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Company Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => onSelectCompany(e.target.value as CompanyCode | 'ALL')}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Organizations</option>
              <option value="AGIPL">AGIPL (Instruments)</option>
              <option value="ASSPL">ASSPL (Sales & Services)</option>
              <option value="ONYX">ONYX Precision</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'ALL')}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="IN STOCK">IN STOCK</option>
              <option value="UNDER REPAIR">UNDER REPAIR</option>
              <option value="RETIRED">RETIRED</option>
              <option value="SCRAPPED">SCRAPPED</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Asset Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Hardware Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Toggles */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button
            onClick={() => setWarrantyFilter(!warrantyFilter)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              warrantyFilter
                ? 'bg-amber-500 text-white shadow-xs'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Warranty Expired / Alert Only</span>
          </button>

          <button
            onClick={() => setReplacementFilter(!replacementFilter)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              replacementFilter
                ? 'bg-rose-500 text-white shadow-xs'
                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Clock className="h-3 w-3" />
            <span>Replacement Due (&gt; Expected Life)</span>
          </button>

          {(statusFilter !== 'ALL' ||
            typeFilter !== 'ALL' ||
            deptFilter !== 'ALL' ||
            warrantyFilter ||
            replacementFilter ||
            searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setDeptFilter('ALL');
                setWarrantyFilter(false);
                setReplacementFilter(false);
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-rose-600 hover:underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Asset Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
              <tr>
                <th className="w-10 px-3 py-3.5 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedAssetIds.length === sortedAssets.length && sortedAssets.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                <th
                  onClick={() => handleSort('assetId')}
                  className="cursor-pointer px-3 py-3.5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Asset ID & Co.</span>
                    {sortField === 'assetId' &&
                      (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assetType')}
                  className="cursor-pointer px-3 py-3.5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Type & Specs</span>
                    {sortField === 'assetType' &&
                      (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('assignedEmployeeName')}
                  className="cursor-pointer px-3 py-3.5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Assigned User & Dept</span>
                    {sortField === 'assignedEmployeeName' &&
                      (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="px-3 py-3.5">IP & Serial</th>
                <th
                  onClick={() => handleSort('status')}
                  className="cursor-pointer px-3 py-3.5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortField === 'status' &&
                      (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('purchaseCost')}
                  className="cursor-pointer px-3 py-3.5 transition-colors hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Purchase Cost</span>
                    {sortField === 'purchaseCost' &&
                      (sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                  </div>
                </th>
                <th className="px-3 py-3.5">Warranty & Age</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Layers className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                    <p className="font-semibold text-sm">No IT assets match current filters.</p>
                    <p className="text-xs mt-1">Try resetting search keywords or organization filter.</p>
                  </td>
                </tr>
              ) : (
                sortedAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  const statusStyle = STATUS_COLORS[asset.status] || STATUS_COLORS.ACTIVE;
                  const companyBadge = COMPANY_BADGES[asset.company];

                  return (
                    <tr
                      key={asset.id}
                      className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                        isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(asset.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      {/* Asset ID & Company */}
                      <td className="px-3 py-3">
                        <div
                          onClick={() => onNavigate('asset-details', asset.id)}
                          className="cursor-pointer group font-bold text-slate-900 dark:text-white hover:text-blue-600"
                        >
                          <span className="group-hover:underline">{asset.assetId}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-1">
                          <span className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-bold ${companyBadge.bg}`}>
                            {asset.company}
                          </span>
                          {asset.assetNumber && (
                            <span className="text-[10px] text-slate-500 font-mono">#{asset.assetNumber}</span>
                          )}
                        </div>
                      </td>

                      {/* Type & Hardware Specs */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset.manufacturer} {asset.model}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {asset.assetType} • {asset.processor || 'CPU'} • {asset.ram || 'RAM'}
                        </div>
                      </td>

                      {/* Assigned Employee & Dept */}
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset.assignedEmployeeName || (
                            <span className="italic text-slate-400">Unassigned (Buffer)</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {asset.department || 'N/A'} • {asset.location || 'HQ'}
                        </div>
                      </td>

                      {/* IP & Serial */}
                      <td className="px-3 py-3 font-mono text-[11px]">
                        <div className="text-slate-700 dark:text-slate-300">
                          {asset.ipAddress || 'DHCP'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          SN: {asset.serialNumber || 'N/A'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyle.bg}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}></span>
                          <span>{asset.status}</span>
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                        <div>{formatCurrencyINR(asset.purchaseCost)}</div>
                        <div className="text-[10px] text-slate-500">
                          Dep: {formatCurrencyINR(asset.depreciatedValue)}
                        </div>
                      </td>

                      {/* Warranty & Age */}
                      <td className="px-3 py-3 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span>End: {formatDateDisplay(asset.warrantyEnd)}</span>
                          {asset.warrantyAlert && (
                            <span title="Warranty Alert: Expired or Expiring Soon">
                              <AlertTriangle className="h-3 w-3 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span>Age: {asset.assetAge}</span>
                          {asset.replacementAlert && (
                            <span className="text-rose-600 font-bold" title="Past Expected Lifespan">
                              (Due)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Row Action Buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onNavigate('asset-details', asset.id)}
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="View Complete History & Specs"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {canEditAsset && (
                            <button
                              onClick={() => onNavigate('asset-edit', asset.id)}
                              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                              title="Edit Asset Details"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setActiveTagAsset(asset)}
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Print Asset QR Tag Sticker"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setActiveSlipAsset(asset)}
                            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800"
                            title="Print Handover Slip"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Tag & Handover Modals */}
      <AssetTagModal
        asset={activeTagAsset}
        isOpen={!!activeTagAsset}
        onClose={() => setActiveTagAsset(null)}
      />

      <HandoverSlipModal
        asset={activeSlipAsset}
        isOpen={!!activeSlipAsset}
        onClose={() => setActiveSlipAsset(null)}
      />
    </div>
  );
};
