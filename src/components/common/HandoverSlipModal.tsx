import React from 'react';
import { Asset, COMPANY_NAMES } from '../../types';
import { FileText, Printer, X, CheckSquare } from 'lucide-react';
import { formatDateDisplay } from '../../utils/assetUtils';

interface HandoverSlipModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HandoverSlipModal: React.FC<HandoverSlipModalProps> = ({ asset, isOpen, onClose }) => {
  if (!isOpen || !asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              IT Asset Handover & Acknowledgment Slip
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Official Slip Content */}
        <div className="my-6 rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm print:m-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 text-center">
            <div className="text-lg font-black tracking-wide text-slate-950 uppercase">
              {COMPANY_NAMES[asset.company]}
            </div>
            <div className="text-xs font-semibold text-slate-600">
              INFORMATION TECHNOLOGY DEPARTMENT • ASSET ALLOCATION ACKNOWLEDGMENT
            </div>
            <div className="mt-2 inline-block rounded border border-slate-400 bg-slate-100 px-3 py-0.5 text-[11px] font-bold">
              SLIP REF: {asset.assetId}-HO-{new Date().getFullYear()}
            </div>
          </div>

          {/* Asset & Employee Grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">EMPLOYEE DETAILS</div>
              <div><strong>Name:</strong> {asset.assignedEmployeeName || '_______________________'}</div>
              <div><strong>Login Username:</strong> {asset.assetUserName || '_______________________'}</div>
              <div><strong>Department:</strong> {asset.department || '_______________________'}</div>
              <div><strong>Location / Branch:</strong> {asset.location || '_______________________'}</div>
              <div><strong>Allocation Date:</strong> {formatDateDisplay(new Date().toISOString())}</div>
            </div>

            <div className="space-y-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">HARDWARE ASSET SPECIFICATIONS</div>
              <div><strong>Asset ID:</strong> <span className="font-mono font-bold">{asset.assetId}</span></div>
              <div><strong>Type:</strong> {asset.assetType} ({asset.condition})</div>
              <div><strong>Make & Model:</strong> {asset.manufacturer} {asset.model}</div>
              <div><strong>Serial Number:</strong> {asset.serialNumber || 'N/A'}</div>
              <div><strong>Processor & RAM:</strong> {asset.processor || 'N/A'}, {asset.ram || 'N/A'}</div>
              <div><strong>Storage:</strong> {asset.storage || 'N/A'}</div>
            </div>
          </div>

          {/* Software and Accessories Included */}
          <div className="mt-4 rounded-lg border border-slate-200 p-3 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2">
              INSTALLED LICENSED SOFTWARE & ACCESSORIES
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>• OS: {asset.windowsVersion || 'Standard Company Windows OS'}</div>
              <div>• MS Office: {asset.msOffice || 'Standard Edition'}</div>
              <div>• Antivirus: {asset.escan || 'eScan Corporate Security'}</div>
              <div>• Power Adapter / Battery: {asset.upsBattery || 'OEM Power Adapter Included'}</div>
              <div>• Display / Peripherals: {asset.display || 'Standard Display & Input'}</div>
              <div>• Assigned Static IP: {asset.ipAddress || 'DHCP Reserved'}</div>
            </div>
          </div>

          {/* Terms & Undertaking */}
          <div className="mt-4 text-[11px] text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-800">Undertaking & IT Security Policy:</p>
            <p>1. I acknowledge receipt of the IT asset listed above in fully functional and clean condition.</p>
            <p>2. I agree to use this machine strictly for official company work in compliance with Group IT Security Policies.</p>
            <p>3. I will not install unlicensed pirated software, tamper with antivirus, or disassemble hardware.</p>
            <p>4. Upon resignation or transfer, I agree to return this asset in good working condition.</p>
          </div>

          {/* Signatures */}
          <div className="mt-8 grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs">
            <div>
              <div className="font-semibold text-slate-900">Issued by IT Department:</div>
              <div className="mt-8 border-b border-slate-400"></div>
              <div className="mt-1 text-[11px] text-slate-500">
                IT Engineer Sign & Date ({asset.updatedBy || 'IT Admin'})
              </div>
            </div>

            <div>
              <div className="font-semibold text-slate-900">Received & Acknowledged by:</div>
              <div className="mt-8 border-b border-slate-400"></div>
              <div className="mt-1 text-[11px] text-slate-500">
                Employee Signature & Date ({asset.assignedEmployeeName || 'Employee'})
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="text-xs text-slate-500">
            Official handover slip for HR & IT audit compliance
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              <span>Print Handover Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
