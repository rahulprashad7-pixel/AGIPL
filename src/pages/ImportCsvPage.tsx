import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Building2,
  Layers,
  Table,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Asset, CompanyCode, PageView, COMPANY_NAMES } from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';

interface ImportCsvPageProps {
  existingAssets: Asset[];
  onNavigate: (page: PageView) => void;
  onRefreshData: () => void;
}

export const ImportCsvPage: React.FC<ImportCsvPageProps> = ({
  existingAssets,
  onNavigate,
  onRefreshData,
}) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [targetCompany, setTargetCompany] = useState<CompanyCode | 'AUTO'>('AUTO');
  const [parsedRows, setParsedRows] = useState<Partial<Asset>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
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
      'eScan',
      'Vendor',
      'Purchase Date',
      'Purchase Cost',
      'Invoice Number',
      'Expected Life',
      'Warranty Start',
      'Warranty End',
      'AMC Start',
      'AMC End',
      'Remarks',
    ];

    const sampleRow1 = [
      'AGIPL-DSK-101',
      'AGIPL',
      'Desktop',
      'AG-IT-2024-101',
      'ACTIVE',
      'NEW',
      'Anand Sharma',
      'asharma',
      'Engineering & Design',
      'Hadapsar Plant',
      '192.168.10.77',
      'Dell',
      'OptiPlex 7010',
      'DL-SN-99281',
      'Intel Core i5-13500',
      '16GB DDR4',
      '512GB NVMe SSD',
      'Dell B660',
      'Dell 24" FHD',
      '24 inch',
      'Gigabit Ethernet',
      'APC 600VA',
      'Windows 11 Pro 64-bit',
      'MS Office 2021 H&B',
      'eScan Corporate Active',
      'Softmart Solutions',
      '2024-02-15',
      '68000',
      'INV-2024-098',
      '5',
      '2024-02-15',
      '2027-02-14',
      '2027-02-15',
      '2028-02-14',
      'New workstation for CAD drafting',
    ];

    const sampleRow2 = [
      'ASSPL-LAP-102',
      'ASSPL',
      'Laptop',
      'AS-IT-2024-102',
      'ACTIVE',
      'NEW',
      'Pooja Nair',
      'pnair',
      'Sales & Field Services',
      'Mumbai Regional Office',
      '192.168.20.44',
      'Lenovo',
      'ThinkPad E14 Gen 5',
      'LN-SN-88271',
      'AMD Ryzen 7 7730U',
      '16GB DDR4',
      '512GB SSD',
      'OEM Integrated',
      '14" FHD IPS',
      '14 inch',
      'Wi-Fi 6 + BT 5.2',
      '57Wh Battery',
      'Windows 11 Pro',
      'MS Office 365 Bus',
      'eScan Endpoint',
      'CompuServe Pune',
      '2024-03-10',
      '74000',
      'INV-CS-554',
      '4',
      '2024-03-10',
      '2027-03-09',
      '',
      '',
      'Issued to Field Sales Engineer with bag',
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), sampleRow1.join(','), sampleRow2.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'AccurateGroup_IT_Asset_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Parse CSV helper
  const parseCSVText = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setValidationErrors(['CSV file is empty or does not contain header and data rows.']);
      return;
    }

    // Split headers handling quotes
    const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const rows: Partial<Asset>[] = [];
    const errors: string[] = [];

    const existingIdSet = new Set(existingAssets.map((a) => a.assetId.toLowerCase()));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex to parse comma separated values handling double quotes
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = '';

      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      const rowData: any = {};
      headers.forEach((header, index) => {
        const rawVal = values[index] ? values[index].replace(/^["']|["']$/g, '').trim() : '';

        if (header.includes('asset id') || header === 'assetid') rowData.assetId = rawVal;
        else if (header === 'company') rowData.company = rawVal.toUpperCase();
        else if (header.includes('asset type') || header === 'type') rowData.assetType = rawVal;
        else if (header.includes('asset number') || header === 'assetno') rowData.assetNumber = rawVal;
        else if (header === 'status') rowData.status = rawVal.toUpperCase();
        else if (header === 'condition') rowData.condition = rawVal.toUpperCase() === 'OLD' ? 'OLD' : 'NEW';
        else if (header.includes('employee') || header.includes('assigned')) rowData.assignedEmployeeName = rawVal;
        else if (header.includes('username') || header === 'user') rowData.assetUserName = rawVal;
        else if (header === 'department' || header === 'dept') rowData.department = rawVal;
        else if (header === 'location') rowData.location = rawVal;
        else if (header.includes('ip') || header === 'ipaddress') rowData.ipAddress = rawVal;
        else if (header.includes('manufacturer') || header === 'make') rowData.manufacturer = rawVal;
        else if (header === 'model') rowData.model = rawVal;
        else if (header.includes('serial') || header === 'sn') rowData.serialNumber = rawVal;
        else if (header === 'processor' || header === 'cpu') rowData.processor = rawVal;
        else if (header === 'ram' || header === 'memory') rowData.ram = rawVal;
        else if (header === 'storage' || header === 'hdd' || header === 'ssd') rowData.storage = rawVal;
        else if (header === 'motherboard') rowData.motherboard = rawVal;
        else if (header === 'display' || header === 'monitor') rowData.display = rawVal;
        else if (header.includes('display size')) rowData.displaySize = rawVal;
        else if (header.includes('lan')) rowData.lanCard = rawVal;
        else if (header.includes('ups') || header.includes('battery')) rowData.upsBattery = rawVal;
        else if (header.includes('windows') || header === 'os') rowData.windowsVersion = rawVal;
        else if (header.includes('office')) rowData.msOffice = rawVal;
        else if (header.includes('escan') || header.includes('antivirus')) rowData.escan = rawVal;
        else if (header === 'vendor' || header === 'supplier') rowData.vendor = rawVal;
        else if (header.includes('purchase date')) rowData.purchaseDate = rawVal;
        else if (header.includes('cost') || header.includes('price')) rowData.purchaseCost = Number(rawVal) || 0;
        else if (header.includes('invoice')) rowData.invoiceNumber = rawVal;
        else if (header.includes('expected life')) rowData.expectedLife = Number(rawVal) || 5;
        else if (header.includes('warranty start')) rowData.warrantyStart = rawVal;
        else if (header.includes('warranty end')) rowData.warrantyEnd = rawVal;
        else if (header.includes('amc start')) rowData.amcStart = rawVal;
        else if (header.includes('amc end')) rowData.amcEnd = rawVal;
        else if (header.includes('remarks') || header === 'notes') rowData.remarks = rawVal;
      });

      // If company is set to specific override
      if (targetCompany !== 'AUTO') {
        rowData.company = targetCompany;
      } else if (!rowData.company) {
        rowData.company = 'AGIPL';
      }

      // Defaults & Validations
      if (!rowData.assetId) {
        errors.push(`Row ${i + 1}: Missing Asset ID`);
      } else if (existingIdSet.has(rowData.assetId.toLowerCase())) {
        errors.push(`Row ${i + 1}: Asset ID "${rowData.assetId}" already exists in the system.`);
      }

      if (!rowData.assetType) rowData.assetType = 'Desktop';
      if (!rowData.status) rowData.status = rowData.assignedEmployeeName ? 'ACTIVE' : 'IN STOCK';
      if (!rowData.condition) rowData.condition = 'NEW';
      if (!rowData.purchaseCost) rowData.purchaseCost = 0;
      if (!rowData.expectedLife) rowData.expectedLife = 5;

      rows.push(rowData);
    }

    setParsedRows(rows);
    setValidationErrors(errors);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportSuccess(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVText(text);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0 || validationErrors.length > 0) return;

    setIsProcessing(true);
    try {
      let count = 0;
      for (const row of parsedRows) {
        await DataService.saveAsset(row, currentUser, true);
        count++;
      }
      setImportSuccess(count);
      onRefreshData();
      setTimeout(() => {
        onNavigate('assets');
      }, 1500);
    } catch (err: any) {
      alert(`Import error: ${err?.message || 'Failed to save items.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
            Import IT Assets from CSV / Excel
          </h1>
          <p className="text-xs text-slate-500">
            Bulk upload and register equipment across Accurate Gauging, Accurate Sales, and Onyx Precision
          </p>
        </div>

        <button
          onClick={handleDownloadSampleCsv}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <Download className="h-4 w-4 text-blue-600" />
          <span>Download Standard CSV Template</span>
        </button>
      </div>

      {/* Step 1: Upload Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-blue-600" />
          <span>1. Select Organization & Upload File</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Organization Scope
            </label>
            <select
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value as any)}
              className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="AUTO">Auto-detect from CSV column ("Company")</option>
              <option value="AGIPL">Force All to AGIPL (Accurate Gauging)</option>
              <option value="ASSPL">Force All to ASSPL (Accurate Sales)</option>
              <option value="ONYX">Force All to ONYX (Onyx Precision)</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-colors hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
            className="hidden"
          />
          <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {fileName ? `Selected: ${fileName}` : 'Click or Drag CSV file here to upload'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Supports standard CSV files with hardware specs, assignment, and valuation columns
          </p>
        </div>
      </div>

      {/* Success Banner */}
      {importSuccess !== null && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <div>Successfully imported {importSuccess} IT hardware assets!</div>
            <div className="font-normal text-emerald-700 dark:text-emerald-400">
              Audit logs generated and inventory updated in database. Redirecting to inventory...
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Validation Feedback */}
      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
          <div className="flex items-center gap-2 font-bold mb-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <span>Validation Issues Detected ({validationErrors.length})</span>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step 3: Parsed Preview Data Table */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Preview Data Rows ({parsedRows.length} Assets Found)
              </h2>
              {validationErrors.length === 0 && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Ready to Import
                </span>
              )}
            </div>

            <button
              onClick={handleCommitImport}
              disabled={isProcessing || validationErrors.length > 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving {parsedRows.length} Assets...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Confirm & Import {parsedRows.length} Assets</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="max-h-96 overflow-x-auto overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="sticky top-0 bg-slate-100 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-3 py-2.5">Asset ID</th>
                    <th className="px-3 py-2.5">Company</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Make & Model</th>
                    <th className="px-3 py-2.5">Assigned Employee</th>
                    <th className="px-3 py-2.5">Department</th>
                    <th className="px-3 py-2.5">IP Address</th>
                    <th className="px-3 py-2.5">Serial No.</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-white">
                        {row.assetId}
                      </td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {row.company}
                        </span>
                      </td>
                      <td className="px-3 py-2">{row.assetType}</td>
                      <td className="px-3 py-2">{row.manufacturer} {row.model}</td>
                      <td className="px-3 py-2 font-medium">{row.assignedEmployeeName || 'Buffer Stock'}</td>
                      <td className="px-3 py-2 text-slate-500">{row.department}</td>
                      <td className="px-3 py-2 font-mono text-[11px]">{row.ipAddress || 'DHCP'}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-400">{row.serialNumber || 'N/A'}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
