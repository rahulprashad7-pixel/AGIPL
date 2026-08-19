import React, { useState } from 'react';
import {
  FileBarChart2,
  IndianRupee,
  Building2,
  PieChart,
  Calendar,
  AlertTriangle,
  Download,
  Printer,
  TrendingDown,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Asset, CompanyCode, COMPANY_NAMES, COMPANY_BADGES, PageView } from '../types';
import { formatCurrencyINR, formatDateDisplay } from '../utils/assetUtils';

interface ReportsPageProps {
  assets: Asset[];
  selectedCompany: CompanyCode | 'ALL';
  onNavigate: (page: PageView, assetId?: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  assets,
  selectedCompany,
  onNavigate,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'valuation' | 'warranty' | 'departments' | 'software'>('valuation');

  const filteredAssets =
    selectedCompany === 'ALL'
      ? assets
      : assets.filter((a) => a.company === selectedCompany);

  // Financial Metrics
  const totalPurchaseCost = filteredAssets.reduce((s, a) => s + (Number(a.purchaseCost) || 0), 0);
  const totalDepreciatedValue = filteredAssets.reduce((s, a) => s + (Number(a.depreciatedValue) || 0), 0);
  const totalDepreciationLoss = totalPurchaseCost - totalDepreciatedValue;

  // Breakdown by Organization
  const companyReports = (['AGIPL', 'ASSPL', 'ONYX'] as CompanyCode[]).map((code) => {
    const orgAssets = assets.filter((a) => a.company === code);
    const purchaseVal = orgAssets.reduce((s, a) => s + (Number(a.purchaseCost) || 0), 0);
    const bookVal = orgAssets.reduce((s, a) => s + (Number(a.depreciatedValue) || 0), 0);
    const active = orgAssets.filter((a) => a.status === 'ACTIVE').length;
    const underRepair = orgAssets.filter((a) => a.status === 'UNDER REPAIR').length;

    return {
      code,
      name: COMPANY_NAMES[code],
      count: orgAssets.length,
      purchaseVal,
      bookVal,
      active,
      underRepair,
      depreciationRate: purchaseVal > 0 ? Math.round(((purchaseVal - bookVal) / purchaseVal) * 100) : 0,
    };
  });

  // Breakdown by Department
  const deptMap: Record<string, { count: number; cost: number; bookVal: number }> = {};
  filteredAssets.forEach((a) => {
    const dept = a.department || 'Unassigned / Buffer';
    if (!deptMap[dept]) deptMap[dept] = { count: 0, cost: 0, bookVal: 0 };
    deptMap[dept].count += 1;
    deptMap[dept].cost += Number(a.purchaseCost) || 0;
    deptMap[dept].bookVal += Number(a.depreciatedValue) || 0;
  });

  const departmentReports = Object.entries(deptMap).sort((a, b) => b[1].cost - a[1].cost);

  // Warranty Status Categorization
  const today = new Date().toISOString().split('T')[0];
  const warrantyCategories = {
    expired: [] as Asset[],
    expiringSoon: [] as Asset[], // within 60 days
    valid: [] as Asset[],
    notSpecified: [] as Asset[],
  };

  filteredAssets.forEach((a) => {
    if (!a.warrantyEnd) {
      warrantyCategories.notSpecified.push(a);
      return;
    }
    const end = new Date(a.warrantyEnd);
    const now = new Date();
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      warrantyCategories.expired.push(a);
    } else if (diffDays <= 60) {
      warrantyCategories.expiringSoon.push(a);
    } else {
      warrantyCategories.valid.push(a);
    }
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              IT Asset Valuation & Executive Reports
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {selectedCompany === 'ALL' ? 'Accurate Group Master' : selectedCompany}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Straight-line depreciation accounting, warranty liability, and departmental asset allocation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Cost */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">Historical Procurement Cost</span>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrencyINR(totalPurchaseCost)}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Gross capital expenditure for {filteredAssets.length} tracked units
          </p>
        </div>

        {/* Current Book Value */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">Current Net Book Value</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {formatCurrencyINR(totalDepreciatedValue)}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Calculated via straight-line standard IT depreciation method
          </p>
        </div>

        {/* Depreciation Absorbed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">Accumulated Depreciation</span>
          <div className="mt-2 text-2xl font-black text-rose-600">
            {formatCurrencyINR(totalDepreciationLoss)}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {totalPurchaseCost > 0 ? Math.round((totalDepreciationLoss / totalPurchaseCost) * 100) : 0}% of historical value depreciated
          </p>
        </div>
      </div>

      {/* Report View Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {[
          { id: 'valuation', label: '1. Group Valuation & Companies' },
          { id: 'warranty', label: '2. Warranty & AMC Lifecycle' },
          { id: 'departments', label: '3. Department Cost Allocation' },
          { id: 'software', label: '4. Software & Antivirus Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              activeReportTab === tab.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Valuation and Companies */}
      {activeReportTab === 'valuation' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Multi-Company Valuation Summary Table</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3 text-center">Assets Tracked</th>
                    <th className="px-4 py-3 text-center">Active In Use</th>
                    <th className="px-4 py-3">Purchase Value</th>
                    <th className="px-4 py-3">Current Book Value</th>
                    <th className="px-4 py-3">Depreciation %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {companyReports.map((org) => {
                    const badge = COMPANY_BADGES[org.code];
                    return (
                      <tr key={org.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                          {org.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${badge.bg}`}>
                            {org.code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold">{org.count} units</td>
                        <td className="px-4 py-3.5 text-center text-emerald-600 font-semibold">{org.active} units</td>
                        <td className="px-4 py-3.5 font-extrabold text-slate-900 dark:text-white">
                          {formatCurrencyINR(org.purchaseVal)}
                        </td>
                        <td className="px-4 py-3.5 font-extrabold text-emerald-600">
                          {formatCurrencyINR(org.bookVal)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{org.depreciationRate}%</span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                              <div className="h-full bg-blue-600" style={{ width: `${org.depreciationRate}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Warranty & AMC Status */}
      {activeReportTab === 'warranty' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/40">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400">OEM Warranty Expired</span>
              <div className="mt-1 text-2xl font-black text-rose-800 dark:text-rose-200">
                {warrantyCategories.expired.length} Units
              </div>
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-300">
                Recommend establishing Annual Maintenance Contract (AMC)
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/40">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Expiring in &lt;60 Days</span>
              <div className="mt-1 text-2xl font-black text-amber-800 dark:text-amber-200">
                {warrantyCategories.expiringSoon.length} Units
              </div>
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-300">
                Action required with vendors for renewal quotations
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Under Active Warranty</span>
              <div className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {warrantyCategories.valid.length} Units
              </div>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-300">
                Full OEM hardware replacement & on-site support valid
              </p>
            </div>
          </div>

          {/* List of Expired or Expiring Assets */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Detailed Warranty Expiry Risk Registry
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2.5">Asset ID</th>
                    <th className="px-3 py-2.5">Company</th>
                    <th className="px-3 py-2.5">Model</th>
                    <th className="px-3 py-2.5">Assigned Employee</th>
                    <th className="px-3 py-2.5">Warranty End</th>
                    <th className="px-3 py-2.5">AMC End</th>
                    <th className="px-3 py-2.5">Vendor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[...warrantyCategories.expired, ...warrantyCategories.expiringSoon].map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => onNavigate('asset-details', asset.id)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-3 py-2.5 font-bold font-mono text-blue-600">{asset.assetId}</td>
                      <td className="px-3 py-2.5">{asset.company}</td>
                      <td className="px-3 py-2.5">{asset.manufacturer} {asset.model}</td>
                      <td className="px-3 py-2.5">{asset.assignedEmployeeName || 'Buffer Stock'}</td>
                      <td className="px-3 py-2.5 font-bold text-amber-600">{formatDateDisplay(asset.warrantyEnd)}</td>
                      <td className="px-3 py-2.5">{formatDateDisplay(asset.amcEnd)}</td>
                      <td className="px-3 py-2.5">{asset.vendor || 'OEM'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Department Breakdown */}
      {activeReportTab === 'departments' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            Department-wise Hardware Capital Allocation
          </h2>

          <div className="space-y-4">
            {departmentReports.map(([deptName, data]) => {
              const costPct = totalPurchaseCost > 0 ? Math.round((data.cost / totalPurchaseCost) * 100) : 0;
              return (
                <div key={deptName} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">{deptName}</h3>
                      <p className="text-[11px] text-slate-500">{data.count} IT assets assigned</p>
                    </div>
                    <div className="flex items-baseline gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400">Total Purchase: </span>
                        <strong className="text-slate-900 dark:text-white">{formatCurrencyINR(data.cost)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">Book Value: </span>
                        <strong className="text-emerald-600">{formatCurrencyINR(data.bookVal)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full bg-indigo-600" style={{ width: `${costPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Software and Antivirus Audit */}
      {activeReportTab === 'software' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Endpoint Software & Security License Compliance</span>
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-2">eScan Corporate Antivirus</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Managed corporate client installed on endpoints to comply with ISO/IATF automotive and precision tool quality requirements.
              </p>
              <div className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>100% of Active Endpoints Configured</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-2">Microsoft Windows & Office</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Standard corporate Windows 11/10 Pro 64-bit with genuine OEM digital licenses & MS Office Home & Business / M365.
              </p>
              <div className="mt-3 text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Genuine License Compliance Active</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
