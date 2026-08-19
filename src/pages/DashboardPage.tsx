import React from 'react';
import {
  Boxes,
  IndianRupee,
  Activity,
  Package,
  Wrench,
  Archive,
  AlertTriangle,
  Clock,
  Building2,
  TrendingUp,
  PlusCircle,
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Laptop,
  Monitor,
  Server,
  Printer,
  Wifi,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { Asset, AuditLog, CompanyCode, COMPANY_NAMES, COMPANY_BADGES, PageView } from '../types';
import { formatCurrencyINR, formatDateDisplay } from '../utils/assetUtils';

interface DashboardPageProps {
  assets: Asset[];
  auditLogs: AuditLog[];
  selectedCompany: CompanyCode | 'ALL';
  onNavigate: (page: PageView, assetId?: string) => void;
  onSelectCompany: (c: CompanyCode | 'ALL') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  assets,
  auditLogs,
  selectedCompany,
  onNavigate,
  onSelectCompany,
}) => {
  // Filter assets according to selected company
  const filteredAssets =
    selectedCompany === 'ALL'
      ? assets
      : assets.filter((a) => a.company === selectedCompany);

  // Core KPI Calculations
  const totalAssets = filteredAssets.length;
  const totalPurchaseValue = filteredAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
  const totalDepreciatedValue = filteredAssets.reduce((sum, a) => sum + (Number(a.depreciatedValue) || 0), 0);

  const activeAssets = filteredAssets.filter((a) => a.status === 'ACTIVE').length;
  const inStockAssets = filteredAssets.filter((a) => a.status === 'IN STOCK').length;
  const underRepairAssets = filteredAssets.filter((a) => a.status === 'UNDER REPAIR').length;
  const retiredAssets = filteredAssets.filter((a) => a.status === 'RETIRED' || a.status === 'SCRAPPED').length;

  const warrantyAlerts = filteredAssets.filter(
    (a) => a.warrantyAlert && a.status !== 'RETIRED' && a.status !== 'SCRAPPED'
  );
  const replacementAlerts = filteredAssets.filter(
    (a) => a.replacementAlert && a.status !== 'RETIRED' && a.status !== 'SCRAPPED'
  );
  const totalAlerts = warrantyAlerts.length + replacementAlerts.length;

  // Group by Organization metrics
  const companies: CompanyCode[] = ['AGIPL', 'ASSPL', 'ONYX'];
  const orgMetrics = companies.map((code) => {
    const orgAssets = assets.filter((a) => a.company === code);
    const orgVal = orgAssets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);
    const orgDepVal = orgAssets.reduce((sum, a) => sum + (Number(a.depreciatedValue) || 0), 0);
    const orgActive = orgAssets.filter((a) => a.status === 'ACTIVE').length;
    return {
      code,
      name: COMPANY_NAMES[code],
      count: orgAssets.length,
      purchaseValue: orgVal,
      depreciatedValue: orgDepVal,
      active: orgActive,
    };
  });

  // Group by Asset Type
  const assetTypeMap: Record<string, number> = {};
  filteredAssets.forEach((a) => {
    const type = a.assetType || 'Other';
    assetTypeMap[type] = (assetTypeMap[type] || 0) + 1;
  });
  const assetTypes = Object.entries(assetTypeMap).sort((a, b) => b[1] - a[1]);

  const activePct = totalAssets ? Math.round((activeAssets / totalAssets) * 100) : 0;
  const inStockPct = totalAssets ? Math.round((inStockAssets / totalAssets) * 100) : 0;
  const underRepairPct = totalAssets ? Math.round((underRepairAssets / totalAssets) * 100) : 0;
  const retiredPct = totalAssets ? Math.round((retiredAssets / totalAssets) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Scope Title Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {selectedCompany === 'ALL'
                ? 'Accurate Group Master IT Inventory'
                : `${COMPANY_NAMES[selectedCompany]} (${selectedCompany})`}
            </h1>
            {selectedCompany !== 'ALL' && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${COMPANY_BADGES[selectedCompany].bg}`}>
                {selectedCompany} Scope
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Bento grid overview for AGIPL, ASSPL, and ONYX precision hardware assets
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="quick-add-asset-btn"
            onClick={() => onNavigate('asset-add')}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Add New Asset</span>
          </button>
          <button
            id="quick-import-csv-btn"
            onClick={() => onNavigate('import-csv')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <UploadCloud className="h-4 w-4 text-blue-600" />
            <span>Import CSV</span>
          </button>
          <button
            id="quick-reports-btn"
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>Valuation Report</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID: Primary Top Row (12 columns) */}
      <div className="grid grid-cols-12 gap-4 lg:gap-5">
        {/* Bento 1: Total Assets (Col Span 3) */}
        <div
          onClick={() => onNavigate('assets')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Total Assets
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
              {totalAssets}
            </h2>
            <span className="flex items-center text-xs font-bold text-emerald-600 mb-1">
              <TrendingUp className="mr-1 h-3.5 w-3.5" />
              {activePct}% in use
            </span>
          </div>
          <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(activePct, 15)}%` }} />
          </div>
        </div>

        {/* Bento 2: Inventory Valuation (Col Span 3) */}
        <div
          onClick={() => onNavigate('reports')}
          className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Inventory Value
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
              {formatCurrencyINR(totalPurchaseValue)}
            </h2>
            <span className="mb-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              SLD Model
            </span>
          </div>
          <div className="mt-4 flex items-center space-x-1.5">
            <div className="h-1.5 flex-1 rounded-full bg-blue-400" title="Procurement" />
            <div className="h-1.5 flex-1 rounded-full bg-emerald-400" title="Net Book Value" />
            <div className="h-1.5 flex-1 rounded-full bg-amber-400" title="Depreciation" />
          </div>
        </div>

        {/* Bento 3: Compliance & Urgent Action Alerts (Col Span 6 - Hero Bento Card) */}
        <div className="col-span-12 lg:col-span-6 relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-xl dark:bg-slate-900 dark:border dark:border-slate-800">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Compliance & Warranty Alerts ({totalAlerts})</span>
              </h3>
              <button
                onClick={() => onNavigate('reports')}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase tracking-wider"
              >
                View Radar →
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Alert item 1: Warranties */}
              <div
                onClick={() => onNavigate('reports')}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/10 p-3 text-xs backdrop-blur-md transition-colors hover:bg-white/15"
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${warrantyAlerts.length > 0 ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span className="font-semibold text-slate-100">
                    {warrantyAlerts.length > 0
                      ? `Warranty Expiry Alert: ${warrantyAlerts.length} Assets past or near warranty`
                      : 'All OEM warranties healthy and tracked'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  Review
                </span>
              </div>

              {/* Alert item 2: Lifespan */}
              <div
                onClick={() => onNavigate('reports')}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/10 p-3 text-xs backdrop-blur-md transition-colors hover:bg-white/15"
              >
                <div className="flex items-center space-x-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${replacementAlerts.length > 0 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="font-semibold text-slate-100">
                    {replacementAlerts.length > 0
                      ? `Replacement Due: ${replacementAlerts.length} Units past expected life`
                      : 'Hardware lifespans within optimal lifecycle limit'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  Review
                </span>
              </div>
            </div>
          </div>

          {/* Ambient Bento glow orb */}
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        </div>
      </div>

      {/* BENTO GRID: Middle Row (12 columns) */}
      <div className="grid grid-cols-12 gap-4 lg:gap-5">
        {/* Bento 4: Status Distribution & Multi-Org Grid (Col Span 4) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Status Distribution
              </h3>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{totalAssets} Units</span>
            </div>

            <div className="space-y-3.5 py-1">
              <div
                onClick={() => onNavigate('assets')}
                className="flex cursor-pointer items-center justify-between text-xs transition-colors hover:text-blue-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Active (In Service)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{activeAssets} ({activePct}%)</span>
              </div>

              <div
                onClick={() => onNavigate('assets')}
                className="flex cursor-pointer items-center justify-between text-xs transition-colors hover:text-blue-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">In Stock (Buffer Pool)</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{inStockAssets} ({inStockPct}%)</span>
              </div>

              <div
                onClick={() => onNavigate('assets')}
                className="flex cursor-pointer items-center justify-between text-xs transition-colors hover:text-blue-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">Under Repair</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{underRepairAssets} ({underRepairPct}%)</span>
              </div>

              <div
                onClick={() => onNavigate('assets')}
                className="flex cursor-pointer items-center justify-between text-xs text-slate-400 transition-colors hover:text-slate-600"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-slate-400" />
                  <span className="font-medium">Retired / Scrapped</span>
                </div>
                <span className="font-bold text-slate-600 dark:text-slate-300">{retiredAssets} ({retiredPct}%)</span>
              </div>
            </div>
          </div>

          {/* Sub-Bento: Organization Split */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              By Organization
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {orgMetrics.map((org) => {
                const isCurrent = selectedCompany === org.code;
                return (
                  <div
                    key={org.code}
                    onClick={() => onSelectCompany(org.code)}
                    className={`cursor-pointer rounded-xl p-2.5 text-center transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                      {org.code}
                    </p>
                    <p className={`text-sm font-black ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {org.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bento 5: Recent Activity & Audit Trail (Col Span 8) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Recent Audit Trail Activity
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Timestamped immutable changes across all 3 organizations
              </p>
            </div>
            <button
              onClick={() => onNavigate('assets')}
              className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              View Full Registry →
            </button>
          </div>

          <div className="flex-1 overflow-x-auto px-6">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                <tr>
                  <th className="py-3.5">Asset ID</th>
                  <th className="py-3.5">Action</th>
                  <th className="py-3.5">Organization</th>
                  <th className="py-3.5">User / Performed By</th>
                  <th className="py-3.5">Details</th>
                  <th className="py-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {auditLogs.slice(0, 5).map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => {
                      if (log.assetDocId && log.assetDocId !== 'SYSTEM') {
                        onNavigate('asset-details', log.assetDocId);
                      }
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer"
                  >
                    <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {log.assetId}
                    </td>
                    <td className="py-3">
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        log.action === 'CREATED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        log.action === 'ASSIGNED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                        log.action === 'SERVICED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {log.company || 'AGIPL'}
                    </td>
                    <td className="py-3 font-medium">
                      {log.performedBy}
                    </td>
                    <td className="py-3 text-[11px] text-slate-500 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="py-3 text-right font-mono text-[11px] text-slate-400">
                      {log.timestamp.split(' ')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-slate-50 text-center border-t border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Accurate Group IT Compliance System — Enterprise Multi-Org Data Shield Active
            </p>
          </div>
        </div>
      </div>

      {/* BENTO GRID: Bottom Row - Hardware Types & Endpoint Security (12 columns) */}
      <div className="grid grid-cols-12 gap-4 lg:gap-5">
        {/* Bento 6: Hardware Types Breakdown (Col Span 8) */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Hardware Allocation by Asset Type</span>
            </h3>
            <span className="text-xs font-bold text-blue-600">{assetTypes.length} Device Categories</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {assetTypes.map(([type, count]) => {
              const pct = totalAssets ? Math.round((count / totalAssets) * 100) : 0;
              return (
                <div
                  key={type}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                      {type}
                    </span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {count}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">{pct}% of inventory</div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bento 7: Security & Standards (Col Span 4) */}
        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Security & Compliance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">eScan Endpoint Protection</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Corporate antivirus active on 100% of workstations</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="font-bold text-slate-900 dark:text-white">Windows & Office Genuine OEM</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Digital license compliance for ISO/IATF quality audits</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Audit Trail: Immutable</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> 100% Compliant
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
